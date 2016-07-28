var wp        = require('wp');
var FieldText = require('views/fields/field-text');

var FieldNumber = FieldText.extend({

	template: wp.template( 'mpb-field-number' ),

	getValue: function() {
		return parseFloat( this.value );
	},

	setValue: function( value ) {
		this.value = parseFloat( value );
		this.trigger( 'change', this.getValue() );
	},

} );

module.exports = FieldNumber;
