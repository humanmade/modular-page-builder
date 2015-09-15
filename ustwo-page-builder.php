<?php
/**
 * Plugin Name: UsTwo Page Builder
 * Version: 0.1
 * Author: Human Made Limited
 * Author URI: http://hmm.md
 * License: GPL v2 or later
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

namespace UsTwo\Page_Builder;

use WP_CLI;

define( __NAMESPACE__ . '\\PLUGIN_URL', plugins_url( null, __FILE__ ) );
define( __NAMESPACE__ . '\\PLUGIN_DIR', __DIR__ );

require __DIR__ . '/inc/class-plugin.php';
require __DIR__ . '/inc/class-builder.php';
require __DIR__ . '/inc/class-builder-post-meta.php';

add_action( 'init', function() {

	$plugin = Plugin::get_instance();

	$plugin->register_builder_post_meta( 'ustwo-page-builder', array(
		'title'           => __( 'Page Body Content' ),
		'api_prop'        => 'page_builder',
		'allowed_modules' => array( 'header', 'text', 'image', 'video', 'blockquote', ),
	) );

}, 99999 );

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	require __DIR__ . '/inc/class-wp-cli.php';
	WP_CLI::add_command( 'ustwo-page-builder', '\UsTwo\Page_Builder\CLI' );
}
