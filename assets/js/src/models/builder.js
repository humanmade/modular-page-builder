var Backbone         = require('backbone');
var Modules          = require('collections/modules');
var ModuleFactory    = require('utils/module-factory');

var Builder = Backbone.Model.extend({

	defaults: {
		selectDefault:   modularPageBuilderData.l10n.selectDefault,
		addNewButton:    modularPageBuilderData.l10n.addNewButton,
		selection:       [], // Instance of Modules. Can't use a default, otherwise they won't be unique.
		allowedModules:  [], // Module names allowed for this builder.
		requiredModules: [], // Module names required for this builder. They will be required in this order, at these positions.
	},

	initialize: function() {

		// Set default selection to ensure it isn't a reference.
		if ( ! ( this.get( 'selection' ) instanceof Modules ) ) {
			this.set( 'selection', new Modules() );
		}

		this.get( 'selection' ).on( 'change reset add remove', this.setRequiredModules, this );
		this.setRequiredModules();
	},

	setData: function( data ) {

		var _selection;

		if ( '' === data ) {
			return;
		}

		// Handle either JSON string or proper obhect.
		data = ( 'string' === typeof data ) ? JSON.parse( data ) : data;

		// Convert saved data to Module models.
		if ( data && Array.isArray( data ) ) {
			_selection = data.map( function( module ) {
				return ModuleFactory.create( module.name, module.attr );
			} );
		}

		// Reset selection using data from hidden input.
		if ( _selection && _selection.length ) {
			this.get('selection').reset( _selection );
		} else {
			this.get('selection').reset( [] );
		}

	},

	saveData: function() {

		var data = [];

		this.get('selection').each( function( module ) {

			// Skip empty/broken modules.
			if ( ! module.get('name' ) ) {
				return;
			}

			data.push( module.toMicroJSON() );

		} );

		this.trigger( 'save', data );

	},

	/**
	 * List all available modules for this builder.
	 * All modules, filtered by this.allowedModules.
	 */
	getAvailableModules: function() {
		return _.filter( ModuleFactory.availableModules, function( module ) {
			return this.isModuleAllowed( module.name );
		}.bind( this ) );
	},

	isModuleAllowed: function( moduleName ) {
		return this.get('allowedModules').indexOf( moduleName ) >= 0;
	},

	setRequiredModules: function() {
		var selection = this.get( 'selection' );
		var required  = this.get( 'requiredModules' );

		if ( ! selection || ! required || required.length < 1 ) {
			return;
		}

		for ( var i = 0; i < required.length; i++ ) {
			if (
				( ! selection.at( i ) || selection.at( i ).get( 'name' ) !== required[ i ] ) &&
				this.isModuleAllowed( required[ i ] )
			) {
				var module = ModuleFactory.create( required[ i ], [], { sortable: false } );
				selection.add( module, { at: i, silent: true } );
			} else if ( selection.at( i ).get( 'name' ) === required[ i ] ) {
				selection.at( i ).set( 'sortable', false );
			}
		}
	}

});

module.exports = Builder;
