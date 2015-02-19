<?php

/**
 * Plugin Name: WP Post Checklist
 */

namespace Fusion_Post_Checklist;

include_once( dirname( __FILE__ ) . '/dev.php' );

add_action( 'admin_enqueue_scripts', 'Fusion_Post_Checklist\action_admin_enqueue_scripts', 100 );

/**
 * Initialize Plugin.
 */
function action_admin_enqueue_scripts( $hook ) {

	if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ) ) ) {
        return;
    }

	$ver = '0.1';

	wp_register_script( 'wp-api-js', plugins_url( 'wp-api-client-js/wp-api.js', __FILE__ ), array( 'jquery', 'underscore', 'backbone' ), $ver, true );
	wp_register_script( 'fpc-model', plugins_url( 'js/post-model.js', __FILE__ ), array( 'wp-api-js' ), $ver, true );
	wp_register_script( 'fpc', plugins_url( 'js/post-checklist.js', __FILE__ ), array( 'fpc-model' ), $ver, true );

	wp_register_style( 'fpc', plugins_url( 'css/post-checklist.css', __FILE__ ), array(), $ver );

	wp_localize_script( 'wp-api-js', 'WP_API_Settings', array(
		'root' => null,
		'nonce' => wp_create_nonce( 'wp_json' ),
	) );

	/**
	 * Register items using the fpc_items filter.
	 * Required args
	 * - label - item description.
	 * - test - a JS function that will be called
	 */
	$items = array_map(
		function( $args ) {
			return wp_parse_args( $args, array(
				'label' => '',
				'test'  => '',
			) );
		},
		apply_filters( 'fpc_items', array() )
	);

	wp_localize_script(
		'fpc',
		'fusionPostChecklistData',
		array(
			'items' => $items,
			'strings' => array(
				'title' => __( 'Post Publish Checklist', 'fpc' ),
			),
		)
	);

	wp_enqueue_script( 'fpc' );
	wp_enqueue_style( 'fpc' );

	add_action( 'admin_footer', 'Fusion_Post_Checklist\action_admin_footer' );
	add_action( 'admin_footer', 'Fusion_Post_Checklist\action_admin_footer' );

}

function action_admin_footer() {
	do_action( 'fpc_scripts' );
	include( dirname( __FILE__ ) . '/templates/templates.php' );
}
