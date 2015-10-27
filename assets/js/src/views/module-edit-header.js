var $             = require('jquery');
var ModuleEdit    = require('views/module-edit');
var FieldText     = require('views/fields/field-text');
var FieldTextarea = require('views/fields/field-textarea');

/**
 * Header Module.
 * Extends default moudule with custom different template.
 */
var HeaderModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-mpb-module-edit-header' ).html(),

	fields: {
		heading: null,
		subheading: null,
	},

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		this.fields.heading = new FieldText( {
			value: this.model.getAttr('heading').get('value'),
		} );

		this.fields.heading.on( 'change', function( value ) {
			this.setAttr( 'heading', value );
		}.bind(this) );

		this.fields.subheading = new FieldTextarea( {
			value: this.model.getAttr('subheading').get('value'),
		} );

		this.fields.subheading.on( 'change', function( value ) {
			this.setAttr( 'subheading', value );
		}.bind(this) );

	},

	render: function() {
		ModuleEdit.prototype.render.apply( this );
		$( '.field-heading', this.$el ).append( this.fields.heading.render().$el );
		$( '.field-subheading', this.$el ).append( this.fields.subheading.render().$el );
		return this;
	},

});

module.exports = HeaderModuleEditView;
