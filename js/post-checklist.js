(function( $, window, undefined ) {

	window.fusionPostChecklist = window.fusionPostChecklist || {};

	var self = this;
	var post = window.fusionPostChecklist.post;

	self.models      = {};
	self.collections = {};
	self.views       = {};

	/**
	 * Single Test Model.
	 *
	 * Models should have a label, a test callback function and a status.
	 * Item status will get updated with the result of the test
	 * when the state of the global post model changes.
	 */
	self.models.item = Backbone.Model.extend({

		defaults: {
			label:  '',
			test: null,
			status: null, // expects bool or string.
			blocker: true,
		},

		initialize: function() {
			this.updateStatus();
			post.bind( 'change', this.updateStatus, this );
		},

		updateStatus: function() {
			var test = this.get('test');
			var status = test( post );
    		this.set( 'status', status );
		}

	});

	self.collections.items = Backbone.Collection.extend({
		model: self.models.item,
	})

	self.models.checklist = Backbone.Model.extend({
		defaults: {
			title: fusionPostChecklistData.strings.title,
			items: self.collections.items,
		},
	});

	self.views.checklist = wp.Backbone.View.extend({

		template:  wp.template('post-checklist'),
		className: 'fpc-list',

		initialize: function() {
			this.model.get('items').bind( "change reset add remove", this.render, this);
		},

		render: function() {

			var t = this;

			if ( this.model.get('items').length < 1 ) {
				this.$el.html('');
				return this;
			}

			this.$el.html( this.template( this.model.toJSON() ) );

			this.model.get('items').each( function( item ) {
				t.views.add( 'ul', new self.views.item( { model: item } ) );
			} );

			var blockers = this.model.get('items').filter( function( item ) {
				return item.get('blocker') && item.get('status') !== true;
			});

			if ( blockers.length > 0 ) {
				$('#publish').prop( 'disabled', true );
			} else {
				$('#publish').prop( 'disabled', false );
			}

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


	var checklistItems = new self.collections.items( fusionPostChecklistData.items );
	var checklistModel = new self.models.checklist( { items: checklistItems } );
	var checklistView  = new self.views.checklist( { model: checklistModel } );

	$(document).ready( function() {
		checklistView.render().$el.prependTo( $( '#major-publishing-actions' ) );
	});

	window.fusionPostChecklist.addItem = function( item ) {
		var items = checklistView.model.get( 'items' );
		items.add( item  );
	};

})( jQuery, window );
