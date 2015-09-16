/**
 * Available Modules.
 *
 * All available modules must be registered by ading them to the array of availableModules.
 * All default model data must be defined here.
 * Only the 'value' of each attribute is saved.
 */
var availableModules = [];

availableModules.push({
	label: 'Header',
	name:  'header',
	attr: [
		{ name: 'heading',    label: 'Heading',               type: 'text' },
		{ name: 'subheading', label: 'Subheading (optional)', type: 'textarea' },
	]
});

availableModules.push({
	label: 'Text',
	name:  'text',
	attr: [
		{ name: 'heading', label: 'Heading', type: 'text' },
		{ name: 'body',    label: 'Content', type: 'wysiwyg' },
		{ name: 'style',   label: 'Style',   type: 'select', options: [ { value: '1-column', label: '1 column' }, { value: '2-columns', label: '2 columns' } ] },
	]
});

availableModules.push({
	name:  'stats',
	label: 'Stats/Figures',
	attr: [
		{ name: 'title', label: 'Title',    type: 'text' },
		{ name: 'col1',  label: 'Column 1', type: 'textarea' },
		{ name: 'col2',  label: 'Column 2', type: 'textarea' },
		{ name: 'col3',  label: 'Column 3', type: 'textarea' },
	]
});

availableModules.push({
	name:  'video',
	label: 'Video',
	attr: [
		{ name: 'video_id', label: 'Vimeo Video ID', type: 'text' },
	]
});

availableModules.push({
	label: 'Image',
	name: 'image',
	attr: [
		{ name: 'image',   label: 'Image',   type: 'image', config: { multiple: false, sizeReq: { width: 1024, height: 768 } } },
		{ name: 'caption', label: 'Caption', type: 'image' },
	]
});

availableModules.push({
	name: 'blockquote',
	label: 'Large Quote',
	attr: [
		{ name: 'text',     label: 'Quote Text',  type: 'textarea' },
		{ name: 'source',   label: 'Source',      type: 'text' },
	]
} );

availableModules.push({
	label: 'Case Studies',
	name:  'case_studies',
	attr: [
		{ name: 'case_studies', label: 'Case Studies', type: 'postID' },
	]
});

availableModules.push({
	label: 'Content Grid',
	name:  'grid',
	attr: [
		{ name: 'grid_cells', label: 'Grid Cells', type: 'builder' },
		{ name: 'grid_video', label: 'Video', type: 'video' },
		{ name: 'grid_image', label: 'Image', type: 'image' },
	]
});

availableModules.push({
	label: 'Text/Image Cell',
	name:  'grid_cell',
	attr: [
		{ name: 'heading', label: 'Heading', type: 'text' },
		{ name: 'body',    label: 'Content', type: 'wysiwyg' },
		{ name: 'image',   label: 'Image',   type: 'image', config: { sizeReq: { width: 640, height: 480 } } },
	]
});

availableModules.push({
	label: 'Image with logo and heading',
	name:  'image_logo_headline',
	attr: [
		{ name: 'heading', label: 'Heading', type: 'text' },
		{ name: 'image',   label: 'Image',   type: 'image', config: { sizeReq: { width: 1024, height: 768 } } },
	]
});

module.exports = availableModules;
