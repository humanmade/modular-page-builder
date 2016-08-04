var $          = require('jquery');
var ModuleEdit = require('views/module-edit');
var FieldText = require('views/fields/field-text');
var FieldContentEditable = require('views/fields/field-content-editable');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var HighlightModuleEditView = ModuleEdit.extend({

	template: _.template( $( '#tmpl-mpb-module-edit-blockquote' ).html() ),

	fields: {
		text: null,
		source: null,
	},

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		this.fields.text = new FieldContentEditable( {
			value: this.model.getAttr('text').get('value'),
		} );

		this.fields.text.on( 'change', function( value ) {
			this.model.setAttrValue( 'text', value );
		}.bind(this) );

		this.fields.source = new FieldText( {
			value: this.model.getAttr('source').get('value'),
		} );

		this.fields.source.on( 'change', function( value ) {
			this.model.setAttrValue( 'source', value );
		}.bind(this) );

	},

	render: function() {

		ModuleEdit.prototype.render.apply( this );

		$( '.field-text', this.$el ).append( this.fields.text.render().$el );
		$( '.field-source', this.$el ).append( this.fields.source.render().$el );

		return this;

	},

});

module.exports = HighlightModuleEditView;
