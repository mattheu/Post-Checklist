<?php

/**
 * Output the FPC tests.
 */
add_action( 'fpc_scripts', function() {

	?>

<script type="text/javascript">

jQuery( document).ready( function() {

	window.fusionPostChecklist.addItem({
		'label': 'Must have at least 3 narratives.',
		test: function( post ) {

			var count = 0;
			var terms = post.get('terms');

			for ( var tax in terms ) {
				count += terms[tax].length;
			}

			return count >= 3;

		},
	});

	window.fusionPostChecklist.addItem( {
		'label':  'Has post featured iamge.',
		'test': function( post ) {
			return post.get('featured_image') ? true : false;
		}
	} );

	window.fusionPostChecklist.addItem( {
		'label': 'Content between 500 and 1500 words.',
		'test': function( post ) {
			var content = post.get('content') || '';
			var length  = content.split(' ').length;
			return ( length > 500 && length < 1500 ) ? true : false;
		}
	} );

} );

</script>

	<?php
});
