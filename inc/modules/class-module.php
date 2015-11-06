<?php

namespace ModularPageBuilder\Modules;

abstract class Module {

	public $name  = null;
	public $label = null;
	public $attr  = array();

	public function __construct( array $args = array() ) {
		// Update attribute values for this instance using $args.
		if ( isset( $args['attr'] ) ) {
			$this->update_all_attr_values( $args['attr'] );
		}
	}

	public function render() {
		?>
		<p>You must implement `render` in <?php echo __CLASS__ ?></p>
		<?php
	}

	public function get_rendered() {
		ob_start();
		$this->render();
		return ob_get_clean();
	}

	public function get_json() {

		$json = array();
		foreach ( $this->attr as $attr ) {
			$json[ $attr['name'] ] = $this->get_attr_value( $attr['name'] );
		}

		return $json;
	}

	protected function get_attr( $attr_name ) {
		foreach ( $this->attr as $key => $attr ) {
			if ( $attr['name'] === $attr_name ) {
				return $attr;
			}
		}
	}

	protected function get_attr_value( $attr_name ) {
		if ( $attr = $this->get_attr( $attr_name ) ) {
			return isset( $attr['value'] ) ? $attr['value'] : null;
		}
	}

	protected function update_all_attr_values( array $data ) {
		foreach ( $data as $attr ) {
			if ( isset( $attr['name'] ) && isset( $attr['value'] ) ) {
				$this->update_attr_value( $attr['name'], $attr['value'] );
			}
		}
	}

	protected function update_attr_value( $attr_name, $value ) {
		foreach ( $this->attr as &$attr ) {
			if ( $attr_name === $attr['name'] ) {
				$attr['value'] = $value;
			}
		}
	}
}
