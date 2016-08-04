<?php

namespace ModularPageBuilder;

class Builder_Post_Content extends Builder_Post_Meta {

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
			if ( $nonce && wp_verify_nonce( $nonce, $this->id ) ) {
				$post_data['post_content'] = $this->get_rendered_data( $post_data['ID'] );
			}
		}

		return $post_data;
	}

}
