// var $          = require('jquery');
var ModuleEdit = require('views/module-edit');
var FieldText = require('views/fields/field-text');
var FieldContentEditable = require('views/fields/field-content-editable');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
module.exports = ModuleEdit.extend({

	template: wp.template( 'mpb-module-edit-blockquote' ),

	fields: {
		text: null,
		source: null,
	},

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		var fieldText = new FieldContentEditable( {
			value: this.model.getAttr('text').get('value'),
		} );

		var fieldSource = new FieldText( {
			value: this.model.getAttr('source').get('value'),
		} );

		this.views.add( '.field-text', fieldText );
		this.views.add( '.field-source', fieldSource );

		fieldText.on( 'change', function( value ) {
			this.model.setAttrValue( 'text', value );
		}.bind(this) );

		fieldSource.on( 'change', function( value ) {
			this.model.setAttrValue( 'source', value );
		}.bind(this) );

	},

});
