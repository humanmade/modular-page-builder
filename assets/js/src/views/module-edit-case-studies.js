var $          = require('jquery');
var ModuleEdit = require('views/module-edit');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var HighlightModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-ustwo-module-edit-case-studies' ).html(),
	caseStudyAttr: null,

	initialize: function() {
		ModuleEdit.prototype.initialize.apply( this );
		this.caseStudyAttr = this.model.get('attr').findWhere( { name: 'case_studies' });
	},

	render: function () {
		ModuleEdit.prototype.render.apply( this );
		this.initSelect2();
		return this;
	},

	initSelect2: function() {

		var $field = $( '[data-module-attr-name=case_studies]', this.$el );
		var values = this.caseStudyAttr.get('value');

		$.ajax( '/wp-json/ustwo/v1/case-studies/').done( function( data ) {

			data = _.map( data, function( item ) {
				return { id: item.slug, text: item.name };
			});

			$field.select2( {
				allowClear: true,
				data: data,
				multiple: true,
			} ).select2( 'val', values.split( ',' ) );

		} );

	},

	removeModel: function(e) {
		ModuleEdit.prototype.removeModel.apply( this, [e] );
	},

});

module.exports = HighlightModuleEditView;
