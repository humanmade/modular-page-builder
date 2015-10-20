/**
 * Map module type to views.
 */
var editViewMap = {
	'header':              require('views/module-edit-header'),
	'textarea':            require('views/module-edit-textarea'),
	'text':                require('views/module-edit-text'),
	'image':               require('views/module-edit-image'),
	'video':               require('views/module-edit-video'),
	'blockquote':          require('views/module-edit-blockquote'),
};

module.exports = editViewMap;
