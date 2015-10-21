<?php

namespace ModularPageBuilder\Modules;

class Image extends Module {

	public $name = 'image';

	public function __construct( array $args = array() ) {

		$this->label = __( 'Image', 'mpb' );

		// Set all attribute data.
		$this->attr = array(
			array( 'name' => 'image', 'label' => __( 'Content', 'mpb' ), 'type' => 'number', 'value' => '' ),
			array( 'name' => 'caption', 'label' => __( 'Caption', 'mpb' ), 'type' => 'text', 'value' => '' ),
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

}
