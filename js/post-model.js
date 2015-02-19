/**
 * Post Model.
 *
 * Maintain a model of the current post state.
 * It should live update.
 * It sometimes takes a bit of hacky JS to do this!
 */
(function( $, window, undefined ) {

	var self = this;

	window.fusionPostChecklist = window.fusionPostChecklist || {};
	self.post = window.fusionPostChecklist.post = new wp.api.models.Post();

	self.init = function() {
		self.postProps();
		self.postTerms();
		self.postTermsHeirarchical();
		self.fusionNarrativeFields();
		self.postFeaturedImage();
	}

	/**
	 * Listen for changes to fields that map directly to a post property.
	 * Update the Post model on change
	 * @return null
	 */
	self.postProps = function() {

		var postProps = [
			{ name: 'title', selector: '#title', events: 'change keyup blur' },
			{ name: 'content', selector: '#content', events: 'change keyup blur postChecklist:change'  },
		];

		_.each( postProps, function( prop ) {

			var $field = $( prop.selector );

			self.post.set( prop.name, $field.val() );

			$field.on( prop.events, _.debounce( function() {
				self.post.set( prop.name, $field.val() );
			}, 200 ) );

		} );

		// Trigger updates from tinyMCE editor
		self.triggerContentUpdate();

	}

	/**
	 * Update tags and other non-heirarchical terms.
	 * They must use the standard WP UI.
	 */
	self.postTerms = function() {

		// @TODO this could be dynamic
		var taxonomies = [
			{ name: 'post_tag', selector: '#tax-input-post_tag', events: 'change postChecklist:change' },
			{ name: 'taxonomy-slug', selector: '#tax-input-taxonomy-slug', events: 'change postChecklist:change' },
		]

		_.each( taxonomies, function( tax ) {

			var $field = $( tax.selector );

			var updateTerms = function() {
				var terms = _.clone( self.post.get( 'terms' ) );
				var val   = $field.val();
				if ( val )  {
					terms[tax.name] = val.split(',').map( function(s) { return s.trim() } );
					self.post.set( 'terms', terms );
			 	}
			};

			updateTerms();
			$field.on( tax.events, updateTerms );

		} );

		self.triggerTermUpdate();

	}

	/**
	 * Update post categories and other heirarchical terms
	 * They must use the standard WP UI.
	 */
	self.postTermsHeirarchical = function() {

		// @TODO this could be dynamic
		var heirarchicalTaxonomies = [
			{ name: 'category', selector: '[name^=post_category]', events: 'change postChecklist:change' },
		];

		_.each( heirarchicalTaxonomies, function( tax ) {

			var $fields = $( tax.selector );

			var updateTerms = function() {

				var terms = _.clone( self.post.get( 'terms' ) );
				terms[tax.name] = [];

				$fields.each( function() {

					if ( ! $(this).is(':checked' ) ) {
						return;
					}

					var id   = parseInt( $(this).val() );
					var name = $(this).closest('label').text().trim();

					if ( id ) {
						terms[tax.name].push( { id: id, name: name } );
					}

				} );

				self.post.set( 'terms', terms );

			};

			updateTerms();
			$fields.on( tax.events, updateTerms );

			/**
			 * When new categories are added - a whole new input is created.
			 * Need to update $fields, and attach event listeners to new elements.
			 * Also update terms to match current state.
			 * Use mutation observer when available.
			 */
			var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
			var node = $fields.closest( '.categorydiv' );

			if ( MutationObserver && node.length ) {

				var observer = new MutationObserver( function() {
					$fields.off( tax.events, updateTerms );
					$fields = $( tax.selector );
					$fields.on( tax.events, updateTerms );
					updateTerms();
				} );

				observer.observe( node[0], { childList: true, subtree: true } );

			} else {
				var addButton = $fields.closest( '.categorydiv' ).find( '.category-add-submit' );
				addButton.click( function() {
					setTimeout( function() {
						$fields.off( tax.events, updateTerms );
						$fields = $( tax.selector );
						$fields.on( tax.events, updateTerms );
						updateTerms();
					}, 250 );
				} );
			}

			/**
			 * Popular terms are a whole separate list of inputs.
			 * Terms should be updated when these are changed.
			 */
			var popular = $fields.closest( '.categorydiv' ).find( '.popular-category input' );
			popular.change( function() {
				window.setTimeout( function() {
					updateTerms();
				}, 200 );
			} );

		} );

	}

	/**
	 * Helper to trigger a custom change event when a new
	 * tag/term is created.
	 */
	self.triggerTermUpdate = function() {

		$( '.tagsdiv' ).each( function() {

			var $el = $(this);

			var triggerUpdate = function() {
				$el.find( '.the-tags' ).trigger( 'postChecklist:change' );
			}

			$el.find( 'input.tagadd' ).click( function() {
				window.setTimeout( triggerUpdate, 100 );
			});

			$el.find( 'input.newtag' ).on( 'keyup keypress', function(e) {
				if ( 13 == e.which ) {
					triggerUpdate();
				}
			});

		} );

	}

	/**
	 * Custom handler for #Content TinyMCE
	 * Update the post content property when there are any changes.
	 */
	self.triggerContentUpdate = function() {

		// Delay to ensure editor is created.
		window.setTimeout( function() {
			var editor = tinyMCE.get("content");
			if ( editor ) {
				editor.on( 'change keyup paste cut', _.debounce( function() {
					self.post.set( 'content', editor.getContent({ format : 'raw' } ) );
				}, 200 ) );
			}
		}, 500 );

	}


	/**
	 * Custom handler for #Content TinyMCE
	 * Update the post content property when there are any changes.
	 */
	self.postFeaturedImage = function() {

		wp.media.featuredImage.frame().state('featured-image').on( 'select', function() {
			self.post.set( 'featured_image', wp.media.featuredImage.get() );
		} );

		if ( $('#set-post-thumbnail img').length ) {
			self.post.set( 'featured_image', true );
		}

		$('#remove-post-thumbnail').click( function() {
			self.post.set( 'featured_image', false );
		} );

	}

	/**
	 * Custom Fusion Narrative fields.
	 * Listen for changes to custom fields that map to a taxonomy property.
	 * This is specific to some custom fusion fields.
	 */
	self.fusionNarrativeFields = function() {

		var updateTerms = function() {

			var $field = $(this);
			var terms  = _.clone( self.post.get( 'terms' ) );
			var tax    = $field.attr('name').match(/fusion_taxonomies\[(.+)\]/)[1];
			var val    = $field.val();

			if ( val ) {
				terms[tax] = val.split(',').map( function(s) { return s.trim() } );
			} else {
				terms[tax] = [];
			}

			self.post.set( 'terms', terms );

		};

		$('[name^=fusion_taxonomies]' ).each( function() {
			updateTerms.call( this );
			$(this).on( 'change', updateTerms );
		})

	}

	$(document).ready( function() {

		window.setTimeout( function() {
			self.init();
		}, 100 );

		// self.post.on('change', function() {
		// 	console.log( self.post.toJSON() );
		// } );

	});

})( jQuery, window );
