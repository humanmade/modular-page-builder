var $ = require('jquery');
var FieldText = require('views/fields/field-text');

var FieldTextarea = FieldText.extend({

	template: _.template( $( '#tmpl-mpb-field-textarea' ).html() ),

	events: {
		'keyup  textarea': 'inputChanged',
		'change textarea': 'inputChanged',
	},

} );

module.exports = FieldTextarea;
