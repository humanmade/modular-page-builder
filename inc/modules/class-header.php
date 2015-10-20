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

		$heading_tag    = 'h2';
		$subheading_tag = 'p';

		if ( $val = $this->get_attr_value( 'heading' ) ) {
			printf( '<%s class="page-builder-heading">%s</%s>', esc_attr( $heading_tag ), esc_html( $val ), esc_attr( $heading_tag ) );
		}

		if ( $val = $this->get_attr_value( 'subheading' ) ) {
			printf( '<%s class="page-builder-heading">%s</%s>', esc_attr( $subheading_tag ), esc_html( $val ), esc_attr( $subheading_tag ) );
		}

	}

}
