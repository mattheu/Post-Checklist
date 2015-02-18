(function( $, window, undefined ) {

	var self = this;

	self.post = new wp.api.models.Post();

	self.post.on( 'change', function() {
		console.log( self.post.toJSON() );
	} );

	self.init = function() {
		self.postProps();
		self.postTerms();
		self.postTermsHeirarchical();
	}

	self.postProps = function() {

		var postProps = [
			{ name: 'title', selector: '#title', events: 'change keyup blur' },
			{ name: 'content', selector: '#content', events: 'change keyup blur postChecklist:change'  },
		];

		_.each( postProps, function( prop ) {

			var $field = $( prop.selector );

			self.post.set( prop.name, $field.val() );

			$field.on( prop.events, function() {
				self.post.set( prop.name, $field.val() );
			} );

		} );

		self.triggerContentUpdate();

	}

	self.postTerms = function() {

		var taxonomies = [
			{ name: 'post_tag', selector: '#tax-input-post_tag', events: 'change postChecklist:change' },
			{ name: 'taxonomy-slug', selector: '#tax-input-taxonomy-slug', events: 'change postChecklist:change' },
		]

		_.each( taxonomies, function( tax ) {

			var $field = $( tax.selector );

			var updateTerms = function() {
				var terms = _.clone( self.post.get( 'terms' ) );
				terms[tax.name] = $field.val().split(',').map( function(s) { return s.trim() } );
				self.post.set( 'terms', terms );
			}

			updateTerms();
			$field.on( tax.events, updateTerms );

		} );

		self.triggerTermUpdate();

	}

	self.postTermsHeirarchical = function() {

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

			}

			updateTerms();
			$fields.on( tax.events, updateTerms );

			/**
			 * When new categories are added
			 * Need to update $fields with new inputs.
			 * And update terms.
			 * Use mutation observer when available.
			 */
			var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
			if ( MutationObserver ) {

				var observer = new MutationObserver( function() {
					$fields.off( tax.events, updateTerms );
					$fields = $( tax.selector );
					$fields.on( tax.events, updateTerms );
					updateTerms();
				} );

				observer.observe( $fields.closest( '.categorydiv' )[0], { childList: true, subtree: true } );

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
			 * When popular terms are checked,
			 * trigger update.
			 */
			var popular = $fields.closest( '.categorydiv' ).find( '.popular-category input' );
			popular.change( function() {
				window.setTimeout( function() {
					updateTerms();
				}, 200 );
			} );

		} );

	}

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
	 * When #Content TinyMCE Editor changes,
	 * trigger custom event on hidden #content textarea
	 * so we can update post model.
	 */
	self.triggerContentUpdate = function() {

		$(window).load( function() {
			var editor = tinyMCE.get("content");
			if ( editor ) {
				editor.on( 'change', function() {
					jQuery('#content').trigger( 'postChecklist:change' );
				} );
			}
		} );

	}

	self.init();

})( jQuery, window );
