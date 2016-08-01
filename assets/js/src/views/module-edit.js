var wp              = require('wp');
var ModuleEditTools = require('views/module-edit-tools');

/**
 * Very generic form view handler.
 * This does some basic magic based on data attributes to update simple text fields.
 */
module.exports = wp.Backbone.View.extend({

	template:  wp.template( 'mpb-module-edit' ),
	className: 'module-edit',

	initialize: function() {

		_.bindAll( this, 'removeModel', 'refresh', 'toggleCollapsed' );

		var tools = new ModuleEditTools( {
			label: this.model.get( 'label' )
		} );

		this.views.set( '.module-edit-tools-container', tools );

		tools.on( 'mpb:module-remove', this.removeModel );
		tools.on( 'mpb:module-toggle-collapsed', this.toggleCollapsed );

	},

	render: function() {
		wp.Backbone.View.prototype.render.apply( this, arguments );
		this.$el.attr( 'data-cid', this.model.cid );
		return this;
	},

	/**
	 * Remove model handler.
	 */
	removeModel: function() {
		this.remove();
		this.model.destroy();
	},

	/**
	 * Refresh view.
	 * Required after sort/collapse etc.
	 */
	refresh: function() {},

	toggleCollapsed: function() {
		this.$el.toggleClass( 'module-collapsed' );
	}

});
