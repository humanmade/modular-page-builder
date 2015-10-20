<?php

namespace ModularPageBuilder\Modules;

class Blockquote extends Module {

	public $name = 'blockquote';

	public function __construct( array $args = array() ) {

		$this->label = __( 'Large Quote', 'mpb' );

		// Set all attribute data.
		$this->attr = array(
			array( 'name' => 'text', 'label' => __( 'Quote Text', 'mpb' ), 'type' => 'text', 'value' => '' ),
			array( 'name' => 'source', 'label' => __( 'Source', 'mpb' ), 'type' => 'text', 'value' => '' ),
		);

		// Update attribute values for this instance using $args.
		if ( isset( $args['attr'] ) ) {
			$this->update_all_attr_values( $args['attr'] );
		}
	}

	public function render() {

		echo '<div class="modular-page-builder-blockquote">';

		if ( $val = $this->get_attr_value( 'text' ) ) {
			printf( '<blockquote class="modular-page-builder-blockquote-text">%s</blockquote>', esc_html( $val ) );
		}

		if ( $val = $this->get_attr_value( 'source' ) ) {
			printf( '<p class="modular-page-builder-blockquote-source">%s</blockquote>', esc_html( $val ) );
		}

		echo '</div>';

	}

}
