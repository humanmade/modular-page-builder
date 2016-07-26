/* global ajaxurl */

var $           = require('jquery');
var Field       = require('views/fields/field');

/**
 * Text Field View
 *
 * You can use this anywhere.
 * Just listen for 'change' event on the view.
 */
var FieldPostSelect = Field.extend({

	template: _.template( $( '#tmpl-mpb-field-text' ).html() ),

	defaultConfig: {
		multiple: true,
		postType: 'post'
	},

	events: {
		'change input': 'inputChanged'
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

	render: function () {

		var value, data;

		value = this.getValue();
		value = Array.isArray( value ) ? value.join( ',' ) : value;

		data = {
			id: this.cid,
			value: value,
			config: {}
		};

		this.$el.html( this.template( data ) );

		this.initSelect2();

		return this;

	},

	initSelect2: function() {

		var $field = $( '#' + this.cid, this.$el );
		var postType = this.config.postType;

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

			var value = this.getValue().join(',');

			if ( value.length ) {
				$.get( ajaxurl, {
					action: 'mce_get_posts',
					post__in: value,
					post_type: postType
				} ).done( function( data ) {
					callback( parseResults( data ).results );
				} );
			}

		}.bind(this);

		$field.select2({
			minimumInputLength: 1,
			multiple: this.config.multiple,
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

	inputChanged: function() {
		var value = $( 'input#' + this.cid, this.$el ).val();
		value = value.split( ',' ).map( Number );
		this.setValue( value );
	},

	remove: function() {
	},

} );

module.exports = FieldPostSelect;
