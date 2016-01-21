<?php

namespace ModularPageBuilder;

class Builder_Post_Content extends Builder {

	public $id     = null;
	public $plugin = null;
	public $args   = array();

	public function init() {

		$this->register_api_fields();

		add_action( 'edit_form_after_editor', array( $this, 'output' ) );
		add_action( 'wp_insert_post_data', array( $this, 'wp_insert_post_data' ) );

		add_action(
			'admin_enqueue_scripts',
			function() {
				if ( $this->is_allowed_for_screen() ) {
					Plugin::get_instance()->enqueue_builder();
				}
			}
		);

	}

	public function output( $post ) {

		if ( ! $this->is_allowed_for_screen() ) {
			return;
		}

		$data[ $this->id . '-data' ]            = json_encode( $this->get_raw_data( $post->ID, $this->id . '-data' ) );
		$data[ $this->id . '-allowed-modules' ] = implode( ',', $this->get_allowed_modules_for_page( $post->ID ) );
		$data[ $this->id . '-nonce' ]           = wp_create_nonce( $this->id );

		printf( '<div id="%s" class="modular-page-builder-container">', $this->id );

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

	public function wp_insert_post_data( $post_data ) {

		if ( ! $this->is_allowed_for_screen() ) {
			return $post_data;
		}

		$nonce = null;
		$data  = null;

		if ( isset( $_POST[ $this->id . '-nonce' ] ) ) {
			$nonce = sanitize_text_field( $_POST[ $this->id . '-nonce' ] ); // Input var okay.
		}

		if ( isset( $_POST[ $this->id . '-data' ] ) ) {
			$json = $_POST[ $this->id . '-data' ]; // Input var okay.
			if ( $nonce && wp_verify_nonce( $nonce, $this->id ) ) {
				$post_data['post_content'] = $json;
			}
		}

		return $post_data;
	}

	public function get_allowed_modules_for_page( $post_id = null ) {
		return apply_filters( 'modular_page_builder_allowed_modules_for_page', $this->args['allowed_modules'], $post_id );
	}

	public function register_api_fields() {

		$schema = array(
			'description' => 'Modular page builder data.',
			'type'        => 'array',
			'context'     => array( 'view' ),
			'properties'  => array(
				'rendered'        => array(
					'type'        => 'string',
					'description' => 'HTML rendering of the page builder moduels',
				),
				'modules'         => array(
					'type'        => 'array',
					'description' => 'Data for all the modules',
				),
			)
		);

		register_api_field(
			$this->get_supported_post_types(),
			$this->args['api_prop'],
			array(
				'schema'       => $schema,
				'get_callback' => function( $object, $field_name, $request ) {

					if ( ! is_null( $request->get_param( 'ignore_page_builder' ) ) ) {
						return array();
					}

					$html = $this->get_rendered_data( $object['id'], $this->id . '-data' );
					$modules = array();

					foreach ( $this->get_raw_data( $object['id'] ) as $module_args ) {
						if ( $module = Plugin::get_instance()->init_module( $module_args['name'], $module_args ) ) {
							$modules[] = array(
								'type'   => $module_args['name'],
								'data'   => $module->get_json(),
							);
						}
					}
					return array(
						'rendered' => $html,
						'modules'  => $modules,
					);
				},
			)
		);

	}

	public function get_raw_data( $object_id ) {
		$post = get_post( $object_id );
		$data = json_decode( $post->post_content );
		return $this->validate_data( $data );
	}

	public function get_rendered_data( $object_id ) {

		$content = '';

		foreach ( $this->get_raw_data( $object_id ) as $module_args ) {
			if ( $module = Plugin::get_instance()->init_module( $module_args['name'], $module_args ) ) {
				$content .= $module->get_rendered();
			}
		}

		return $content;

	}

	/**
	 * Is this builder allowed for the current admin screen?
	 *
	 * @return boolean
	 */
	public function is_allowed_for_screen() {

		$screen = get_current_screen();

		if ( ! $screen ) {
			return false;
		}

		$allowed_for_screen = in_array( $screen->id, $this->get_supported_post_types() );

		return $allowed_for_screen;

	}

	/**
	 * Get post types that this page builder instance supports.
	 *
	 * @return array $post_types
	 */
	public function get_supported_post_types() {
		return array_filter( get_post_types(), function( $post_type ) {
			return post_type_supports( $post_type, $this->id );
		} );
	}

	function save_data( $object_id, $data = array() ) {
		// no op as it's saved via the wp_insert_post_data hook
	}

}
