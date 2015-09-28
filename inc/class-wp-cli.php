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

		$plugin  = Plugin::get_instance();
		$builder = $plugin->get_builder( 'ustwo-page-builder' );

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

				$modules   = $builder->get_raw_data( $post->ID );
				$modules[] = $module;

				$modules = $builder->validate_data( $modules );

				if ( ! $assoc_args['dry_run'] ) {
					$modules = $builder->save_data( $post->ID, $modules );
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

		$plugin  = Plugin::get_instance();
		$builder = $plugin->get_builder( 'ustwo-page-builder' );

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

				$modules = $builder->get_raw_data( $post->ID );

				if ( ! $assoc_args['dry_run'] ) {
					$builder->save_data( $post->ID, $modules );
				}
			}

			$more_posts = $page < absint( $query->max_num_pages );
			$page++;

		}

	}

	/**
	 * Migrate legacy image data.
	 *
	 * We used to store the full image model in the DB.
	 * Now - just store the ID and fetch the data on output.
	 * This is leaner and more flexible to changes.
	 *
	 * @subcommand migrate-legacy-image-data
	 * @synopsis [--builder_id] [--post_type=<post>] [--dry_run]
	 */
	public function migrate_legacy_image_data( $args, $assoc_args ) {

		$assoc_args = wp_parse_args( $assoc_args, array(
			'post_type' => 'post',
			'dry_run'   => false,
			'builder_id'  => 'ustwo-page-builder',
		) );

		$plugin  = Plugin::get_instance();
		$builder = $plugin->get_builder( $assoc_args['builder_id'] );

		if ( ! $builder ) {
			return;
		}

		$query_args = array(
			'post_type'      => $assoc_args['post_type'],
			'posts_per_page' => 50,
			'post_status'    => 'any',
			// @codingStandardsIgnoreStart
			'meta_key'       => sprintf( '%s-data', $assoc_args['builder_id'] ),
			// @codingStandardsIgnoreEnd
			'meta_compare'   => 'EXISTS',
		);

		$page       = 1;
		$more_posts = true;

		while ( $more_posts ) {

			$query_args['paged'] = $page;
			$query = new WP_Query( $query_args );

			foreach ( $query->posts as $post ) {

				WP_CLI::line( "Updating data for $post->ID" );

				$modules = $builder->get_raw_data( $post->ID );

				foreach ( $modules as &$module ) {
					$module = $this->migrate_legacy_image_data_for_module( $module );
				}

				$builder->save_data( $post->ID, $modules );

			}

			$more_posts = $page < absint( $query->max_num_pages );
			$page++;

		}

	}

	function migrate_legacy_image_data_for_module( $module ) {

		// Migrate data function.
		$migrate_callback = function( $val ) {
			if ( is_numeric( $val ) ) {
				return absint( $val );
			} elseif ( is_object( $val ) && isset( $val->id ) ) {
				return absint( $val->id );
			}
		};

		foreach ( $module['attr'] as &$attr ) {

			$simple_image_fields = array( 'image', 'image_logo_headline' );

			if ( in_array( $module['name'], $simple_image_fields ) && isset( $module['attr']['image'] ) ) {

				$module['attr']['image']['value'] = array_filter( array_map( $migrate_callback, (array) $module['attr']['image']['value'] ) );

			} elseif ( 'grid' === $module['name'] ) {

				if ( isset( $module['attr']['grid_image'] ) ) {
					$module['attr']['grid_image']['value'] = array_filter( array_map( $migrate_callback, $module['attr']['grid_image']['value'] ) );
				}

				if ( isset( $module['attr']['grid_cells'] ) ) {
					foreach ( $module['attr']['grid_cells']['value'] as &$cell ) {
						$cell->attr->image->value = array_filter( array_map( $migrate_callback, $cell->attr->image->value ) );
					}
				}
			}

			return $module;

		}
	}
}
