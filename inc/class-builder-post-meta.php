<?php

namespace ModularPageBuilder;

class Builder_Post_Meta extends Builder {

	public $id     = null;
	public $plugin = null;
	public $args   = array();

	public function init() {

		$this->register_api_fields();

		add_action( 'edit_form_after_editor', array( $this, 'output' ) );
		add_action( 'save_post', array( $this, 'save_post' ) );
		add_filter( 'wp_refresh_nonces', function( $response, $data ) {
			if ( ! array_key_exists( 'wp-refresh-post-nonces', $response ) ) {
				return $response;
			}

			$response['wp-refresh-post-nonces']['replace'][ $this->id . '-nonce' ] = wp_create_nonce( $this->id );

			return $response;
		}, 11, 2 );

		add_filter( "wp_get_revision_ui_diff", array( $this, 'revision_ui_diff' ), 10, 3 );

		add_filter( '_wp_post_revision_fields', function( $fields ) {
			$fields['modular-page-builder-data'] = __( 'Modular Page Builder Data' );
			$fields['modular-page-builder-nonce'] = __( 'Modular Page Builder Data' );
			$fields['modular-page-builder-allowed-modules'] = __( 'Modular Page Builder Data' );
			return $fields;
		} );

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

	public function save_post( $post_id ) {

		if ( ! $this->is_allowed_for_screen() ) {
			return;
		}

		$nonce = null;
		$data  = null;

		if ( isset( $_POST[ $this->id . '-nonce' ] ) ) {
			$nonce = sanitize_text_field( $_POST[ $this->id . '-nonce' ] ); // Input var okay.
		}

		if ( isset( $_POST[ $this->id . '-data' ] ) ) {
			$json = $_POST[ $this->id . '-data' ]; // Input var okay.
			$data = json_decode( $json );

			/**
			 * Data is sometimes already slahed, see https://core.trac.wordpress.org/ticket/35408
			 */
			if ( json_last_error() ) {
				$data = json_decode( stripslashes( $json ) );
			}

			if ( ! json_last_error()  && $nonce && wp_verify_nonce( $nonce, $this->id ) ) {
				$this->save_data( $post_id, $data );
			}
		}
	}

	public function get_allowed_modules_for_page( $post_id = null ) {
		return apply_filters( 'modular_page_builder_allowed_modules_for_page', $this->args['allowed_modules'], $post_id );
	}

	/**
	 * Build the revision UI diff in the case where we have data for revisions.
	 *
	 * This is only visible if you have revisioned meta data.
	 *
	 * @param  array   $return        The data that will be returned for the diff.
	 * @param  WP_Post $compare_from  The post comparing from.
	 * @param  WP_Post $compare_to    The post comparing to.
	 * @return array
	 */
	public function revision_ui_diff( $return, $compare_from, $compare_to ) {
		$from_data = $this->get_raw_data( $compare_from->ID );
		$to_data = $this->get_raw_data( $compare_to->ID );

		if ( ! $from_data && ! $to_data ) {
			return $return;
		}

		$return[] = array(
			'id'   => $this->id,
			'name' => 'Page Builder',
			'diff' => wp_text_diff(
				json_encode( $from_data ),
				json_encode( $to_data ),
				array( 'show_split_view' => true )
			)
		);

		return $return;
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

		register_rest_field(
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

	public function save_data( $object_id, $data = array() ) {

		if ( ! empty( $data ) ) {
			update_metadata( 'post', $object_id, $this->id . '-data', $data );
		} else {
			delete_metadata( 'post', $object_id, $this->id . '-data' );
		}

	}

	public function get_raw_data( $object_id ) {
		$data = (array) get_post_meta( $object_id, $this->id . '-data', true );
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

}
