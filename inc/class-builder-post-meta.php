<?php

namespace ModularPageBuilder;

class Builder_Post_Meta extends Builder {

	public $id;
	public $plugin;
	public $args = array();
	public $data;

	public function init() {

		if ( function_exists( 'register_rest_field' ) ) {
			$this->register_rest_fields();
		}

		add_action( 'edit_form_after_editor', array( $this, 'output' ) );
		add_action( 'save_post', array( $this, 'save_post' ) );
		add_action( 'wp_insert_post_data', array( $this, 'wp_insert_post_data' ), 10, 2 );
		add_filter( 'wp_refresh_nonces', function ( $response, $data ) {
			if ( ! array_key_exists( 'wp-refresh-post-nonces', $response ) ) {
				return $response;
			}

			$response['wp-refresh-post-nonces']['replace'][ $this->id . '-nonce' ] = wp_create_nonce( $this->id );

			return $response;
		}, 11, 2 );

		add_filter( "wp_get_revision_ui_diff", array( $this, 'revision_ui_diff' ), 10, 3 );

		add_filter( 'wp_post_revision_meta_keys', function ( $keys ) {
			$keys[] = $this->id . '-data';
			return $keys;
		} );

		add_action(
			'admin_enqueue_scripts',
			function () {
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

		$data[ $this->id . '-data' ]             = json_encode( $this->get_raw_data( $post->ID, $this->id . '-data' ) );
		$data[ $this->id . '-allowed-modules' ]  = implode( ',', $this->get_allowed_modules_for_page( $post->ID ) );
		$data[ $this->id . '-required-modules' ] = implode( ',', $this->get_required_modules_for_page( $post->ID ) );
		$data[ $this->id . '-nonce' ]            = wp_create_nonce( $this->id );

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
		if (
			isset( $_POST[ $this->id . '-nonce' ] ) && // Input var okay.
			wp_verify_nonce( sanitize_text_field( $_POST[ $this->id . '-nonce' ] ), $this->id ) // Input var okay.
		) {
			$data = $this->get_post_data();
			$this->save_data( $post_id, $data );
		}
	}

	public function wp_insert_post_data( $post_data, $postarr ) {
		global $wpdb;

		if (
			! isset( $_POST[ $this->id . '-nonce' ] ) || // Input var okay.
			! wp_verify_nonce( sanitize_text_field( $_POST[ $this->id . '-nonce' ] ), $this->id ) // Input var okay.
		) {
			return $post_data;
		}

		$data = $this->get_post_data();

		if ( $data && ! empty( $postarr['ID'] ) ) {
			$post_data['post_content'] = $this->get_rendered_data( $data );
			$post_data['post_content'] = sanitize_post_field( 'post_content', $post_data['post_content'], $postarr['ID'], 'db' );
			$post_data['post_content'] = wp_slash( $post_data['post_content'] );

			$charset = $wpdb->get_col_charset( $wpdb->posts, 'post_content' );
			if ( 'utf8' === $charset ) {
				$post_data['post_content'] = wp_encode_emoji( $post_data['post_content'] );
			}
		}

		return $post_data;
	}

	public function get_allowed_modules_for_page( $post_id = null ) {
		return apply_filters( 'modular_page_builder_allowed_modules_for_page', $this->args['allowed_modules'], $post_id );
	}

	public function get_required_modules_for_page( $post_id = null ) {
		return apply_filters( 'modular_page_builder_required_modules_for_page', $this->args['required_modules'], $post_id );
	}

	/**
	 * Build the revision UI diff in the case where we have data for revisions.
	 *
	 * This is only visible if you have revisioned meta data.
	 *
	 * @param  array    $return       The data that will be returned for the diff.
	 * @param  \WP_Post $compare_from The post comparing from.
	 * @param  \WP_Post $compare_to   The post comparing to.
	 * @return array
	 */
	public function revision_ui_diff( $return, $compare_from, $compare_to ) {

		if ( ! is_a( $compare_from, 'WP_Post' ) || ! is_a( $compare_to, 'WP_Post' ) ) {
			return $return;
		}

		$from_data = $this->get_raw_data( $compare_from->ID );
		$to_data   = $this->get_raw_data( $compare_to->ID );

		$return[] = array(
			'id'   => $this->id,
			'name' => 'Page Builder',
			'diff' => wp_text_diff(
				json_encode( $from_data ),
				json_encode( $to_data ),
				array( 'show_split_view' => true )
			),
		);

		return $return;
	}

	public function register_rest_fields() {

		$schema = array(
			'description' => 'Modular page builder data.',
			'type'        => 'array',
			'context'     => array( 'view' ),
			'properties'  => array(
				'rendered' => array(
					'type'        => 'string',
					'description' => 'HTML rendering of the page builder moduels',
				),
				'modules'  => array(
					'type'        => 'array',
					'description' => 'Data for all the modules',
				),
			),
		);

		register_rest_field(
			$this->get_supported_post_types(),
			$this->args['api_prop'],
			array(
				'schema'       => $schema,
				'get_callback' => function ( $object, $field_name, $request ) {

					if ( ! is_null( $request->get_param( 'ignore_page_builder' ) ) ) {
						return array();
					}

					$raw_data = $this->get_raw_data( $object['id'] );
					$html     = $this->get_rendered_data( $raw_data );
					$modules  = array();

					foreach ( $raw_data as $module_args ) {
						if ( $module = Plugin::get_instance()->init_module( $module_args['name'], $module_args ) ) {
							$modules[] = array(
								'type' => $module_args['name'],
								'data' => $module->get_json(),
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

	/**
	 * Renders the page builder content from the data array
	 *
	 * @param array|int $data Data array or post ID
	 * @return string
	 */
	public function get_rendered_data( $data ) {

		$content = '';

		// Back compat
		if ( is_int( $data ) ) {
			$data = $this->get_raw_data( $data );
		}

		foreach ( $data as $module_args ) {
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

		// function won't be available when not in the admin.
		if ( ! function_exists( 'get_current_screen' ) ) {
			return false;
		}

		$screen = get_current_screen();

		if ( ! $screen ) {
			return false;
		}

		$allowed_for_screen = false;
		$id                 = null;

		if ( isset( $_GET['post'] ) ) {
			$id = absint( $_GET['post'] );
		} elseif ( isset( $_POST['post_ID'] ) ) {
			$id = absint( $_POST['post_ID'] );
		}

		if ( $id ) {
			$allowed_for_screen = $this->is_enabled_for_post( $id );
		}

		return $allowed_for_screen;
	}

	/**
	 * Check if page builder is enabled for a single post.
	 * @param  mixed $post_id Post Id.
	 * @return boolean
	 */
	public function is_enabled_for_post( $post_id ) {

		// Is enabled for post type.
		$allowed = in_array( get_post_type( $post_id ), $this->get_supported_post_types() );

		// Allow filtering to enable per-post.
		return apply_filters( 'modular_page_builder_is_allowed_for_post', $allowed, $post_id, $this->id );
	}

	/**
	 * Get post types that this page builder instance supports.
	 *
	 * @return array $post_types
	 */
	public function get_supported_post_types() {
		return array_filter( get_post_types(), function ( $post_type ) {
			return post_type_supports( $post_type, $this->id );
		} );
	}

	/**
	 * Gets the page builder json and returns it as a PHP array
	 * or false on failure.
	 *
	 * @return array|bool
	 */
	protected function get_post_data() {

		if ( ! $this->is_allowed_for_screen() ) {
			return null;
		}

		if ( $this->data ) {
			return $this->data;
		}

		if ( ! isset( $_POST[ $this->id . '-data' ] ) ) {  // Input var okay
			return null;
		}

		$this->data = json_decode( stripslashes( $_POST[ $this->id . '-data' ] ), true ); // Input var okay.
		return $this->data;

	}

}
