<?php

namespace UsTwo\Page_Builder;

use WP_CLI;
use WP_CLI_Command;
use WP_Query;

/**
 * Implements example command.
 */
class CLI extends WP_CLI_Command {

	/**
	 * Generate modular layout data from standard post content.
	 *
	 * @subcommand generate-from-content
	 * @synopsis [--post_type=<post>] [--dry_run]
	 */
	public function generate_from_content( $args, $assoc_args ) {

		$plugin = Plugin::get_instance();

		$assoc_args = wp_parse_args( $assoc_args, array(
			'post_type' => 'post',
			'dry_run'   => false,
		) );

		$query_args = array(
			'post_type'      => $assoc_args['post_type'],
			'post_status'    => 'any',
			'posts_per_page' => 50,
		);

		$page       = 1;
		$more_posts = true;

		while ( $more_posts ) {

			$query_args['paged'] = $page;
			$query = new WP_Query( $query_args );

			foreach ( $query->posts as $post ) {

				if ( empty( $post->post_content ) ) {
					continue;
				}

				WP_CLI::line( "Migrating data for $post->ID" );

				$module = array(
					'name' => 'text',
					'attr' => array(
						array( 'name' => 'body', 'type' => 'wysiwyg', 'value' => $post->post_content ),
					)
				);

				$modules = $plugin->get_data( $post->ID, 'ustwo-page-builder-data' );
				$modules[] = $module;

				$modules = $plugin->validate_modules( $modules );

				if ( ! $assoc_args['dry_run'] ) {
					$modules = $plugin->save_data( $post->ID, 'ustwo-page-builder-data', $modules );
					wp_update_post( array( 'ID' => $post->ID, 'post_content' => '' ) );
				}

			}

			$more_posts = $page < absint( $query->max_num_pages );
			$page++;

		}

	}

	/**
	 * Validate all page builder data.
	 *
	 * @subcommand validate-data
 	 * @synopsis [--post_type=<post>] [--dry_run]
	 */
	public function validate_data( $args, $assoc_args ) {

		$plugin = Plugin::get_instance();

		$assoc_args = wp_parse_args( $assoc_args, array(
			'post_type' => 'post',
			'dry_run'   => false,
		) );

		$query_args = array(
			'post_type'      => $assoc_args['post_type'],
			'posts_per_page' => 50,
			'post_status'    => 'any',
		);

		$page       = 1;
		$more_posts = true;

		while ( $more_posts ) {

			$query_args['paged'] = $page;
			$query = new WP_Query( $query_args );

			foreach ( $query->posts as $post ) {

				WP_CLI::line( "Validating data for $post->ID" );

				$modules = $plugin->get_data( $post->ID, 'ustwo-page-builder-data' );

				if ( ! $assoc_args['dry_run'] ) {
					$plugin->save_data( $post->ID, 'ustwo-page-builder-data', $modules );
				}

			}

			$more_posts = $page < absint( $query->max_num_pages );
			$page++;

		}

	}

	/**
	 * Fix double header bug.
	 *
	 * Following `generate-from-content` you get double headers.
	 * This fixes things where the first module heading is the same as the page title.
	 * This issue has been fixed in the original command - only required for legacy content.
	 *
	 * @subcommand fix-double-header
	 * @synopsis [--post_type=<post>] [--dry_run]
	 */
	public function fix_double_header( $args, $assoc_args ) {

		$plugin = Plugin::get_instance();

		$assoc_args = wp_parse_args( $assoc_args, array(
			'post_type' => 'post',
			'dry_run'   => false,
		) );

		$query_args = array(
			'post_type'      => $assoc_args['post_type'],
			'posts_per_page' => 50,
			'post_status'    => 'any',
		);

		$page       = 1;
		$more_posts = true;

		while ( $more_posts ) {

			$query_args['paged'] = $page;
			$query = new WP_Query( $query_args );

			foreach ( $query->posts as $post ) {

				$modules = $plugin->get_data( $post->ID, 'ustwo-page-builder-data' );

				if ( count( $modules ) <= 0 ) {
					continue;
				}

				if (
					'text' === $modules[0]['name']
					&& isset( $modules[0]['attr']['heading'] )
					&& $post->post_title === $modules[0]['attr']['heading']['value']
				) {
					WP_CLI::line( "Updating data for $post->ID" );
					unset( $modules[0]['attr']['heading'] );

					if ( ! $assoc_args['dry_run'] ) {
						$plugin->save_data( $post->ID, 'ustwo-page-builder-data', $modules );
					}

				}
			}

			$more_posts = $page < absint( $query->max_num_pages );
			$page++;

		}

	}
}
