<?php
/**
 * Plugin Name: Modular Page Builder
 * Version: 0.1
 * Author: Human Made Limited
 * Author URI: http://hmm.md
 * License: GPL v2 or later
 *
 * Originally built for UsTwo.com.
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

namespace ModularPageBuilder;

use WP_CLI;

define( __NAMESPACE__ . '\\PLUGIN_URL', plugins_url( null, __FILE__ ) );
define( __NAMESPACE__ . '\\PLUGIN_DIR', __DIR__ );

require __DIR__ . '/inc/class-plugin.php';
require __DIR__ . '/inc/class-builder.php';
require __DIR__ . '/inc/class-builder-post-meta.php';
require __DIR__ . '/inc/modules/class-module.php';
require __DIR__ . '/inc/modules/class-header.php';
require __DIR__ . '/inc/modules/class-text.php';
require __DIR__ . '/inc/modules/class-image.php';
require __DIR__ . '/inc/modules/class-blockquote.php';

add_action( 'init', function() {

	$plugin = Plugin::get_instance();

	$plugin->register_module( 'header', __NAMESPACE__ . '\Modules\Header' );
	$plugin->register_module( 'text', __NAMESPACE__ . '\Modules\Text' );
	$plugin->register_module( 'image', __NAMESPACE__ . '\Modules\Image' );
	$plugin->register_module( 'blockquote', __NAMESPACE__ . '\Modules\Blockquote' );

	$plugin->register_builder_post_meta( 'modular-page-builder', array(
		'title'           => __( 'Page Body Content' ),
		'api_prop'        => 'page_builder',
		'allowed_modules' => array( 'header', 'text', 'image', 'video', 'blockquote', ),
	) );

}, 100 );

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	require __DIR__ . '/inc/class-wp-cli.php';
	WP_CLI::add_command( 'modular-page-builder', __NAMESPACE__ . '\\CLI' );
}


