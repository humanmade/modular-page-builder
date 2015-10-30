/* global ajaxurl */

var $     = require('jquery');
var Field = require('views/fields/field');

/**
 * Text Field View
 *
 * You can use this anywhere.
 * Just listen for 'change' event on the view.
 */
var FieldPostSelect = Field.extend({

	template:  $( '#tmpl-mpb-field-text' ).html(),
	value: [],
	multiple: true,

	defaultConfig: {
		multiple: true,
	},

	events: {
		'change input.select2': 'inputChanged'
	},

	/**
	 * Init.
	 *
	 * options.value is used to pass initial value.
	 */
	initialize: function( options ) {
		Field.prototype.initialize.apply( this, [ options ] );
	},

	render: function () {

		var data = {
			id: this.cid,
			value: '',
			config: {}
		};

		// Create element from template.
		this.$el.html( _.template( this.template, data ) );

		this.initSelect2();

		return this;

	},

	setValue: function( value ) {

		if ( this.multiple && ! Array.isArray( value ) ) {
			value = [ value ];
		} else if ( ! this.multiple && Array.isArray( value ) ) {
			value = value[0];
		}

		Field.prototype.setValue.apply( this, [ value ] );

	},

	getValue: function() {

		var value = this.value;

		if ( this.multiple && ! Array.isArray( value ) ) {
			value = [ value ];
		} else if ( ! this.multiple && Array.isArray( value ) ) {
			value = value[0];
		}

		return value;

	},

	initSelect2: function() {

		var $field = $( '#' + this.cid, this.$el );

		var formatRequest =function ( term, page ) {
			return {
				action: 'mce_get_posts',
				s: term,
				page: page
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
			}
		});

	},

	inputChanged: function() {

		var value = $( 'input.select2', this.$el ).val();

		if ( this.config.multiple ) {
			value = value.split( ',' ).map( Number );
		} else {
			value = parseInt( value );
		}

		this.setValue( value );

	},

	remove: function() {
	},

} );

module.exports = FieldPostSelect;
