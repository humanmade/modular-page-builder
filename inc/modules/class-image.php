<?php

namespace ModularPageBuilder\Modules;

class Image extends Module {

	public $name = 'image';

	public function __construct( array $args = array() ) {

		$this->label = __( 'Image', 'mpb' );

		// Set all attribute data.
		$this->attr = array(
			array( 'name' => 'image', 'label' => __( 'Content', 'mpb' ), 'type' => 'attachment' ),
			array( 'name' => 'caption', 'label' => __( 'Caption', 'mpb' ), 'type' => 'text' ),
		);

		// Update attribute values for this instance using $args.
		if ( isset( $args['attr'] ) ) {
			$this->update_all_attr_values( $args['attr'] );
		}
	}

	public function render() {

		$val = (array) $this->get_attr_value( 'image' );
		$val = reset( $val );

		if ( empty( $val ) ) {
			return;
		}

		echo '<div class="modular-page-builder-image">';

		echo wp_get_attachment_image( $val, 'large' );

		if ( $val = $this->get_attr_value( 'caption' ) ) {
			printf( '<p>%s</p>', esc_html( $val ) );
		}

		echo '</div>';

	}

	public function get_json() {
		$data = parent::get_json();
		$data['image'] = array_map( function( $val ) {
			return wp_get_attachment_image_src( $val, 'large' );
		}, $data['image'] );
		return $data;
	}

	public function get_rest_links() {
		$data = parent::get_json();

		if ( ! $data['image'] ) {
			return array();
		}

		return array(
			'image' => array(
				'embeddable' => true,
				'href'       => rest_url( sprintf( '/wp/v2/media/%d', $data['image'][0] ) ),
			),
		);
	}
}
