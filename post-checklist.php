<?php

/**
 * Plugin Name: WP Post Checklist
 */

add_action( 'init', function() {

	$ver = '0.1';

	wp_register_script( 'wp-api-js', plugins_url( 'wp-api-client-js/wp-api.js', __FILE__ ), array( 'jquery', 'underscore', 'backbone' ), $ver, true );
	wp_register_script( 'fusion-post-checklist-model', plugins_url( 'js/post-model.js', __FILE__ ), array( 'wp-api-js' ), $ver, true );
	wp_register_script( 'fusion-post-checklist', plugins_url( 'js/post-checklist.js', __FILE__ ), array( 'fusion-post-checklist-model' ), $ver, true );

	wp_register_style( 'fusion-post-checklist', plugins_url( 'css/post-checklist.css', __FILE__ ), array(), $ver );

	wp_localize_script( 'wp-api-js', 'WP_API_Settings', array(
		'root' => null,
		'nonce' => wp_create_nonce( 'wp_json' ),
	) );

	wp_localize_script( 'fusion-post-check', 'WP_API_Settings', array(
		'strings' => array(
			'title' => __( 'Post Publish Checklist', 'fusion-post-checklist' ),
		),
	) );

	wp_enqueue_script( 'fusion-post-checklist' );
	wp_enqueue_style( 'fusion-post-checklist' );

	add_action( 'admin_footer', function() {
		include( dirname( __FILE__ ) . '/templates/templates.php' );
	} );

} );
