var $     = require('jquery');
var wp    = require('wp');
var Field = require('views/fields/field');

var FieldText = Field.extend({

	template: wp.template( 'mpb-field-checkbox' ),

	defaultConfig: {
		label: 'Test Label',
	},

	events: {
		'change  input': 'inputChanged',
	},

	inputChanged: _.debounce( function() {
		this.setValue( $( 'input', this.$el ).prop( 'checked' ) );
	} ),

} );

module.exports = FieldText;
