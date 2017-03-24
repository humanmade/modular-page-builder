var wp              = require('wp');
var ModuleEditTools = require('views/module-edit-tools');

/**
 * Very generic form view handler.
 * This does some basic magic based on data attributes to update simple text fields.
 */
module.exports = wp.Backbone.View.extend({

	className: 'module-edit',

	initialize: function() {

		_.bindAll( this, 'render', 'removeModel' );

		var tools = new ModuleEditTools( {
			label: this.model.get( 'label' )
		} );

		this.views.add( '', tools );
		this.model.on( 'change:sortable', this.render );
		tools.on( 'mpb:module-remove', this.removeModel );

	},

	render: function() {
		wp.Backbone.View.prototype.render.apply( this, arguments );
		this.$el.attr( 'data-cid', this.model.cid );
		this.$el.toggleClass( 'module-edit-sortable', this.model.get( 'sortable' ) );
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

});
