<?php

namespace UsTwo\Page_Builder;

/**
 * Abstract Builder.
 *
 * This class should be extended for different contexts.
 * This will handle outputting the builder, and getting and saving the data.
 */
abstract class Builder {

	public $id     = null;
	public $plugin = null;
	public $args   = array();

	public function __construct( $id, $args ) {

		$this->id     = $id;
		$this->plugin = Plugin::get_instance();

		$this->args = wp_parse_args( $args, array(
			'title'           => null,
			'api_prop'        => $this->id,
			'allowed_modules' => array(),
		) );

	}

	abstract function get_raw_data( $object_id );

	abstract function get_rendered_data( $object_id );

	abstract function save_data( $object_id, $data = array() );

	public function validate_data( $modules ) {

		$modules = array_map( array( $this, 'validate_module_data' ), $modules );

		$modules = array_filter( $modules, function( $module ) {
			return ! empty( $module['name'] );
		} );

		return array_values( $modules );

	}

	public function validate_module_data( $module ) {

		$module = $this->parse_args( (array) $module, array(
			'name' => '',
			'attr' => array(),
		) );

		$valid_attr = array();
		foreach ( $module['attr'] as $attr ) {
			$attr = $this->validate_attribute_data( $attr );
			$valid_attr[ sanitize_text_field( $attr['name'] ) ] = $attr;
		}
		$module['attr'] = $valid_attr;

		return $module;

	}

	public function validate_attribute_data( $attr ) {
		return $this->parse_args( (array) $attr, array(
			'name'  => '',
			'value' => '',
			'type'  => '',
		) );
	}

	/**
	 * Parse Args.
	 *
	 * Like wp_parse_args, but whitelisted to attributes with defaults.
	 *
	 * @param  array $args
	 * @param  array $defaults
	 * @return array $args
	 */
	public function parse_args( $args, $defaults ) {
		$args = wp_parse_args( $args, $defaults );
		return array_intersect_key( $args, $defaults );
	}

}
