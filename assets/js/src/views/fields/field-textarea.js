var wp        = require('wp');
var FieldText = require('views/fields/field-text');

var FieldTextarea = FieldText.extend({

	template: wp.template( 'mpb-field-textarea' ),

	events: {
		'keyup  textarea': 'inputChanged',
		'change textarea': 'inputChanged',
	},

} );

module.exports = FieldTextarea;
