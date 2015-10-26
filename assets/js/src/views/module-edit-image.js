var $          = require('jquery');
var ModuleEdit = require('views/module-edit');
var FieldAttachment = require('views/field-attachment');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var ImageModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-mpb-module-edit-image' ).html(),

	fields: {
		image: null
	},

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		this.imageAttr = this.model.getAttr('image');

		var config = this.imageAttr.get('config') || {};

		config = _.extend( {
			multiple: false,
		}, config );

		this.fields.image = new FieldAttachment( {
			value: this.imageAttr.get('value'),
			config: config,
		} );

		this.fields.image.on( 'change', function( data ) {
			this.setAttr( 'image', data );
		}.bind(this) );

	},

	render: function() {

		ModuleEdit.prototype.render.apply( this );

		$( '.image-field', this.$el ).append(
			this.fields.image.render().$el
		);

		return this;

	},

});

module.exports = ImageModuleEditView;
