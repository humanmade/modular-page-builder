var $ = require('jquery');
var Field = require('views/fields/field');

var FieldLink = Field.extend({

	template: _.template( $( '#tmpl-mpb-field-link' ).html() ),

	events: {
		'keyup   input.field-text': 'textInputChanged',
		'change  input.field-text': 'textInputChanged',
		'keyup   input.field-link': 'linkInputChanged',
		'change  input.field-link': 'linkInputChanged',
	},

	initialize: function( options ) {

		Field.prototype.initialize.apply( this, [ options ] );

		this.value = this.value || {};
		this.value = _.defaults( this.value, { link: '', text: '' } );

	},

	textInputChanged: _.debounce( function(e) {
		if ( e && e.target ) {
			var value = this.getValue();
			value.text = e.target.value;
			this.setValue( value );
		}
	} ),

	linkInputChanged: _.debounce( function(e) {
		if ( e && e.target ) {
			var value = this.getValue();
			value.link = e.target.value;
			this.setValue( value );
		}
	} ),

});

module.exports = FieldLink;
