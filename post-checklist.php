<?php

/**
 * Plugin Name: WP Post Checklist
 */

add_action( 'init', function() {

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

	add_action( 'admin_footer', function() {
		do_action( 'fpc_tests' );
		include( dirname( __FILE__ ) . '/templates/templates.php' );
	} );

}, 100 );

/**
 * Register checklist items.
 */
add_filter( 'fpc_items', function( $items ) {

	$items[] = array(
		'label' => 'Has at least 3 narratives.',
		'test'  => 'fpcTestNarratives',
	);

	$items[] = array(
		'label' => 'Has post featured iamge.',
		'test'  => 'fpcTestFeaturedImage',
	);

	$items[] = array(
		'label' => 'Content between 500 and 1500 words.',
		'test'  => 'fpcTestContentLength',
	);

	return $items;

});

/**
 * Output the FPC tests.
 */
add_action( 'fpc_tests', function() {

	?>

<script type="text/javascript">

	var fpcTestNarratives = function( post ) {

		var count = 0;
		var terms = post.get('terms');

		for ( var tax in terms ) {
			count += terms[tax].length;
		}

		return count > 3;

	}

	var fpcTestFeaturedImage = function( post ) {
		return post.get('featured_image') ? true : false;
	}

	var fpcTestContentLength = function( post ) {
		var content = post.get('content') || '';
		var length  = content.split(' ').length;
		return ( length > 500 && length < 1500 ) ? true : false;
	}

</script>

	<?php
});
