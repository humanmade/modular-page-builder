var FieldText       = require('views/fields/field-text');
var FieldTextarea   = require('views/fields/field-textarea');
var FieldWYSIWYG    = require('views/fields/field-wysiwyg');
var FieldAttachment = require('views/fields/field-attachment');
var FieldLink       = require('views/fields/field-link');
var FieldNumber     = require('views/fields/field-number');

var fieldViews = {
	text:       FieldText,
	textarea:   FieldTextarea,
	html:       FieldWYSIWYG,
	number:     FieldNumber,
	attachment: FieldAttachment,
	link:       FieldLink,
};

module.exports = fieldViews;
