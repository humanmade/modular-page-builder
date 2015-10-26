var $          = require('jquery');
var ModuleEdit = require('views/module-edit');
var FieldText  = require('views/field-wysiwyg');

var TextModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-mpb-module-edit-text' ).html(),
	textField: null,

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		// Initialize our textfield subview.
		this.textField = new FieldText( {
			value: this.model.getAttr('body').get('value'),
		} );

		// Listen for change event in subview and update current value.
		this.textField.on( 'change', function( value ) {
			this.setAttr( 'body', value );
		}.bind(this) );

		/**
		 * Destroy the text field when model is removed.
		 */
		this.model.on( 'destroy', function() {
			this.textField.remove();
		}.bind(this) );

	},

	render: function() {

		// Call default ModuleEdeit render.
		ModuleEdit.prototype.render.apply( this );

		// Render and insert textField view.
		$( '.text-field', this.$el ).append(
			this.textField.render().$el
		);

		return this;

	},

});

module.exports = TextModuleEditView;
