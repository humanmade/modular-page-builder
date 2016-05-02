var $ = require('jquery');
var Field = require('views/fields/field');

var FieldContentEditable = Field.extend({

	template:  _.template( $( '#tmpl-mpb-field-content-editable' ).html() ),

	events: {
		'keyup  .content-editable-field': 'inputChanged',
		'change .content-editable-field': 'inputChanged',
	},

	inputChanged: _.debounce( function(e) {
		if ( e && e.target ) {
        	this.setValue( $(e.target).html() );
        }
	} ),

} );

module.exports = FieldContentEditable;
