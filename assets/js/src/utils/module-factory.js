var Module           = require('models/module');
var ModuleAtts       = require('collections/module-attributes');
var $                = require('jquery');

var ModuleFactory = {

	availableModules: [],

	init: function() {
		if ( modularPageBuilderData && 'available_modules' in modularPageBuilderData ) {
			_.each( modularPageBuilderData.available_modules, function( module ) {
				this.registerModule( module );
			}.bind( this ) );
		}
	},

	registerModule: function( module ) {
		this.availableModules.push( module );
	},

	/**
	 * Create Module Model.
	 * Use data from config, plus saved data.
	 *
	 * @param  string moduleName
	 * @param  object attribute JSON. Saved attribute values.
	 * @return Module
	 */
	create: function( moduleName, attrData ) {

		var data = $.extend( true, {}, _.findWhere( this.availableModules, { name: moduleName } ) );

		if ( ! data ) {
			return null;
		}

		var attributes = new ModuleAtts();

		/**
		 * Add all the module attributes.
		 * Whitelisted to attributes documented in schema
		 * Sets only value from attrData.
		 */
		_.each( data.attr, function( attr ) {

			var cloneAttr = $.extend( true, {}, attr  );
			var savedAttr = _.findWhere( attrData, { name: attr.name } );

			// Add saved attribute values.
			if ( savedAttr && 'value' in savedAttr ) {
				cloneAttr.value = savedAttr.value;
			}

			attributes.add( cloneAttr );

		} );

		data.attr = attributes;

	    return new Module( data );

	},

};

module.exports = ModuleFactory;
