<?php

namespace ModularPageBuilder\Modules;

class Header extends Module {

	public $name = 'header';

	public function __construct( array $args = array() ) {

		$this->label = __( 'Header', 'mpb' );

		// Set all attribute data.
		$this->attr = array(
			array( 'name' => 'heading', 'label' => __( 'Heading', 'mpb' ), 'type' => 'text', 'value' => '' ),
			array( 'name' => 'subheading', 'label' => __( 'Subheading (optional)', 'mpb' ), 'type' => 'textarea', 'value' => '' ),
			array( 'name' => 'cta_text', 'label' => __( 'CTA Text (optional)', 'mpb' ), 'type' => 'text', 'value' => '' ),
			array( 'name' => 'cta_link', 'label' => __( 'CTA Link (optional)', 'mpb' ), 'type' => 'text', 'value' => '' ),
		);

		// Update attribute values for this instance using $args.
		if ( isset( $args['attr'] ) ) {
			$this->update_all_attr_values( $args['attr'] );
		}
	}

	public function render() {
		echo 'demo';
	}

}
