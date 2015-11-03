var FieldText       = require('views/fields/field-text');
var FieldTextarea   = require('views/fields/field-textarea');
var FieldWYSIWYG    = require('views/fields/field-wysiwyg');
var FieldAttachment = require('views/fields/field-attachment');
var FieldLink       = require('views/fields/field-link');
var FieldNumber     = require('views/fields/field-number');
var FieldCheckbox   = require('views/fields/field-checkbox');
var FieldSelect     = require('views/fields/field-select');

var fieldViews = {
	text:       FieldText,
	textarea:   FieldTextarea,
	html:       FieldWYSIWYG,
	number:     FieldNumber,
	attachment: FieldAttachment,
	link:       FieldLink,
	checkbox:   FieldCheckbox,
	select:     FieldSelect,
};

module.exports = fieldViews;
