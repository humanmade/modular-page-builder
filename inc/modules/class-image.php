<?php

namespace ModularPageBuilder\Modules;

class Image extends Module {

	public $name = 'image';

	public function __construct( array $args = array() ) {

		$this->label = __( 'Image', 'mpb' );

		// Set all attribute data.
		$this->attr = array(
			array( 'name' => 'image', 'label' => __( 'Image / Gallery', 'mpb' ), 'type' => 'attachment', 'description' => 'Select one or more images.', 'config' => [ 'multiple' => true ] ),
			array( 'name' => 'caption', 'label' => __( 'Caption', 'mpb' ), 'type' => 'text' ),
		);

		// Update attribute values for this instance using $args.
		if ( isset( $args['attr'] ) ) {
			$this->update_all_attr_values( $args['attr'] );
		}
	}

	public function render() {

		$image_ids = (array) $this->get_attr_value( 'image' );

		if ( empty( $image_ids ) ) {
			return;
		}

		echo '<div class="modular-page-builder-image">';

		if ( count( $image_ids ) > 1 ) {
			echo do_shortcode( sprintf( '[gallery ids="%s"]', implode( ',', $image_ids ) ) );
		} else {
			echo wp_get_attachment_image( $image_id[0], 'large' );
		}

		if ( $caption = $this->get_attr_value( 'caption' ) ) {
			printf( '<p>%s</p>', esc_html( $caption ) );
		}

		echo '</div>';

	}

	public function get_json() {
		$data = parent::get_json();
		$data['image'] = array_map( function( $value ) {
			return wp_get_attachment_image_src( $value, 'large' );
		}, $data['image'] );
		return $data;
	}
}
