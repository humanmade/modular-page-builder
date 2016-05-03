var $               = require('jquery');
var ModuleEdit      = require('views/module-edit');
var fieldViews      = require('utils/field-views');

/**
 * Generic Edit Form.
 *
 * Handles a wide range of generic field types.
 * For each attribute, it creates a field based on the attribute 'type'
 * Also uses optional attribute 'config' property when initializing field.
 */
var ModuleEditDefault = ModuleEdit.extend({

	rowTemplate: _.template( $('#tmpl-mpb-form-row' ).html() ),

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		_.bindAll( this, 'render' );

		var fields = this.fields = {};
		var model  = this.model;

		// For each attribute -
		// initialize a field for that attribute 'type'
		// Store in this.fields
		// Use config from the attribute
		this.model.get('attr').each( function( singleAttr ) {

			var fieldView, type, name, config;

			type = singleAttr.get('type');

			if ( type && ( type in fieldViews ) ) {

				fieldView = fieldViews[ type ];
				name      = singleAttr.get('name');
				config    = singleAttr.get('config') || {};

				fields[ name ] = new fieldView({
					value: model.getAttrValue( name ),
					config: config,
					onChange: function( value ) {
						model.setAttrValue( name, value );
					},
				});

			}

		} );

		// Cleanup.
		// Remove each field view when this model is destroyed.
		this.model.on( 'destroy', function() {
			_.each( fields, function(field) {
				field.remove();
			} );
		} );

	},

	render: function() {

		// Call default ModuleEdeit render.
		ModuleEdit.prototype.render.apply( this );

		var $el = this.$el;

		// For each field, render sub-view and append to this.$el
		// Uses this.rowTemplate.
		_.each( this.fields, function( field, name ) {

			var attr = this.model.getAttr( name );

			// Create row element from template.
			var $row = $( this.rowTemplate( {
				label: attr.get('label'),
				desc:  attr.get('description' ),
			} ) );

			$( '.field', $row ).append( field.render().$el );
			$el.append( $row );

		}.bind(this) );

		return this;

	},

});

module.exports = ModuleEditDefault;
