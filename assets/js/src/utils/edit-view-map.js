/**
 * Map module type to views.
 */
var editViewMap = {
	'header':              require('views/module-edit-header'),
	'textarea':            require('views/module-edit-textarea'),
	'text':                require('views/module-edit-text'),
	'stats':               require('views/module-edit-stats'),
	'image':               require('views/module-edit-image'),
	'video':               require('views/module-edit-video'),
	'blockquote':          require('views/module-edit-blockquote'),
	'case_studies':        require('views/module-edit-case-studies'),
	'grid':                require('views/module-edit-grid'),
	'grid_cell':           require('views/module-edit-grid-cell'),
	'image_logo_headline': require('views/module-edit-image-logo-headline'),
};

module.exports = editViewMap;
