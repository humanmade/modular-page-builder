<?php

namespace ModularPageBuilder\Modules;

class Text extends Module {

	public $name = 'text';

	public function __construct( array $args = array() ) {

		$this->label = __( 'Text', 'mpb' );

		// Set all attribute data.
		$this->attr = array(
			array( 'name' => 'body', 'label' => __( 'Content', 'mpb' ), 'type' => 'html' ),
		);

		parent::__construct( $args );

	}

	public function render() {

		if ( $val = $this->get_attr_value( 'body' ) ) {
			printf( '<div class="modular-page-builder-text">%s</div>', wpautop( wp_kses_post( $val ) ) );
		}

	}

}
