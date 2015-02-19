<?php

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
add_action( 'fpc_scripts', function() {

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
