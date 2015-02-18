<?php

/**
 * Plugin Name: WP Post Checklist
 */

add_action( 'init', function() {


		$labels = array(
			'name'					=> _x( 'Plural Name', 'Taxonomy plural name', 'text-domain' ),
			'singular_name'			=> _x( 'Singular Name', 'Taxonomy singular name', 'text-domain' ),
			'search_items'			=> __( 'Search Plural Name', 'text-domain' ),
			'popular_items'			=> __( 'Popular Plural Name', 'text-domain' ),
			'all_items'				=> __( 'All Plural Name', 'text-domain' ),
			'parent_item'			=> __( 'Parent Singular Name', 'text-domain' ),
			'parent_item_colon'		=> __( 'Parent Singular Name', 'text-domain' ),
			'edit_item'				=> __( 'Edit Singular Name', 'text-domain' ),
			'update_item'			=> __( 'Update Singular Name', 'text-domain' ),
			'add_new_item'			=> __( 'Add New Singular Name', 'text-domain' ),
			'new_item_name'			=> __( 'New Singular Name Name', 'text-domain' ),
			'add_or_remove_items'	=> __( 'Add or remove Plural Name', 'text-domain' ),
			'choose_from_most_used'	=> __( 'Choose from most used text-domain', 'text-domain' ),
			'menu_name'				=> __( 'Singular Name', 'text-domain' ),
		);

		$args = array(
			'labels'            => $labels,
			'public'            => true,
			'show_in_nav_menus' => true,
			'show_admin_column' => false,
			'hierarchical'      => false,
			'show_tagcloud'     => true,
			'show_ui'           => true,
			'query_var'         => true,
			'rewrite'           => true,
			'query_var'         => true,
			'capabilities'      => array(),
		);

		register_taxonomy( 'taxonomy-slug', array( 'post' ), $args );

	wp_enqueue_script( 'wp-api-js', plugins_url( 'wp-api-client-js/build/js/wp-api.js', __FILE__ ), array( 'jquery', 'underscore', 'backbone' ), '1.0', true );

	$settings = array( 'root' => home_url( null ), 'nonce' => wp_create_nonce( 'wp_json' ) );
	wp_localize_script( 'wp-api-js', 'WP_API_Settings', $settings );

	wp_enqueue_script( 'post-checklist-model', plugins_url( 'js/post-model.js', __FILE__ ), array( 'wp-api-js', 'jquery', 'underscore', 'backbone' ), '1.0', true );

} );
