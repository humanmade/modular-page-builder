var wp    = require('wp');
var Field = require('views/fields/field');

var FieldText = Field.extend({

	template: wp.template( 'mpb-field-text' ),

	defaultConfig: {
		classes: 'regular-text',
		placeholder: null,
	},

	events: {
		'keyup   input': 'inputChanged',
		'change  input': 'inputChanged',
	},

	inputChanged: _.debounce( function(e) {
		if ( e && e.target ) {
			this.setValue( e.target.value );
		}
	} ),

} );

module.exports = FieldText;
