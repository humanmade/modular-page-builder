var Backbone         = require('backbone');
var Modules          = require('collections/modules');
var ModuleFactory    = require('utils/module-factory');

var Builder = Backbone.Model.extend({

	defaults: {
		id:             '', // Builder unique ID.
		object_id:      0, // Unique object ID for builder.
		selectDefault:  modularPageBuilderData.l10n.selectDefault,
		addNewButton:   modularPageBuilderData.l10n.addNewButton,
		selection:      [], // Instance of Modules. Can't use a default, otherwise they won't be unique.
		allowedModules: [], // Module names allowed for this builder.
	},

	initialize: function() {

		_.bindAll( this, 'toggleCollapsedState', 'isModuleCollapsed' );

		// Set default selection to ensure it isn't a reference.
		if ( ! ( this.get('selection') instanceof Modules ) ) {
			this.set( 'selection', new Modules() );
		}

	},

	setData: function( data ) {

		var selection;

		if ( '' === data ) {
			return;
		}

		// Handle either JSON string or proper obhect.
		data = ( 'string' === typeof data ) ? JSON.parse( data ) : data;

		// Convert saved data to Module models.
		if ( data && Array.isArray( data ) ) {
			selection = data.map( function( module ) {
				return ModuleFactory.create( module.name, module.attr );
			} );
		}

		// Reset selection using data from hidden input.
		if ( selection && selection.length ) {
			this.get('selection').add( selection );
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

	getCollapsedState: function() {

		var state;
		var key      = 'mpb-' + this.get( 'id' ) + '-collapsed-state';
		var objectId = this.get( 'object_id' );

		try {
			state = window.localStorage.getItem( key );
			state = JSON.parse( state );
			state = state ? state : {};
		} catch( e ) {
			state = {};
		}

		// Maybe set the object Id.
		if ( ! ( objectId in state ) ) {
			state[ objectId ] = {};
		}

		return state;

	},

	setCollapsedState: function( state ) {

		var key      = 'mpb-' + this.get( 'id' ) + '-collapsed-state';
		var objectId = this.get( 'object_id' );

		for ( var moduleId in state[ objectId ] ) {
			if ( ! state[ objectId ][ moduleId ] ) {
				delete state[ objectId ][ moduleId ];
			}
		}

		// Clear empty object Ids.
		if ( _.isEmpty( state[ objectId ] ) ) {
			delete state[ objectId ];
		}

		if ( ! _.isEmpty( state ) ) {
			window.localStorage.setItem( key, JSON.stringify( state ) );
		} else {
			window.localStorage.removeItem( key );
		}

	},

	toggleCollapsedState: function( moduleView ) {

		var state = this.getCollapsedState();
		var objectId = this.get( 'object_id' );
		var moduleId  = moduleView.cid;

		// Set the collapsed state.
		if ( ! ( moduleId in state[ objectId ] ) ) {
			state[ objectId ][ moduleId ] = true;
		} else {
			state[ objectId ][ moduleId ] = ! state[ objectId ][ moduleId ];
		}

		this.setCollapsedState( state );

	},

	isModuleCollapsed: function( moduleId ) {

		var state    = this.getCollapsedState();
		var objectId = this.get( 'object_id' );

		return ( moduleId in state[ objectId ] ) && state[ objectId ][ moduleId ];

	},

});

module.exports = Builder;
