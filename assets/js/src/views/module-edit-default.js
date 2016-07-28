var ModuleEdit = require('views/module-edit');
var ModuleEditFormRow = require('views/module-edit-form-row');
var fieldViews = require('utils/field-views');

/**
 * Generic Edit Form.
 *
 * Handles a wide range of generic field types.
 * For each attribute, it creates a field based on the attribute 'type'
 * Also uses optional attribute 'config' property when initializing field.
 */
module.exports = ModuleEdit.extend({

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		_.bindAll( this, 'render' );

		// this.fields is an easy reference for the field views.
		var fieldsViews = this.fields = [];
		var model       = this.model;

		// For each attribute -
		// initialize a field for that attribute 'type'
		// Store in this.fields
		// Use config from the attribute
		this.model.get('attr').each( function( attr ) {

			var fieldView, type, name, config, view;

			type = attr.get('type');

			if ( ! type || ! ( type in fieldViews ) ) {
				return;
			}

			fieldView = fieldViews[ type ];
			name      = attr.get('name');
			config    = attr.get('config') || {};

			view = new fieldView( {
				value: model.getAttrValue( name ),
				config: config,
				onChange: function( value ) {
					model.setAttrValue( name, value );
				},
			});

			this.views.add( '', new ModuleEditFormRow( {
				label: attr.get('label'),
				desc:  attr.get('description' ),
				field: view
			} ) );

			fieldsViews.push( view );

		}.bind( this ) );

		// Cleanup.
		// Remove each field view when this model is destroyed.
		this.model.on( 'destroy', function() {
			_.each( this.fields, function( field ) {
				field.remove();
			} );
		} );

		this.on( 'mpb:sort-stop', function() {
			_.each( this.fields, function( field ) {
				field.trigger( 'mpb:sort-stop' );
			} );
		}.bind(this) );

	},

});
