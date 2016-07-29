var wp            = require('wp');
var ModuleFactory = require('utils/module-factory');
var $             = require('jquery');

module.exports = wp.Backbone.View.extend({

	template: wp.template( 'mpb-builder' ),
	className: 'modular-page-builder',
	model: null,
	newModuleName: null,

	events: {
		'change > .add-new .add-new-module-select': 'toggleButtonStatus',
		'click > .add-new .add-new-module-button': 'addModule',
	},

	initialize: function() {

		var selection = this.model.get('selection');

		selection.on( 'add', this.addNewSelectionItemView, this );
		selection.on( 'all', this.model.saveData, this.model );

		this.model.get('selection').each( function( module ) {
			this.addNewSelectionItemView( module );
		}.bind(this) );

		this.on( 'mpb:rendered', this.rendered );

	},

	prepare: function() {
		var options = this.model.toJSON();
		options.defaultLabel     = modularPageBuilderData.l10n.selectDefault;
		options.availableModules = this.model.getAvailableModules();
		return options;
	},

	render: function() {
		wp.Backbone.View.prototype.render.apply( this, arguments );
		this.trigger( 'mpb:rendered' );
		return this;
	},

	rendered: function() {
		this.initSortable();
	},

	/**
	 * Initialize Sortable.
	 */
	initSortable: function() {
		$( '> .selection', this.$el ).sortable({
			handle: '.module-edit-tools',
			items:  '> .module-edit',
			stop:   function( e, ui ) {
				this.updateSelectionOrder( ui );
				this.triggerSortStop( ui.item.attr( 'data-cid') );
			}.bind( this )
		});
	},

	/**
	 * Sortable end callback.
	 * After reordering, update the selection order.
	 * Note - uses direct manipulation of collection models property.
	 * This is to avoid having to mess about with the views themselves.
	 */
	updateSelectionOrder: function( ui ) {

		var selection = this.model.get('selection');
		var item      = selection.get({ cid: ui.item.attr( 'data-cid') });
		var newIndex  = ui.item.index();
		var oldIndex  = selection.indexOf( item );

		if ( newIndex !== oldIndex ) {
			var dropped = selection.models.splice( oldIndex, 1 );
			selection.models.splice( newIndex, 0, dropped[0] );
			this.model.saveData();
		}

	},

	/**
	 * Trigger sort stop on subView (by model CID).
	 */
	triggerSortStop: function( cid ) {

		var views = this.views.get( '> .selection' );

		if ( views && views.length ) {

			var view = _.find( views, function( view ) {
				return cid === view.model.cid;
			} );

			if ( view ) {
				view.trigger( 'mpb:sort-stop' );
			}

		}

	},

	/**
	 * Toggle button status.
	 * Enable/Disable button depending on whether
	 * placeholder or valid module is selected.
	 */
	toggleButtonStatus: function(e) {
		var value         = $(e.target).val();
		var defaultOption = $(e.target).children().first().attr('value');
		$('.add-new-module-button', this.$el ).attr( 'disabled', value === defaultOption );
		this.newModuleName = ( value !== defaultOption ) ? value : null;
	},

	/**
	 * Handle adding module.
	 *
	 * Find module model. Clone it. Add to selection.
	 */
	addModule: function(e) {

		e.preventDefault();

		if ( this.newModuleName && this.model.isModuleAllowed( this.newModuleName ) ) {
			var model = ModuleFactory.create( this.newModuleName );
			this.model.get('selection').add( model );
		}

	},

	/**
	 * Append new selection item view.
	 */
	addNewSelectionItemView: function( item ) {

		if ( ! this.model.isModuleAllowed( item.get('name') ) ) {
			return;
		}

		var view = ModuleFactory.createEditView( item );
		this.views.add( '> .selection', view );

		var $selection = $( '> .selection', this.$el );
		if ( $selection.hasClass('ui-sortable') ) {
			$selection.sortable('refresh');
		}

	},

});
