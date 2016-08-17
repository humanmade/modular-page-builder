<?php

namespace ModularPageBuilder;

use WP_Query;

class Plugin {

	protected static $instances;

	/**
	 * All available builder instances.
	 * id => instance
	 *
	 * @var array
	 */
	protected $builders;

	/**
	 * A list of all available modules.
	 * name => className.
	 *
	 * @var array
	 */
	public $available_modules = array();

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

		add_filter( 'teeny_mce_plugins', array( $this, 'enable_autoresize_plugin' ) );

		add_action( 'wp_ajax_mce_get_posts', array( $this, 'get_posts' ) );

	}

	public function get_posts() {

		$query = array(
			'post_type'      => 'page',
			'fields'         => 'ids',
			'posts_per_page' => 5,
			'perm'           => 'readable',
			'paged'          => 1,
		);

		if ( isset( $_GET['post_type'] ) ) {
			if ( is_array( $_GET['post_type'] ) ) {
				$query['post_type'] = array_map( 'sanitize_text_field', wp_unslash( $_GET['post_type'] ) );
			} else {
				$query['post_type'] = sanitize_text_field( $_GET['post_type'] );
			}
		}

		if ( isset( $_GET['q'] ) ) {
			$query['s'] = sanitize_text_field( $_GET['q'] );
		}

		if ( isset( $_GET['page'] ) ) {
			$query['paged'] = absint( $_GET['page'] );
		}

		if ( isset( $_GET['post__in'] ) ) {
			$query['post__in'] = explode( ',', sanitize_text_field( $_GET['post__in'] ) );
			$query['post__in'] = array_map( 'absint', $query['post__in'] );
		}

		$query = new WP_Query( $query );
		$data  = array();

		foreach ( $query->posts as $post_id ) {
			$data[] = array( 'id' => absint( $post_id ), 'text' => get_the_title( $post_id ) );
		}

		wp_send_json( array(
			'results' => $data,
			'more' => $query->get( 'page' ) < $query->max_num_pages,
		) );

	}

	public function register_builder_post_meta( $id, $args ) {
		$this->builders[ $id ] = new Builder_Post_Meta( $id, $args );
		$this->builders[ $id ]->init();
	}

	public function register_builder_post_content( $id, $args ) {
		$this->builders[ $id ] = new Builder_Post_Content( $id, $args );
		$this->builders[ $id ]->init();
	}

	public function get_builder( $id ) {
		if ( isset( $this->builders[ $id ] ) ) {
			return $this->builders[ $id ];
		}
	}

	function register_module( $module_name, $class_name ) {
		$this->available_modules[ $module_name ] = $class_name;
	}

	function init_module( $module_name, $args = array() ) {

		if ( ! array_key_exists( $module_name, $this->available_modules ) ) {
			return;
		}

		$class_name = $this->available_modules[ $module_name ];

		if ( $class_name && class_exists( $class_name ) ) {
			return new $class_name( $args );
		}

		throw new \Exception( 'Module not found' );

	}

	public function register_scripts( $screen ) {

		wp_register_style(  'select2', '//cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.min.css' );
		wp_register_script( 'select2', '//cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.min.js', array( 'jquery' ) );

		wp_register_script( 'modular-page-builder', PLUGIN_URL . '/assets/js/dist/modular-page-builder.js', array( 'jquery', 'backbone', 'wp-backbone', 'wp-color-picker', 'jquery-ui-sortable', 'select2' ), null, true );
		wp_register_style( 'modular-page-builder', PLUGIN_URL . '/assets/css/dist/modular-page-builder.css', array( 'wp-color-picker', 'select2' ) );

	}

	public function enqueue_builder( $post_id = null ) {

		wp_enqueue_media();
		wp_enqueue_script( 'modular-page-builder' );
		wp_enqueue_style( 'modular-page-builder' );

		$data = array(
			'l10n' => array(
				'addNewButton'  => __( 'Add new module', 'modular-page-builder' ),
				'selectDefault' => __( 'Select Module…', 'modular-page-builder' ),
			),
			'available_modules' => array(),
		);

		foreach ( array_keys( $this->available_modules ) as $module_name ) {

			if ( $module = $this->init_module( $module_name ) ) {
				$data['available_modules'][] = array(
					'name'  => $module->name,
					'label' => $module->label,
					'attr'  => $module->attr,
				);
			}
		}

		wp_localize_script( 'modular-page-builder', 'modularPageBuilderData', $data );

		add_action( 'admin_footer', array( $this, 'load_templates' ) );

	}

	public function load_templates() {
		foreach ( glob( PLUGIN_DIR . '/templates/*.tpl.html' ) as $filepath ) {
			$id = str_replace( '.tpl.html', '', basename( $filepath ) );
			echo '<script type="text/html" id="tmpl-mpb-' . esc_attr( $id ) . '">';
			include $filepath;
			echo '</script>';
		}
	}

	/**
	 * Make sure wpautoresize mce plugin is available for 'teeny' versions.
	 */
	function enable_autoresize_plugin( $plugins ) {
		if ( ! in_array( 'wpautoresize', $plugins ) ) {
			$plugins[] = 'wpautoresize';
		}
		return $plugins;
	}

}
