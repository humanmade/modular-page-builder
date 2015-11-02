var $ = require('jquery');
var FieldText = require('views/fields/field-text');

var FieldNumber = FieldText.extend({

	template:  $( '#tmpl-mpb-field-number' ).html(),

	getValue: function() {
		return parseFloat( this.value );
	},

	setValue: function( value ) {

		this.value = parseFloat( value );

		this.trigger( 'change', this.getValue() );

	},

} );

module.exports = FieldNumber;
