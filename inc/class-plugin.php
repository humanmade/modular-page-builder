<?php

namespace UsTwo\Page_Builder;

class Plugin {

	protected static $instances;

	protected $builders;

	public static function get_instance() {
		$class = get_called_class();
		if ( ! isset( static::$instances[ $class ] ) ) {
			self::$instances[ $class ] = $instance = new $class;
			$instance->load();
		}
		return self::$instances[ $class ];
	}

	public function load() {
		add_action( 'admin_enqueue_scripts', array( $this, 'register_scripts' ), 5 );
	}

	public function register_builder_post_meta( $id, $args ) {
		$this->builders[ $id ] = new Builder_Post_Meta( $id, $args );
		$this->builders[ $id ]->init();
	}

	public function get_builder( $id ) {
		if ( isset( $this->builders[ $id ] ) ) {
			return $this->builders[ $id ];
		}
	}

	public function register_scripts( $screen ) {

		wp_register_style(  'select2', '//cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.min.css' );
		wp_register_script( 'select2', '//cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.min.js', array( 'jquery' ) );

		wp_register_script( 'ustwo-page-builder', PLUGIN_URL . '/assets/js/dist/ustwo-page-builder.js', array( 'jquery', 'backbone', 'wp-color-picker', 'jquery-ui-sortable', 'select2' ), null, true );
		wp_register_style( 'ustwo-page-builder', PLUGIN_URL . '/assets/css/dist/ustwo-page-builder.css', array( 'wp-color-picker', 'select2' ) );

	}

	public function enqueue_builder( $post_id = null ) {

		wp_enqueue_media();
		wp_enqueue_script( 'ustwo-page-builder' );
		wp_enqueue_style( 'ustwo-page-builder' );

		wp_localize_script( 'ustwo-page-builder', 'usTwoPageBuilderData', array(
			'l10n' => array(
				'addNewButton'  => __( 'Add new module', 'ustwo-page-builder' ),
				'selectDefault' => __( 'Select Module…', 'ustwo-page-builder' ),
			),
		) );

		add_action( 'admin_footer', array( $this, 'load_templates' ) );

	}

	public function load_templates() {
		foreach ( glob( PLUGIN_DIR . '/templates/*.tpl.html' ) as $filepath ) {
			$id = str_replace( '.tpl.html', '', basename( $filepath ) );
			echo '<script type="text/html" id="tmpl-ustwo-' . esc_attr( $id ) . '">';
			include $filepath;
			echo '</script>';
		}
	}

}
