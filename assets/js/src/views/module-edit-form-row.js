var wp = require('wp');

module.exports = wp.Backbone.View.extend({

	template: wp.template( 'mpb-form-row' ),
	className: 'form-row',

	initialize: function( options ) {
		if ( 'field' in options ) {
			this.views.set( '.field', options.field );
		}
	},

});
