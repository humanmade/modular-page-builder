var $     = require('jquery');
var wp    = require('wp');
var Field = require('views/fields/field');

var FieldContentEditable = Field.extend({

	template: wp.template( 'mpb-field-content-editable' ),

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
