(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var ModuleAttribute = require('./../models/module-attribute.js');

/**
 * Shortcode Attributes collection.
 */
var ShortcodeAttributes = Backbone.Collection.extend({

	model : ModuleAttribute,

	// Deep Clone.
	clone: function() {
		return new this.constructor( _.map( this.models, function(m) {
			return m.clone();
		}));
	},

	/**
	 * Return only the data that needs to be saved.
	 *
	 * @return object
	 */
	toMicroJSON: function( options ) {

		var json = {};

		this.each( function( model ) {
			json[ model.get( 'name' ) ] = model.toMicroJSON();
		} );

		return json;
	},


});

module.exports = ShortcodeAttributes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../models/module-attribute.js":5}],2:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var Module   = require('./../models/module.js');

// Shortcode Collection
var Modules = Backbone.Collection.extend({

	model : Module,

	//  Deep Clone.
	clone : function() {
		return new this.constructor( _.map( this.models, function(m) {
			return m.clone();
		}));
	},

	/**
	 * Return only the data that needs to be saved.
	 *
	 * @return object
	 */
	toMicroJSON: function( options ) {
		return this.map( function(model) { return model.toMicroJSON( options ); } );
	},

});

module.exports = Modules;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../models/module.js":6}],3:[function(require,module,exports){
// Expose some functionality globally.
globals = {
	Builder:       require('./models/builder.js'),
	BuilderView:   require('./views/builder.js'),
	ModuleFactory: require('./utils/module-factory.js'),
};

module.exports = globals;

},{"./models/builder.js":4,"./utils/module-factory.js":10,"./views/builder.js":11}],4:[function(require,module,exports){
(function (global){
var Backbone         = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var Modules          = require('./../collections/modules.js');
var ModuleFactory    = require('./../utils/module-factory.js');
var availableModules = require('./../utils/available-modules.js');
var $                = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Builder = Backbone.Model.extend({

	defaults: {
		selectDefault:  usTwoPageBuilderData.l10n.selectDefault,
		addNewButton:   usTwoPageBuilderData.l10n.addNewButton,
		selection:      [], // Instance of Modules. Can't use a default, otherwise they won't be unique.
		allowedModules: [], // Module names allowed for this builder.
	},

	initialize: function() {

		// Set default selection to ensure it isn't a reference.
		if ( ! ( this.get('selection') instanceof Modules ) ) {
			this.set( 'selection', new Modules );
		}

	},

	setData: function( data ) {

		var selection;

		if ( '' === data ) {
			return;
		}

		// Handle either JSON string or proper obhect.
		var data = ( 'string' === typeof data ) ? JSON.parse( data ) : data;

		// Convert saved data to Module models.
		if ( data && Array.isArray( data ) ) {
			selection = data.map( function( module ) {
				return ModuleFactory.create( module.name, module.attr );
			} );
		}

		// Reset selection using data from hidden input.
		if ( selection && selection.length ) {
			this.get('selection').add( selection );
		}

	},

	saveData: function() {

		var data = []

		this.get('selection').each( function( module ) {

			// Skip empty/broken modules.
			if ( ! module.get('name' ) ) {
				return;
			}

			data.push( module.toMicroJSON() );

		} );

		this.trigger( 'save', data );

	},

	/**
	 * List all available modules for this builder.
	 * All modules, filtered by this.allowedModules.
	 */
	getAvailableModules: function() {
		return _.filter( availableModules, function( module ) {
			return this.isModuleAllowed( module.name );
		}.bind( this ) );
	},

	isModuleAllowed: function( moduleName ) {
		return this.get('allowedModules').indexOf( moduleName ) >= 0;
	}

});

module.exports = Builder;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../collections/modules.js":2,"./../utils/available-modules.js":8,"./../utils/module-factory.js":10}],5:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);

var ModuleAttribute = Backbone.Model.extend({

	defaults: {
		name:         '',
		label:        '',
		value:        '',
		type:         'text',
		description:  '',
		defaultValue: '',
		config:       {}
	},

	/**
	 * Return only the data that needs to be saved.
	 *
	 * @return object
	 */
	toMicroJSON: function() {

		var r = {};
		var allowedAttrProperties = [ 'name', 'value', 'type' ];

		_.each( allowedAttrProperties, function( prop ) {
			r[ prop ] = this.get( prop );
		}.bind(this) );

		return r;

	}

});

module.exports = ModuleAttribute;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],6:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Backbone   = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var ModuleAtts = require('./../collections/module-attributes.js');

Module = Backbone.Model.extend({

	defaults: {
		name: '',
		label: '',
		attr: new ModuleAtts,
	},

	/**
	 * Get an attribute model by name.
	 */
	getAttr: function( attrName ) {
		return this.get('attr').findWhere( { name: attrName });
	},

	/**
	 * Custom Parse.
	 * Ensures attributes is an instance of ModuleAtts
	 */
	parse: function( response ) {

		if ( 'attr' in response && ! ( response.attr instanceof ModuleAtts ) ) {
			response.attr = new ModuleAtts( response.attr );
		}

	    return response;

	},

	toJSON: function() {

		var json = _.clone( this.attributes );

		if ( 'attr' in json && ( json.attr instanceof ModuleAtts ) ) {
			json.attr = json.attr.toJSON();
		}

		return json;

	},

	/**
	 * Return only the data that needs to be saved.
	 *
	 * @return object
	 */
	toMicroJSON: function() {

		return {
			name: this.get('name'),
			attr: this.get('attr').toMicroJSON()
		}
	},

});

module.exports = Module;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../collections/module-attributes.js":1}],7:[function(require,module,exports){
(function (global){
var $             = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Builder       = require('./models/builder.js');
var BuilderView   = require('./views/builder.js');
var ModuleFactory = require('./utils/module-factory.js');

// Expose some functionality to global namespace.
window.ustwoPageBuilder = require('./globals');

$(document).ready(function(){

	// A field for storing the builder data.
	var $field = $( '[name=ustwo-page-builder-data]' );

	if ( ! $field.length ) {
		return;
	}

	// A container element for displaying the builder.
	var $container = $( '#ustwo-page-builder' )

	// Create a new instance of Builder model.
	// Pass an array of module names that are allowed for this builder.
	var builder = new Builder({
		allowedModules: $( '[name=ustwo-page-builder-allowed-modules]' ).val().split(',')
	});

	// Set the data using the current field value
	builder.setData( JSON.parse( $field.val() ) );

	// On save, update the field value.
	builder.on( 'save', function( data ) {
		$field.val( JSON.stringify( data ) );
	} );

	// Create builder view.
	var builderView = new BuilderView( { model: builder } );

	// Render builder.
	builderView.render().$el.appendTo( $container )

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./globals":3,"./models/builder.js":4,"./utils/module-factory.js":10,"./views/builder.js":11}],8:[function(require,module,exports){
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
		{ name: 'image',   label: 'Image',   type: 'image', config: { sizeReq: { width: 1024, height: 768 } } },
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

},{}],9:[function(require,module,exports){
/**
 * Map module type to views.
 */
var editViewMap = {
	'header':              require('./../views/module-edit-header.js'),
	'textarea':            require('./../views/module-edit-textarea.js'),
	'text':                require('./../views/module-edit-text.js'),
	'stats':               require('./../views/module-edit-stats.js'),
	'image':               require('./../views/module-edit-image.js'),
	'video':               require('./../views/module-edit-video.js'),
	'blockquote':          require('./../views/module-edit-blockquote.js'),
	'case_studies':        require('./../views/module-edit-case-studies.js'),
	'grid':                require('./../views/module-edit-grid.js'),
	'grid_cell':           require('./../views/module-edit-grid-cell.js'),
	'image_logo_headline': require('./../views/module-edit-image-logo-headline.js'),
};

module.exports = editViewMap;

},{"./../views/module-edit-blockquote.js":13,"./../views/module-edit-case-studies.js":14,"./../views/module-edit-grid-cell.js":15,"./../views/module-edit-grid.js":16,"./../views/module-edit-header.js":17,"./../views/module-edit-image-logo-headline.js":18,"./../views/module-edit-image.js":19,"./../views/module-edit-stats.js":20,"./../views/module-edit-text.js":21,"./../views/module-edit-textarea.js":22,"./../views/module-edit-video.js":23}],10:[function(require,module,exports){
(function (global){
var availableModules = require('./available-modules.js');
var Module           = require('./../models/module.js');
var ModuleAtts       = require('./../collections/module-attributes.js');
var $                = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var ModuleFactory = {

	/**
	 * Create Module Model.
	 * Use data from config, plus saved data.
	 *
	 * @param  string moduleName
	 * @param  object attribute JSON. Saved attribute values.
	 * @return Module
	 */
	create: function( moduleName, attrData ) {

		var data = $.extend( true, {}, _.findWhere( availableModules, { name: moduleName } ) );

		if ( ! data ) {
			return null;
		}

		var attributes = new ModuleAtts;

		/**
		 * Add all the module attributes.
		 * Whitelisted to attributes documented in schema
		 * Sets only value from attrData.
		 */
		_.each( data.attr, function( attr ) {

			var cloneAttr = $.extend( true, {}, attr  );
			var savedAttr = _.findWhere( attrData, { name: attr.name } );

			// Add saved attribute values.
			if ( savedAttr && 'value' in savedAttr ) {
				cloneAttr.value = savedAttr.value;
			}

			attributes.add( cloneAttr );

		} );

		data.attr = attributes;

	    return new Module( data );

	},

}

module.exports = ModuleFactory;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../collections/module-attributes.js":1,"./../models/module.js":6,"./available-modules.js":8}],11:[function(require,module,exports){
(function (global){
var Backbone      = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var Builder       = require('./../models/builder.js');
var Modules       = require('./../collections/modules.js');
var editViewMap   = require('./../utils/edit-view-map.js');
var ModuleFactory = require('./../utils/module-factory.js');
var $             = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var Builder = Backbone.View.extend({

	template: $('#tmpl-ustwo-builder' ).html(),
	className: 'ustwo-page-builder',
	model: null,
	newModuleName: null,

	events: {
		'change > .add-new .add-new-module-select': 'toggleButtonStatus',
		'click > .add-new .add-new-module-button': 'addModule',
	},

	initialize: function(options) {

		var selection = this.model.get('selection')

		selection.on( "add", this.addNewSelectionItemView, this );
		selection.on( "all", this.model.saveData, this.model );

	},

	render: function() {

		var data = this.model.toJSON();

		this.$el.html( _.template( this.template, data  ) );

		this.model.get('selection').each( function( module ) {
			this.addNewSelectionItemView( module );
		}.bind( this ) );

		this.renderAddNew();
		this.initSortable();

		return this;

	},

	/**
	 * Render the Add New module controls.
	 */
	renderAddNew: function() {

		var $select = this.$el.find( '> .add-new select.add-new-module-select' );

		$select.append(
			$( '<option/>', { text: usTwoPageBuilderData.l10n.selectDefault } )
		);

		_.each( this.model.getAvailableModules(), function( module ) {
			var template = '<option value="<%= name %>"><%= label %></option>';
			$select.append( _.template( template, module ) );
		} );;

	},

	/**
	 * Initialize Sortable.
	 */
	initSortable: function() {
		$( '> .selection', this.$el ).sortable({
			handle: ".module-edit-tools",
			items: "> .module-edit",
			stop: this.updateSelectionOrder.bind( this ),
		});
	},

	/**
	 * Sortable end callback.
	 * After reordering, update the selection order.
	 * Note - uses direct manipulation of collection models property.
	 * This is to avoid having to mess about with the views themselves.
	 */
	updateSelectionOrder: function( e, ui ) {

		var selection = this.model.get('selection');
		var item      = selection.get({ cid: ui.item.attr( 'data-cid') });
		var newIndex  = ui.item.index();
		var oldIndex  = selection.indexOf( item );

		if ( newIndex != oldIndex ) {
			var dropped = selection.models.splice( oldIndex, 1 );
			selection.models.splice( newIndex, 0, dropped[0] );
			this.model.saveData();
		}

	},

	/**
	 * Toggle button status.
	 * Enable/Disable button depending on whether
	 * placeholder or valid module is selected.
	 */
	toggleButtonStatus: function(e) {
		var value         = $(e.target).val();
		var defaultOption = $(e.target).children().first().attr('value');
		$('.add-new-module-button', this.$el ).attr( 'disabled', value === defaultOption );
		this.newModuleName = ( value !== defaultOption ) ? value : null;
	},

	/**
	 * Handle adding module.
	 *
	 * Find module model. Clone it. Add to selection.
	 */
	addModule: function(e) {

		e.preventDefault();

		if ( this.newModuleName && this.model.isModuleAllowed( this.newModuleName ) ) {
			var model = ModuleFactory.create( this.newModuleName );
			this.model.get('selection').add( model );
		}

	},

	/**
	 * Append new selection item view.
	 */
	addNewSelectionItemView: function( item ) {

		var editView, view, customView;

		editView = ( item.get('name') in editViewMap ) ? editViewMap[ item.get('name') ] : null;

		if ( ! editView || ! this.model.isModuleAllowed( item.get('name') ) ) {
			return;
		}

		view = new editView( { model: item } );

		$( '> .selection', this.$el ).append( view.render().$el );

		var $selection = $( '> .selection', this.$el );
		if ( $selection.hasClass('ui-sortable') ) {
			$selection.sortable('refresh');
		}


	},

});

module.exports = Builder;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../collections/modules.js":2,"./../models/builder.js":4,"./../utils/edit-view-map.js":9,"./../utils/module-factory.js":10}],12:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Image Field
 *
 * Initialize and listen for the 'change' event to get updated data.
 *
 */
var FieldImage = Backbone.View.extend({

	template: $( '#tmpl-ustwo-field-image' ).html(),
	frame: null,
	imageAttr: null,
	value: [],
	config: {},

	events: {
		'click .image-placeholder .button.add': 'editImage',
		'click .image-placeholder img': 'editImage',
		'click .image-placeholder .button.remove': 'removeImage',
	},

	/**
	 * Initialize.
	 *
	 * Pass value and config as properties on the options object.
	 * Available options
	 * - multiple: bool
	 * - sizeReq: eg { width: 100, height: 100 }
	 *
	 * @param  object options
	 * @return null
	 */
	initialize: function( options ) {

		_.bindAll( this, 'editImage', 'onSelectImage', 'removeImage', 'isAttachmentSizeOk' );

		if ( 'value' in options ) {
			this.value = options.value
		}

		if ( 'config' in options ) {
			this.config = _.extend( {
				multiple: false,
			}, options.config );
		}

		this.on( 'change', this.render );

	},

	render: function() {

		var template = _.memoize( function( value, config ) {
			return _.template( this.template, {
				value: value,
				config: config,
			} )
		}.bind(this) );

		this.$el.html( template( this.value, this.config ) );

		return this;

	},

	onSelectImage: function() {

		var frame = this.frame || null;

		if ( ! frame ) {
			return;
		}

		frame.close();

		var selection = frame.state().get('selection');
		this.value    = [];

		selection.each( function( attachment ) {
			if ( this.isAttachmentSizeOk( attachment ) ) {
				this.value.push( attachment.toJSON() );
			}
		}.bind(this) );

		this.trigger( 'change', this.value );

	},

	editImage: function(e) {

		e.preventDefault();

		var frame = this.frame;

		if ( ! Array.isArray( this.value ) ) {
			this.value = [];
		}

		this.value.map( function( item ) {
			return new wp.media.model.Attachment( item );
		} );

		if ( ! frame ) {

			var frameArgs = {
				library: { type: 'image' },
				multiple: this.config.multiple,
				title: 'Select Image',
				frame: 'select',
				selection: this.value,
			}

			frame = this.frame = wp.media( frameArgs );

			frame.on( 'content:create:browse', this.setupFilters, this );
			frame.on( 'select', this.onSelectImage, this );

		}

		frame.open();

	},

	/**
	 * Add a filter to the frame library collection to limit to required size.
	 * @return null
	 */
	setupFilters: function() {

		var lib    = this.frame.state().get('library');

		if ( 'sizeReq' in this.config ) {
			lib.filters['size'] = this.isAttachmentSizeOk;
		}

	},

	removeImage: function(e) {

		e.preventDefault();

		var $target, attrModel, id;

		$target   = $(e.target);
		$target   = ( $target.prop('tagName') === 'BUTTON' ) ? $target : $target.closest('button.remove');
		id        = $target.data( 'image-id' );

		if ( ! id  ) {
			return;
		}

		this.value = _.filter( this.value, function( image ) {
			return ( image.id !== id );
		} );

		this.value = ( this.value.length > 0 ) ? this.value : '';

		this.trigger( 'change', this.value );

	},

	/**
	 * Does attachment meet size requirements?
	 *
	 * @param  Attachment
	 * @return boolean
	 */
	isAttachmentSizeOk: function( attachment ) {

		if ( ! 'sizeReq' in this.config ) {
			return true;
		}

		this.config.sizeReq = _.extend( {
			width: 0,
			height: 0,
		}, this.config.sizeReq );

		var widthReq  = attachment.get('width')  >= this.config.sizeReq.width;
		var heightReq = attachment.get('height') >= this.config.sizeReq.height;

		return widthReq && heightReq;

	}

} );

module.exports = FieldImage;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":24}],13:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var HighlightModuleEditView = ModuleEdit.extend({
	template: $( '#tmpl-ustwo-module-edit-blockquote' ).html(),
});

module.exports = HighlightModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":24}],14:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

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

		$.ajax( "/wp-json/ustwo/v1/case-studies/").done( function( data ) {

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":24}],15:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');
var FieldImage = require('./field-image.js');

/**
 * Header Module.
 * Extends default moudule with custom different template.
 */
var GridCellModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-ustwo-module-edit-grid-cell' ).html(),
	imageField: null,

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		var imageAttr = this.model.getAttr('image');

		this.imageField = new FieldImage( {
			value: imageAttr.get('value'),
			config: imageAttr.get('config') || {},
		} );

		this.imageField.on( 'change', function( data ) {
			imageAttr.set( 'value', data );
			this.model.trigger( 'change', this.model );
		}.bind(this) );

	},

	render: function () {

		ModuleEdit.prototype.render.apply( this );

		$( '.image-field', this.$el ).append(
			this.imageField.render().$el
		);

		return this;

	},

});

module.exports = GridCellModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field-image.js":12,"./module-edit.js":24}],16:[function(require,module,exports){
(function (global){
var $           = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit  = require('./module-edit.js');
var Builder     = require('./../models/builder.js');
var FieldImage  = require('./field-image.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var GridModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-ustwo-module-edit-grid' ).html(),

	imageField: null,

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		var imageAttr = this.model.getAttr('grid_image');

		this.imageField = new FieldImage( {
			value:  imageAttr.get('value'),
			config: imageAttr.get('config') || {},
		} );

		this.imageField.on( 'change', function( data ) {
			imageAttr.set( 'value', data );
			this.model.trigger( 'change', this.model );
		}.bind(this) );

	},

	render: function() {

		this.model.set( 'cid', this.model.cid );
		ModuleEdit.prototype.render.apply( this );

		this.renderBuilder();
		this.renderImage();

		return this;

	},

	renderBuilder: function() {

		var builder = new Builder({
			id: 'grid-builder-' + this.model.cid,
			allowedModules: [ 'grid_cell' ],
		});

		// Require BuilderView. Note - do it after runtime to avoid loop.
		var BuilderView = require('./builder.js');
		var builderView = new BuilderView( { model: builder } );

		$( '.builder', this.$el ).append( builderView.render().$el );

		// On save, update attribute with builder data.
		// Manually trigger change event.
		builder.on( 'save', function( data ) {
			this.model.getAttr( 'grid_cells' ).set( 'value', data );
			this.model.trigger( 'change', this.model );
		}.bind(this) );

		// Initalize data.
		var attrModel = this.model.getAttr( 'grid_cells' );

		if ( attrModel ) {
			builder.setData( attrModel.get( 'value') );
		}

	},

	renderImage: function() {

		$( '> .selection-item > .form-row > .image-field', this.$el ).append(
			this.imageField.render().$el
		);

	},

});

module.exports = GridModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../models/builder.js":4,"./builder.js":11,"./field-image.js":12,"./module-edit.js":24}],17:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Header Module.
 * Extends default moudule with custom different template.
 */
var HeaderModuleEditView = ModuleEdit.extend({
	template: $( '#tmpl-ustwo-module-edit-header' ).html(),
});

module.exports = HeaderModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":24}],18:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');
var FieldImage = require('./field-image.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var ImageModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-ustwo-module-edit-image-logo-headline' ).html(),
	imageField: null,
	imageAttr: null,

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		this.imageAttr = this.model.getAttr('image');

		var config = this.imageAttr.get('config') || {};

		config = _.extend( {
			multiple: false,
		}, config );

		this.imageField = new FieldImage( {
			value: this.imageAttr.get('value'),
			config: config,
		} );

		this.imageField.on( 'change', function( data ) {
			this.imageAttr.set( 'value', data );
			this.model.trigger( 'change', this.model );
		}.bind(this) );

	},

	render: function() {

		ModuleEdit.prototype.render.apply( this );

		$( '.image-field', this.$el ).append(
			this.imageField.render().$el
		);

		return this;

	},

});

module.exports = ImageModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field-image.js":12,"./module-edit.js":24}],19:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');
var FieldImage = require('./field-image.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var ImageModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-ustwo-module-edit-image' ).html(),
	imageField: null,
	imageAttr: null,

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		this.imageAttr = this.model.getAttr('image');

		var config = this.imageAttr.get('config') || {};

		config = _.extend( {
			multiple: false,
		}, config );

		this.imageField = new FieldImage( {
			value: this.imageAttr.get('value'),
			config: config,
		} );

		this.imageField.on( 'change', function( data ) {
			this.imageAttr.set( 'value', data );
			this.model.trigger( 'change', this.model );
		}.bind(this) );

	},

	render: function() {

		ModuleEdit.prototype.render.apply( this );

		$( '.image-field', this.$el ).append(
			this.imageField.render().$el
		);

		return this;

	},

});

module.exports = ImageModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field-image.js":12,"./module-edit.js":24}],20:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var StatsModuleEditView = ModuleEdit.extend({
	template: $( '#tmpl-ustwo-module-edit-stats' ).html(),
});

module.exports = StatsModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":24}],21:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var HighlightModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-ustwo-module-edit-text' ).html(),

	initialize: function() {

		ModuleEdit.prototype.initialize.apply( this );

		// Make sure the template for this module is unique to this instance.
		this.editor = {
			id           : 'ustwo-text-body-' + this.model.cid,
			nameRegex    : new RegExp( 'ustwo-placeholder-name', 'g' ),
			idRegex      : new RegExp( 'ustwo-placeholder-id', 'g' ),
			contentRegex : new RegExp( 'ustwo-placeholder-content', 'g' ),
		};

		this.template  = this.template.replace( this.editor.nameRegex, this.editor.id )
		this.template  = this.template.replace( this.editor.idRegex, this.editor.id );
		this.template  = this.template.replace( this.editor.contentRegex, '<%= attr.body.value %>' );

		this.test = this.model.cid;
	},

	render: function () {

		ModuleEdit.prototype.render.apply( this );

		var self = this;

		// Prevent FOUC. Show again on init. See setup.
		$( '.wp-editor-wrap', this.$el ).css( 'display', 'none' );

		window.setTimeout( function() {
			this.initTinyMCE();
		}.bind( this ), 100 );

		return this;

	},

	/**
	 * Initialize the TinyMCE editor.
	 *
	 * @return null.
	 */
	initTinyMCE: function() {

		var self = this, id, ed, $el;

		id  = this.editor.id;
		ed  = tinyMCE.get( id );
		$el = $( '#wp-' + id + '-wrap', this.$el );

		if ( ed )
			return;

		// If no settings for this field. Clone from placeholder.
		if ( typeof( tinyMCEPreInit.mceInit[ id ] ) === 'undefined' ) {
			var newSettings = jQuery.extend( {}, tinyMCEPreInit.mceInit[ 'ustwo-placeholder-id' ] );
			for ( var prop in newSettings ) {
				if ( 'string' === typeof( newSettings[prop] ) ) {
					newSettings[prop] = newSettings[prop].replace( this.editor.idRegex, id ).replace( this.editor.nameRegex, name );
				}
			}
			tinyMCEPreInit.mceInit[ id ] = newSettings;
		}

		// Remove fullscreen plugin.
		tinyMCEPreInit.mceInit[ id ].plugins = tinyMCEPreInit.mceInit[ id ].plugins.replace( 'fullscreen,', '' );

		// If no Quicktag settings for this field. Clone from placeholder.
		if ( typeof( tinyMCEPreInit.qtInit[ id ] ) === 'undefined' ) {
			var newQTS = jQuery.extend( {}, tinyMCEPreInit.qtInit[ 'ustwo-placeholder-id' ] );
			for ( var prop in newQTS ) {
				if ( 'string' === typeof( newQTS[prop] ) ) {
					newQTS[prop] = newQTS[prop].replace( this.editor.idRegex, id ).replace( this.editor.nameRegex, name );
				}
			}
			tinyMCEPreInit.qtInit[ id ] = newQTS;
		}

		var mode = $el.hasClass('tmce-active') ? 'tmce' : 'html';

		// When editor inits, attach save callback to change event.
		tinyMCEPreInit.mceInit[id].setup = function() {

			this.on('change', function(e) {
				self.setAttr( 'body', e.target.getContent() );
			} );

			this.on( 'init', function(ed) {
				window.setTimeout( function() {
					$el.css( 'display', 'block' );
				}, 100 )
			});

		};

		// If current mode is visual, create the tinyMCE.
		if ( 'tmce' === mode ) {
			tinymce.init( tinyMCEPreInit.mceInit[id] );
		} else {
			$el.css( 'display', 'block' );
		}

		// Init quicktags.
		setTimeout( function() {
			quicktags( tinyMCEPreInit.qtInit[ id ] );
			QTags._buttonsInit();
		}, 100 );

		// Handle temporarily remove tinyMCE when sorting.
		this.$el.closest('.ui-sortable').on( "sortstart", function( event, ui ) {
			if ( ui.item[0].getAttribute('data-cid') === this.el.getAttribute('data-cid') ) {
				tinyMCE.execCommand( 'mceRemoveEditor', false, id );
			}
		}.bind(this) );

		// Handle re-init after sorting.
		this.$el.closest('.ui-sortable').on( "sortstop", function( event, ui ) {
			if ( ui.item[0].getAttribute('data-cid') === this.el.getAttribute('data-cid') ) {
				tinyMCE.execCommand('mceAddEditor', false, id);
			}
		}.bind(this) );

	},

	/**
	 * Remove model handler.
	 */
	removeModel: function(e) {
		ModuleEdit.prototype.removeModel.apply( this, [e] );
		tinyMCE.execCommand( 'mceRemoveEditor', false, this.editor.id );
	},
});

module.exports = HighlightModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":24}],22:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Header Module.
 * Extends default moudule with custom different template.
 */
var HeaderModuleEditView = ModuleEdit.extend({
	template: $( '#tmpl-ustwo-module-edit-textarea' ).html(),
});

module.exports = HeaderModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":24}],23:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var HighlightModuleEditView = ModuleEdit.extend({
	template: $( '#tmpl-ustwo-module-edit-video' ).html(),
});

module.exports = HighlightModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":24}],24:[function(require,module,exports){
(function (global){
var Backbone   = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var ModuleEdit = Backbone.View.extend({

	model: Module,
	className: 'module-edit',

	toolsTemplate: $('#tmpl-ustwo-module-edit-tools' ).html(),

	events: {
		'change *[data-module-attr-name]': 'attrFieldChanged',
		'keyup  *[data-module-attr-name]': 'attrFieldChanged',
		'input  *[data-module-attr-name]': 'attrFieldChanged',
		'click  .button-selection-item-remove': 'removeModel',
	},

	initialize: function( options ) {
		_.bindAll( this, 'attrFieldChanged', 'removeModel', 'setAttr' );
	},

	render: function() {

		var data  = this.model.toJSON();
		data.attr = {};

		// Format attribute array for easy templating.
		// Because attributes in  array is difficult to access.
		this.model.get('attr').each( function( attr ) {
			data.attr[ attr.get('name') ] = attr.toJSON();
		} );

		this.$el.html( _.template( this.template, data ) );

		this.initializeColorpicker();

		// ID attribute, so we can connect the view and model again later.
		this.$el.attr( 'data-cid', this.model.cid );

		// Append the module tools.
		this.$el.prepend( _.template( this.toolsTemplate, data ) );

		return this;

	},

	initializeColorpicker: function() {
		$('.ustwo-pb-color-picker', this.$el ).wpColorPicker({
		    palettes: ['#ed0082', '#e60c29','#ff5519','#ffbf00','#96cc29','#14c04d','#16d5d9','#009cf3','#143fcc','#6114cc','#333333'],
			change: function( event, ui ) {
				$(this).attr( 'value', ui.color.toString() );
				$(this).trigger( 'change' );
			}
		});
	},

	setAttr: function( attribute, value ) {

		var attr = this.model.get( 'attr' ).findWhere( { name: attribute } );

		if ( attr ) {
			attr.set( 'value', value );
			this.model.trigger('change:attr');
		}

	},

	/**
	 * Change event handler.
	 * Update attribute following value change.
	 */
	attrFieldChanged: function(e) {

		var attr = e.target.getAttribute( 'data-module-attr-name' );

        if ( e.target.hasAttribute( 'contenteditable' ) ) {
        	this.setAttr( attr, $(e.target).html() );
        } else {
        	this.setAttr( attr, e.target.value );
        }

	},

	/**
	 * Remove model handler.
	 */
	removeModel: function(e) {
		e.preventDefault();
		this.remove();
		this.model.destroy();
	},

});

module.exports = ModuleEdit;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[7])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvc3JjL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9nbG9iYWxzLmpzIiwiYXNzZXRzL2pzL3NyYy9tb2RlbHMvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMiLCJhc3NldHMvanMvc3JjL21vZGVscy9tb2R1bGUuanMiLCJhc3NldHMvanMvc3JjL3VzdHdvLXBhZ2UtYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvdXRpbHMvYXZhaWxhYmxlLW1vZHVsZXMuanMiLCJhc3NldHMvanMvc3JjL3V0aWxzL2VkaXQtdmlldy1tYXAuanMiLCJhc3NldHMvanMvc3JjL3V0aWxzL21vZHVsZS1mYWN0b3J5LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9idWlsZGVyLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZC1pbWFnZS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtYmxvY2txdW90ZS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtY2FzZS1zdHVkaWVzLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC1ncmlkLWNlbGwuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWdyaWQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWhlYWRlci5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtaW1hZ2UtbG9nby1oZWFkbGluZS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtaW1hZ2UuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LXN0YXRzLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC10ZXh0LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC10ZXh0YXJlYS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtdmlkZW8uanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzlMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZUF0dHJpYnV0ZSA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMnKTtcblxuLyoqXG4gKiBTaG9ydGNvZGUgQXR0cmlidXRlcyBjb2xsZWN0aW9uLlxuICovXG52YXIgU2hvcnRjb2RlQXR0cmlidXRlcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblxuXHRtb2RlbCA6IE1vZHVsZUF0dHJpYnV0ZSxcblxuXHQvLyBEZWVwIENsb25lLlxuXHRjbG9uZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCBfLm1hcCggdGhpcy5tb2RlbHMsIGZ1bmN0aW9uKG0pIHtcblx0XHRcdHJldHVybiBtLmNsb25lKCk7XG5cdFx0fSkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0dmFyIGpzb24gPSB7fTtcblxuXHRcdHRoaXMuZWFjaCggZnVuY3Rpb24oIG1vZGVsICkge1xuXHRcdFx0anNvblsgbW9kZWwuZ2V0KCAnbmFtZScgKSBdID0gbW9kZWwudG9NaWNyb0pTT04oKTtcblx0XHR9ICk7XG5cblx0XHRyZXR1cm4ganNvbjtcblx0fSxcblxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaG9ydGNvZGVBdHRyaWJ1dGVzO1xuIiwidmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgTW9kdWxlICAgPSByZXF1aXJlKCcuLy4uL21vZGVscy9tb2R1bGUuanMnKTtcblxuLy8gU2hvcnRjb2RlIENvbGxlY3Rpb25cbnZhciBNb2R1bGVzID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXG5cdG1vZGVsIDogTW9kdWxlLFxuXG5cdC8vICBEZWVwIENsb25lLlxuXHRjbG9uZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvciggXy5tYXAoIHRoaXMubW9kZWxzLCBmdW5jdGlvbihtKSB7XG5cdFx0XHRyZXR1cm4gbS5jbG9uZSgpO1xuXHRcdH0pKTtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIG9ubHkgdGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBzYXZlZC5cblx0ICpcblx0ICogQHJldHVybiBvYmplY3Rcblx0ICovXG5cdHRvTWljcm9KU09OOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoIGZ1bmN0aW9uKG1vZGVsKSB7IHJldHVybiBtb2RlbC50b01pY3JvSlNPTiggb3B0aW9ucyApOyB9ICk7XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZXM7XG4iLCIvLyBFeHBvc2Ugc29tZSBmdW5jdGlvbmFsaXR5IGdsb2JhbGx5LlxuZ2xvYmFscyA9IHtcblx0QnVpbGRlcjogICAgICAgcmVxdWlyZSgnLi9tb2RlbHMvYnVpbGRlci5qcycpLFxuXHRCdWlsZGVyVmlldzogICByZXF1aXJlKCcuL3ZpZXdzL2J1aWxkZXIuanMnKSxcblx0TW9kdWxlRmFjdG9yeTogcmVxdWlyZSgnLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpLFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnbG9iYWxzO1xuIiwidmFyIEJhY2tib25lICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGVzICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzJyk7XG52YXIgTW9kdWxlRmFjdG9yeSAgICA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMnKTtcbnZhciBhdmFpbGFibGVNb2R1bGVzID0gcmVxdWlyZSgnLi8uLi91dGlscy9hdmFpbGFibGUtbW9kdWxlcy5qcycpO1xudmFyICQgICAgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5CdWlsZGVyID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuXHRkZWZhdWx0czoge1xuXHRcdHNlbGVjdERlZmF1bHQ6ICB1c1R3b1BhZ2VCdWlsZGVyRGF0YS5sMTBuLnNlbGVjdERlZmF1bHQsXG5cdFx0YWRkTmV3QnV0dG9uOiAgIHVzVHdvUGFnZUJ1aWxkZXJEYXRhLmwxMG4uYWRkTmV3QnV0dG9uLFxuXHRcdHNlbGVjdGlvbjogICAgICBbXSwgLy8gSW5zdGFuY2Ugb2YgTW9kdWxlcy4gQ2FuJ3QgdXNlIGEgZGVmYXVsdCwgb3RoZXJ3aXNlIHRoZXkgd29uJ3QgYmUgdW5pcXVlLlxuXHRcdGFsbG93ZWRNb2R1bGVzOiBbXSwgLy8gTW9kdWxlIG5hbWVzIGFsbG93ZWQgZm9yIHRoaXMgYnVpbGRlci5cblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblxuXHRcdC8vIFNldCBkZWZhdWx0IHNlbGVjdGlvbiB0byBlbnN1cmUgaXQgaXNuJ3QgYSByZWZlcmVuY2UuXG5cdFx0aWYgKCAhICggdGhpcy5nZXQoJ3NlbGVjdGlvbicpIGluc3RhbmNlb2YgTW9kdWxlcyApICkge1xuXHRcdFx0dGhpcy5zZXQoICdzZWxlY3Rpb24nLCBuZXcgTW9kdWxlcyApO1xuXHRcdH1cblxuXHR9LFxuXG5cdHNldERhdGE6IGZ1bmN0aW9uKCBkYXRhICkge1xuXG5cdFx0dmFyIHNlbGVjdGlvbjtcblxuXHRcdGlmICggJycgPT09IGRhdGEgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gSGFuZGxlIGVpdGhlciBKU09OIHN0cmluZyBvciBwcm9wZXIgb2JoZWN0LlxuXHRcdHZhciBkYXRhID0gKCAnc3RyaW5nJyA9PT0gdHlwZW9mIGRhdGEgKSA/IEpTT04ucGFyc2UoIGRhdGEgKSA6IGRhdGE7XG5cblx0XHQvLyBDb252ZXJ0IHNhdmVkIGRhdGEgdG8gTW9kdWxlIG1vZGVscy5cblx0XHRpZiAoIGRhdGEgJiYgQXJyYXkuaXNBcnJheSggZGF0YSApICkge1xuXHRcdFx0c2VsZWN0aW9uID0gZGF0YS5tYXAoIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHRcdHJldHVybiBNb2R1bGVGYWN0b3J5LmNyZWF0ZSggbW9kdWxlLm5hbWUsIG1vZHVsZS5hdHRyICk7XG5cdFx0XHR9ICk7XG5cdFx0fVxuXG5cdFx0Ly8gUmVzZXQgc2VsZWN0aW9uIHVzaW5nIGRhdGEgZnJvbSBoaWRkZW4gaW5wdXQuXG5cdFx0aWYgKCBzZWxlY3Rpb24gJiYgc2VsZWN0aW9uLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuZ2V0KCdzZWxlY3Rpb24nKS5hZGQoIHNlbGVjdGlvbiApO1xuXHRcdH1cblxuXHR9LFxuXG5cdHNhdmVEYXRhOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBkYXRhID0gW11cblxuXHRcdHRoaXMuZ2V0KCdzZWxlY3Rpb24nKS5lYWNoKCBmdW5jdGlvbiggbW9kdWxlICkge1xuXG5cdFx0XHQvLyBTa2lwIGVtcHR5L2Jyb2tlbiBtb2R1bGVzLlxuXHRcdFx0aWYgKCAhIG1vZHVsZS5nZXQoJ25hbWUnICkgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0ZGF0YS5wdXNoKCBtb2R1bGUudG9NaWNyb0pTT04oKSApO1xuXG5cdFx0fSApO1xuXG5cdFx0dGhpcy50cmlnZ2VyKCAnc2F2ZScsIGRhdGEgKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBMaXN0IGFsbCBhdmFpbGFibGUgbW9kdWxlcyBmb3IgdGhpcyBidWlsZGVyLlxuXHQgKiBBbGwgbW9kdWxlcywgZmlsdGVyZWQgYnkgdGhpcy5hbGxvd2VkTW9kdWxlcy5cblx0ICovXG5cdGdldEF2YWlsYWJsZU1vZHVsZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBfLmZpbHRlciggYXZhaWxhYmxlTW9kdWxlcywgZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdHJldHVybiB0aGlzLmlzTW9kdWxlQWxsb3dlZCggbW9kdWxlLm5hbWUgKTtcblx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHR9LFxuXG5cdGlzTW9kdWxlQWxsb3dlZDogZnVuY3Rpb24oIG1vZHVsZU5hbWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCdhbGxvd2VkTW9kdWxlcycpLmluZGV4T2YoIG1vZHVsZU5hbWUgKSA+PSAwO1xuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1aWxkZXI7XG4iLCJ2YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcblxudmFyIE1vZHVsZUF0dHJpYnV0ZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRuYW1lOiAgICAgICAgICcnLFxuXHRcdGxhYmVsOiAgICAgICAgJycsXG5cdFx0dmFsdWU6ICAgICAgICAnJyxcblx0XHR0eXBlOiAgICAgICAgICd0ZXh0Jyxcblx0XHRkZXNjcmlwdGlvbjogICcnLFxuXHRcdGRlZmF1bHRWYWx1ZTogJycsXG5cdFx0Y29uZmlnOiAgICAgICB7fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHIgPSB7fTtcblx0XHR2YXIgYWxsb3dlZEF0dHJQcm9wZXJ0aWVzID0gWyAnbmFtZScsICd2YWx1ZScsICd0eXBlJyBdO1xuXG5cdFx0Xy5lYWNoKCBhbGxvd2VkQXR0clByb3BlcnRpZXMsIGZ1bmN0aW9uKCBwcm9wICkge1xuXHRcdFx0clsgcHJvcCBdID0gdGhpcy5nZXQoIHByb3AgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHJldHVybiByO1xuXG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlQXR0cmlidXRlO1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEJhY2tib25lICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGVBdHRzID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGUtYXR0cmlidXRlcy5qcycpO1xuXG5Nb2R1bGUgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXG5cdGRlZmF1bHRzOiB7XG5cdFx0bmFtZTogJycsXG5cdFx0bGFiZWw6ICcnLFxuXHRcdGF0dHI6IG5ldyBNb2R1bGVBdHRzLFxuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgYW4gYXR0cmlidXRlIG1vZGVsIGJ5IG5hbWUuXG5cdCAqL1xuXHRnZXRBdHRyOiBmdW5jdGlvbiggYXR0ck5hbWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCdhdHRyJykuZmluZFdoZXJlKCB7IG5hbWU6IGF0dHJOYW1lIH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDdXN0b20gUGFyc2UuXG5cdCAqIEVuc3VyZXMgYXR0cmlidXRlcyBpcyBhbiBpbnN0YW5jZSBvZiBNb2R1bGVBdHRzXG5cdCAqL1xuXHRwYXJzZTogZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXG5cdFx0aWYgKCAnYXR0cicgaW4gcmVzcG9uc2UgJiYgISAoIHJlc3BvbnNlLmF0dHIgaW5zdGFuY2VvZiBNb2R1bGVBdHRzICkgKSB7XG5cdFx0XHRyZXNwb25zZS5hdHRyID0gbmV3IE1vZHVsZUF0dHMoIHJlc3BvbnNlLmF0dHIgKTtcblx0XHR9XG5cblx0ICAgIHJldHVybiByZXNwb25zZTtcblxuXHR9LFxuXG5cdHRvSlNPTjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIganNvbiA9IF8uY2xvbmUoIHRoaXMuYXR0cmlidXRlcyApO1xuXG5cdFx0aWYgKCAnYXR0cicgaW4ganNvbiAmJiAoIGpzb24uYXR0ciBpbnN0YW5jZW9mIE1vZHVsZUF0dHMgKSApIHtcblx0XHRcdGpzb24uYXR0ciA9IGpzb24uYXR0ci50b0pTT04oKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ganNvbjtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdG5hbWU6IHRoaXMuZ2V0KCduYW1lJyksXG5cdFx0XHRhdHRyOiB0aGlzLmdldCgnYXR0cicpLnRvTWljcm9KU09OKClcblx0XHR9XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZTtcbiIsInZhciAkICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBCdWlsZGVyICAgICAgID0gcmVxdWlyZSgnLi9tb2RlbHMvYnVpbGRlci5qcycpO1xudmFyIEJ1aWxkZXJWaWV3ICAgPSByZXF1aXJlKCcuL3ZpZXdzL2J1aWxkZXIuanMnKTtcbnZhciBNb2R1bGVGYWN0b3J5ID0gcmVxdWlyZSgnLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpO1xuXG4vLyBFeHBvc2Ugc29tZSBmdW5jdGlvbmFsaXR5IHRvIGdsb2JhbCBuYW1lc3BhY2UuXG53aW5kb3cudXN0d29QYWdlQnVpbGRlciA9IHJlcXVpcmUoJy4vZ2xvYmFscycpO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuXG5cdC8vIEEgZmllbGQgZm9yIHN0b3JpbmcgdGhlIGJ1aWxkZXIgZGF0YS5cblx0dmFyICRmaWVsZCA9ICQoICdbbmFtZT11c3R3by1wYWdlLWJ1aWxkZXItZGF0YV0nICk7XG5cblx0aWYgKCAhICRmaWVsZC5sZW5ndGggKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gQSBjb250YWluZXIgZWxlbWVudCBmb3IgZGlzcGxheWluZyB0aGUgYnVpbGRlci5cblx0dmFyICRjb250YWluZXIgPSAkKCAnI3VzdHdvLXBhZ2UtYnVpbGRlcicgKVxuXG5cdC8vIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBCdWlsZGVyIG1vZGVsLlxuXHQvLyBQYXNzIGFuIGFycmF5IG9mIG1vZHVsZSBuYW1lcyB0aGF0IGFyZSBhbGxvd2VkIGZvciB0aGlzIGJ1aWxkZXIuXG5cdHZhciBidWlsZGVyID0gbmV3IEJ1aWxkZXIoe1xuXHRcdGFsbG93ZWRNb2R1bGVzOiAkKCAnW25hbWU9dXN0d28tcGFnZS1idWlsZGVyLWFsbG93ZWQtbW9kdWxlc10nICkudmFsKCkuc3BsaXQoJywnKVxuXHR9KTtcblxuXHQvLyBTZXQgdGhlIGRhdGEgdXNpbmcgdGhlIGN1cnJlbnQgZmllbGQgdmFsdWVcblx0YnVpbGRlci5zZXREYXRhKCBKU09OLnBhcnNlKCAkZmllbGQudmFsKCkgKSApO1xuXG5cdC8vIE9uIHNhdmUsIHVwZGF0ZSB0aGUgZmllbGQgdmFsdWUuXG5cdGJ1aWxkZXIub24oICdzYXZlJywgZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0JGZpZWxkLnZhbCggSlNPTi5zdHJpbmdpZnkoIGRhdGEgKSApO1xuXHR9ICk7XG5cblx0Ly8gQ3JlYXRlIGJ1aWxkZXIgdmlldy5cblx0dmFyIGJ1aWxkZXJWaWV3ID0gbmV3IEJ1aWxkZXJWaWV3KCB7IG1vZGVsOiBidWlsZGVyIH0gKTtcblxuXHQvLyBSZW5kZXIgYnVpbGRlci5cblx0YnVpbGRlclZpZXcucmVuZGVyKCkuJGVsLmFwcGVuZFRvKCAkY29udGFpbmVyIClcblxufSk7XG4iLCIvKipcbiAqIEF2YWlsYWJsZSBNb2R1bGVzLlxuICpcbiAqIEFsbCBhdmFpbGFibGUgbW9kdWxlcyBtdXN0IGJlIHJlZ2lzdGVyZWQgYnkgYWRpbmcgdGhlbSB0byB0aGUgYXJyYXkgb2YgYXZhaWxhYmxlTW9kdWxlcy5cbiAqIEFsbCBkZWZhdWx0IG1vZGVsIGRhdGEgbXVzdCBiZSBkZWZpbmVkIGhlcmUuXG4gKiBPbmx5IHRoZSAndmFsdWUnIG9mIGVhY2ggYXR0cmlidXRlIGlzIHNhdmVkLlxuICovXG52YXIgYXZhaWxhYmxlTW9kdWxlcyA9IFtdO1xuXG5hdmFpbGFibGVNb2R1bGVzLnB1c2goe1xuXHRsYWJlbDogJ0hlYWRlcicsXG5cdG5hbWU6ICAnaGVhZGVyJyxcblx0YXR0cjogW1xuXHRcdHsgbmFtZTogJ2hlYWRpbmcnLCAgICBsYWJlbDogJ0hlYWRpbmcnLCAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyB9LFxuXHRcdHsgbmFtZTogJ3N1YmhlYWRpbmcnLCBsYWJlbDogJ1N1YmhlYWRpbmcgKG9wdGlvbmFsKScsIHR5cGU6ICd0ZXh0YXJlYScgfSxcblx0XVxufSk7XG5cbmF2YWlsYWJsZU1vZHVsZXMucHVzaCh7XG5cdGxhYmVsOiAnVGV4dCcsXG5cdG5hbWU6ICAndGV4dCcsXG5cdGF0dHI6IFtcblx0XHR7IG5hbWU6ICdoZWFkaW5nJywgbGFiZWw6ICdIZWFkaW5nJywgdHlwZTogJ3RleHQnIH0sXG5cdFx0eyBuYW1lOiAnYm9keScsICAgIGxhYmVsOiAnQ29udGVudCcsIHR5cGU6ICd3eXNpd3lnJyB9LFxuXHRdXG59KTtcblxuYXZhaWxhYmxlTW9kdWxlcy5wdXNoKHtcblx0bmFtZTogICdzdGF0cycsXG5cdGxhYmVsOiAnU3RhdHMvRmlndXJlcycsXG5cdGF0dHI6IFtcblx0XHR7IG5hbWU6ICd0aXRsZScsIGxhYmVsOiAnVGl0bGUnLCAgICB0eXBlOiAndGV4dCcgfSxcblx0XHR7IG5hbWU6ICdjb2wxJywgIGxhYmVsOiAnQ29sdW1uIDEnLCB0eXBlOiAndGV4dGFyZWEnIH0sXG5cdFx0eyBuYW1lOiAnY29sMicsICBsYWJlbDogJ0NvbHVtbiAyJywgdHlwZTogJ3RleHRhcmVhJyB9LFxuXHRcdHsgbmFtZTogJ2NvbDMnLCAgbGFiZWw6ICdDb2x1bW4gMycsIHR5cGU6ICd0ZXh0YXJlYScgfSxcblx0XVxufSk7XG5cbmF2YWlsYWJsZU1vZHVsZXMucHVzaCh7XG5cdG5hbWU6ICAndmlkZW8nLFxuXHRsYWJlbDogJ1ZpZGVvJyxcblx0YXR0cjogW1xuXHRcdHsgbmFtZTogJ3ZpZGVvX2lkJywgbGFiZWw6ICdWaW1lbyBWaWRlbyBJRCcsIHR5cGU6ICd0ZXh0JyB9LFxuXHRdXG59KTtcblxuYXZhaWxhYmxlTW9kdWxlcy5wdXNoKHtcblx0bGFiZWw6ICdJbWFnZScsXG5cdG5hbWU6ICdpbWFnZScsXG5cdGF0dHI6IFtcblx0XHR7IG5hbWU6ICdpbWFnZScsICAgbGFiZWw6ICdJbWFnZScsICAgdHlwZTogJ2ltYWdlJywgY29uZmlnOiB7IHNpemVSZXE6IHsgd2lkdGg6IDEwMjQsIGhlaWdodDogNzY4IH0gfSB9LFxuXHRcdHsgbmFtZTogJ2NhcHRpb24nLCBsYWJlbDogJ0NhcHRpb24nLCB0eXBlOiAnaW1hZ2UnIH0sXG5cdF1cbn0pO1xuXG5hdmFpbGFibGVNb2R1bGVzLnB1c2goe1xuXHRuYW1lOiAnYmxvY2txdW90ZScsXG5cdGxhYmVsOiAnTGFyZ2UgUXVvdGUnLFxuXHRhdHRyOiBbXG5cdFx0eyBuYW1lOiAndGV4dCcsICAgICBsYWJlbDogJ1F1b3RlIFRleHQnLCAgdHlwZTogJ3RleHRhcmVhJyB9LFxuXHRcdHsgbmFtZTogJ3NvdXJjZScsICAgbGFiZWw6ICdTb3VyY2UnLCAgICAgIHR5cGU6ICd0ZXh0JyB9LFxuXHRdXG59ICk7XG5cbmF2YWlsYWJsZU1vZHVsZXMucHVzaCh7XG5cdGxhYmVsOiAnQ2FzZSBTdHVkaWVzJyxcblx0bmFtZTogICdjYXNlX3N0dWRpZXMnLFxuXHRhdHRyOiBbXG5cdFx0eyBuYW1lOiAnY2FzZV9zdHVkaWVzJywgbGFiZWw6ICdDYXNlIFN0dWRpZXMnLCB0eXBlOiAncG9zdElEJyB9LFxuXHRdXG59KTtcblxuYXZhaWxhYmxlTW9kdWxlcy5wdXNoKHtcblx0bGFiZWw6ICdDb250ZW50IEdyaWQnLFxuXHRuYW1lOiAgJ2dyaWQnLFxuXHRhdHRyOiBbXG5cdFx0eyBuYW1lOiAnZ3JpZF9jZWxscycsIGxhYmVsOiAnR3JpZCBDZWxscycsIHR5cGU6ICdidWlsZGVyJyB9LFxuXHRcdHsgbmFtZTogJ2dyaWRfdmlkZW8nLCBsYWJlbDogJ1ZpZGVvJywgdHlwZTogJ3ZpZGVvJyB9LFxuXHRcdHsgbmFtZTogJ2dyaWRfaW1hZ2UnLCBsYWJlbDogJ0ltYWdlJywgdHlwZTogJ2ltYWdlJyB9LFxuXHRdXG59KTtcblxuYXZhaWxhYmxlTW9kdWxlcy5wdXNoKHtcblx0bGFiZWw6ICdUZXh0L0ltYWdlIENlbGwnLFxuXHRuYW1lOiAgJ2dyaWRfY2VsbCcsXG5cdGF0dHI6IFtcblx0XHR7IG5hbWU6ICdoZWFkaW5nJywgbGFiZWw6ICdIZWFkaW5nJywgdHlwZTogJ3RleHQnIH0sXG5cdFx0eyBuYW1lOiAnYm9keScsICAgIGxhYmVsOiAnQ29udGVudCcsIHR5cGU6ICd3eXNpd3lnJyB9LFxuXHRcdHsgbmFtZTogJ2ltYWdlJywgICBsYWJlbDogJ0ltYWdlJywgICB0eXBlOiAnaW1hZ2UnLCBjb25maWc6IHsgc2l6ZVJlcTogeyB3aWR0aDogNjQwLCBoZWlnaHQ6IDQ4MCB9IH0gfSxcblx0XVxufSk7XG5cbmF2YWlsYWJsZU1vZHVsZXMucHVzaCh7XG5cdGxhYmVsOiAnSW1hZ2Ugd2l0aCBsb2dvIGFuZCBoZWFkaW5nJyxcblx0bmFtZTogICdpbWFnZV9sb2dvX2hlYWRsaW5lJyxcblx0YXR0cjogW1xuXHRcdHsgbmFtZTogJ2hlYWRpbmcnLCBsYWJlbDogJ0hlYWRpbmcnLCB0eXBlOiAndGV4dCcgfSxcblx0XHR7IG5hbWU6ICdpbWFnZScsICAgbGFiZWw6ICdJbWFnZScsICAgdHlwZTogJ2ltYWdlJywgY29uZmlnOiB7IHNpemVSZXE6IHsgd2lkdGg6IDEwMjQsIGhlaWdodDogNzY4IH0gfSB9LFxuXHRdXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBhdmFpbGFibGVNb2R1bGVzO1xuIiwiLyoqXG4gKiBNYXAgbW9kdWxlIHR5cGUgdG8gdmlld3MuXG4gKi9cbnZhciBlZGl0Vmlld01hcCA9IHtcblx0J2hlYWRlcic6ICAgICAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LWhlYWRlci5qcycpLFxuXHQndGV4dGFyZWEnOiAgICAgICAgICAgIHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtdGV4dGFyZWEuanMnKSxcblx0J3RleHQnOiAgICAgICAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LXRleHQuanMnKSxcblx0J3N0YXRzJzogICAgICAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LXN0YXRzLmpzJyksXG5cdCdpbWFnZSc6ICAgICAgICAgICAgICAgcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC1pbWFnZS5qcycpLFxuXHQndmlkZW8nOiAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtdmlkZW8uanMnKSxcblx0J2Jsb2NrcXVvdGUnOiAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LWJsb2NrcXVvdGUuanMnKSxcblx0J2Nhc2Vfc3R1ZGllcyc6ICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LWNhc2Utc3R1ZGllcy5qcycpLFxuXHQnZ3JpZCc6ICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtZ3JpZC5qcycpLFxuXHQnZ3JpZF9jZWxsJzogICAgICAgICAgIHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtZ3JpZC1jZWxsLmpzJyksXG5cdCdpbWFnZV9sb2dvX2hlYWRsaW5lJzogcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC1pbWFnZS1sb2dvLWhlYWRsaW5lLmpzJyksXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVkaXRWaWV3TWFwO1xuIiwidmFyIGF2YWlsYWJsZU1vZHVsZXMgPSByZXF1aXJlKCcuL2F2YWlsYWJsZS1tb2R1bGVzLmpzJyk7XG52YXIgTW9kdWxlICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL21vZHVsZS5qcycpO1xudmFyIE1vZHVsZUF0dHMgICAgICAgPSByZXF1aXJlKCcuLy4uL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzJyk7XG52YXIgJCAgICAgICAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbnZhciBNb2R1bGVGYWN0b3J5ID0ge1xuXG5cdC8qKlxuXHQgKiBDcmVhdGUgTW9kdWxlIE1vZGVsLlxuXHQgKiBVc2UgZGF0YSBmcm9tIGNvbmZpZywgcGx1cyBzYXZlZCBkYXRhLlxuXHQgKlxuXHQgKiBAcGFyYW0gIHN0cmluZyBtb2R1bGVOYW1lXG5cdCAqIEBwYXJhbSAgb2JqZWN0IGF0dHJpYnV0ZSBKU09OLiBTYXZlZCBhdHRyaWJ1dGUgdmFsdWVzLlxuXHQgKiBAcmV0dXJuIE1vZHVsZVxuXHQgKi9cblx0Y3JlYXRlOiBmdW5jdGlvbiggbW9kdWxlTmFtZSwgYXR0ckRhdGEgKSB7XG5cblx0XHR2YXIgZGF0YSA9ICQuZXh0ZW5kKCB0cnVlLCB7fSwgXy5maW5kV2hlcmUoIGF2YWlsYWJsZU1vZHVsZXMsIHsgbmFtZTogbW9kdWxlTmFtZSB9ICkgKTtcblxuXHRcdGlmICggISBkYXRhICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0dmFyIGF0dHJpYnV0ZXMgPSBuZXcgTW9kdWxlQXR0cztcblxuXHRcdC8qKlxuXHRcdCAqIEFkZCBhbGwgdGhlIG1vZHVsZSBhdHRyaWJ1dGVzLlxuXHRcdCAqIFdoaXRlbGlzdGVkIHRvIGF0dHJpYnV0ZXMgZG9jdW1lbnRlZCBpbiBzY2hlbWFcblx0XHQgKiBTZXRzIG9ubHkgdmFsdWUgZnJvbSBhdHRyRGF0YS5cblx0XHQgKi9cblx0XHRfLmVhY2goIGRhdGEuYXR0ciwgZnVuY3Rpb24oIGF0dHIgKSB7XG5cblx0XHRcdHZhciBjbG9uZUF0dHIgPSAkLmV4dGVuZCggdHJ1ZSwge30sIGF0dHIgICk7XG5cdFx0XHR2YXIgc2F2ZWRBdHRyID0gXy5maW5kV2hlcmUoIGF0dHJEYXRhLCB7IG5hbWU6IGF0dHIubmFtZSB9ICk7XG5cblx0XHRcdC8vIEFkZCBzYXZlZCBhdHRyaWJ1dGUgdmFsdWVzLlxuXHRcdFx0aWYgKCBzYXZlZEF0dHIgJiYgJ3ZhbHVlJyBpbiBzYXZlZEF0dHIgKSB7XG5cdFx0XHRcdGNsb25lQXR0ci52YWx1ZSA9IHNhdmVkQXR0ci52YWx1ZTtcblx0XHRcdH1cblxuXHRcdFx0YXR0cmlidXRlcy5hZGQoIGNsb25lQXR0ciApO1xuXG5cdFx0fSApO1xuXG5cdFx0ZGF0YS5hdHRyID0gYXR0cmlidXRlcztcblxuXHQgICAgcmV0dXJuIG5ldyBNb2R1bGUoIGRhdGEgKTtcblxuXHR9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlRmFjdG9yeTtcbiIsInZhciBCYWNrYm9uZSAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgQnVpbGRlciAgICAgICA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2J1aWxkZXIuanMnKTtcbnZhciBNb2R1bGVzICAgICAgID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzJyk7XG52YXIgZWRpdFZpZXdNYXAgICA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvZWRpdC12aWV3LW1hcC5qcycpO1xudmFyIE1vZHVsZUZhY3RvcnkgPSByZXF1aXJlKCcuLy4uL3V0aWxzL21vZHVsZS1mYWN0b3J5LmpzJyk7XG52YXIgJCAgICAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbnZhciBCdWlsZGVyID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAkKCcjdG1wbC11c3R3by1idWlsZGVyJyApLmh0bWwoKSxcblx0Y2xhc3NOYW1lOiAndXN0d28tcGFnZS1idWlsZGVyJyxcblx0bW9kZWw6IG51bGwsXG5cdG5ld01vZHVsZU5hbWU6IG51bGwsXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NoYW5nZSA+IC5hZGQtbmV3IC5hZGQtbmV3LW1vZHVsZS1zZWxlY3QnOiAndG9nZ2xlQnV0dG9uU3RhdHVzJyxcblx0XHQnY2xpY2sgPiAuYWRkLW5ldyAuYWRkLW5ldy1tb2R1bGUtYnV0dG9uJzogJ2FkZE1vZHVsZScsXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuXG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMubW9kZWwuZ2V0KCdzZWxlY3Rpb24nKVxuXG5cdFx0c2VsZWN0aW9uLm9uKCBcImFkZFwiLCB0aGlzLmFkZE5ld1NlbGVjdGlvbkl0ZW1WaWV3LCB0aGlzICk7XG5cdFx0c2VsZWN0aW9uLm9uKCBcImFsbFwiLCB0aGlzLm1vZGVsLnNhdmVEYXRhLCB0aGlzLm1vZGVsICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGRhdGEgPSB0aGlzLm1vZGVsLnRvSlNPTigpO1xuXG5cdFx0dGhpcy4kZWwuaHRtbCggXy50ZW1wbGF0ZSggdGhpcy50ZW1wbGF0ZSwgZGF0YSAgKSApO1xuXG5cdFx0dGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpLmVhY2goIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHR0aGlzLmFkZE5ld1NlbGVjdGlvbkl0ZW1WaWV3KCBtb2R1bGUgKTtcblx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXG5cdFx0dGhpcy5yZW5kZXJBZGROZXcoKTtcblx0XHR0aGlzLmluaXRTb3J0YWJsZSgpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHQvKipcblx0ICogUmVuZGVyIHRoZSBBZGQgTmV3IG1vZHVsZSBjb250cm9scy5cblx0ICovXG5cdHJlbmRlckFkZE5ldzogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgJHNlbGVjdCA9IHRoaXMuJGVsLmZpbmQoICc+IC5hZGQtbmV3IHNlbGVjdC5hZGQtbmV3LW1vZHVsZS1zZWxlY3QnICk7XG5cblx0XHQkc2VsZWN0LmFwcGVuZChcblx0XHRcdCQoICc8b3B0aW9uLz4nLCB7IHRleHQ6IHVzVHdvUGFnZUJ1aWxkZXJEYXRhLmwxMG4uc2VsZWN0RGVmYXVsdCB9IClcblx0XHQpO1xuXG5cdFx0Xy5lYWNoKCB0aGlzLm1vZGVsLmdldEF2YWlsYWJsZU1vZHVsZXMoKSwgZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdHZhciB0ZW1wbGF0ZSA9ICc8b3B0aW9uIHZhbHVlPVwiPCU9IG5hbWUgJT5cIj48JT0gbGFiZWwgJT48L29wdGlvbj4nO1xuXHRcdFx0JHNlbGVjdC5hcHBlbmQoIF8udGVtcGxhdGUoIHRlbXBsYXRlLCBtb2R1bGUgKSApO1xuXHRcdH0gKTs7XG5cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZSBTb3J0YWJsZS5cblx0ICovXG5cdGluaXRTb3J0YWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0JCggJz4gLnNlbGVjdGlvbicsIHRoaXMuJGVsICkuc29ydGFibGUoe1xuXHRcdFx0aGFuZGxlOiBcIi5tb2R1bGUtZWRpdC10b29sc1wiLFxuXHRcdFx0aXRlbXM6IFwiPiAubW9kdWxlLWVkaXRcIixcblx0XHRcdHN0b3A6IHRoaXMudXBkYXRlU2VsZWN0aW9uT3JkZXIuYmluZCggdGhpcyApLFxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTb3J0YWJsZSBlbmQgY2FsbGJhY2suXG5cdCAqIEFmdGVyIHJlb3JkZXJpbmcsIHVwZGF0ZSB0aGUgc2VsZWN0aW9uIG9yZGVyLlxuXHQgKiBOb3RlIC0gdXNlcyBkaXJlY3QgbWFuaXB1bGF0aW9uIG9mIGNvbGxlY3Rpb24gbW9kZWxzIHByb3BlcnR5LlxuXHQgKiBUaGlzIGlzIHRvIGF2b2lkIGhhdmluZyB0byBtZXNzIGFib3V0IHdpdGggdGhlIHZpZXdzIHRoZW1zZWx2ZXMuXG5cdCAqL1xuXHR1cGRhdGVTZWxlY3Rpb25PcmRlcjogZnVuY3Rpb24oIGUsIHVpICkge1xuXG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMubW9kZWwuZ2V0KCdzZWxlY3Rpb24nKTtcblx0XHR2YXIgaXRlbSAgICAgID0gc2VsZWN0aW9uLmdldCh7IGNpZDogdWkuaXRlbS5hdHRyKCAnZGF0YS1jaWQnKSB9KTtcblx0XHR2YXIgbmV3SW5kZXggID0gdWkuaXRlbS5pbmRleCgpO1xuXHRcdHZhciBvbGRJbmRleCAgPSBzZWxlY3Rpb24uaW5kZXhPZiggaXRlbSApO1xuXG5cdFx0aWYgKCBuZXdJbmRleCAhPSBvbGRJbmRleCApIHtcblx0XHRcdHZhciBkcm9wcGVkID0gc2VsZWN0aW9uLm1vZGVscy5zcGxpY2UoIG9sZEluZGV4LCAxICk7XG5cdFx0XHRzZWxlY3Rpb24ubW9kZWxzLnNwbGljZSggbmV3SW5kZXgsIDAsIGRyb3BwZWRbMF0gKTtcblx0XHRcdHRoaXMubW9kZWwuc2F2ZURhdGEoKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogVG9nZ2xlIGJ1dHRvbiBzdGF0dXMuXG5cdCAqIEVuYWJsZS9EaXNhYmxlIGJ1dHRvbiBkZXBlbmRpbmcgb24gd2hldGhlclxuXHQgKiBwbGFjZWhvbGRlciBvciB2YWxpZCBtb2R1bGUgaXMgc2VsZWN0ZWQuXG5cdCAqL1xuXHR0b2dnbGVCdXR0b25TdGF0dXM6IGZ1bmN0aW9uKGUpIHtcblx0XHR2YXIgdmFsdWUgICAgICAgICA9ICQoZS50YXJnZXQpLnZhbCgpO1xuXHRcdHZhciBkZWZhdWx0T3B0aW9uID0gJChlLnRhcmdldCkuY2hpbGRyZW4oKS5maXJzdCgpLmF0dHIoJ3ZhbHVlJyk7XG5cdFx0JCgnLmFkZC1uZXctbW9kdWxlLWJ1dHRvbicsIHRoaXMuJGVsICkuYXR0ciggJ2Rpc2FibGVkJywgdmFsdWUgPT09IGRlZmF1bHRPcHRpb24gKTtcblx0XHR0aGlzLm5ld01vZHVsZU5hbWUgPSAoIHZhbHVlICE9PSBkZWZhdWx0T3B0aW9uICkgPyB2YWx1ZSA6IG51bGw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZSBhZGRpbmcgbW9kdWxlLlxuXHQgKlxuXHQgKiBGaW5kIG1vZHVsZSBtb2RlbC4gQ2xvbmUgaXQuIEFkZCB0byBzZWxlY3Rpb24uXG5cdCAqL1xuXHRhZGRNb2R1bGU6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGlmICggdGhpcy5uZXdNb2R1bGVOYW1lICYmIHRoaXMubW9kZWwuaXNNb2R1bGVBbGxvd2VkKCB0aGlzLm5ld01vZHVsZU5hbWUgKSApIHtcblx0XHRcdHZhciBtb2RlbCA9IE1vZHVsZUZhY3RvcnkuY3JlYXRlKCB0aGlzLm5ld01vZHVsZU5hbWUgKTtcblx0XHRcdHRoaXMubW9kZWwuZ2V0KCdzZWxlY3Rpb24nKS5hZGQoIG1vZGVsICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEFwcGVuZCBuZXcgc2VsZWN0aW9uIGl0ZW0gdmlldy5cblx0ICovXG5cdGFkZE5ld1NlbGVjdGlvbkl0ZW1WaWV3OiBmdW5jdGlvbiggaXRlbSApIHtcblxuXHRcdHZhciBlZGl0VmlldywgdmlldywgY3VzdG9tVmlldztcblxuXHRcdGVkaXRWaWV3ID0gKCBpdGVtLmdldCgnbmFtZScpIGluIGVkaXRWaWV3TWFwICkgPyBlZGl0Vmlld01hcFsgaXRlbS5nZXQoJ25hbWUnKSBdIDogbnVsbDtcblxuXHRcdGlmICggISBlZGl0VmlldyB8fCAhIHRoaXMubW9kZWwuaXNNb2R1bGVBbGxvd2VkKCBpdGVtLmdldCgnbmFtZScpICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmlldyA9IG5ldyBlZGl0VmlldyggeyBtb2RlbDogaXRlbSB9ICk7XG5cblx0XHQkKCAnPiAuc2VsZWN0aW9uJywgdGhpcy4kZWwgKS5hcHBlbmQoIHZpZXcucmVuZGVyKCkuJGVsICk7XG5cblx0XHR2YXIgJHNlbGVjdGlvbiA9ICQoICc+IC5zZWxlY3Rpb24nLCB0aGlzLiRlbCApO1xuXHRcdGlmICggJHNlbGVjdGlvbi5oYXNDbGFzcygndWktc29ydGFibGUnKSApIHtcblx0XHRcdCRzZWxlY3Rpb24uc29ydGFibGUoJ3JlZnJlc2gnKTtcblx0XHR9XG5cblxuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCdWlsZGVyO1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG5cbi8qKlxuICogSW1hZ2UgRmllbGRcbiAqXG4gKiBJbml0aWFsaXplIGFuZCBsaXN0ZW4gZm9yIHRoZSAnY2hhbmdlJyBldmVudCB0byBnZXQgdXBkYXRlZCBkYXRhLlxuICpcbiAqL1xudmFyIEZpZWxkSW1hZ2UgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICQoICcjdG1wbC11c3R3by1maWVsZC1pbWFnZScgKS5odG1sKCksXG5cdGZyYW1lOiBudWxsLFxuXHRpbWFnZUF0dHI6IG51bGwsXG5cdHZhbHVlOiBbXSxcblx0Y29uZmlnOiB7fSxcblxuXHRldmVudHM6IHtcblx0XHQnY2xpY2sgLmltYWdlLXBsYWNlaG9sZGVyIC5idXR0b24uYWRkJzogJ2VkaXRJbWFnZScsXG5cdFx0J2NsaWNrIC5pbWFnZS1wbGFjZWhvbGRlciBpbWcnOiAnZWRpdEltYWdlJyxcblx0XHQnY2xpY2sgLmltYWdlLXBsYWNlaG9sZGVyIC5idXR0b24ucmVtb3ZlJzogJ3JlbW92ZUltYWdlJyxcblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZS5cblx0ICpcblx0ICogUGFzcyB2YWx1ZSBhbmQgY29uZmlnIGFzIHByb3BlcnRpZXMgb24gdGhlIG9wdGlvbnMgb2JqZWN0LlxuXHQgKiBBdmFpbGFibGUgb3B0aW9uc1xuXHQgKiAtIG11bHRpcGxlOiBib29sXG5cdCAqIC0gc2l6ZVJlcTogZWcgeyB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCB9XG5cdCAqXG5cdCAqIEBwYXJhbSAgb2JqZWN0IG9wdGlvbnNcblx0ICogQHJldHVybiBudWxsXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblxuXHRcdF8uYmluZEFsbCggdGhpcywgJ2VkaXRJbWFnZScsICdvblNlbGVjdEltYWdlJywgJ3JlbW92ZUltYWdlJywgJ2lzQXR0YWNobWVudFNpemVPaycgKTtcblxuXHRcdGlmICggJ3ZhbHVlJyBpbiBvcHRpb25zICkge1xuXHRcdFx0dGhpcy52YWx1ZSA9IG9wdGlvbnMudmFsdWVcblx0XHR9XG5cblx0XHRpZiAoICdjb25maWcnIGluIG9wdGlvbnMgKSB7XG5cdFx0XHR0aGlzLmNvbmZpZyA9IF8uZXh0ZW5kKCB7XG5cdFx0XHRcdG11bHRpcGxlOiBmYWxzZSxcblx0XHRcdH0sIG9wdGlvbnMuY29uZmlnICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5vbiggJ2NoYW5nZScsIHRoaXMucmVuZGVyICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHRlbXBsYXRlID0gXy5tZW1vaXplKCBmdW5jdGlvbiggdmFsdWUsIGNvbmZpZyApIHtcblx0XHRcdHJldHVybiBfLnRlbXBsYXRlKCB0aGlzLnRlbXBsYXRlLCB7XG5cdFx0XHRcdHZhbHVlOiB2YWx1ZSxcblx0XHRcdFx0Y29uZmlnOiBjb25maWcsXG5cdFx0XHR9IClcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHRoaXMuJGVsLmh0bWwoIHRlbXBsYXRlKCB0aGlzLnZhbHVlLCB0aGlzLmNvbmZpZyApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdG9uU2VsZWN0SW1hZ2U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGZyYW1lID0gdGhpcy5mcmFtZSB8fCBudWxsO1xuXG5cdFx0aWYgKCAhIGZyYW1lICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGZyYW1lLmNsb3NlKCk7XG5cblx0XHR2YXIgc2VsZWN0aW9uID0gZnJhbWUuc3RhdGUoKS5nZXQoJ3NlbGVjdGlvbicpO1xuXHRcdHRoaXMudmFsdWUgICAgPSBbXTtcblxuXHRcdHNlbGVjdGlvbi5lYWNoKCBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblx0XHRcdGlmICggdGhpcy5pc0F0dGFjaG1lbnRTaXplT2soIGF0dGFjaG1lbnQgKSApIHtcblx0XHRcdFx0dGhpcy52YWx1ZS5wdXNoKCBhdHRhY2htZW50LnRvSlNPTigpICk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHR0aGlzLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLnZhbHVlICk7XG5cblx0fSxcblxuXHRlZGl0SW1hZ2U6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciBmcmFtZSA9IHRoaXMuZnJhbWU7XG5cblx0XHRpZiAoICEgQXJyYXkuaXNBcnJheSggdGhpcy52YWx1ZSApICkge1xuXHRcdFx0dGhpcy52YWx1ZSA9IFtdO1xuXHRcdH1cblxuXHRcdHRoaXMudmFsdWUubWFwKCBmdW5jdGlvbiggaXRlbSApIHtcblx0XHRcdHJldHVybiBuZXcgd3AubWVkaWEubW9kZWwuQXR0YWNobWVudCggaXRlbSApO1xuXHRcdH0gKTtcblxuXHRcdGlmICggISBmcmFtZSApIHtcblxuXHRcdFx0dmFyIGZyYW1lQXJncyA9IHtcblx0XHRcdFx0bGlicmFyeTogeyB0eXBlOiAnaW1hZ2UnIH0sXG5cdFx0XHRcdG11bHRpcGxlOiB0aGlzLmNvbmZpZy5tdWx0aXBsZSxcblx0XHRcdFx0dGl0bGU6ICdTZWxlY3QgSW1hZ2UnLFxuXHRcdFx0XHRmcmFtZTogJ3NlbGVjdCcsXG5cdFx0XHRcdHNlbGVjdGlvbjogdGhpcy52YWx1ZSxcblx0XHRcdH1cblxuXHRcdFx0ZnJhbWUgPSB0aGlzLmZyYW1lID0gd3AubWVkaWEoIGZyYW1lQXJncyApO1xuXG5cdFx0XHRmcmFtZS5vbiggJ2NvbnRlbnQ6Y3JlYXRlOmJyb3dzZScsIHRoaXMuc2V0dXBGaWx0ZXJzLCB0aGlzICk7XG5cdFx0XHRmcmFtZS5vbiggJ3NlbGVjdCcsIHRoaXMub25TZWxlY3RJbWFnZSwgdGhpcyApO1xuXG5cdFx0fVxuXG5cdFx0ZnJhbWUub3BlbigpO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEFkZCBhIGZpbHRlciB0byB0aGUgZnJhbWUgbGlicmFyeSBjb2xsZWN0aW9uIHRvIGxpbWl0IHRvIHJlcXVpcmVkIHNpemUuXG5cdCAqIEByZXR1cm4gbnVsbFxuXHQgKi9cblx0c2V0dXBGaWx0ZXJzOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBsaWIgICAgPSB0aGlzLmZyYW1lLnN0YXRlKCkuZ2V0KCdsaWJyYXJ5Jyk7XG5cblx0XHRpZiAoICdzaXplUmVxJyBpbiB0aGlzLmNvbmZpZyApIHtcblx0XHRcdGxpYi5maWx0ZXJzWydzaXplJ10gPSB0aGlzLmlzQXR0YWNobWVudFNpemVPaztcblx0XHR9XG5cblx0fSxcblxuXHRyZW1vdmVJbWFnZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0dmFyICR0YXJnZXQsIGF0dHJNb2RlbCwgaWQ7XG5cblx0XHQkdGFyZ2V0ICAgPSAkKGUudGFyZ2V0KTtcblx0XHQkdGFyZ2V0ICAgPSAoICR0YXJnZXQucHJvcCgndGFnTmFtZScpID09PSAnQlVUVE9OJyApID8gJHRhcmdldCA6ICR0YXJnZXQuY2xvc2VzdCgnYnV0dG9uLnJlbW92ZScpO1xuXHRcdGlkICAgICAgICA9ICR0YXJnZXQuZGF0YSggJ2ltYWdlLWlkJyApO1xuXG5cdFx0aWYgKCAhIGlkICApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnZhbHVlID0gXy5maWx0ZXIoIHRoaXMudmFsdWUsIGZ1bmN0aW9uKCBpbWFnZSApIHtcblx0XHRcdHJldHVybiAoIGltYWdlLmlkICE9PSBpZCApO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMudmFsdWUgPSAoIHRoaXMudmFsdWUubGVuZ3RoID4gMCApID8gdGhpcy52YWx1ZSA6ICcnO1xuXG5cdFx0dGhpcy50cmlnZ2VyKCAnY2hhbmdlJywgdGhpcy52YWx1ZSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIERvZXMgYXR0YWNobWVudCBtZWV0IHNpemUgcmVxdWlyZW1lbnRzP1xuXHQgKlxuXHQgKiBAcGFyYW0gIEF0dGFjaG1lbnRcblx0ICogQHJldHVybiBib29sZWFuXG5cdCAqL1xuXHRpc0F0dGFjaG1lbnRTaXplT2s6IGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXG5cdFx0aWYgKCAhICdzaXplUmVxJyBpbiB0aGlzLmNvbmZpZyApIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHRoaXMuY29uZmlnLnNpemVSZXEgPSBfLmV4dGVuZCgge1xuXHRcdFx0d2lkdGg6IDAsXG5cdFx0XHRoZWlnaHQ6IDAsXG5cdFx0fSwgdGhpcy5jb25maWcuc2l6ZVJlcSApO1xuXG5cdFx0dmFyIHdpZHRoUmVxICA9IGF0dGFjaG1lbnQuZ2V0KCd3aWR0aCcpICA+PSB0aGlzLmNvbmZpZy5zaXplUmVxLndpZHRoO1xuXHRcdHZhciBoZWlnaHRSZXEgPSBhdHRhY2htZW50LmdldCgnaGVpZ2h0JykgPj0gdGhpcy5jb25maWcuc2l6ZVJlcS5oZWlnaHQ7XG5cblx0XHRyZXR1cm4gd2lkdGhSZXEgJiYgaGVpZ2h0UmVxO1xuXG5cdH1cblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkSW1hZ2U7XG4iLCJ2YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdCA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcblxuLyoqXG4gKiBIaWdobGlnaHQgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUsXG4gKiBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgSGlnaGxpZ2h0TW9kdWxlRWRpdFZpZXcgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cdHRlbXBsYXRlOiAkKCAnI3RtcGwtdXN0d28tbW9kdWxlLWVkaXQtYmxvY2txdW90ZScgKS5odG1sKCksXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIaWdobGlnaHRNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xuXG4vKipcbiAqIEhpZ2hsaWdodCBNb2R1bGUuXG4gKiBFeHRlbmRzIGRlZmF1bHQgbW91ZHVsZSxcbiAqIGN1c3RvbSBkaWZmZXJlbnQgdGVtcGxhdGUuXG4gKi9cbnZhciBIaWdobGlnaHRNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLXVzdHdvLW1vZHVsZS1lZGl0LWNhc2Utc3R1ZGllcycgKS5odG1sKCksXG5cdGNhc2VTdHVkeUF0dHI6IG51bGwsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcyApO1xuXHRcdHRoaXMuY2FzZVN0dWR5QXR0ciA9IHRoaXMubW9kZWwuZ2V0KCdhdHRyJykuZmluZFdoZXJlKCB7IG5hbWU6ICdjYXNlX3N0dWRpZXMnIH0pO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcyApO1xuXHRcdHRoaXMuaW5pdFNlbGVjdDIoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRpbml0U2VsZWN0MjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgJGZpZWxkID0gJCggJ1tkYXRhLW1vZHVsZS1hdHRyLW5hbWU9Y2FzZV9zdHVkaWVzXScsIHRoaXMuJGVsICk7XG5cdFx0dmFyIHZhbHVlcyA9IHRoaXMuY2FzZVN0dWR5QXR0ci5nZXQoJ3ZhbHVlJyk7XG5cblx0XHQkLmFqYXgoIFwiL3dwLWpzb24vdXN0d28vdjEvY2FzZS1zdHVkaWVzL1wiKS5kb25lKCBmdW5jdGlvbiggZGF0YSApIHtcblxuXHRcdFx0ZGF0YSA9IF8ubWFwKCBkYXRhLCBmdW5jdGlvbiggaXRlbSApIHtcblx0XHRcdFx0cmV0dXJuIHsgaWQ6IGl0ZW0uc2x1ZywgdGV4dDogaXRlbS5uYW1lIH07XG5cdFx0XHR9KTtcblxuXHRcdFx0JGZpZWxkLnNlbGVjdDIoIHtcblx0XHRcdFx0YWxsb3dDbGVhcjogdHJ1ZSxcblx0XHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdFx0bXVsdGlwbGU6IHRydWUsXG5cdFx0XHR9ICkuc2VsZWN0MiggJ3ZhbCcsIHZhbHVlcy5zcGxpdCggJywnICkgKTtcblxuXHRcdH0gKTtcblxuXHR9LFxuXG5cdHJlbW92ZU1vZGVsOiBmdW5jdGlvbihlKSB7XG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUucmVtb3ZlTW9kZWwuYXBwbHkoIHRoaXMsIFtlXSApO1xuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIaWdobGlnaHRNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xudmFyIEZpZWxkSW1hZ2UgPSByZXF1aXJlKCcuL2ZpZWxkLWltYWdlLmpzJyk7XG5cbi8qKlxuICogSGVhZGVyIE1vZHVsZS5cbiAqIEV4dGVuZHMgZGVmYXVsdCBtb3VkdWxlIHdpdGggY3VzdG9tIGRpZmZlcmVudCB0ZW1wbGF0ZS5cbiAqL1xudmFyIEdyaWRDZWxsTW9kdWxlRWRpdFZpZXcgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICQoICcjdG1wbC11c3R3by1tb2R1bGUtZWRpdC1ncmlkLWNlbGwnICkuaHRtbCgpLFxuXHRpbWFnZUZpZWxkOiBudWxsLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBhdHRyaWJ1dGVzLCBvcHRpb25zIF0gKTtcblxuXHRcdHZhciBpbWFnZUF0dHIgPSB0aGlzLm1vZGVsLmdldEF0dHIoJ2ltYWdlJyk7XG5cblx0XHR0aGlzLmltYWdlRmllbGQgPSBuZXcgRmllbGRJbWFnZSgge1xuXHRcdFx0dmFsdWU6IGltYWdlQXR0ci5nZXQoJ3ZhbHVlJyksXG5cdFx0XHRjb25maWc6IGltYWdlQXR0ci5nZXQoJ2NvbmZpZycpIHx8IHt9LFxuXHRcdH0gKTtcblxuXHRcdHRoaXMuaW1hZ2VGaWVsZC5vbiggJ2NoYW5nZScsIGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0aW1hZ2VBdHRyLnNldCggJ3ZhbHVlJywgZGF0YSApO1xuXHRcdFx0dGhpcy5tb2RlbC50cmlnZ2VyKCAnY2hhbmdlJywgdGhpcy5tb2RlbCApO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMgKTtcblxuXHRcdCQoICcuaW1hZ2UtZmllbGQnLCB0aGlzLiRlbCApLmFwcGVuZChcblx0XHRcdHRoaXMuaW1hZ2VGaWVsZC5yZW5kZXIoKS4kZWxcblx0XHQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3JpZENlbGxNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdCAgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG52YXIgQnVpbGRlciAgICAgPSByZXF1aXJlKCcuLy4uL21vZGVscy9idWlsZGVyLmpzJyk7XG52YXIgRmllbGRJbWFnZSAgPSByZXF1aXJlKCcuL2ZpZWxkLWltYWdlLmpzJyk7XG5cbi8qKlxuICogSGlnaGxpZ2h0IE1vZHVsZS5cbiAqIEV4dGVuZHMgZGVmYXVsdCBtb3VkdWxlLFxuICogY3VzdG9tIGRpZmZlcmVudCB0ZW1wbGF0ZS5cbiAqL1xudmFyIEdyaWRNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLXVzdHdvLW1vZHVsZS1lZGl0LWdyaWQnICkuaHRtbCgpLFxuXG5cdGltYWdlRmllbGQ6IG51bGwsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIGF0dHJpYnV0ZXMsIG9wdGlvbnMgXSApO1xuXG5cdFx0dmFyIGltYWdlQXR0ciA9IHRoaXMubW9kZWwuZ2V0QXR0cignZ3JpZF9pbWFnZScpO1xuXG5cdFx0dGhpcy5pbWFnZUZpZWxkID0gbmV3IEZpZWxkSW1hZ2UoIHtcblx0XHRcdHZhbHVlOiAgaW1hZ2VBdHRyLmdldCgndmFsdWUnKSxcblx0XHRcdGNvbmZpZzogaW1hZ2VBdHRyLmdldCgnY29uZmlnJykgfHwge30sXG5cdFx0fSApO1xuXG5cdFx0dGhpcy5pbWFnZUZpZWxkLm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XHRpbWFnZUF0dHIuc2V0KCAndmFsdWUnLCBkYXRhICk7XG5cdFx0XHR0aGlzLm1vZGVsLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLm1vZGVsICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5tb2RlbC5zZXQoICdjaWQnLCB0aGlzLm1vZGVsLmNpZCApO1xuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcyApO1xuXG5cdFx0dGhpcy5yZW5kZXJCdWlsZGVyKCk7XG5cdFx0dGhpcy5yZW5kZXJJbWFnZSgpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHRyZW5kZXJCdWlsZGVyOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBidWlsZGVyID0gbmV3IEJ1aWxkZXIoe1xuXHRcdFx0aWQ6ICdncmlkLWJ1aWxkZXItJyArIHRoaXMubW9kZWwuY2lkLFxuXHRcdFx0YWxsb3dlZE1vZHVsZXM6IFsgJ2dyaWRfY2VsbCcgXSxcblx0XHR9KTtcblxuXHRcdC8vIFJlcXVpcmUgQnVpbGRlclZpZXcuIE5vdGUgLSBkbyBpdCBhZnRlciBydW50aW1lIHRvIGF2b2lkIGxvb3AuXG5cdFx0dmFyIEJ1aWxkZXJWaWV3ID0gcmVxdWlyZSgnLi9idWlsZGVyLmpzJyk7XG5cdFx0dmFyIGJ1aWxkZXJWaWV3ID0gbmV3IEJ1aWxkZXJWaWV3KCB7IG1vZGVsOiBidWlsZGVyIH0gKTtcblxuXHRcdCQoICcuYnVpbGRlcicsIHRoaXMuJGVsICkuYXBwZW5kKCBidWlsZGVyVmlldy5yZW5kZXIoKS4kZWwgKTtcblxuXHRcdC8vIE9uIHNhdmUsIHVwZGF0ZSBhdHRyaWJ1dGUgd2l0aCBidWlsZGVyIGRhdGEuXG5cdFx0Ly8gTWFudWFsbHkgdHJpZ2dlciBjaGFuZ2UgZXZlbnQuXG5cdFx0YnVpbGRlci5vbiggJ3NhdmUnLCBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdHRoaXMubW9kZWwuZ2V0QXR0ciggJ2dyaWRfY2VsbHMnICkuc2V0KCAndmFsdWUnLCBkYXRhICk7XG5cdFx0XHR0aGlzLm1vZGVsLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLm1vZGVsICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHQvLyBJbml0YWxpemUgZGF0YS5cblx0XHR2YXIgYXR0ck1vZGVsID0gdGhpcy5tb2RlbC5nZXRBdHRyKCAnZ3JpZF9jZWxscycgKTtcblxuXHRcdGlmICggYXR0ck1vZGVsICkge1xuXHRcdFx0YnVpbGRlci5zZXREYXRhKCBhdHRyTW9kZWwuZ2V0KCAndmFsdWUnKSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdHJlbmRlckltYWdlOiBmdW5jdGlvbigpIHtcblxuXHRcdCQoICc+IC5zZWxlY3Rpb24taXRlbSA+IC5mb3JtLXJvdyA+IC5pbWFnZS1maWVsZCcsIHRoaXMuJGVsICkuYXBwZW5kKFxuXHRcdFx0dGhpcy5pbWFnZUZpZWxkLnJlbmRlcigpLiRlbFxuXHRcdCk7XG5cblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3JpZE1vZHVsZUVkaXRWaWV3O1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG5cbi8qKlxuICogSGVhZGVyIE1vZHVsZS5cbiAqIEV4dGVuZHMgZGVmYXVsdCBtb3VkdWxlIHdpdGggY3VzdG9tIGRpZmZlcmVudCB0ZW1wbGF0ZS5cbiAqL1xudmFyIEhlYWRlck1vZHVsZUVkaXRWaWV3ID0gTW9kdWxlRWRpdC5leHRlbmQoe1xuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLXVzdHdvLW1vZHVsZS1lZGl0LWhlYWRlcicgKS5odG1sKCksXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xudmFyIEZpZWxkSW1hZ2UgPSByZXF1aXJlKCcuL2ZpZWxkLWltYWdlLmpzJyk7XG5cbi8qKlxuICogSGlnaGxpZ2h0IE1vZHVsZS5cbiAqIEV4dGVuZHMgZGVmYXVsdCBtb3VkdWxlLFxuICogY3VzdG9tIGRpZmZlcmVudCB0ZW1wbGF0ZS5cbiAqL1xudmFyIEltYWdlTW9kdWxlRWRpdFZpZXcgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICQoICcjdG1wbC11c3R3by1tb2R1bGUtZWRpdC1pbWFnZS1sb2dvLWhlYWRsaW5lJyApLmh0bWwoKSxcblx0aW1hZ2VGaWVsZDogbnVsbCxcblx0aW1hZ2VBdHRyOiBudWxsLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBhdHRyaWJ1dGVzLCBvcHRpb25zIF0gKTtcblxuXHRcdHRoaXMuaW1hZ2VBdHRyID0gdGhpcy5tb2RlbC5nZXRBdHRyKCdpbWFnZScpO1xuXG5cdFx0dmFyIGNvbmZpZyA9IHRoaXMuaW1hZ2VBdHRyLmdldCgnY29uZmlnJykgfHwge307XG5cblx0XHRjb25maWcgPSBfLmV4dGVuZCgge1xuXHRcdFx0bXVsdGlwbGU6IGZhbHNlLFxuXHRcdH0sIGNvbmZpZyApO1xuXG5cdFx0dGhpcy5pbWFnZUZpZWxkID0gbmV3IEZpZWxkSW1hZ2UoIHtcblx0XHRcdHZhbHVlOiB0aGlzLmltYWdlQXR0ci5nZXQoJ3ZhbHVlJyksXG5cdFx0XHRjb25maWc6IGNvbmZpZyxcblx0XHR9ICk7XG5cblx0XHR0aGlzLmltYWdlRmllbGQub24oICdjaGFuZ2UnLCBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdHRoaXMuaW1hZ2VBdHRyLnNldCggJ3ZhbHVlJywgZGF0YSApO1xuXHRcdFx0dGhpcy5tb2RlbC50cmlnZ2VyKCAnY2hhbmdlJywgdGhpcy5tb2RlbCApO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblxuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcyApO1xuXG5cdFx0JCggJy5pbWFnZS1maWVsZCcsIHRoaXMuJGVsICkuYXBwZW5kKFxuXHRcdFx0dGhpcy5pbWFnZUZpZWxkLnJlbmRlcigpLiRlbFxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZU1vZHVsZUVkaXRWaWV3O1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG52YXIgRmllbGRJbWFnZSA9IHJlcXVpcmUoJy4vZmllbGQtaW1hZ2UuanMnKTtcblxuLyoqXG4gKiBIaWdobGlnaHQgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUsXG4gKiBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgSW1hZ2VNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLXVzdHdvLW1vZHVsZS1lZGl0LWltYWdlJyApLmh0bWwoKSxcblx0aW1hZ2VGaWVsZDogbnVsbCxcblx0aW1hZ2VBdHRyOiBudWxsLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBhdHRyaWJ1dGVzLCBvcHRpb25zIF0gKTtcblxuXHRcdHRoaXMuaW1hZ2VBdHRyID0gdGhpcy5tb2RlbC5nZXRBdHRyKCdpbWFnZScpO1xuXG5cdFx0dmFyIGNvbmZpZyA9IHRoaXMuaW1hZ2VBdHRyLmdldCgnY29uZmlnJykgfHwge307XG5cblx0XHRjb25maWcgPSBfLmV4dGVuZCgge1xuXHRcdFx0bXVsdGlwbGU6IGZhbHNlLFxuXHRcdH0sIGNvbmZpZyApO1xuXG5cdFx0dGhpcy5pbWFnZUZpZWxkID0gbmV3IEZpZWxkSW1hZ2UoIHtcblx0XHRcdHZhbHVlOiB0aGlzLmltYWdlQXR0ci5nZXQoJ3ZhbHVlJyksXG5cdFx0XHRjb25maWc6IGNvbmZpZyxcblx0XHR9ICk7XG5cblx0XHR0aGlzLmltYWdlRmllbGQub24oICdjaGFuZ2UnLCBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdHRoaXMuaW1hZ2VBdHRyLnNldCggJ3ZhbHVlJywgZGF0YSApO1xuXHRcdFx0dGhpcy5tb2RlbC50cmlnZ2VyKCAnY2hhbmdlJywgdGhpcy5tb2RlbCApO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblxuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcyApO1xuXG5cdFx0JCggJy5pbWFnZS1maWVsZCcsIHRoaXMuJGVsICkuYXBwZW5kKFxuXHRcdFx0dGhpcy5pbWFnZUZpZWxkLnJlbmRlcigpLiRlbFxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZU1vZHVsZUVkaXRWaWV3O1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG5cbi8qKlxuICogSGlnaGxpZ2h0IE1vZHVsZS5cbiAqIEV4dGVuZHMgZGVmYXVsdCBtb3VkdWxlLFxuICogY3VzdG9tIGRpZmZlcmVudCB0ZW1wbGF0ZS5cbiAqL1xudmFyIFN0YXRzTW9kdWxlRWRpdFZpZXcgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cdHRlbXBsYXRlOiAkKCAnI3RtcGwtdXN0d28tbW9kdWxlLWVkaXQtc3RhdHMnICkuaHRtbCgpLFxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdHNNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xuXG4vKipcbiAqIEhpZ2hsaWdodCBNb2R1bGUuXG4gKiBFeHRlbmRzIGRlZmF1bHQgbW91ZHVsZSxcbiAqIGN1c3RvbSBkaWZmZXJlbnQgdGVtcGxhdGUuXG4gKi9cbnZhciBIaWdobGlnaHRNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLXVzdHdvLW1vZHVsZS1lZGl0LXRleHQnICkuaHRtbCgpLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcyApO1xuXG5cdFx0Ly8gTWFrZSBzdXJlIHRoZSB0ZW1wbGF0ZSBmb3IgdGhpcyBtb2R1bGUgaXMgdW5pcXVlIHRvIHRoaXMgaW5zdGFuY2UuXG5cdFx0dGhpcy5lZGl0b3IgPSB7XG5cdFx0XHRpZCAgICAgICAgICAgOiAndXN0d28tdGV4dC1ib2R5LScgKyB0aGlzLm1vZGVsLmNpZCxcblx0XHRcdG5hbWVSZWdleCAgICA6IG5ldyBSZWdFeHAoICd1c3R3by1wbGFjZWhvbGRlci1uYW1lJywgJ2cnICksXG5cdFx0XHRpZFJlZ2V4ICAgICAgOiBuZXcgUmVnRXhwKCAndXN0d28tcGxhY2Vob2xkZXItaWQnLCAnZycgKSxcblx0XHRcdGNvbnRlbnRSZWdleCA6IG5ldyBSZWdFeHAoICd1c3R3by1wbGFjZWhvbGRlci1jb250ZW50JywgJ2cnICksXG5cdFx0fTtcblxuXHRcdHRoaXMudGVtcGxhdGUgID0gdGhpcy50ZW1wbGF0ZS5yZXBsYWNlKCB0aGlzLmVkaXRvci5uYW1lUmVnZXgsIHRoaXMuZWRpdG9yLmlkIClcblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IuaWRSZWdleCwgdGhpcy5lZGl0b3IuaWQgKTtcblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IuY29udGVudFJlZ2V4LCAnPCU9IGF0dHIuYm9keS52YWx1ZSAlPicgKTtcblxuXHRcdHRoaXMudGVzdCA9IHRoaXMubW9kZWwuY2lkO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzICk7XG5cblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHQvLyBQcmV2ZW50IEZPVUMuIFNob3cgYWdhaW4gb24gaW5pdC4gU2VlIHNldHVwLlxuXHRcdCQoICcud3AtZWRpdG9yLXdyYXAnLCB0aGlzLiRlbCApLmNzcyggJ2Rpc3BsYXknLCAnbm9uZScgKTtcblxuXHRcdHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuaW5pdFRpbnlNQ0UoKTtcblx0XHR9LmJpbmQoIHRoaXMgKSwgMTAwICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIHRoZSBUaW55TUNFIGVkaXRvci5cblx0ICpcblx0ICogQHJldHVybiBudWxsLlxuXHQgKi9cblx0aW5pdFRpbnlNQ0U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHNlbGYgPSB0aGlzLCBpZCwgZWQsICRlbDtcblxuXHRcdGlkICA9IHRoaXMuZWRpdG9yLmlkO1xuXHRcdGVkICA9IHRpbnlNQ0UuZ2V0KCBpZCApO1xuXHRcdCRlbCA9ICQoICcjd3AtJyArIGlkICsgJy13cmFwJywgdGhpcy4kZWwgKTtcblxuXHRcdGlmICggZWQgKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Ly8gSWYgbm8gc2V0dGluZ3MgZm9yIHRoaXMgZmllbGQuIENsb25lIGZyb20gcGxhY2Vob2xkZXIuXG5cdFx0aWYgKCB0eXBlb2YoIHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0gKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHR2YXIgbmV3U2V0dGluZ3MgPSBqUXVlcnkuZXh0ZW5kKCB7fSwgdGlueU1DRVByZUluaXQubWNlSW5pdFsgJ3VzdHdvLXBsYWNlaG9sZGVyLWlkJyBdICk7XG5cdFx0XHRmb3IgKCB2YXIgcHJvcCBpbiBuZXdTZXR0aW5ncyApIHtcblx0XHRcdFx0aWYgKCAnc3RyaW5nJyA9PT0gdHlwZW9mKCBuZXdTZXR0aW5nc1twcm9wXSApICkge1xuXHRcdFx0XHRcdG5ld1NldHRpbmdzW3Byb3BdID0gbmV3U2V0dGluZ3NbcHJvcF0ucmVwbGFjZSggdGhpcy5lZGl0b3IuaWRSZWdleCwgaWQgKS5yZXBsYWNlKCB0aGlzLmVkaXRvci5uYW1lUmVnZXgsIG5hbWUgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGlueU1DRVByZUluaXQubWNlSW5pdFsgaWQgXSA9IG5ld1NldHRpbmdzO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBmdWxsc2NyZWVuIHBsdWdpbi5cblx0XHR0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdLnBsdWdpbnMgPSB0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdLnBsdWdpbnMucmVwbGFjZSggJ2Z1bGxzY3JlZW4sJywgJycgKTtcblxuXHRcdC8vIElmIG5vIFF1aWNrdGFnIHNldHRpbmdzIGZvciB0aGlzIGZpZWxkLiBDbG9uZSBmcm9tIHBsYWNlaG9sZGVyLlxuXHRcdGlmICggdHlwZW9mKCB0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHR2YXIgbmV3UVRTID0galF1ZXJ5LmV4dGVuZCgge30sIHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgJ3VzdHdvLXBsYWNlaG9sZGVyLWlkJyBdICk7XG5cdFx0XHRmb3IgKCB2YXIgcHJvcCBpbiBuZXdRVFMgKSB7XG5cdFx0XHRcdGlmICggJ3N0cmluZycgPT09IHR5cGVvZiggbmV3UVRTW3Byb3BdICkgKSB7XG5cdFx0XHRcdFx0bmV3UVRTW3Byb3BdID0gbmV3UVRTW3Byb3BdLnJlcGxhY2UoIHRoaXMuZWRpdG9yLmlkUmVnZXgsIGlkICkucmVwbGFjZSggdGhpcy5lZGl0b3IubmFtZVJlZ2V4LCBuYW1lICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgaWQgXSA9IG5ld1FUUztcblx0XHR9XG5cblx0XHR2YXIgbW9kZSA9ICRlbC5oYXNDbGFzcygndG1jZS1hY3RpdmUnKSA/ICd0bWNlJyA6ICdodG1sJztcblxuXHRcdC8vIFdoZW4gZWRpdG9yIGluaXRzLCBhdHRhY2ggc2F2ZSBjYWxsYmFjayB0byBjaGFuZ2UgZXZlbnQuXG5cdFx0dGlueU1DRVByZUluaXQubWNlSW5pdFtpZF0uc2V0dXAgPSBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy5vbignY2hhbmdlJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRzZWxmLnNldEF0dHIoICdib2R5JywgZS50YXJnZXQuZ2V0Q29udGVudCgpICk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdHRoaXMub24oICdpbml0JywgZnVuY3Rpb24oZWQpIHtcblx0XHRcdFx0d2luZG93LnNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdCRlbC5jc3MoICdkaXNwbGF5JywgJ2Jsb2NrJyApO1xuXHRcdFx0XHR9LCAxMDAgKVxuXHRcdFx0fSk7XG5cblx0XHR9O1xuXG5cdFx0Ly8gSWYgY3VycmVudCBtb2RlIGlzIHZpc3VhbCwgY3JlYXRlIHRoZSB0aW55TUNFLlxuXHRcdGlmICggJ3RtY2UnID09PSBtb2RlICkge1xuXHRcdFx0dGlueW1jZS5pbml0KCB0aW55TUNFUHJlSW5pdC5tY2VJbml0W2lkXSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkZWwuY3NzKCAnZGlzcGxheScsICdibG9jaycgKTtcblx0XHR9XG5cblx0XHQvLyBJbml0IHF1aWNrdGFncy5cblx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdHF1aWNrdGFncyggdGlueU1DRVByZUluaXQucXRJbml0WyBpZCBdICk7XG5cdFx0XHRRVGFncy5fYnV0dG9uc0luaXQoKTtcblx0XHR9LCAxMDAgKTtcblxuXHRcdC8vIEhhbmRsZSB0ZW1wb3JhcmlseSByZW1vdmUgdGlueU1DRSB3aGVuIHNvcnRpbmcuXG5cdFx0dGhpcy4kZWwuY2xvc2VzdCgnLnVpLXNvcnRhYmxlJykub24oIFwic29ydHN0YXJ0XCIsIGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG5cdFx0XHRpZiAoIHVpLml0ZW1bMF0uZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpID09PSB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSApIHtcblx0XHRcdFx0dGlueU1DRS5leGVjQ29tbWFuZCggJ21jZVJlbW92ZUVkaXRvcicsIGZhbHNlLCBpZCApO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0Ly8gSGFuZGxlIHJlLWluaXQgYWZ0ZXIgc29ydGluZy5cblx0XHR0aGlzLiRlbC5jbG9zZXN0KCcudWktc29ydGFibGUnKS5vbiggXCJzb3J0c3RvcFwiLCBmdW5jdGlvbiggZXZlbnQsIHVpICkge1xuXHRcdFx0aWYgKCB1aS5pdGVtWzBdLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSA9PT0gdGhpcy5lbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2lkJykgKSB7XG5cdFx0XHRcdHRpbnlNQ0UuZXhlY0NvbW1hbmQoJ21jZUFkZEVkaXRvcicsIGZhbHNlLCBpZCk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogUmVtb3ZlIG1vZGVsIGhhbmRsZXIuXG5cdCAqL1xuXHRyZW1vdmVNb2RlbDogZnVuY3Rpb24oZSkge1xuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLnJlbW92ZU1vZGVsLmFwcGx5KCB0aGlzLCBbZV0gKTtcblx0XHR0aW55TUNFLmV4ZWNDb21tYW5kKCAnbWNlUmVtb3ZlRWRpdG9yJywgZmFsc2UsIHRoaXMuZWRpdG9yLmlkICk7XG5cdH0sXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIaWdobGlnaHRNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xuXG4vKipcbiAqIEhlYWRlciBNb2R1bGUuXG4gKiBFeHRlbmRzIGRlZmF1bHQgbW91ZHVsZSB3aXRoIGN1c3RvbSBkaWZmZXJlbnQgdGVtcGxhdGUuXG4gKi9cbnZhciBIZWFkZXJNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblx0dGVtcGxhdGU6ICQoICcjdG1wbC11c3R3by1tb2R1bGUtZWRpdC10ZXh0YXJlYScgKS5odG1sKCksXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xuXG4vKipcbiAqIEhpZ2hsaWdodCBNb2R1bGUuXG4gKiBFeHRlbmRzIGRlZmF1bHQgbW91ZHVsZSxcbiAqIGN1c3RvbSBkaWZmZXJlbnQgdGVtcGxhdGUuXG4gKi9cbnZhciBIaWdobGlnaHRNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblx0dGVtcGxhdGU6ICQoICcjdG1wbC11c3R3by1tb2R1bGUtZWRpdC12aWRlbycgKS5odG1sKCksXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIaWdobGlnaHRNb2R1bGVFZGl0VmlldztcbiIsInZhciBCYWNrYm9uZSAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbnZhciBNb2R1bGVFZGl0ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdG1vZGVsOiBNb2R1bGUsXG5cdGNsYXNzTmFtZTogJ21vZHVsZS1lZGl0JyxcblxuXHR0b29sc1RlbXBsYXRlOiAkKCcjdG1wbC11c3R3by1tb2R1bGUtZWRpdC10b29scycgKS5odG1sKCksXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NoYW5nZSAqW2RhdGEtbW9kdWxlLWF0dHItbmFtZV0nOiAnYXR0ckZpZWxkQ2hhbmdlZCcsXG5cdFx0J2tleXVwICAqW2RhdGEtbW9kdWxlLWF0dHItbmFtZV0nOiAnYXR0ckZpZWxkQ2hhbmdlZCcsXG5cdFx0J2lucHV0ICAqW2RhdGEtbW9kdWxlLWF0dHItbmFtZV0nOiAnYXR0ckZpZWxkQ2hhbmdlZCcsXG5cdFx0J2NsaWNrICAuYnV0dG9uLXNlbGVjdGlvbi1pdGVtLXJlbW92ZSc6ICdyZW1vdmVNb2RlbCcsXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0Xy5iaW5kQWxsKCB0aGlzLCAnYXR0ckZpZWxkQ2hhbmdlZCcsICdyZW1vdmVNb2RlbCcsICdzZXRBdHRyJyApO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZGF0YSAgPSB0aGlzLm1vZGVsLnRvSlNPTigpO1xuXHRcdGRhdGEuYXR0ciA9IHt9O1xuXG5cdFx0Ly8gRm9ybWF0IGF0dHJpYnV0ZSBhcnJheSBmb3IgZWFzeSB0ZW1wbGF0aW5nLlxuXHRcdC8vIEJlY2F1c2UgYXR0cmlidXRlcyBpbiAgYXJyYXkgaXMgZGlmZmljdWx0IHRvIGFjY2Vzcy5cblx0XHR0aGlzLm1vZGVsLmdldCgnYXR0cicpLmVhY2goIGZ1bmN0aW9uKCBhdHRyICkge1xuXHRcdFx0ZGF0YS5hdHRyWyBhdHRyLmdldCgnbmFtZScpIF0gPSBhdHRyLnRvSlNPTigpO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJGVsLmh0bWwoIF8udGVtcGxhdGUoIHRoaXMudGVtcGxhdGUsIGRhdGEgKSApO1xuXG5cdFx0dGhpcy5pbml0aWFsaXplQ29sb3JwaWNrZXIoKTtcblxuXHRcdC8vIElEIGF0dHJpYnV0ZSwgc28gd2UgY2FuIGNvbm5lY3QgdGhlIHZpZXcgYW5kIG1vZGVsIGFnYWluIGxhdGVyLlxuXHRcdHRoaXMuJGVsLmF0dHIoICdkYXRhLWNpZCcsIHRoaXMubW9kZWwuY2lkICk7XG5cblx0XHQvLyBBcHBlbmQgdGhlIG1vZHVsZSB0b29scy5cblx0XHR0aGlzLiRlbC5wcmVwZW5kKCBfLnRlbXBsYXRlKCB0aGlzLnRvb2xzVGVtcGxhdGUsIGRhdGEgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHRpbml0aWFsaXplQ29sb3JwaWNrZXI6IGZ1bmN0aW9uKCkge1xuXHRcdCQoJy51c3R3by1wYi1jb2xvci1waWNrZXInLCB0aGlzLiRlbCApLndwQ29sb3JQaWNrZXIoe1xuXHRcdCAgICBwYWxldHRlczogWycjZWQwMDgyJywgJyNlNjBjMjknLCcjZmY1NTE5JywnI2ZmYmYwMCcsJyM5NmNjMjknLCcjMTRjMDRkJywnIzE2ZDVkOScsJyMwMDljZjMnLCcjMTQzZmNjJywnIzYxMTRjYycsJyMzMzMzMzMnXSxcblx0XHRcdGNoYW5nZTogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblx0XHRcdFx0JCh0aGlzKS5hdHRyKCAndmFsdWUnLCB1aS5jb2xvci50b1N0cmluZygpICk7XG5cdFx0XHRcdCQodGhpcykudHJpZ2dlciggJ2NoYW5nZScgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRzZXRBdHRyOiBmdW5jdGlvbiggYXR0cmlidXRlLCB2YWx1ZSApIHtcblxuXHRcdHZhciBhdHRyID0gdGhpcy5tb2RlbC5nZXQoICdhdHRyJyApLmZpbmRXaGVyZSggeyBuYW1lOiBhdHRyaWJ1dGUgfSApO1xuXG5cdFx0aWYgKCBhdHRyICkge1xuXHRcdFx0YXR0ci5zZXQoICd2YWx1ZScsIHZhbHVlICk7XG5cdFx0XHR0aGlzLm1vZGVsLnRyaWdnZXIoJ2NoYW5nZTphdHRyJyk7XG5cdFx0fVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIENoYW5nZSBldmVudCBoYW5kbGVyLlxuXHQgKiBVcGRhdGUgYXR0cmlidXRlIGZvbGxvd2luZyB2YWx1ZSBjaGFuZ2UuXG5cdCAqL1xuXHRhdHRyRmllbGRDaGFuZ2VkOiBmdW5jdGlvbihlKSB7XG5cblx0XHR2YXIgYXR0ciA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSggJ2RhdGEtbW9kdWxlLWF0dHItbmFtZScgKTtcblxuICAgICAgICBpZiAoIGUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSggJ2NvbnRlbnRlZGl0YWJsZScgKSApIHtcbiAgICAgICAgXHR0aGlzLnNldEF0dHIoIGF0dHIsICQoZS50YXJnZXQpLmh0bWwoKSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICBcdHRoaXMuc2V0QXR0ciggYXR0ciwgZS50YXJnZXQudmFsdWUgKTtcbiAgICAgICAgfVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlbW92ZSBtb2RlbCBoYW5kbGVyLlxuXHQgKi9cblx0cmVtb3ZlTW9kZWw6IGZ1bmN0aW9uKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dGhpcy5yZW1vdmUoKTtcblx0XHR0aGlzLm1vZGVsLmRlc3Ryb3koKTtcblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlRWRpdDtcbiJdfQ==
