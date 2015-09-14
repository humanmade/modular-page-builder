<?php

namespace UsTwo\Page_Builder;

class Builder_Post_Meta extends Builder {

	public $id     = null;
	public $plugin = null;
	public $args   = array();

	public function init() {

		$this->register_api_fields();

		add_action( 'edit_form_after_editor', array( $this, 'output' ) );
		add_action( 'save_post', array( $this, 'save_post' ) );

		add_action( 'admin_enqueue_scripts', function() {
			if ( $this->is_allowed() ) {
				Plugin::get_instance()->enqueue_builder();
			}
		} );

	}

	public function output( $post ) {

		if ( ! $this->is_allowed() ) {
			return;
		}

		$data[ $this->id . '-data' ]            = json_encode( $this->get_raw_data( $post->ID, $this->id . '-data' ) );
		$data[ $this->id . '-allowed-modules' ] = implode( ',', $this->get_allowed_modules_for_page( $post->ID ) );
		$data[ $this->id . '-nonce' ]           = wp_create_nonce( $this->id );

		printf( '<div id="%s" class="ustwo-page-builder-container">', $this->id );

		foreach ( $data as $name => $value ) {
			printf(
				'<input type="hidden" id="%s" name="%s" value="%s" />',
				esc_attr( $name ),
				esc_attr( $name ),
				esc_attr( $value )
			);
		}

		if ( $this->args['title'] ) {
			printf( '<h2>%s</h2>', esc_html( $this->args['title'] ) );
		}

		echo '</div>';

	}

	public function save_post( $post_id ) {

		if ( ! $this->is_allowed() ) {
			return;
		}

		$nonce = isset( $_POST[ $this->id . '-nonce' ] ) ? sanitize_text_field( stripslashes( $_POST[ $this->id . '-nonce' ] ) ) : null;
		$data  = isset( $_POST[ $this->id . '-data' ] ) ? json_decode( stripslashes( $_POST[ $this->id . '-data' ] ) ) : null;

		if ( wp_verify_nonce( $nonce, $this->id ) ) {
			$this->save_data( $post_id, $data );
		}

	}

	public function get_allowed_modules_for_page( $post_id = null ) {
		return apply_filters( 'ustwo_page_builder_allowed_modules_for_page', $this->args['allowed_modules'], $post_id );
	}

	public function register_api_fields() {

		$schema = array(
			'description' => 'Modular page builder data.',
			'type'        => 'array',
			'context'     => array( 'view' ),
		);

		register_api_field( $this->get_supported_post_types(), $this->args['api_prop'], array(
			'schema'          => $schema,
			'get_callback'    => function( $object, $field_name, $request ) {

				if ( ! is_null( $request->get_param( 'ignore_page_builder' ) ) ) {
					return array();
				}

				$data = $this->get_rendered_data( $object['id'], $this->id . '-data' );
				return ( ! empty( $data ) ) ? $data : array();

			},
		) );

	}

	public function save_data( $object_id, $data = array() ) {
		if ( ! empty( $data ) ) {
			update_post_meta( $object_id, $this->id . '-data', $data );
		} else {
			delete_post_meta( $object_id, $this->id . '-data' );
		}
	}

	public function get_raw_data( $object_id ) {
		$data = (array) get_post_meta( $object_id, $this->id . '-data', true );
		return $this->validate_data( $data );
	}

	public function get_rendered_data( $object_id ) {

		$data = $this->get_raw_data( $object_id );

		foreach ( $data as &$module ) {
			if ( 'text' === $module['name'] && isset( $module['attr']['body'] ) ) {
				remove_filter( 'the_content', 'UsTwo\Core\builder_to_content' );
				$module['attr']['body']['value'] = apply_filters( 'the_content', $module['attr']['body']['value'] );
				add_filter( 'the_content', 'UsTwo\Core\builder_to_content' );
			}
		}

		return $data;

	}

	protected function is_allowed() {

		$screen = get_current_screen();

		if ( ! $screen ) {
			return false;
		}

		$allowed_for_screen = in_array( $screen->id, $this->get_supported_post_types() );

		return $allowed_for_screen;

	}

	protected function get_supported_post_types() {
		return array_filter( get_post_types(), function( $post_type ) {
			return post_type_supports( $post_type, $this->id );
		} );
	}

}
