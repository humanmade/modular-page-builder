var $               = require('jquery');
var ModuleEdit      = require('views/module-edit');
var FieldText       = require('views/fields/field-text');
var FieldTextarea   = require('views/fields/field-textarea');
var FieldWYSIWYG    = require('views/fields/field-wysiwyg');
var FieldAttachment = require('views/fields/field-attachment');
var FieldLink       = require('views/fields/field-link');

/**
 * Generic Edit Form.
 *
 * Handles a wide range of generic field types.
 * For each attribute, it creates a field based on the attribute 'type'
 * Also uses optional attribute 'config' property when initializing field.
 */
var ModuleEditDefault = ModuleEdit.extend({

	rowTemplate: '<div class="form-row"><label class="form-row-label"><%= label %></label><div class="field"></div></div>',

	fieldViews: {
		text:       { view: FieldText },
		textarea:   { view: FieldTextarea },
		html:       { view: FieldWYSIWYG },
		attachment: { view: FieldAttachment },
		link:       { view: FieldLink },
	},

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		_.bindAll( this, 'render' );

		var fields     = this.fields = {};
		var fieldViews = this.fieldViews;
		var model      = this.model;

		// For each attribute -
		// initialize a field for that attribute 'type'
		// Store in this.fields
		// Use config from the attribute
		this.model.get('attr').each( function( singleAttr ) {

			var field, type, name, config;

			type = singleAttr.get('type');

			if ( type && ( type in fieldViews ) ) {

				field  = fieldViews[ type ];
				name   = singleAttr.get('name');
				config = singleAttr.get('config') || {};

				fields[ name ] = new field.view({
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

			// Create row element from template.
			var $row = $( _.template( this.rowTemplate, {
				label: this.model.getAttr( name ).get('label'),
			} ) );

			$row.append( field.render().$el );
			$el.append( $row );

		}.bind(this) );

		return this;

	},

});

module.exports = ModuleEditDefault;
