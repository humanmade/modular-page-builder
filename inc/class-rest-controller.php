<?php

namespace ModularPageBuilder;

use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;
use WP_Http;
use WP_REST_Posts_Controller;

/**
 * REST API Controller for the page builder routes.
 */
class REST_Controller extends \WP_REST_Controller {

	public function __construct( Builder $builder ) {
		$this->builder = $builder;
	}

	public function register_routes() {
		register_rest_route( 'modular-page-builder/v1', $this->builder->args['api_prop'] . '/(?P<id>[\d]+)', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'permission_callback' => array( $this, 'get_item_permissions_check' ),
				'callback'            => array( $this, 'get_items' ),
			),
		) );

		register_rest_route( 'modular-page-builder/v1', $this->builder->args['api_prop'] . '/(?P<id>[\d]+)/(?P<number>[\d]+)', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'permission_callback' => array( $this, 'get_item_permissions_check' ),
				'callback'            => array( $this, 'get_item' ),
				'args'                => array(
					'number'          => array(
						'sanitize_callback' => 'absint',
					),
				),
			),
		) );
	}

	public function get_item_permissions_check( $request ) {
		$rest_controller = new WP_REST_Posts_Controller( get_post_type( $request['id'] ) );

		return $rest_controller->get_item_permissions_check( $request );
	}

	public function get_items( $request ) {
		$modules = $this->builder->get_raw_data( $request['id'] );

		$num = 0;

		$data = array_map( function ( $module ) use ( $request, &$num ) {
			$module = Plugin::get_instance()->init_module( $module['name'], $module );
			$response = $this->prepare_item_for_response( $module, $request );
			$data = $response->get_data();
			$data['id'] = $num;
			$num++;
			return $data;
		}, $modules );

		return $data;
	}

	public function get_item( $request ) {

		$modules = $this->builder->get_raw_data( $request['id'] );

		if ( ! isset( $modules[ $request['number'] ] ) ) {
			return new WP_Error( 'module-not-found', 'The module id you specified was not found.', array( 'status' => WP_Http::NOT_FOUND ) );
		}

		$module = $modules[ $request['number'] ];
		$module = Plugin::get_instance()->init_module( $module['name'], $module );

		return $this->prepare_item_for_response( $module, $request );
	}

	public function prepare_item_for_response( $module, $request ) {

		$response = new WP_REST_Response( $module->get_json() );
		$links = $module->get_rest_links();

		foreach ( $links as $rel => $link ) {
			$response->add_link( $rel, $link['href'], $link );
		}

		return $response;
	}
}
