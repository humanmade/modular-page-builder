// Expose some functionality globally.
var globals = {
	Builder:       require('models/builder'),
	ModuleFactory: require('utils/module-factory'),
	editViewMap:   require('utils/edit-view-map'),
	views: {
		BuilderView:     require('views/builder'),
		ModuleEdit:      require('views/module-edit'),
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
