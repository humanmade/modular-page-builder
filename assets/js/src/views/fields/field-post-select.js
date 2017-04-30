/* global ajaxurl */

var $     = require('jquery');
var wp    = require('wp');
var Field = require('views/fields/field');

/**
 * Text Field View
 *
 * You can use this anywhere.
 * Just listen for 'change' event on the view.
 */
var FieldPostSelect = Field.extend({

	template: wp.template( 'mpb-field-text' ),

	defaultConfig: {
		multiple: true,
		sortable: true,
		postType: 'post',
	},

	events: {
		'change input': 'inputChanged'
	},

	initialize: function( options ) {
		Field.prototype.initialize.apply( this, [ options ] );
		this.on( 'mpb:rendered', this.rendered );
	},

	setValue: function( value ) {

		if ( this.config.multiple && ! Array.isArray( value ) ) {
			value = [ value ];
		} else if ( ! this.config.multiple && Array.isArray( value ) ) {
			value = value[0];
		}

		Field.prototype.setValue.apply( this, [ value ] );

	},

	/**
	 * Get Value.
	 *
	 * @param  Return value as an array even if multiple is false.
	 */
	getValue: function() {

		var value = this.value;

		if ( this.config.multiple && ! Array.isArray( value ) ) {
			value = [ value ];
		} else if ( ! this.config.multiple && Array.isArray( value ) ) {
			value = value[0];
		}

		return value;

	},

	prepare: function() {

		var value = this.getValue();
		value = Array.isArray( value ) ? value.join( ',' ) : value;

		return {
			id:     this.cid,
			value:  value,
			config: {}
		};

	},

	rendered: function () {
		this.initSelect2();
		if ( this.config.multiple && this.config.sortable ) {
			this.initSortable();
		}
	},

	initSelect2: function() {

		var $field   = $( '#' + this.cid, this.$el );
		var postType = this.config.postType;
		var multiple = this.config.multiple;

		var formatRequest =function ( term, page ) {
			return {
				action: 'mce_get_posts',
				s: term,
				page: page,
				post_type: postType
			};
		};

		var parseResults = function ( response ) {
			return {
				results: response.results,
				more: response.more
			};
		};

		var initSelection = function( el, callback ) {

			var value = this.getValue();

			if ( Array.isArray( value ) ) {
				value = value.join(',');
			}

			if ( value ) {
				$.get( ajaxurl, {
					action: 'mce_get_posts',
					post__in: value,
					post_type: postType
				} ).done( function( data ) {
					if ( multiple ) {
						callback( parseResults( data ).results );
					} else {
						callback( parseResults( data ).results[0] );
					}
				} );
			}

		}.bind(this);

		$field.select2({
			minimumInputLength: 1,
			multiple: multiple,
			initSelection: initSelection,
			ajax: {
				url: ajaxurl,
				dataType: 'json',
				delay: 250,
				cache: false,
				data: formatRequest,
				results: parseResults,
			},
		});

	},

	initSortable: function() {
		$( '.select2-choices', this.$el ).sortable({
			items: '> .select2-search-choice',
			containment: 'parent',
			stop: function() {
				var sorted = [],
				    $input = $( 'input#' + this.cid, this.$el );

				$( '.select2-choices > .select2-search-choice', this.$el ).each( function() {
					sorted.push( $(this).data('select2Data').id );
				});

				$input.attr( 'value', sorted.join( ',' ) );
				$input.val( sorted.join( ',' ) );
				this.inputChanged();
			}.bind( this )
		});
	},

	inputChanged: function() {
		var value = $( 'input#' + this.cid, this.$el ).val();
		value = value.split( ',' ).map( Number );
		this.setValue( value );
	},

	remove: function() {
		try {
			$( '.select2-choices', this.$el ).sortable( 'destroy' );
		} catch( e ) {}
	},

} );

module.exports = FieldPostSelect;
