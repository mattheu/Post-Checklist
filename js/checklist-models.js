(function( $, window, undefined ) {

	window.fusionPostChecklist = window.fusionPostChecklist || {};

	var self = window.fusionPostChecklist;

	self.models      = {};
	self.collections = {};
	self.views       = {};

	/**
	 * Single Test Model.
	 *
	 * Models should have a label, a test callback function and a test status.
	 * Test status will get updated when the state of the global post model changes.
	 */
	self.models.test = Backbone.Model.extend({

		defaults: {
			label:  '',
			testCallback: null,
			status: 'unknown', // expects bool or string.
		},

		initialize: function() {
			this.updateStatus();
			self.post.bind( 'change', this.updateStatus, this );
		},

		updateStatus: function() {
			var status = this.get( 'testCallback' )( self.post );
			this.set( 'status', status );
		}

	});

	self.collections.tests = Backbone.Collection.extend({
		model: self.models.test,
	})

	self.models.checklist = Backbone.Model.extend({
		defaults: {
			title: 'Post Publish Checklist',
			tests: self.collections.tests,
		},
	});

	self.views.checklist = wp.Backbone.View.extend({

		template:  wp.template('post-checklist'),
		className: 'fpc-list',

		initialize: function() {
			this.model.get('tests').bind( "change reset add remove", this.render, this);
		},

		render: function() {

			var t = this;

			if ( this.model.get('tests').length < 1 ) {
				this.$el.html('');
				return this;
			}

			this.$el.html( this.template( this.model.toJSON() ) );

			this.model.get('tests').each( function( test ) {
				t.views.add( 'ul', new self.views.item( { model: test } ) );
			} );

			return this;

		}

	});

	self.views.item = wp.Backbone.View.extend({

		tagName: 'li',
		template:  wp.template('post-checklist-item'),
		className: 'fpc-list-item',

		initialize: function() {
			this.model.bind( "change", this.render, this);
		},

		render: function() {

			var data = this.model.toJSON();

			// Reset Class.
			this.$el.attr( 'class', this.className )

			if ( typeof( data.status ) === 'boolean' ) {
				data.symbol = ( data.status ) ? '&#10004;' : '&#10008;';
				this.$el.addClass( 'fpc-status-' + ( ( data.status ) ? 'true' : 'false' ) );
			} else {
				data.symbol = '&#63;';
				this.$el.addClass( 'fpc-status-' + data.status );
			}

			this.$el.html( this.template( data ) );

			return this;

		}
	});

	$(document).ready( function() {

		var tests = new self.collections.tests([
			{
				label: 'Has at least 3 narratives.',
				testCallback: function( post ) {
					var count = 0;
					var terms = post.get('terms');
					for ( var tax in terms ) {
						count += terms[tax].length;
					}
					return count > 3;
				}
			},
			{
				label: 'Content between 500 and 1500 words.',
				testCallback: function( post ) {
					var content = post.get('content') || '';
					var length  = content.split(' ').length;
					return ( length > 500 && length < 1500 ) ? true : false;
				}
			},
			{
				label: 'Has post thumbnail',
				testCallback: function( post ) {
					return post.get('featured_image') ? true : false;
				}
			},
		]);

		var checklistModel = new self.models.checklist( { tests: tests } );
		var checklistView  = new self.views.checklist( { model: checklistModel } );

		checklistView.render().$el.prependTo( $( '#major-publishing-actions' ) );

	} );

})( jQuery, window );
