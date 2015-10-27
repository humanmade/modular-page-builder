<?php

namespace ModularPageBuilder\Modules;

class Text extends Module {

	public $name = 'text';

	public function __construct( array $args = array() ) {

		$this->label = __( 'Text', 'mpb' );

		// Set all attribute data.
		$this->attr = array(
			array( 'name' => 'body', 'label' => __( 'Content', 'mpb' ), 'type' => 'html', 'value' => '' ),
		);

		// Update attribute values for this instance using $args.
		if ( isset( $args['attr'] ) ) {
			$this->update_all_attr_values( $args['attr'] );
		}
	}

	public function render() {

		if ( $val = $this->get_attr_value( 'body' ) ) {
			printf( '<div class="modular-page-builder-text">%s</div>', wpautop( wp_kses_post( $val ) ) );
		}

	}

}
