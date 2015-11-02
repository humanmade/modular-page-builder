// Expose some functionality globally.
var globals = {
	Builder:       require('models/builder'),
	ModuleFactory: require('utils/module-factory'),
	editViews:     require('utils/edit-views'),
	fieldViews:    require('utils/field-views'),
	views: {
		BuilderView:     require('views/builder'),
		ModuleEdit:      require('views/module-edit'),
		ModuleEditDefault: require('views/module-edit-default'),
		Field:           require('views/fields/field'),
		FieldLink:       require('views/fields/field-link'),
		FieldAttachment: require('views/fields/field-attachment'),
		FieldText:       require('views/fields/field-text'),
		FieldTextarea:   require('views/fields/field-textarea'),
		FieldWysiwyg:    require('views/fields/field-wysiwyg'),
		FieldPostSelect: require('views/fields/field-post-select'),
	}
};

module.exports = globals;
