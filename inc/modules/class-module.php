<?php

namespace ModularPageBuilder\Modules;

abstract class Module {

	public $name  = null;
	public $label = null;
	public $attr  = array();

	abstract public function __construct( array $args = array() );

	abstract function render();

	public function get_rendered() {
		ob_start();
		$this->render();
		return ob_get_clean();
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
			return $attr['value'];
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
