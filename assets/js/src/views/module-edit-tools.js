var wp = require('wp');

module.exports = wp.Backbone.View.extend({

	template: wp.template( 'mpb-module-edit-tools' ),
	className: 'module-edit-tools',

	events: {
		'click .button-selection-item-remove': function(e) {
			e.preventDefault();
			this.trigger( 'mpb:module-remove' );
		},
	},

});
