var $          = require('jquery');
var ModuleEdit = require('views/module-edit');
var FieldImage = require('views/field-image');

/**
 * Header Module.
 * Extends default moudule with custom different template.
 */
var GridCellModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-ustwo-module-edit-grid-cell' ).html(),
	imageField: null,

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		var imageAttr = this.model.getAttr('image');

		this.imageField = new FieldImage( {
			value: imageAttr.get('value'),
			config: imageAttr.get('config') || {},
		} );

		this.imageField.on( 'change', function( data ) {
			imageAttr.set( 'value', data );
			this.model.trigger( 'change', this.model );
		}.bind(this) );

	},

	render: function () {

		ModuleEdit.prototype.render.apply( this );

		$( '.image-field', this.$el ).append(
			this.imageField.render().$el
		);

		return this;

	},

});

module.exports = GridCellModuleEditView;
