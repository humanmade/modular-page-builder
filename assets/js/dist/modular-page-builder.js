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
	toMicroJSON: function() {

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
var globals = {
	Builder:       require('./models/builder.js'),
	ModuleFactory: require('./utils/module-factory.js'),
	editViewMap:   require('./utils/edit-view-map.js'),
	views: {
		BuilderView: require('./views/builder.js'),
		ModuleEdit:  require('./views/module-edit.js'),
	}
};

module.exports = globals;

},{"./models/builder.js":4,"./utils/edit-view-map.js":8,"./utils/module-factory.js":9,"./views/builder.js":10,"./views/module-edit.js":19}],4:[function(require,module,exports){
(function (global){
var Backbone         = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var Modules          = require('./../collections/modules.js');
var ModuleFactory    = require('./../utils/module-factory.js');

var Builder = Backbone.Model.extend({

	defaults: {
		selectDefault:  modularPageBuilderData.l10n.selectDefault,
		addNewButton:   modularPageBuilderData.l10n.addNewButton,
		selection:      [], // Instance of Modules. Can't use a default, otherwise they won't be unique.
		allowedModules: [], // Module names allowed for this builder.
	},

	initialize: function() {

		// Set default selection to ensure it isn't a reference.
		if ( ! ( this.get('selection') instanceof Modules ) ) {
			this.set( 'selection', new Modules() );
		}

	},

	setData: function( data ) {

		var selection;

		if ( '' === data ) {
			return;
		}

		// Handle either JSON string or proper obhect.
		data = ( 'string' === typeof data ) ? JSON.parse( data ) : data;

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

		var data = [];

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
		return _.filter( ModuleFactory.availableModules, function( module ) {
			return this.isModuleAllowed( module.name );
		}.bind( this ) );
	},

	isModuleAllowed: function( moduleName ) {
		return this.get('allowedModules').indexOf( moduleName ) >= 0;
	}

});

module.exports = Builder;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../collections/modules.js":2,"./../utils/module-factory.js":9}],5:[function(require,module,exports){
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
var Backbone   = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var ModuleAtts = require('./../collections/module-attributes.js');

var Module = Backbone.Model.extend({

	defaults: {
		name:  '',
		label: '',
		attr:  [],
	},

	initialize: function() {

		// Set default selection to ensure it isn't a reference.
		if ( ! ( this.get('attr') instanceof ModuleAtts ) ) {
			this.set( 'attr', new ModuleAtts() );
		}

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
		};
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
window.modularPageBuilder = require('./globals');

$(document).ready(function(){

	ModuleFactory.init();

	// A field for storing the builder data.
	var $field = $( '[name=modular-page-builder-data]' );

	if ( ! $field.length ) {
		return;
	}

	// A container element for displaying the builder.
	var $container = $( '#modular-page-builder' );

	// Create a new instance of Builder model.
	// Pass an array of module names that are allowed for this builder.
	var builder = new Builder({
		allowedModules: $( '[name=modular-page-builder-allowed-modules]' ).val().split(',')
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
	builderView.render().$el.appendTo( $container );

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./globals":3,"./models/builder.js":4,"./utils/module-factory.js":9,"./views/builder.js":10}],8:[function(require,module,exports){
/**
 * Map module type to views.
 */
var editViewMap = {
	'header':              require('./../views/module-edit-header.js'),
	'textarea':            require('./../views/module-edit-textarea.js'),
	'text':                require('./../views/module-edit-text.js'),
	'image':               require('./../views/module-edit-image.js'),
	'video':               require('./../views/module-edit-video.js'),
	'blockquote':          require('./../views/module-edit-blockquote.js'),
};

module.exports = editViewMap;

},{"./../views/module-edit-blockquote.js":13,"./../views/module-edit-header.js":14,"./../views/module-edit-image.js":15,"./../views/module-edit-text.js":16,"./../views/module-edit-textarea.js":17,"./../views/module-edit-video.js":18}],9:[function(require,module,exports){
(function (global){
var Module           = require('./../models/module.js');
var ModuleAtts       = require('./../collections/module-attributes.js');
var $                = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var ModuleFactory = {

	availableModules: [],

	init: function() {
		if ( modularPageBuilderData && 'available_modules' in modularPageBuilderData ) {
			_.each( modularPageBuilderData.available_modules, function( module ) {
				this.registerModule( module );
			}.bind( this ) );
		}
	},

	registerModule: function( module ) {
		this.availableModules.push( module );
	},

	/**
	 * Create Module Model.
	 * Use data from config, plus saved data.
	 *
	 * @param  string moduleName
	 * @param  object attribute JSON. Saved attribute values.
	 * @return Module
	 */
	create: function( moduleName, attrData ) {

		var data = $.extend( true, {}, _.findWhere( this.availableModules, { name: moduleName } ) );

		if ( ! data ) {
			return null;
		}


		var attributes = new ModuleAtts();

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

};

module.exports = ModuleFactory;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../collections/module-attributes.js":1,"./../models/module.js":6}],10:[function(require,module,exports){
(function (global){
var Backbone      = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var Builder       = require('./../models/builder.js');
var editViewMap   = require('./../utils/edit-view-map.js');
var ModuleFactory = require('./../utils/module-factory.js');
var $             = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var Builder = Backbone.View.extend({

	template: $('#tmpl-mpb-builder' ).html(),
	className: 'modular-page-builder',
	model: null,
	newModuleName: null,

	events: {
		'change > .add-new .add-new-module-select': 'toggleButtonStatus',
		'click > .add-new .add-new-module-button': 'addModule',
	},

	initialize: function() {

		var selection = this.model.get('selection');

		selection.on( 'add', this.addNewSelectionItemView, this );
		selection.on( 'all', this.model.saveData, this.model );

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
			$( '<option/>', { text: modularPageBuilderData.l10n.selectDefault } )
		);

		_.each( this.model.getAvailableModules(), function( module ) {
			var template = '<option value="<%= name %>"><%= label %></option>';
			$select.append( _.template( template, module ) );
		} );

	},

	/**
	 * Initialize Sortable.
	 */
	initSortable: function() {
		$( '> .selection', this.$el ).sortable({
			handle: '.module-edit-tools',
			items: '> .module-edit',
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

		if ( newIndex !== oldIndex ) {
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

		var editView, view;

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

},{"./../models/builder.js":4,"./../utils/edit-view-map.js":8,"./../utils/module-factory.js":9}],11:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

/**
 * Image Field
 *
 * Initialize and listen for the 'change' event to get updated data.
 *
 */
var FieldImage = Backbone.View.extend({

	template:  $( '#tmpl-mpb-field-image' ).html(),
	frame:     null,
	imageAttr: null,
	config:    {},
	value:     [], // Attachment IDs.
	selection: {}, // Attachments collection for this.value.

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

		_.bindAll( this, 'render', 'editImage', 'onSelectImage', 'removeImage', 'isAttachmentSizeOk' );

		if ( 'value' in options ) {
			this.value = options.value;
		}

		// Ensure value is array.
		if ( ! this.value || ! Array.isArray( this.value ) ) {
			this.value = [];
		}

		if ( 'config' in options ) {
			this.config = _.extend( {
				multiple: false,
			}, options.config );
		}

		this.on( 'change', this.render );

		this.initSelection();

	},

	/**
	 * Initialize Selection.
	 *
	 * Selection is an Attachment collection containing full models for the current value.
	 *
	 * @return null
	 */
	initSelection: function() {

		this.selection = new wp.media.model.Attachments();

		// Initialize selection.
		_.each( this.value, function( item ) {

			var model;

			// Legacy. Handle storing full objects.
			item  = ( 'object' === typeof( item ) ) ? item.id : item;
			model = new wp.media.attachment( item );

			this.selection.add( model );

			// Re-render after attachments have synced.
			model.fetch();
			model.on( 'sync', this.render );

		}.bind(this) );

	},

	render: function() {

		var template;

		template = _.memoize( function( value, config ) {
			return _.template( this.template, {
				value: value,
				config: config,
			} );
		}.bind(this) );

		this.$el.html( template( this.selection.toJSON(), this.config ) );

		return this;

	},

	/**
	 * Handle the select event.
	 *
	 * Insert an image or multiple images.
	 */
	onSelectImage: function() {

		var frame = this.frame || null;

		if ( ! frame ) {
			return;
		}

		this.value = [];
		this.selection.reset([]);

		frame.state().get('selection').each( function( attachment ) {

			if ( this.isAttachmentSizeOk( attachment ) ) {
				this.value.push( attachment.get('id') );
				this.selection.add( attachment );
			}

		}.bind(this) );

		this.trigger( 'change', this.value );

		frame.close();

	},

	/**
	 * Handle the edit action.
	 */
	editImage: function(e) {

		e.preventDefault();

		var frame = this.frame;

		if ( ! frame ) {

			var frameArgs = {
				library: { type: 'image' },
				multiple: this.config.multiple,
				title: 'Select Image',
				frame: 'select',
			};

			frame = this.frame = wp.media( frameArgs );

			frame.on( 'content:create:browse', this.setupFilters, this );
			frame.on( 'content:render:browse', this.sizeFilterNotice, this );
			frame.on( 'select', this.onSelectImage, this );

		}

		// When the frame opens, set the selection.
		frame.on( 'open', function() {

			var selection = frame.state().get('selection');

			// Set the selection.
			// Note - expects array of objects, not a collection.
			selection.set( this.selection.models );

		}.bind(this) );

		frame.open();

	},

	/**
	 * Add filters to the frame library collection.
	 *
	 *  - filter to limit to required size.
	 */
	setupFilters: function() {

		var lib    = this.frame.state().get('library');

		if ( 'sizeReq' in this.config ) {
			lib.filters.size = this.isAttachmentSizeOk;
		}

	},


	/**
	 * Handle display of size filter notice.
	 */
	sizeFilterNotice: function() {

		var lib = this.frame.state().get('library');

		if ( ! lib.filters.size ) {
			return;
		}

		// Wait to be sure the frame is rendered.
		window.setTimeout( function() {

			var req, $notice, template, $toolbar;

			req = _.extend( {
				width: 0,
				height: 0,
			}, this.config.sizeReq );

			// Display notice on main grid view.
			template = '<p class="filter-notice">Only showing images that meet size requirements: <%= width %>px &times; <%= height %>px</p>';
			$notice  = $( _.template( template, req ) );
			$toolbar = $( '.attachments-browser .media-toolbar', this.frame.$el ).first();
			$toolbar.prepend( $notice );

			var contentView = this.frame.views.get( '.media-frame-content' );
			contentView = contentView[0];

			$notice = $( '<p class="filter-notice">Image does not meet size requirements.</p>' );

			// Display additional notice when selecting an image.
			// Required to indicate a bad image has just been uploaded.
			contentView.options.selection.on( 'selection:single', function() {

				var attachment = contentView.options.selection.single();

				var displayNotice = function() {

					// If still uploading, wait and try displaying notice again.
					if ( attachment.get( 'uploading' ) ) {
						window.setTimeout( function() {
							displayNotice();
						}, 500 );

					// OK. Display notice as required.
					} else {

						if ( ! this.isAttachmentSizeOk( attachment ) ) {
							$( '.attachments-browser .attachment-info' ).prepend( $notice );
						} else {
							$notice.remove();
						}

					}

				}.bind(this);

				displayNotice();

			}.bind(this) );

		}.bind(this), 100  );

	},

	removeImage: function(e) {

		e.preventDefault();

		var $target, id;

		$target   = $(e.target);
		$target   = ( $target.prop('tagName') === 'BUTTON' ) ? $target : $target.closest('button.remove');
		id        = $target.data( 'image-id' );

		if ( ! id  ) {
			return;
		}

		this.value = _.filter( this.value, function( val ) {
			return ( val !== id );
		} );

		this.value = ( this.value.length > 0 ) ? this.value : [];

		// Update selection.
		var remove = this.selection.filter( function( item ) {
			return this.value.indexOf( item.get('id') ) < 0;
		}.bind(this) );

		this.selection.remove( remove );

		this.trigger( 'change', this.value );

	},

	/**
	 * Does attachment meet size requirements?
	 *
	 * @param  Attachment
	 * @return boolean
	 */
	isAttachmentSizeOk: function( attachment ) {

		if ( ! ( 'sizeReq' in this.config ) ) {
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

},{}],12:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

/**
 * Text Field View
 *
 * You can use this anywhere.
 * Just listen for 'change' event on the view.
 */
var FieldWYSIWYG = Backbone.View.extend({

	template:  $( '#tmpl-mpb-field-text' ).html(),
	editor: null,
	value: null,

	/**
	 * Init.
	 *
	 * options.value is used to pass initial value.
	 */
	initialize: function( options ) {

		if ( 'value' in options ) {
			this.value = options.value;
		}

		// A few helpers.
		this.editor = {
			id           : 'mpb-text-body-' + this.cid,
			nameRegex    : new RegExp( 'mpb-placeholder-name', 'g' ),
			idRegex      : new RegExp( 'mpb-placeholder-id', 'g' ),
			contentRegex : new RegExp( 'mpb-placeholder-content', 'g' ),
		};

		// The template provided is generic markup used by TinyMCE.
		// We need a template unique to this view.
		this.template  = this.template.replace( this.editor.nameRegex, this.editor.id );
		this.template  = this.template.replace( this.editor.idRegex, this.editor.id );
		this.template  = this.template.replace( this.editor.contentRegex, '<%= value %>' );

	},

	render: function () {

		// Create element from template.
		this.$el.html( _.template( this.template, { value: this.value } ) );

		// Hide editor to prevent FOUC. Show again on init. See setup.
		$( '.wp-editor-wrap', this.$el ).css( 'display', 'none' );

		this.initTinyMCE();

		return this;

	},

	/**
	 * Initialize the TinyMCE editor.
	 *
	 * Bit hacky this.
	 *
	 * @return null.
	 */
	initTinyMCE: function() {

		var self = this, id, ed, $el, prop;

		id  = this.editor.id;
		ed  = tinyMCE.get( id );
		$el = $( '#wp-' + id + '-wrap', this.$el );

		if ( ed ) {
			return;
		}

		// Get settings for this field.
		// If no settings for this field. Clone from placeholder.
		if ( typeof( tinyMCEPreInit.mceInit[ id ] ) === 'undefined' ) {
			var newSettings = jQuery.extend( {}, tinyMCEPreInit.mceInit[ 'mpb-placeholder-id' ] );
			for ( prop in newSettings ) {
				if ( 'string' === typeof( newSettings[prop] ) ) {
					newSettings[prop] = newSettings[prop].replace( this.editor.idRegex, id ).replace( this.editor.nameRegex, name );
				}
			}
			tinyMCEPreInit.mceInit[ id ] = newSettings;
		}

		// Remove fullscreen plugin.
		tinyMCEPreInit.mceInit[ id ].plugins = tinyMCEPreInit.mceInit[ id ].plugins.replace( 'fullscreen,', '' );

		// Get quicktag settings for this field.
		// If none exists for this field. Clone from placeholder.
		if ( typeof( tinyMCEPreInit.qtInit[ id ] ) === 'undefined' ) {
			var newQTS = jQuery.extend( {}, tinyMCEPreInit.qtInit[ 'mpb-placeholder-id' ] );
			for ( prop in newQTS ) {
				if ( 'string' === typeof( newQTS[prop] ) ) {
					newQTS[prop] = newQTS[prop].replace( this.editor.idRegex, id ).replace( this.editor.nameRegex, name );
				}
			}
			tinyMCEPreInit.qtInit[ id ] = newQTS;
		}

		// When editor inits, attach save callback to change event.
		tinyMCEPreInit.mceInit[id].setup = function() {

			this.on('change', function(e) {
				self.value = e.target.getContent();
				self.trigger( 'change', self.value );
			} );

			// Prevent FOUC. Show element after init.
			this.on( 'init', function() {
				window.setTimeout( function() {
					$el.css( 'display', 'block' );
				}, 100 );
			});

		};


		// Current mode determined by class on element.
		// If mode is visual, create the tinyMCE.
		if ( $el.hasClass('tmce-active') ) {
			tinyMCE.init( tinyMCEPreInit.mceInit[id] );
		} else {
			$el.css( 'display', 'block' );
		}

		// Init quicktags.
		setTimeout( function() {
			quicktags( tinyMCEPreInit.qtInit[ id ] );
			QTags._buttonsInit();
		}, 100 );

		// Handle temporary removal of tinyMCE when sorting.
		this.$el.closest('.ui-sortable').on( 'sortstart', function( event, ui ) {
			if ( ui.item[0].getAttribute('data-cid') === this.el.getAttribute('data-cid') ) {
				tinyMCE.execCommand( 'mceRemoveEditor', false, id );
			}
		}.bind(this) );

		// Handle re-init after sorting.
		this.$el.closest('.ui-sortable').on( 'sortstop', function( event, ui ) {
			if ( ui.item[0].getAttribute('data-cid') === this.el.getAttribute('data-cid') ) {
				tinyMCE.execCommand('mceAddEditor', false, id);
			}
		}.bind(this) );

	},

	remove: function() {
		tinyMCE.execCommand( 'mceRemoveEditor', false, this.editor.id );
	},

} );

module.exports = FieldWYSIWYG;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],13:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var HighlightModuleEditView = ModuleEdit.extend({
	template: $( '#tmpl-mpb-module-edit-blockquote' ).html(),
});

module.exports = HighlightModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":19}],14:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Header Module.
 * Extends default moudule with custom different template.
 */
var HeaderModuleEditView = ModuleEdit.extend({
	template: $( '#tmpl-mpb-module-edit-header' ).html(),
});

module.exports = HeaderModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":19}],15:[function(require,module,exports){
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

	template: $( '#tmpl-mpb-module-edit-image' ).html(),
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

},{"./field-image.js":11,"./module-edit.js":19}],16:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');
var FieldText  = require('./field-wysiwyg.js');

var TextModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-mpb-module-edit-text' ).html(),
	textField: null,

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		// Initialize our textfield subview.
		this.textField = new FieldText( {
			value: this.model.getAttr('body').get('value'),
		} );

		// Listen for change event in subview and update current value.
		// Note manual change event trigger to ensure everything is updated.
		this.textField.on( 'change', function( data ) {
			this.model.getAttr('body').set( 'value', data );
			this.model.trigger( 'change', this.model );
		}.bind(this) );

	},

	render: function() {

		// Call default ModuleEdeit render.
		ModuleEdit.prototype.render.apply( this );

		// Render and insert textField view.
		$( '.text-field', this.$el ).append(
			this.textField.render().$el
		);

		return this;

	},

	/**
	 * Destroy the text field when model is removed.
	 */
	removeModel: function() {
		this.textField.remove();
	},

});

module.exports = TextModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field-wysiwyg.js":12,"./module-edit.js":19}],17:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Header Module.
 * Extends default moudule with custom different template.
 */
var HeaderModuleEditView = ModuleEdit.extend({
	template: $( '#tmpl-mpb-module-edit-textarea' ).html(),
});

module.exports = HeaderModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":19}],18:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var HighlightModuleEditView = ModuleEdit.extend({
	template: $( '#tmpl-mpb-module-edit-video' ).html(),
});

module.exports = HighlightModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":19}],19:[function(require,module,exports){
(function (global){
var Backbone   = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var ModuleEdit = Backbone.View.extend({

	className:     'module-edit',
	toolsTemplate: $('#tmpl-mpb-module-edit-tools' ).html(),

	events: {
		'change *[data-module-attr-name]': 'attrFieldChanged',
		'keyup  *[data-module-attr-name]': 'attrFieldChanged',
		'input  *[data-module-attr-name]': 'attrFieldChanged',
		'click  .button-selection-item-remove': 'removeModel',
	},

	initialize: function() {
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
		$('.mpb-color-picker', this.$el ).wpColorPicker({
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvc3JjL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9nbG9iYWxzLmpzIiwiYXNzZXRzL2pzL3NyYy9tb2RlbHMvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMiLCJhc3NldHMvanMvc3JjL21vZGVscy9tb2R1bGUuanMiLCJhc3NldHMvanMvc3JjL21vZHVsYXItcGFnZS1idWlsZGVyLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9lZGl0LXZpZXctbWFwLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9tb2R1bGUtZmFjdG9yeS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvZmllbGQtaW1hZ2UuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkLXd5c2l3eWcuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWJsb2NrcXVvdGUuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWhlYWRlci5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtaW1hZ2UuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LXRleHQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LXRleHRhcmVhLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC12aWRlby5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDL1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGVBdHRyaWJ1dGUgPSByZXF1aXJlKCcuLy4uL21vZGVscy9tb2R1bGUtYXR0cmlidXRlLmpzJyk7XG5cbi8qKlxuICogU2hvcnRjb2RlIEF0dHJpYnV0ZXMgY29sbGVjdGlvbi5cbiAqL1xudmFyIFNob3J0Y29kZUF0dHJpYnV0ZXMgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cblx0bW9kZWwgOiBNb2R1bGVBdHRyaWJ1dGUsXG5cblx0Ly8gRGVlcCBDbG9uZS5cblx0Y2xvbmU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvciggXy5tYXAoIHRoaXMubW9kZWxzLCBmdW5jdGlvbihtKSB7XG5cdFx0XHRyZXR1cm4gbS5jbG9uZSgpO1xuXHRcdH0pKTtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIG9ubHkgdGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBzYXZlZC5cblx0ICpcblx0ICogQHJldHVybiBvYmplY3Rcblx0ICovXG5cdHRvTWljcm9KU09OOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBqc29uID0ge307XG5cblx0XHR0aGlzLmVhY2goIGZ1bmN0aW9uKCBtb2RlbCApIHtcblx0XHRcdGpzb25bIG1vZGVsLmdldCggJ25hbWUnICkgXSA9IG1vZGVsLnRvTWljcm9KU09OKCk7XG5cdFx0fSApO1xuXG5cdFx0cmV0dXJuIGpzb247XG5cdH0sXG5cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2hvcnRjb2RlQXR0cmlidXRlcztcbiIsInZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZSAgID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvbW9kdWxlLmpzJyk7XG5cbi8vIFNob3J0Y29kZSBDb2xsZWN0aW9uXG52YXIgTW9kdWxlcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblxuXHRtb2RlbCA6IE1vZHVsZSxcblxuXHQvLyAgRGVlcCBDbG9uZS5cblx0Y2xvbmUgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoIF8ubWFwKCB0aGlzLm1vZGVscywgZnVuY3Rpb24obSkge1xuXHRcdFx0cmV0dXJuIG0uY2xvbmUoKTtcblx0XHR9KSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybiBvbmx5IHRoZSBkYXRhIHRoYXQgbmVlZHMgdG8gYmUgc2F2ZWQuXG5cdCAqXG5cdCAqIEByZXR1cm4gb2JqZWN0XG5cdCAqL1xuXHR0b01pY3JvSlNPTjogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0cmV0dXJuIHRoaXMubWFwKCBmdW5jdGlvbihtb2RlbCkgeyByZXR1cm4gbW9kZWwudG9NaWNyb0pTT04oIG9wdGlvbnMgKTsgfSApO1xuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGVzO1xuIiwiLy8gRXhwb3NlIHNvbWUgZnVuY3Rpb25hbGl0eSBnbG9iYWxseS5cbnZhciBnbG9iYWxzID0ge1xuXHRCdWlsZGVyOiAgICAgICByZXF1aXJlKCcuL21vZGVscy9idWlsZGVyLmpzJyksXG5cdE1vZHVsZUZhY3Rvcnk6IHJlcXVpcmUoJy4vdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMnKSxcblx0ZWRpdFZpZXdNYXA6ICAgcmVxdWlyZSgnLi91dGlscy9lZGl0LXZpZXctbWFwLmpzJyksXG5cdHZpZXdzOiB7XG5cdFx0QnVpbGRlclZpZXc6IHJlcXVpcmUoJy4vdmlld3MvYnVpbGRlci5qcycpLFxuXHRcdE1vZHVsZUVkaXQ6ICByZXF1aXJlKCcuL3ZpZXdzL21vZHVsZS1lZGl0LmpzJyksXG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2xvYmFscztcbiIsInZhciBCYWNrYm9uZSAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgTW9kdWxlcyAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vY29sbGVjdGlvbnMvbW9kdWxlcy5qcycpO1xudmFyIE1vZHVsZUZhY3RvcnkgICAgPSByZXF1aXJlKCcuLy4uL3V0aWxzL21vZHVsZS1mYWN0b3J5LmpzJyk7XG5cbnZhciBCdWlsZGVyID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuXHRkZWZhdWx0czoge1xuXHRcdHNlbGVjdERlZmF1bHQ6ICBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhLmwxMG4uc2VsZWN0RGVmYXVsdCxcblx0XHRhZGROZXdCdXR0b246ICAgbW9kdWxhclBhZ2VCdWlsZGVyRGF0YS5sMTBuLmFkZE5ld0J1dHRvbixcblx0XHRzZWxlY3Rpb246ICAgICAgW10sIC8vIEluc3RhbmNlIG9mIE1vZHVsZXMuIENhbid0IHVzZSBhIGRlZmF1bHQsIG90aGVyd2lzZSB0aGV5IHdvbid0IGJlIHVuaXF1ZS5cblx0XHRhbGxvd2VkTW9kdWxlczogW10sIC8vIE1vZHVsZSBuYW1lcyBhbGxvd2VkIGZvciB0aGlzIGJ1aWxkZXIuXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cblx0XHQvLyBTZXQgZGVmYXVsdCBzZWxlY3Rpb24gdG8gZW5zdXJlIGl0IGlzbid0IGEgcmVmZXJlbmNlLlxuXHRcdGlmICggISAoIHRoaXMuZ2V0KCdzZWxlY3Rpb24nKSBpbnN0YW5jZW9mIE1vZHVsZXMgKSApIHtcblx0XHRcdHRoaXMuc2V0KCAnc2VsZWN0aW9uJywgbmV3IE1vZHVsZXMoKSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdHNldERhdGE6IGZ1bmN0aW9uKCBkYXRhICkge1xuXG5cdFx0dmFyIHNlbGVjdGlvbjtcblxuXHRcdGlmICggJycgPT09IGRhdGEgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gSGFuZGxlIGVpdGhlciBKU09OIHN0cmluZyBvciBwcm9wZXIgb2JoZWN0LlxuXHRcdGRhdGEgPSAoICdzdHJpbmcnID09PSB0eXBlb2YgZGF0YSApID8gSlNPTi5wYXJzZSggZGF0YSApIDogZGF0YTtcblxuXHRcdC8vIENvbnZlcnQgc2F2ZWQgZGF0YSB0byBNb2R1bGUgbW9kZWxzLlxuXHRcdGlmICggZGF0YSAmJiBBcnJheS5pc0FycmF5KCBkYXRhICkgKSB7XG5cdFx0XHRzZWxlY3Rpb24gPSBkYXRhLm1hcCggZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdFx0cmV0dXJuIE1vZHVsZUZhY3RvcnkuY3JlYXRlKCBtb2R1bGUubmFtZSwgbW9kdWxlLmF0dHIgKTtcblx0XHRcdH0gKTtcblx0XHR9XG5cblx0XHQvLyBSZXNldCBzZWxlY3Rpb24gdXNpbmcgZGF0YSBmcm9tIGhpZGRlbiBpbnB1dC5cblx0XHRpZiAoIHNlbGVjdGlvbiAmJiBzZWxlY3Rpb24ubGVuZ3RoICkge1xuXHRcdFx0dGhpcy5nZXQoJ3NlbGVjdGlvbicpLmFkZCggc2VsZWN0aW9uICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0c2F2ZURhdGE6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGRhdGEgPSBbXTtcblxuXHRcdHRoaXMuZ2V0KCdzZWxlY3Rpb24nKS5lYWNoKCBmdW5jdGlvbiggbW9kdWxlICkge1xuXG5cdFx0XHQvLyBTa2lwIGVtcHR5L2Jyb2tlbiBtb2R1bGVzLlxuXHRcdFx0aWYgKCAhIG1vZHVsZS5nZXQoJ25hbWUnICkgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0ZGF0YS5wdXNoKCBtb2R1bGUudG9NaWNyb0pTT04oKSApO1xuXG5cdFx0fSApO1xuXG5cdFx0dGhpcy50cmlnZ2VyKCAnc2F2ZScsIGRhdGEgKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBMaXN0IGFsbCBhdmFpbGFibGUgbW9kdWxlcyBmb3IgdGhpcyBidWlsZGVyLlxuXHQgKiBBbGwgbW9kdWxlcywgZmlsdGVyZWQgYnkgdGhpcy5hbGxvd2VkTW9kdWxlcy5cblx0ICovXG5cdGdldEF2YWlsYWJsZU1vZHVsZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBfLmZpbHRlciggTW9kdWxlRmFjdG9yeS5hdmFpbGFibGVNb2R1bGVzLCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuaXNNb2R1bGVBbGxvd2VkKCBtb2R1bGUubmFtZSApO1xuXHRcdH0uYmluZCggdGhpcyApICk7XG5cdH0sXG5cblx0aXNNb2R1bGVBbGxvd2VkOiBmdW5jdGlvbiggbW9kdWxlTmFtZSApIHtcblx0XHRyZXR1cm4gdGhpcy5nZXQoJ2FsbG93ZWRNb2R1bGVzJykuaW5kZXhPZiggbW9kdWxlTmFtZSApID49IDA7XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQnVpbGRlcjtcbiIsInZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuXG52YXIgTW9kdWxlQXR0cmlidXRlID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuXHRkZWZhdWx0czoge1xuXHRcdG5hbWU6ICAgICAgICAgJycsXG5cdFx0bGFiZWw6ICAgICAgICAnJyxcblx0XHR2YWx1ZTogICAgICAgICcnLFxuXHRcdHR5cGU6ICAgICAgICAgJ3RleHQnLFxuXHRcdGRlc2NyaXB0aW9uOiAgJycsXG5cdFx0ZGVmYXVsdFZhbHVlOiAnJyxcblx0XHRjb25maWc6ICAgICAgIHt9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybiBvbmx5IHRoZSBkYXRhIHRoYXQgbmVlZHMgdG8gYmUgc2F2ZWQuXG5cdCAqXG5cdCAqIEByZXR1cm4gb2JqZWN0XG5cdCAqL1xuXHR0b01pY3JvSlNPTjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgciA9IHt9O1xuXHRcdHZhciBhbGxvd2VkQXR0clByb3BlcnRpZXMgPSBbICduYW1lJywgJ3ZhbHVlJywgJ3R5cGUnIF07XG5cblx0XHRfLmVhY2goIGFsbG93ZWRBdHRyUHJvcGVydGllcywgZnVuY3Rpb24oIHByb3AgKSB7XG5cdFx0XHRyWyBwcm9wIF0gPSB0aGlzLmdldCggcHJvcCApO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0cmV0dXJuIHI7XG5cblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGVBdHRyaWJ1dGU7XG4iLCJ2YXIgQmFja2JvbmUgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZUF0dHMgPSByZXF1aXJlKCcuLy4uL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzJyk7XG5cbnZhciBNb2R1bGUgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXG5cdGRlZmF1bHRzOiB7XG5cdFx0bmFtZTogICcnLFxuXHRcdGxhYmVsOiAnJyxcblx0XHRhdHRyOiAgW10sXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cblx0XHQvLyBTZXQgZGVmYXVsdCBzZWxlY3Rpb24gdG8gZW5zdXJlIGl0IGlzbid0IGEgcmVmZXJlbmNlLlxuXHRcdGlmICggISAoIHRoaXMuZ2V0KCdhdHRyJykgaW5zdGFuY2VvZiBNb2R1bGVBdHRzICkgKSB7XG5cdFx0XHR0aGlzLnNldCggJ2F0dHInLCBuZXcgTW9kdWxlQXR0cygpICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBhbiBhdHRyaWJ1dGUgbW9kZWwgYnkgbmFtZS5cblx0ICovXG5cdGdldEF0dHI6IGZ1bmN0aW9uKCBhdHRyTmFtZSApIHtcblx0XHRyZXR1cm4gdGhpcy5nZXQoJ2F0dHInKS5maW5kV2hlcmUoIHsgbmFtZTogYXR0ck5hbWUgfSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEN1c3RvbSBQYXJzZS5cblx0ICogRW5zdXJlcyBhdHRyaWJ1dGVzIGlzIGFuIGluc3RhbmNlIG9mIE1vZHVsZUF0dHNcblx0ICovXG5cdHBhcnNlOiBmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cblx0XHRpZiAoICdhdHRyJyBpbiByZXNwb25zZSAmJiAhICggcmVzcG9uc2UuYXR0ciBpbnN0YW5jZW9mIE1vZHVsZUF0dHMgKSApIHtcblx0XHRcdHJlc3BvbnNlLmF0dHIgPSBuZXcgTW9kdWxlQXR0cyggcmVzcG9uc2UuYXR0ciApO1xuXHRcdH1cblxuXHQgICAgcmV0dXJuIHJlc3BvbnNlO1xuXG5cdH0sXG5cblx0dG9KU09OOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBqc29uID0gXy5jbG9uZSggdGhpcy5hdHRyaWJ1dGVzICk7XG5cblx0XHRpZiAoICdhdHRyJyBpbiBqc29uICYmICgganNvbi5hdHRyIGluc3RhbmNlb2YgTW9kdWxlQXR0cyApICkge1xuXHRcdFx0anNvbi5hdHRyID0ganNvbi5hdHRyLnRvSlNPTigpO1xuXHRcdH1cblxuXHRcdHJldHVybiBqc29uO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybiBvbmx5IHRoZSBkYXRhIHRoYXQgbmVlZHMgdG8gYmUgc2F2ZWQuXG5cdCAqXG5cdCAqIEByZXR1cm4gb2JqZWN0XG5cdCAqL1xuXHR0b01pY3JvSlNPTjogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG5hbWU6IHRoaXMuZ2V0KCduYW1lJyksXG5cdFx0XHRhdHRyOiB0aGlzLmdldCgnYXR0cicpLnRvTWljcm9KU09OKClcblx0XHR9O1xuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGU7XG4iLCJ2YXIgJCAgICAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgQnVpbGRlciAgICAgICA9IHJlcXVpcmUoJy4vbW9kZWxzL2J1aWxkZXIuanMnKTtcbnZhciBCdWlsZGVyVmlldyAgID0gcmVxdWlyZSgnLi92aWV3cy9idWlsZGVyLmpzJyk7XG52YXIgTW9kdWxlRmFjdG9yeSA9IHJlcXVpcmUoJy4vdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMnKTtcblxuLy8gRXhwb3NlIHNvbWUgZnVuY3Rpb25hbGl0eSB0byBnbG9iYWwgbmFtZXNwYWNlLlxud2luZG93Lm1vZHVsYXJQYWdlQnVpbGRlciA9IHJlcXVpcmUoJy4vZ2xvYmFscycpO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuXG5cdE1vZHVsZUZhY3RvcnkuaW5pdCgpO1xuXG5cdC8vIEEgZmllbGQgZm9yIHN0b3JpbmcgdGhlIGJ1aWxkZXIgZGF0YS5cblx0dmFyICRmaWVsZCA9ICQoICdbbmFtZT1tb2R1bGFyLXBhZ2UtYnVpbGRlci1kYXRhXScgKTtcblxuXHRpZiAoICEgJGZpZWxkLmxlbmd0aCApIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyBBIGNvbnRhaW5lciBlbGVtZW50IGZvciBkaXNwbGF5aW5nIHRoZSBidWlsZGVyLlxuXHR2YXIgJGNvbnRhaW5lciA9ICQoICcjbW9kdWxhci1wYWdlLWJ1aWxkZXInICk7XG5cblx0Ly8gQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEJ1aWxkZXIgbW9kZWwuXG5cdC8vIFBhc3MgYW4gYXJyYXkgb2YgbW9kdWxlIG5hbWVzIHRoYXQgYXJlIGFsbG93ZWQgZm9yIHRoaXMgYnVpbGRlci5cblx0dmFyIGJ1aWxkZXIgPSBuZXcgQnVpbGRlcih7XG5cdFx0YWxsb3dlZE1vZHVsZXM6ICQoICdbbmFtZT1tb2R1bGFyLXBhZ2UtYnVpbGRlci1hbGxvd2VkLW1vZHVsZXNdJyApLnZhbCgpLnNwbGl0KCcsJylcblx0fSk7XG5cblx0Ly8gU2V0IHRoZSBkYXRhIHVzaW5nIHRoZSBjdXJyZW50IGZpZWxkIHZhbHVlXG5cdGJ1aWxkZXIuc2V0RGF0YSggSlNPTi5wYXJzZSggJGZpZWxkLnZhbCgpICkgKTtcblxuXHQvLyBPbiBzYXZlLCB1cGRhdGUgdGhlIGZpZWxkIHZhbHVlLlxuXHRidWlsZGVyLm9uKCAnc2F2ZScsIGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdCRmaWVsZC52YWwoIEpTT04uc3RyaW5naWZ5KCBkYXRhICkgKTtcblx0fSApO1xuXG5cdC8vIENyZWF0ZSBidWlsZGVyIHZpZXcuXG5cdHZhciBidWlsZGVyVmlldyA9IG5ldyBCdWlsZGVyVmlldyggeyBtb2RlbDogYnVpbGRlciB9ICk7XG5cblx0Ly8gUmVuZGVyIGJ1aWxkZXIuXG5cdGJ1aWxkZXJWaWV3LnJlbmRlcigpLiRlbC5hcHBlbmRUbyggJGNvbnRhaW5lciApO1xuXG59KTtcbiIsIi8qKlxuICogTWFwIG1vZHVsZSB0eXBlIHRvIHZpZXdzLlxuICovXG52YXIgZWRpdFZpZXdNYXAgPSB7XG5cdCdoZWFkZXInOiAgICAgICAgICAgICAgcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC1oZWFkZXIuanMnKSxcblx0J3RleHRhcmVhJzogICAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LXRleHRhcmVhLmpzJyksXG5cdCd0ZXh0JzogICAgICAgICAgICAgICAgcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC10ZXh0LmpzJyksXG5cdCdpbWFnZSc6ICAgICAgICAgICAgICAgcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC1pbWFnZS5qcycpLFxuXHQndmlkZW8nOiAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtdmlkZW8uanMnKSxcblx0J2Jsb2NrcXVvdGUnOiAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LWJsb2NrcXVvdGUuanMnKSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZWRpdFZpZXdNYXA7XG4iLCJ2YXIgTW9kdWxlICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL21vZHVsZS5qcycpO1xudmFyIE1vZHVsZUF0dHMgICAgICAgPSByZXF1aXJlKCcuLy4uL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzJyk7XG52YXIgJCAgICAgICAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbnZhciBNb2R1bGVGYWN0b3J5ID0ge1xuXG5cdGF2YWlsYWJsZU1vZHVsZXM6IFtdLFxuXG5cdGluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggbW9kdWxhclBhZ2VCdWlsZGVyRGF0YSAmJiAnYXZhaWxhYmxlX21vZHVsZXMnIGluIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEgKSB7XG5cdFx0XHRfLmVhY2goIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEuYXZhaWxhYmxlX21vZHVsZXMsIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHRcdHRoaXMucmVnaXN0ZXJNb2R1bGUoIG1vZHVsZSApO1xuXHRcdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0XHR9XG5cdH0sXG5cblx0cmVnaXN0ZXJNb2R1bGU6IGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0dGhpcy5hdmFpbGFibGVNb2R1bGVzLnB1c2goIG1vZHVsZSApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgTW9kdWxlIE1vZGVsLlxuXHQgKiBVc2UgZGF0YSBmcm9tIGNvbmZpZywgcGx1cyBzYXZlZCBkYXRhLlxuXHQgKlxuXHQgKiBAcGFyYW0gIHN0cmluZyBtb2R1bGVOYW1lXG5cdCAqIEBwYXJhbSAgb2JqZWN0IGF0dHJpYnV0ZSBKU09OLiBTYXZlZCBhdHRyaWJ1dGUgdmFsdWVzLlxuXHQgKiBAcmV0dXJuIE1vZHVsZVxuXHQgKi9cblx0Y3JlYXRlOiBmdW5jdGlvbiggbW9kdWxlTmFtZSwgYXR0ckRhdGEgKSB7XG5cblx0XHR2YXIgZGF0YSA9ICQuZXh0ZW5kKCB0cnVlLCB7fSwgXy5maW5kV2hlcmUoIHRoaXMuYXZhaWxhYmxlTW9kdWxlcywgeyBuYW1lOiBtb2R1bGVOYW1lIH0gKSApO1xuXG5cdFx0aWYgKCAhIGRhdGEgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblxuXHRcdHZhciBhdHRyaWJ1dGVzID0gbmV3IE1vZHVsZUF0dHMoKTtcblxuXHRcdC8qKlxuXHRcdCAqIEFkZCBhbGwgdGhlIG1vZHVsZSBhdHRyaWJ1dGVzLlxuXHRcdCAqIFdoaXRlbGlzdGVkIHRvIGF0dHJpYnV0ZXMgZG9jdW1lbnRlZCBpbiBzY2hlbWFcblx0XHQgKiBTZXRzIG9ubHkgdmFsdWUgZnJvbSBhdHRyRGF0YS5cblx0XHQgKi9cblx0XHRfLmVhY2goIGRhdGEuYXR0ciwgZnVuY3Rpb24oIGF0dHIgKSB7XG5cblx0XHRcdHZhciBjbG9uZUF0dHIgPSAkLmV4dGVuZCggdHJ1ZSwge30sIGF0dHIgICk7XG5cdFx0XHR2YXIgc2F2ZWRBdHRyID0gXy5maW5kV2hlcmUoIGF0dHJEYXRhLCB7IG5hbWU6IGF0dHIubmFtZSB9ICk7XG5cblx0XHRcdC8vIEFkZCBzYXZlZCBhdHRyaWJ1dGUgdmFsdWVzLlxuXHRcdFx0aWYgKCBzYXZlZEF0dHIgJiYgJ3ZhbHVlJyBpbiBzYXZlZEF0dHIgKSB7XG5cdFx0XHRcdGNsb25lQXR0ci52YWx1ZSA9IHNhdmVkQXR0ci52YWx1ZTtcblx0XHRcdH1cblxuXHRcdFx0YXR0cmlidXRlcy5hZGQoIGNsb25lQXR0ciApO1xuXG5cdFx0fSApO1xuXG5cdFx0ZGF0YS5hdHRyID0gYXR0cmlidXRlcztcblxuXHQgICAgcmV0dXJuIG5ldyBNb2R1bGUoIGRhdGEgKTtcblxuXHR9LFxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZUZhY3Rvcnk7XG4iLCJ2YXIgQmFja2JvbmUgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIEJ1aWxkZXIgICAgICAgPSByZXF1aXJlKCcuLy4uL21vZGVscy9idWlsZGVyLmpzJyk7XG52YXIgZWRpdFZpZXdNYXAgICA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvZWRpdC12aWV3LW1hcC5qcycpO1xudmFyIE1vZHVsZUZhY3RvcnkgPSByZXF1aXJlKCcuLy4uL3V0aWxzL21vZHVsZS1mYWN0b3J5LmpzJyk7XG52YXIgJCAgICAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbnZhciBCdWlsZGVyID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAkKCcjdG1wbC1tcGItYnVpbGRlcicgKS5odG1sKCksXG5cdGNsYXNzTmFtZTogJ21vZHVsYXItcGFnZS1idWlsZGVyJyxcblx0bW9kZWw6IG51bGwsXG5cdG5ld01vZHVsZU5hbWU6IG51bGwsXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NoYW5nZSA+IC5hZGQtbmV3IC5hZGQtbmV3LW1vZHVsZS1zZWxlY3QnOiAndG9nZ2xlQnV0dG9uU3RhdHVzJyxcblx0XHQnY2xpY2sgPiAuYWRkLW5ldyAuYWRkLW5ldy1tb2R1bGUtYnV0dG9uJzogJ2FkZE1vZHVsZScsXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpO1xuXG5cdFx0c2VsZWN0aW9uLm9uKCAnYWRkJywgdGhpcy5hZGROZXdTZWxlY3Rpb25JdGVtVmlldywgdGhpcyApO1xuXHRcdHNlbGVjdGlvbi5vbiggJ2FsbCcsIHRoaXMubW9kZWwuc2F2ZURhdGEsIHRoaXMubW9kZWwgKTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZGF0YSA9IHRoaXMubW9kZWwudG9KU09OKCk7XG5cblx0XHR0aGlzLiRlbC5odG1sKCBfLnRlbXBsYXRlKCB0aGlzLnRlbXBsYXRlLCBkYXRhICApICk7XG5cblx0XHR0aGlzLm1vZGVsLmdldCgnc2VsZWN0aW9uJykuZWFjaCggZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdHRoaXMuYWRkTmV3U2VsZWN0aW9uSXRlbVZpZXcoIG1vZHVsZSApO1xuXHRcdH0uYmluZCggdGhpcyApICk7XG5cblx0XHR0aGlzLnJlbmRlckFkZE5ldygpO1xuXHRcdHRoaXMuaW5pdFNvcnRhYmxlKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW5kZXIgdGhlIEFkZCBOZXcgbW9kdWxlIGNvbnRyb2xzLlxuXHQgKi9cblx0cmVuZGVyQWRkTmV3OiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciAkc2VsZWN0ID0gdGhpcy4kZWwuZmluZCggJz4gLmFkZC1uZXcgc2VsZWN0LmFkZC1uZXctbW9kdWxlLXNlbGVjdCcgKTtcblxuXHRcdCRzZWxlY3QuYXBwZW5kKFxuXHRcdFx0JCggJzxvcHRpb24vPicsIHsgdGV4dDogbW9kdWxhclBhZ2VCdWlsZGVyRGF0YS5sMTBuLnNlbGVjdERlZmF1bHQgfSApXG5cdFx0KTtcblxuXHRcdF8uZWFjaCggdGhpcy5tb2RlbC5nZXRBdmFpbGFibGVNb2R1bGVzKCksIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHR2YXIgdGVtcGxhdGUgPSAnPG9wdGlvbiB2YWx1ZT1cIjwlPSBuYW1lICU+XCI+PCU9IGxhYmVsICU+PC9vcHRpb24+Jztcblx0XHRcdCRzZWxlY3QuYXBwZW5kKCBfLnRlbXBsYXRlKCB0ZW1wbGF0ZSwgbW9kdWxlICkgKTtcblx0XHR9ICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZSBTb3J0YWJsZS5cblx0ICovXG5cdGluaXRTb3J0YWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0JCggJz4gLnNlbGVjdGlvbicsIHRoaXMuJGVsICkuc29ydGFibGUoe1xuXHRcdFx0aGFuZGxlOiAnLm1vZHVsZS1lZGl0LXRvb2xzJyxcblx0XHRcdGl0ZW1zOiAnPiAubW9kdWxlLWVkaXQnLFxuXHRcdFx0c3RvcDogdGhpcy51cGRhdGVTZWxlY3Rpb25PcmRlci5iaW5kKCB0aGlzICksXG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNvcnRhYmxlIGVuZCBjYWxsYmFjay5cblx0ICogQWZ0ZXIgcmVvcmRlcmluZywgdXBkYXRlIHRoZSBzZWxlY3Rpb24gb3JkZXIuXG5cdCAqIE5vdGUgLSB1c2VzIGRpcmVjdCBtYW5pcHVsYXRpb24gb2YgY29sbGVjdGlvbiBtb2RlbHMgcHJvcGVydHkuXG5cdCAqIFRoaXMgaXMgdG8gYXZvaWQgaGF2aW5nIHRvIG1lc3MgYWJvdXQgd2l0aCB0aGUgdmlld3MgdGhlbXNlbHZlcy5cblx0ICovXG5cdHVwZGF0ZVNlbGVjdGlvbk9yZGVyOiBmdW5jdGlvbiggZSwgdWkgKSB7XG5cblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpO1xuXHRcdHZhciBpdGVtICAgICAgPSBzZWxlY3Rpb24uZ2V0KHsgY2lkOiB1aS5pdGVtLmF0dHIoICdkYXRhLWNpZCcpIH0pO1xuXHRcdHZhciBuZXdJbmRleCAgPSB1aS5pdGVtLmluZGV4KCk7XG5cdFx0dmFyIG9sZEluZGV4ICA9IHNlbGVjdGlvbi5pbmRleE9mKCBpdGVtICk7XG5cblx0XHRpZiAoIG5ld0luZGV4ICE9PSBvbGRJbmRleCApIHtcblx0XHRcdHZhciBkcm9wcGVkID0gc2VsZWN0aW9uLm1vZGVscy5zcGxpY2UoIG9sZEluZGV4LCAxICk7XG5cdFx0XHRzZWxlY3Rpb24ubW9kZWxzLnNwbGljZSggbmV3SW5kZXgsIDAsIGRyb3BwZWRbMF0gKTtcblx0XHRcdHRoaXMubW9kZWwuc2F2ZURhdGEoKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogVG9nZ2xlIGJ1dHRvbiBzdGF0dXMuXG5cdCAqIEVuYWJsZS9EaXNhYmxlIGJ1dHRvbiBkZXBlbmRpbmcgb24gd2hldGhlclxuXHQgKiBwbGFjZWhvbGRlciBvciB2YWxpZCBtb2R1bGUgaXMgc2VsZWN0ZWQuXG5cdCAqL1xuXHR0b2dnbGVCdXR0b25TdGF0dXM6IGZ1bmN0aW9uKGUpIHtcblx0XHR2YXIgdmFsdWUgICAgICAgICA9ICQoZS50YXJnZXQpLnZhbCgpO1xuXHRcdHZhciBkZWZhdWx0T3B0aW9uID0gJChlLnRhcmdldCkuY2hpbGRyZW4oKS5maXJzdCgpLmF0dHIoJ3ZhbHVlJyk7XG5cdFx0JCgnLmFkZC1uZXctbW9kdWxlLWJ1dHRvbicsIHRoaXMuJGVsICkuYXR0ciggJ2Rpc2FibGVkJywgdmFsdWUgPT09IGRlZmF1bHRPcHRpb24gKTtcblx0XHR0aGlzLm5ld01vZHVsZU5hbWUgPSAoIHZhbHVlICE9PSBkZWZhdWx0T3B0aW9uICkgPyB2YWx1ZSA6IG51bGw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZSBhZGRpbmcgbW9kdWxlLlxuXHQgKlxuXHQgKiBGaW5kIG1vZHVsZSBtb2RlbC4gQ2xvbmUgaXQuIEFkZCB0byBzZWxlY3Rpb24uXG5cdCAqL1xuXHRhZGRNb2R1bGU6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGlmICggdGhpcy5uZXdNb2R1bGVOYW1lICYmIHRoaXMubW9kZWwuaXNNb2R1bGVBbGxvd2VkKCB0aGlzLm5ld01vZHVsZU5hbWUgKSApIHtcblx0XHRcdHZhciBtb2RlbCA9IE1vZHVsZUZhY3RvcnkuY3JlYXRlKCB0aGlzLm5ld01vZHVsZU5hbWUgKTtcblx0XHRcdHRoaXMubW9kZWwuZ2V0KCdzZWxlY3Rpb24nKS5hZGQoIG1vZGVsICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEFwcGVuZCBuZXcgc2VsZWN0aW9uIGl0ZW0gdmlldy5cblx0ICovXG5cdGFkZE5ld1NlbGVjdGlvbkl0ZW1WaWV3OiBmdW5jdGlvbiggaXRlbSApIHtcblxuXHRcdHZhciBlZGl0VmlldywgdmlldztcblxuXHRcdGVkaXRWaWV3ID0gKCBpdGVtLmdldCgnbmFtZScpIGluIGVkaXRWaWV3TWFwICkgPyBlZGl0Vmlld01hcFsgaXRlbS5nZXQoJ25hbWUnKSBdIDogbnVsbDtcblxuXHRcdGlmICggISBlZGl0VmlldyB8fCAhIHRoaXMubW9kZWwuaXNNb2R1bGVBbGxvd2VkKCBpdGVtLmdldCgnbmFtZScpICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmlldyA9IG5ldyBlZGl0VmlldyggeyBtb2RlbDogaXRlbSB9ICk7XG5cblx0XHQkKCAnPiAuc2VsZWN0aW9uJywgdGhpcy4kZWwgKS5hcHBlbmQoIHZpZXcucmVuZGVyKCkuJGVsICk7XG5cblx0XHR2YXIgJHNlbGVjdGlvbiA9ICQoICc+IC5zZWxlY3Rpb24nLCB0aGlzLiRlbCApO1xuXHRcdGlmICggJHNlbGVjdGlvbi5oYXNDbGFzcygndWktc29ydGFibGUnKSApIHtcblx0XHRcdCRzZWxlY3Rpb24uc29ydGFibGUoJ3JlZnJlc2gnKTtcblx0XHR9XG5cblxuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCdWlsZGVyO1xuIiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG4vKipcbiAqIEltYWdlIEZpZWxkXG4gKlxuICogSW5pdGlhbGl6ZSBhbmQgbGlzdGVuIGZvciB0aGUgJ2NoYW5nZScgZXZlbnQgdG8gZ2V0IHVwZGF0ZWQgZGF0YS5cbiAqXG4gKi9cbnZhciBGaWVsZEltYWdlID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAgJCggJyN0bXBsLW1wYi1maWVsZC1pbWFnZScgKS5odG1sKCksXG5cdGZyYW1lOiAgICAgbnVsbCxcblx0aW1hZ2VBdHRyOiBudWxsLFxuXHRjb25maWc6ICAgIHt9LFxuXHR2YWx1ZTogICAgIFtdLCAvLyBBdHRhY2htZW50IElEcy5cblx0c2VsZWN0aW9uOiB7fSwgLy8gQXR0YWNobWVudHMgY29sbGVjdGlvbiBmb3IgdGhpcy52YWx1ZS5cblxuXHRldmVudHM6IHtcblx0XHQnY2xpY2sgLmltYWdlLXBsYWNlaG9sZGVyIC5idXR0b24uYWRkJzogJ2VkaXRJbWFnZScsXG5cdFx0J2NsaWNrIC5pbWFnZS1wbGFjZWhvbGRlciBpbWcnOiAnZWRpdEltYWdlJyxcblx0XHQnY2xpY2sgLmltYWdlLXBsYWNlaG9sZGVyIC5idXR0b24ucmVtb3ZlJzogJ3JlbW92ZUltYWdlJyxcblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZS5cblx0ICpcblx0ICogUGFzcyB2YWx1ZSBhbmQgY29uZmlnIGFzIHByb3BlcnRpZXMgb24gdGhlIG9wdGlvbnMgb2JqZWN0LlxuXHQgKiBBdmFpbGFibGUgb3B0aW9uc1xuXHQgKiAtIG11bHRpcGxlOiBib29sXG5cdCAqIC0gc2l6ZVJlcTogZWcgeyB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCB9XG5cdCAqXG5cdCAqIEBwYXJhbSAgb2JqZWN0IG9wdGlvbnNcblx0ICogQHJldHVybiBudWxsXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblxuXHRcdF8uYmluZEFsbCggdGhpcywgJ3JlbmRlcicsICdlZGl0SW1hZ2UnLCAnb25TZWxlY3RJbWFnZScsICdyZW1vdmVJbWFnZScsICdpc0F0dGFjaG1lbnRTaXplT2snICk7XG5cblx0XHRpZiAoICd2YWx1ZScgaW4gb3B0aW9ucyApIHtcblx0XHRcdHRoaXMudmFsdWUgPSBvcHRpb25zLnZhbHVlO1xuXHRcdH1cblxuXHRcdC8vIEVuc3VyZSB2YWx1ZSBpcyBhcnJheS5cblx0XHRpZiAoICEgdGhpcy52YWx1ZSB8fCAhIEFycmF5LmlzQXJyYXkoIHRoaXMudmFsdWUgKSApIHtcblx0XHRcdHRoaXMudmFsdWUgPSBbXTtcblx0XHR9XG5cblx0XHRpZiAoICdjb25maWcnIGluIG9wdGlvbnMgKSB7XG5cdFx0XHR0aGlzLmNvbmZpZyA9IF8uZXh0ZW5kKCB7XG5cdFx0XHRcdG11bHRpcGxlOiBmYWxzZSxcblx0XHRcdH0sIG9wdGlvbnMuY29uZmlnICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5vbiggJ2NoYW5nZScsIHRoaXMucmVuZGVyICk7XG5cblx0XHR0aGlzLmluaXRTZWxlY3Rpb24oKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIFNlbGVjdGlvbi5cblx0ICpcblx0ICogU2VsZWN0aW9uIGlzIGFuIEF0dGFjaG1lbnQgY29sbGVjdGlvbiBjb250YWluaW5nIGZ1bGwgbW9kZWxzIGZvciB0aGUgY3VycmVudCB2YWx1ZS5cblx0ICpcblx0ICogQHJldHVybiBudWxsXG5cdCAqL1xuXHRpbml0U2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMuc2VsZWN0aW9uID0gbmV3IHdwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzKCk7XG5cblx0XHQvLyBJbml0aWFsaXplIHNlbGVjdGlvbi5cblx0XHRfLmVhY2goIHRoaXMudmFsdWUsIGZ1bmN0aW9uKCBpdGVtICkge1xuXG5cdFx0XHR2YXIgbW9kZWw7XG5cblx0XHRcdC8vIExlZ2FjeS4gSGFuZGxlIHN0b3JpbmcgZnVsbCBvYmplY3RzLlxuXHRcdFx0aXRlbSAgPSAoICdvYmplY3QnID09PSB0eXBlb2YoIGl0ZW0gKSApID8gaXRlbS5pZCA6IGl0ZW07XG5cdFx0XHRtb2RlbCA9IG5ldyB3cC5tZWRpYS5hdHRhY2htZW50KCBpdGVtICk7XG5cblx0XHRcdHRoaXMuc2VsZWN0aW9uLmFkZCggbW9kZWwgKTtcblxuXHRcdFx0Ly8gUmUtcmVuZGVyIGFmdGVyIGF0dGFjaG1lbnRzIGhhdmUgc3luY2VkLlxuXHRcdFx0bW9kZWwuZmV0Y2goKTtcblx0XHRcdG1vZGVsLm9uKCAnc3luYycsIHRoaXMucmVuZGVyICk7XG5cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgdGVtcGxhdGU7XG5cblx0XHR0ZW1wbGF0ZSA9IF8ubWVtb2l6ZSggZnVuY3Rpb24oIHZhbHVlLCBjb25maWcgKSB7XG5cdFx0XHRyZXR1cm4gXy50ZW1wbGF0ZSggdGhpcy50ZW1wbGF0ZSwge1xuXHRcdFx0XHR2YWx1ZTogdmFsdWUsXG5cdFx0XHRcdGNvbmZpZzogY29uZmlnLFxuXHRcdFx0fSApO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0dGhpcy4kZWwuaHRtbCggdGVtcGxhdGUoIHRoaXMuc2VsZWN0aW9uLnRvSlNPTigpLCB0aGlzLmNvbmZpZyApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgdGhlIHNlbGVjdCBldmVudC5cblx0ICpcblx0ICogSW5zZXJ0IGFuIGltYWdlIG9yIG11bHRpcGxlIGltYWdlcy5cblx0ICovXG5cdG9uU2VsZWN0SW1hZ2U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGZyYW1lID0gdGhpcy5mcmFtZSB8fCBudWxsO1xuXG5cdFx0aWYgKCAhIGZyYW1lICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMudmFsdWUgPSBbXTtcblx0XHR0aGlzLnNlbGVjdGlvbi5yZXNldChbXSk7XG5cblx0XHRmcmFtZS5zdGF0ZSgpLmdldCgnc2VsZWN0aW9uJykuZWFjaCggZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cblx0XHRcdGlmICggdGhpcy5pc0F0dGFjaG1lbnRTaXplT2soIGF0dGFjaG1lbnQgKSApIHtcblx0XHRcdFx0dGhpcy52YWx1ZS5wdXNoKCBhdHRhY2htZW50LmdldCgnaWQnKSApO1xuXHRcdFx0XHR0aGlzLnNlbGVjdGlvbi5hZGQoIGF0dGFjaG1lbnQgKTtcblx0XHRcdH1cblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0dGhpcy50cmlnZ2VyKCAnY2hhbmdlJywgdGhpcy52YWx1ZSApO1xuXG5cdFx0ZnJhbWUuY2xvc2UoKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgdGhlIGVkaXQgYWN0aW9uLlxuXHQgKi9cblx0ZWRpdEltYWdlOiBmdW5jdGlvbihlKSB7XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR2YXIgZnJhbWUgPSB0aGlzLmZyYW1lO1xuXG5cdFx0aWYgKCAhIGZyYW1lICkge1xuXG5cdFx0XHR2YXIgZnJhbWVBcmdzID0ge1xuXHRcdFx0XHRsaWJyYXJ5OiB7IHR5cGU6ICdpbWFnZScgfSxcblx0XHRcdFx0bXVsdGlwbGU6IHRoaXMuY29uZmlnLm11bHRpcGxlLFxuXHRcdFx0XHR0aXRsZTogJ1NlbGVjdCBJbWFnZScsXG5cdFx0XHRcdGZyYW1lOiAnc2VsZWN0Jyxcblx0XHRcdH07XG5cblx0XHRcdGZyYW1lID0gdGhpcy5mcmFtZSA9IHdwLm1lZGlhKCBmcmFtZUFyZ3MgKTtcblxuXHRcdFx0ZnJhbWUub24oICdjb250ZW50OmNyZWF0ZTpicm93c2UnLCB0aGlzLnNldHVwRmlsdGVycywgdGhpcyApO1xuXHRcdFx0ZnJhbWUub24oICdjb250ZW50OnJlbmRlcjpicm93c2UnLCB0aGlzLnNpemVGaWx0ZXJOb3RpY2UsIHRoaXMgKTtcblx0XHRcdGZyYW1lLm9uKCAnc2VsZWN0JywgdGhpcy5vblNlbGVjdEltYWdlLCB0aGlzICk7XG5cblx0XHR9XG5cblx0XHQvLyBXaGVuIHRoZSBmcmFtZSBvcGVucywgc2V0IHRoZSBzZWxlY3Rpb24uXG5cdFx0ZnJhbWUub24oICdvcGVuJywgZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBzZWxlY3Rpb24gPSBmcmFtZS5zdGF0ZSgpLmdldCgnc2VsZWN0aW9uJyk7XG5cblx0XHRcdC8vIFNldCB0aGUgc2VsZWN0aW9uLlxuXHRcdFx0Ly8gTm90ZSAtIGV4cGVjdHMgYXJyYXkgb2Ygb2JqZWN0cywgbm90IGEgY29sbGVjdGlvbi5cblx0XHRcdHNlbGVjdGlvbi5zZXQoIHRoaXMuc2VsZWN0aW9uLm1vZGVscyApO1xuXG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHRmcmFtZS5vcGVuKCk7XG5cblx0fSxcblxuXHQvKipcblx0ICogQWRkIGZpbHRlcnMgdG8gdGhlIGZyYW1lIGxpYnJhcnkgY29sbGVjdGlvbi5cblx0ICpcblx0ICogIC0gZmlsdGVyIHRvIGxpbWl0IHRvIHJlcXVpcmVkIHNpemUuXG5cdCAqL1xuXHRzZXR1cEZpbHRlcnM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGxpYiAgICA9IHRoaXMuZnJhbWUuc3RhdGUoKS5nZXQoJ2xpYnJhcnknKTtcblxuXHRcdGlmICggJ3NpemVSZXEnIGluIHRoaXMuY29uZmlnICkge1xuXHRcdFx0bGliLmZpbHRlcnMuc2l6ZSA9IHRoaXMuaXNBdHRhY2htZW50U2l6ZU9rO1xuXHRcdH1cblxuXHR9LFxuXG5cblx0LyoqXG5cdCAqIEhhbmRsZSBkaXNwbGF5IG9mIHNpemUgZmlsdGVyIG5vdGljZS5cblx0ICovXG5cdHNpemVGaWx0ZXJOb3RpY2U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGxpYiA9IHRoaXMuZnJhbWUuc3RhdGUoKS5nZXQoJ2xpYnJhcnknKTtcblxuXHRcdGlmICggISBsaWIuZmlsdGVycy5zaXplICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFdhaXQgdG8gYmUgc3VyZSB0aGUgZnJhbWUgaXMgcmVuZGVyZWQuXG5cdFx0d2luZG93LnNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgcmVxLCAkbm90aWNlLCB0ZW1wbGF0ZSwgJHRvb2xiYXI7XG5cblx0XHRcdHJlcSA9IF8uZXh0ZW5kKCB7XG5cdFx0XHRcdHdpZHRoOiAwLFxuXHRcdFx0XHRoZWlnaHQ6IDAsXG5cdFx0XHR9LCB0aGlzLmNvbmZpZy5zaXplUmVxICk7XG5cblx0XHRcdC8vIERpc3BsYXkgbm90aWNlIG9uIG1haW4gZ3JpZCB2aWV3LlxuXHRcdFx0dGVtcGxhdGUgPSAnPHAgY2xhc3M9XCJmaWx0ZXItbm90aWNlXCI+T25seSBzaG93aW5nIGltYWdlcyB0aGF0IG1lZXQgc2l6ZSByZXF1aXJlbWVudHM6IDwlPSB3aWR0aCAlPnB4ICZ0aW1lczsgPCU9IGhlaWdodCAlPnB4PC9wPic7XG5cdFx0XHQkbm90aWNlICA9ICQoIF8udGVtcGxhdGUoIHRlbXBsYXRlLCByZXEgKSApO1xuXHRcdFx0JHRvb2xiYXIgPSAkKCAnLmF0dGFjaG1lbnRzLWJyb3dzZXIgLm1lZGlhLXRvb2xiYXInLCB0aGlzLmZyYW1lLiRlbCApLmZpcnN0KCk7XG5cdFx0XHQkdG9vbGJhci5wcmVwZW5kKCAkbm90aWNlICk7XG5cblx0XHRcdHZhciBjb250ZW50VmlldyA9IHRoaXMuZnJhbWUudmlld3MuZ2V0KCAnLm1lZGlhLWZyYW1lLWNvbnRlbnQnICk7XG5cdFx0XHRjb250ZW50VmlldyA9IGNvbnRlbnRWaWV3WzBdO1xuXG5cdFx0XHQkbm90aWNlID0gJCggJzxwIGNsYXNzPVwiZmlsdGVyLW5vdGljZVwiPkltYWdlIGRvZXMgbm90IG1lZXQgc2l6ZSByZXF1aXJlbWVudHMuPC9wPicgKTtcblxuXHRcdFx0Ly8gRGlzcGxheSBhZGRpdGlvbmFsIG5vdGljZSB3aGVuIHNlbGVjdGluZyBhbiBpbWFnZS5cblx0XHRcdC8vIFJlcXVpcmVkIHRvIGluZGljYXRlIGEgYmFkIGltYWdlIGhhcyBqdXN0IGJlZW4gdXBsb2FkZWQuXG5cdFx0XHRjb250ZW50Vmlldy5vcHRpb25zLnNlbGVjdGlvbi5vbiggJ3NlbGVjdGlvbjpzaW5nbGUnLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHR2YXIgYXR0YWNobWVudCA9IGNvbnRlbnRWaWV3Lm9wdGlvbnMuc2VsZWN0aW9uLnNpbmdsZSgpO1xuXG5cdFx0XHRcdHZhciBkaXNwbGF5Tm90aWNlID0gZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0XHQvLyBJZiBzdGlsbCB1cGxvYWRpbmcsIHdhaXQgYW5kIHRyeSBkaXNwbGF5aW5nIG5vdGljZSBhZ2Fpbi5cblx0XHRcdFx0XHRpZiAoIGF0dGFjaG1lbnQuZ2V0KCAndXBsb2FkaW5nJyApICkge1xuXHRcdFx0XHRcdFx0d2luZG93LnNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRkaXNwbGF5Tm90aWNlKCk7XG5cdFx0XHRcdFx0XHR9LCA1MDAgKTtcblxuXHRcdFx0XHRcdC8vIE9LLiBEaXNwbGF5IG5vdGljZSBhcyByZXF1aXJlZC5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRpZiAoICEgdGhpcy5pc0F0dGFjaG1lbnRTaXplT2soIGF0dGFjaG1lbnQgKSApIHtcblx0XHRcdFx0XHRcdFx0JCggJy5hdHRhY2htZW50cy1icm93c2VyIC5hdHRhY2htZW50LWluZm8nICkucHJlcGVuZCggJG5vdGljZSApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0JG5vdGljZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9LmJpbmQodGhpcyk7XG5cblx0XHRcdFx0ZGlzcGxheU5vdGljZSgpO1xuXG5cdFx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdH0uYmluZCh0aGlzKSwgMTAwICApO1xuXG5cdH0sXG5cblx0cmVtb3ZlSW1hZ2U6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciAkdGFyZ2V0LCBpZDtcblxuXHRcdCR0YXJnZXQgICA9ICQoZS50YXJnZXQpO1xuXHRcdCR0YXJnZXQgICA9ICggJHRhcmdldC5wcm9wKCd0YWdOYW1lJykgPT09ICdCVVRUT04nICkgPyAkdGFyZ2V0IDogJHRhcmdldC5jbG9zZXN0KCdidXR0b24ucmVtb3ZlJyk7XG5cdFx0aWQgICAgICAgID0gJHRhcmdldC5kYXRhKCAnaW1hZ2UtaWQnICk7XG5cblx0XHRpZiAoICEgaWQgICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMudmFsdWUgPSBfLmZpbHRlciggdGhpcy52YWx1ZSwgZnVuY3Rpb24oIHZhbCApIHtcblx0XHRcdHJldHVybiAoIHZhbCAhPT0gaWQgKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLnZhbHVlID0gKCB0aGlzLnZhbHVlLmxlbmd0aCA+IDAgKSA/IHRoaXMudmFsdWUgOiBbXTtcblxuXHRcdC8vIFVwZGF0ZSBzZWxlY3Rpb24uXG5cdFx0dmFyIHJlbW92ZSA9IHRoaXMuc2VsZWN0aW9uLmZpbHRlciggZnVuY3Rpb24oIGl0ZW0gKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy52YWx1ZS5pbmRleE9mKCBpdGVtLmdldCgnaWQnKSApIDwgMDtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHRoaXMuc2VsZWN0aW9uLnJlbW92ZSggcmVtb3ZlICk7XG5cblx0XHR0aGlzLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLnZhbHVlICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogRG9lcyBhdHRhY2htZW50IG1lZXQgc2l6ZSByZXF1aXJlbWVudHM/XG5cdCAqXG5cdCAqIEBwYXJhbSAgQXR0YWNobWVudFxuXHQgKiBAcmV0dXJuIGJvb2xlYW5cblx0ICovXG5cdGlzQXR0YWNobWVudFNpemVPazogZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cblx0XHRpZiAoICEgKCAnc2l6ZVJlcScgaW4gdGhpcy5jb25maWcgKSApIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHRoaXMuY29uZmlnLnNpemVSZXEgPSBfLmV4dGVuZCgge1xuXHRcdFx0d2lkdGg6IDAsXG5cdFx0XHRoZWlnaHQ6IDAsXG5cdFx0fSwgdGhpcy5jb25maWcuc2l6ZVJlcSApO1xuXG5cdFx0dmFyIHdpZHRoUmVxICA9IGF0dGFjaG1lbnQuZ2V0KCd3aWR0aCcpICA+PSB0aGlzLmNvbmZpZy5zaXplUmVxLndpZHRoO1xuXHRcdHZhciBoZWlnaHRSZXEgPSBhdHRhY2htZW50LmdldCgnaGVpZ2h0JykgPj0gdGhpcy5jb25maWcuc2l6ZVJlcS5oZWlnaHQ7XG5cblx0XHRyZXR1cm4gd2lkdGhSZXEgJiYgaGVpZ2h0UmVxO1xuXG5cdH1cblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkSW1hZ2U7XG4iLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbi8qKlxuICogVGV4dCBGaWVsZCBWaWV3XG4gKlxuICogWW91IGNhbiB1c2UgdGhpcyBhbnl3aGVyZS5cbiAqIEp1c3QgbGlzdGVuIGZvciAnY2hhbmdlJyBldmVudCBvbiB0aGUgdmlldy5cbiAqL1xudmFyIEZpZWxkV1lTSVdZRyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogICQoICcjdG1wbC1tcGItZmllbGQtdGV4dCcgKS5odG1sKCksXG5cdGVkaXRvcjogbnVsbCxcblx0dmFsdWU6IG51bGwsXG5cblx0LyoqXG5cdCAqIEluaXQuXG5cdCAqXG5cdCAqIG9wdGlvbnMudmFsdWUgaXMgdXNlZCB0byBwYXNzIGluaXRpYWwgdmFsdWUuXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblxuXHRcdGlmICggJ3ZhbHVlJyBpbiBvcHRpb25zICkge1xuXHRcdFx0dGhpcy52YWx1ZSA9IG9wdGlvbnMudmFsdWU7XG5cdFx0fVxuXG5cdFx0Ly8gQSBmZXcgaGVscGVycy5cblx0XHR0aGlzLmVkaXRvciA9IHtcblx0XHRcdGlkICAgICAgICAgICA6ICdtcGItdGV4dC1ib2R5LScgKyB0aGlzLmNpZCxcblx0XHRcdG5hbWVSZWdleCAgICA6IG5ldyBSZWdFeHAoICdtcGItcGxhY2Vob2xkZXItbmFtZScsICdnJyApLFxuXHRcdFx0aWRSZWdleCAgICAgIDogbmV3IFJlZ0V4cCggJ21wYi1wbGFjZWhvbGRlci1pZCcsICdnJyApLFxuXHRcdFx0Y29udGVudFJlZ2V4IDogbmV3IFJlZ0V4cCggJ21wYi1wbGFjZWhvbGRlci1jb250ZW50JywgJ2cnICksXG5cdFx0fTtcblxuXHRcdC8vIFRoZSB0ZW1wbGF0ZSBwcm92aWRlZCBpcyBnZW5lcmljIG1hcmt1cCB1c2VkIGJ5IFRpbnlNQ0UuXG5cdFx0Ly8gV2UgbmVlZCBhIHRlbXBsYXRlIHVuaXF1ZSB0byB0aGlzIHZpZXcuXG5cdFx0dGhpcy50ZW1wbGF0ZSAgPSB0aGlzLnRlbXBsYXRlLnJlcGxhY2UoIHRoaXMuZWRpdG9yLm5hbWVSZWdleCwgdGhpcy5lZGl0b3IuaWQgKTtcblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IuaWRSZWdleCwgdGhpcy5lZGl0b3IuaWQgKTtcblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IuY29udGVudFJlZ2V4LCAnPCU9IHZhbHVlICU+JyApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cblx0XHQvLyBDcmVhdGUgZWxlbWVudCBmcm9tIHRlbXBsYXRlLlxuXHRcdHRoaXMuJGVsLmh0bWwoIF8udGVtcGxhdGUoIHRoaXMudGVtcGxhdGUsIHsgdmFsdWU6IHRoaXMudmFsdWUgfSApICk7XG5cblx0XHQvLyBIaWRlIGVkaXRvciB0byBwcmV2ZW50IEZPVUMuIFNob3cgYWdhaW4gb24gaW5pdC4gU2VlIHNldHVwLlxuXHRcdCQoICcud3AtZWRpdG9yLXdyYXAnLCB0aGlzLiRlbCApLmNzcyggJ2Rpc3BsYXknLCAnbm9uZScgKTtcblxuXHRcdHRoaXMuaW5pdFRpbnlNQ0UoKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgdGhlIFRpbnlNQ0UgZWRpdG9yLlxuXHQgKlxuXHQgKiBCaXQgaGFja3kgdGhpcy5cblx0ICpcblx0ICogQHJldHVybiBudWxsLlxuXHQgKi9cblx0aW5pdFRpbnlNQ0U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHNlbGYgPSB0aGlzLCBpZCwgZWQsICRlbCwgcHJvcDtcblxuXHRcdGlkICA9IHRoaXMuZWRpdG9yLmlkO1xuXHRcdGVkICA9IHRpbnlNQ0UuZ2V0KCBpZCApO1xuXHRcdCRlbCA9ICQoICcjd3AtJyArIGlkICsgJy13cmFwJywgdGhpcy4kZWwgKTtcblxuXHRcdGlmICggZWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gR2V0IHNldHRpbmdzIGZvciB0aGlzIGZpZWxkLlxuXHRcdC8vIElmIG5vIHNldHRpbmdzIGZvciB0aGlzIGZpZWxkLiBDbG9uZSBmcm9tIHBsYWNlaG9sZGVyLlxuXHRcdGlmICggdHlwZW9mKCB0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdICkgPT09ICd1bmRlZmluZWQnICkge1xuXHRcdFx0dmFyIG5ld1NldHRpbmdzID0galF1ZXJ5LmV4dGVuZCgge30sIHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbICdtcGItcGxhY2Vob2xkZXItaWQnIF0gKTtcblx0XHRcdGZvciAoIHByb3AgaW4gbmV3U2V0dGluZ3MgKSB7XG5cdFx0XHRcdGlmICggJ3N0cmluZycgPT09IHR5cGVvZiggbmV3U2V0dGluZ3NbcHJvcF0gKSApIHtcblx0XHRcdFx0XHRuZXdTZXR0aW5nc1twcm9wXSA9IG5ld1NldHRpbmdzW3Byb3BdLnJlcGxhY2UoIHRoaXMuZWRpdG9yLmlkUmVnZXgsIGlkICkucmVwbGFjZSggdGhpcy5lZGl0b3IubmFtZVJlZ2V4LCBuYW1lICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0gPSBuZXdTZXR0aW5ncztcblx0XHR9XG5cblx0XHQvLyBSZW1vdmUgZnVsbHNjcmVlbiBwbHVnaW4uXG5cdFx0dGlueU1DRVByZUluaXQubWNlSW5pdFsgaWQgXS5wbHVnaW5zID0gdGlueU1DRVByZUluaXQubWNlSW5pdFsgaWQgXS5wbHVnaW5zLnJlcGxhY2UoICdmdWxsc2NyZWVuLCcsICcnICk7XG5cblx0XHQvLyBHZXQgcXVpY2t0YWcgc2V0dGluZ3MgZm9yIHRoaXMgZmllbGQuXG5cdFx0Ly8gSWYgbm9uZSBleGlzdHMgZm9yIHRoaXMgZmllbGQuIENsb25lIGZyb20gcGxhY2Vob2xkZXIuXG5cdFx0aWYgKCB0eXBlb2YoIHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgaWQgXSApID09PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdHZhciBuZXdRVFMgPSBqUXVlcnkuZXh0ZW5kKCB7fSwgdGlueU1DRVByZUluaXQucXRJbml0WyAnbXBiLXBsYWNlaG9sZGVyLWlkJyBdICk7XG5cdFx0XHRmb3IgKCBwcm9wIGluIG5ld1FUUyApIHtcblx0XHRcdFx0aWYgKCAnc3RyaW5nJyA9PT0gdHlwZW9mKCBuZXdRVFNbcHJvcF0gKSApIHtcblx0XHRcdFx0XHRuZXdRVFNbcHJvcF0gPSBuZXdRVFNbcHJvcF0ucmVwbGFjZSggdGhpcy5lZGl0b3IuaWRSZWdleCwgaWQgKS5yZXBsYWNlKCB0aGlzLmVkaXRvci5uYW1lUmVnZXgsIG5hbWUgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGlueU1DRVByZUluaXQucXRJbml0WyBpZCBdID0gbmV3UVRTO1xuXHRcdH1cblxuXHRcdC8vIFdoZW4gZWRpdG9yIGluaXRzLCBhdHRhY2ggc2F2ZSBjYWxsYmFjayB0byBjaGFuZ2UgZXZlbnQuXG5cdFx0dGlueU1DRVByZUluaXQubWNlSW5pdFtpZF0uc2V0dXAgPSBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy5vbignY2hhbmdlJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRzZWxmLnZhbHVlID0gZS50YXJnZXQuZ2V0Q29udGVudCgpO1xuXHRcdFx0XHRzZWxmLnRyaWdnZXIoICdjaGFuZ2UnLCBzZWxmLnZhbHVlICk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdC8vIFByZXZlbnQgRk9VQy4gU2hvdyBlbGVtZW50IGFmdGVyIGluaXQuXG5cdFx0XHR0aGlzLm9uKCAnaW5pdCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR3aW5kb3cuc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0JGVsLmNzcyggJ2Rpc3BsYXknLCAnYmxvY2snICk7XG5cdFx0XHRcdH0sIDEwMCApO1xuXHRcdFx0fSk7XG5cblx0XHR9O1xuXG5cblx0XHQvLyBDdXJyZW50IG1vZGUgZGV0ZXJtaW5lZCBieSBjbGFzcyBvbiBlbGVtZW50LlxuXHRcdC8vIElmIG1vZGUgaXMgdmlzdWFsLCBjcmVhdGUgdGhlIHRpbnlNQ0UuXG5cdFx0aWYgKCAkZWwuaGFzQ2xhc3MoJ3RtY2UtYWN0aXZlJykgKSB7XG5cdFx0XHR0aW55TUNFLmluaXQoIHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbaWRdICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRlbC5jc3MoICdkaXNwbGF5JywgJ2Jsb2NrJyApO1xuXHRcdH1cblxuXHRcdC8vIEluaXQgcXVpY2t0YWdzLlxuXHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0cXVpY2t0YWdzKCB0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gKTtcblx0XHRcdFFUYWdzLl9idXR0b25zSW5pdCgpO1xuXHRcdH0sIDEwMCApO1xuXG5cdFx0Ly8gSGFuZGxlIHRlbXBvcmFyeSByZW1vdmFsIG9mIHRpbnlNQ0Ugd2hlbiBzb3J0aW5nLlxuXHRcdHRoaXMuJGVsLmNsb3Nlc3QoJy51aS1zb3J0YWJsZScpLm9uKCAnc29ydHN0YXJ0JywgZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblx0XHRcdGlmICggdWkuaXRlbVswXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2lkJykgPT09IHRoaXMuZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpICkge1xuXHRcdFx0XHR0aW55TUNFLmV4ZWNDb21tYW5kKCAnbWNlUmVtb3ZlRWRpdG9yJywgZmFsc2UsIGlkICk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHQvLyBIYW5kbGUgcmUtaW5pdCBhZnRlciBzb3J0aW5nLlxuXHRcdHRoaXMuJGVsLmNsb3Nlc3QoJy51aS1zb3J0YWJsZScpLm9uKCAnc29ydHN0b3AnLCBmdW5jdGlvbiggZXZlbnQsIHVpICkge1xuXHRcdFx0aWYgKCB1aS5pdGVtWzBdLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSA9PT0gdGhpcy5lbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2lkJykgKSB7XG5cdFx0XHRcdHRpbnlNQ0UuZXhlY0NvbW1hbmQoJ21jZUFkZEVkaXRvcicsIGZhbHNlLCBpZCk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0fSxcblxuXHRyZW1vdmU6IGZ1bmN0aW9uKCkge1xuXHRcdHRpbnlNQ0UuZXhlY0NvbW1hbmQoICdtY2VSZW1vdmVFZGl0b3InLCBmYWxzZSwgdGhpcy5lZGl0b3IuaWQgKTtcblx0fSxcblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkV1lTSVdZRztcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xuXG4vKipcbiAqIEhpZ2hsaWdodCBNb2R1bGUuXG4gKiBFeHRlbmRzIGRlZmF1bHQgbW91ZHVsZSxcbiAqIGN1c3RvbSBkaWZmZXJlbnQgdGVtcGxhdGUuXG4gKi9cbnZhciBIaWdobGlnaHRNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblx0dGVtcGxhdGU6ICQoICcjdG1wbC1tcGItbW9kdWxlLWVkaXQtYmxvY2txdW90ZScgKS5odG1sKCksXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIaWdobGlnaHRNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xuXG4vKipcbiAqIEhlYWRlciBNb2R1bGUuXG4gKiBFeHRlbmRzIGRlZmF1bHQgbW91ZHVsZSB3aXRoIGN1c3RvbSBkaWZmZXJlbnQgdGVtcGxhdGUuXG4gKi9cbnZhciBIZWFkZXJNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblx0dGVtcGxhdGU6ICQoICcjdG1wbC1tcGItbW9kdWxlLWVkaXQtaGVhZGVyJyApLmh0bWwoKSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlck1vZHVsZUVkaXRWaWV3O1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG52YXIgRmllbGRJbWFnZSA9IHJlcXVpcmUoJy4vZmllbGQtaW1hZ2UuanMnKTtcblxuLyoqXG4gKiBIaWdobGlnaHQgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUsXG4gKiBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgSW1hZ2VNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLW1wYi1tb2R1bGUtZWRpdC1pbWFnZScgKS5odG1sKCksXG5cdGltYWdlRmllbGQ6IG51bGwsXG5cdGltYWdlQXR0cjogbnVsbCxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggYXR0cmlidXRlcywgb3B0aW9ucyApIHtcblxuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgYXR0cmlidXRlcywgb3B0aW9ucyBdICk7XG5cblx0XHR0aGlzLmltYWdlQXR0ciA9IHRoaXMubW9kZWwuZ2V0QXR0cignaW1hZ2UnKTtcblxuXHRcdHZhciBjb25maWcgPSB0aGlzLmltYWdlQXR0ci5nZXQoJ2NvbmZpZycpIHx8IHt9O1xuXG5cdFx0Y29uZmlnID0gXy5leHRlbmQoIHtcblx0XHRcdG11bHRpcGxlOiBmYWxzZSxcblx0XHR9LCBjb25maWcgKTtcblxuXHRcdHRoaXMuaW1hZ2VGaWVsZCA9IG5ldyBGaWVsZEltYWdlKCB7XG5cdFx0XHR2YWx1ZTogdGhpcy5pbWFnZUF0dHIuZ2V0KCd2YWx1ZScpLFxuXHRcdFx0Y29uZmlnOiBjb25maWcsXG5cdFx0fSApO1xuXG5cdFx0dGhpcy5pbWFnZUZpZWxkLm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XHR0aGlzLmltYWdlQXR0ci5zZXQoICd2YWx1ZScsIGRhdGEgKTtcblx0XHRcdHRoaXMubW9kZWwudHJpZ2dlciggJ2NoYW5nZScsIHRoaXMubW9kZWwgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMgKTtcblxuXHRcdCQoICcuaW1hZ2UtZmllbGQnLCB0aGlzLiRlbCApLmFwcGVuZChcblx0XHRcdHRoaXMuaW1hZ2VGaWVsZC5yZW5kZXIoKS4kZWxcblx0XHQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xudmFyIEZpZWxkVGV4dCAgPSByZXF1aXJlKCcuL2ZpZWxkLXd5c2l3eWcuanMnKTtcblxudmFyIFRleHRNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLW1wYi1tb2R1bGUtZWRpdC10ZXh0JyApLmh0bWwoKSxcblx0dGV4dEZpZWxkOiBudWxsLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBhdHRyaWJ1dGVzLCBvcHRpb25zIF0gKTtcblxuXHRcdC8vIEluaXRpYWxpemUgb3VyIHRleHRmaWVsZCBzdWJ2aWV3LlxuXHRcdHRoaXMudGV4dEZpZWxkID0gbmV3IEZpZWxkVGV4dCgge1xuXHRcdFx0dmFsdWU6IHRoaXMubW9kZWwuZ2V0QXR0cignYm9keScpLmdldCgndmFsdWUnKSxcblx0XHR9ICk7XG5cblx0XHQvLyBMaXN0ZW4gZm9yIGNoYW5nZSBldmVudCBpbiBzdWJ2aWV3IGFuZCB1cGRhdGUgY3VycmVudCB2YWx1ZS5cblx0XHQvLyBOb3RlIG1hbnVhbCBjaGFuZ2UgZXZlbnQgdHJpZ2dlciB0byBlbnN1cmUgZXZlcnl0aGluZyBpcyB1cGRhdGVkLlxuXHRcdHRoaXMudGV4dEZpZWxkLm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XHR0aGlzLm1vZGVsLmdldEF0dHIoJ2JvZHknKS5zZXQoICd2YWx1ZScsIGRhdGEgKTtcblx0XHRcdHRoaXMubW9kZWwudHJpZ2dlciggJ2NoYW5nZScsIHRoaXMubW9kZWwgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHQvLyBDYWxsIGRlZmF1bHQgTW9kdWxlRWRlaXQgcmVuZGVyLlxuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcyApO1xuXG5cdFx0Ly8gUmVuZGVyIGFuZCBpbnNlcnQgdGV4dEZpZWxkIHZpZXcuXG5cdFx0JCggJy50ZXh0LWZpZWxkJywgdGhpcy4kZWwgKS5hcHBlbmQoXG5cdFx0XHR0aGlzLnRleHRGaWVsZC5yZW5kZXIoKS4kZWxcblx0XHQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHQvKipcblx0ICogRGVzdHJveSB0aGUgdGV4dCBmaWVsZCB3aGVuIG1vZGVsIGlzIHJlbW92ZWQuXG5cdCAqL1xuXHRyZW1vdmVNb2RlbDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy50ZXh0RmllbGQucmVtb3ZlKCk7XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRleHRNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xuXG4vKipcbiAqIEhlYWRlciBNb2R1bGUuXG4gKiBFeHRlbmRzIGRlZmF1bHQgbW91ZHVsZSB3aXRoIGN1c3RvbSBkaWZmZXJlbnQgdGVtcGxhdGUuXG4gKi9cbnZhciBIZWFkZXJNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblx0dGVtcGxhdGU6ICQoICcjdG1wbC1tcGItbW9kdWxlLWVkaXQtdGV4dGFyZWEnICkuaHRtbCgpLFxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyTW9kdWxlRWRpdFZpZXc7XG4iLCJ2YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdCA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcblxuLyoqXG4gKiBIaWdobGlnaHQgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUsXG4gKiBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgSGlnaGxpZ2h0TW9kdWxlRWRpdFZpZXcgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cdHRlbXBsYXRlOiAkKCAnI3RtcGwtbXBiLW1vZHVsZS1lZGl0LXZpZGVvJyApLmh0bWwoKSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhpZ2hsaWdodE1vZHVsZUVkaXRWaWV3O1xuIiwidmFyIEJhY2tib25lICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxudmFyIE1vZHVsZUVkaXQgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0Y2xhc3NOYW1lOiAgICAgJ21vZHVsZS1lZGl0Jyxcblx0dG9vbHNUZW1wbGF0ZTogJCgnI3RtcGwtbXBiLW1vZHVsZS1lZGl0LXRvb2xzJyApLmh0bWwoKSxcblxuXHRldmVudHM6IHtcblx0XHQnY2hhbmdlICpbZGF0YS1tb2R1bGUtYXR0ci1uYW1lXSc6ICdhdHRyRmllbGRDaGFuZ2VkJyxcblx0XHQna2V5dXAgICpbZGF0YS1tb2R1bGUtYXR0ci1uYW1lXSc6ICdhdHRyRmllbGRDaGFuZ2VkJyxcblx0XHQnaW5wdXQgICpbZGF0YS1tb2R1bGUtYXR0ci1uYW1lXSc6ICdhdHRyRmllbGRDaGFuZ2VkJyxcblx0XHQnY2xpY2sgIC5idXR0b24tc2VsZWN0aW9uLWl0ZW0tcmVtb3ZlJzogJ3JlbW92ZU1vZGVsJyxcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRfLmJpbmRBbGwoIHRoaXMsICdhdHRyRmllbGRDaGFuZ2VkJywgJ3JlbW92ZU1vZGVsJywgJ3NldEF0dHInICk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBkYXRhICA9IHRoaXMubW9kZWwudG9KU09OKCk7XG5cdFx0ZGF0YS5hdHRyID0ge307XG5cblx0XHQvLyBGb3JtYXQgYXR0cmlidXRlIGFycmF5IGZvciBlYXN5IHRlbXBsYXRpbmcuXG5cdFx0Ly8gQmVjYXVzZSBhdHRyaWJ1dGVzIGluICBhcnJheSBpcyBkaWZmaWN1bHQgdG8gYWNjZXNzLlxuXHRcdHRoaXMubW9kZWwuZ2V0KCdhdHRyJykuZWFjaCggZnVuY3Rpb24oIGF0dHIgKSB7XG5cdFx0XHRkYXRhLmF0dHJbIGF0dHIuZ2V0KCduYW1lJykgXSA9IGF0dHIudG9KU09OKCk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kZWwuaHRtbCggXy50ZW1wbGF0ZSggdGhpcy50ZW1wbGF0ZSwgZGF0YSApICk7XG5cblx0XHR0aGlzLmluaXRpYWxpemVDb2xvcnBpY2tlcigpO1xuXG5cdFx0Ly8gSUQgYXR0cmlidXRlLCBzbyB3ZSBjYW4gY29ubmVjdCB0aGUgdmlldyBhbmQgbW9kZWwgYWdhaW4gbGF0ZXIuXG5cdFx0dGhpcy4kZWwuYXR0ciggJ2RhdGEtY2lkJywgdGhpcy5tb2RlbC5jaWQgKTtcblxuXHRcdC8vIEFwcGVuZCB0aGUgbW9kdWxlIHRvb2xzLlxuXHRcdHRoaXMuJGVsLnByZXBlbmQoIF8udGVtcGxhdGUoIHRoaXMudG9vbHNUZW1wbGF0ZSwgZGF0YSApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdGluaXRpYWxpemVDb2xvcnBpY2tlcjogZnVuY3Rpb24oKSB7XG5cdFx0JCgnLm1wYi1jb2xvci1waWNrZXInLCB0aGlzLiRlbCApLndwQ29sb3JQaWNrZXIoe1xuXHRcdCAgICBwYWxldHRlczogWycjZWQwMDgyJywgJyNlNjBjMjknLCcjZmY1NTE5JywnI2ZmYmYwMCcsJyM5NmNjMjknLCcjMTRjMDRkJywnIzE2ZDVkOScsJyMwMDljZjMnLCcjMTQzZmNjJywnIzYxMTRjYycsJyMzMzMzMzMnXSxcblx0XHRcdGNoYW5nZTogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblx0XHRcdFx0JCh0aGlzKS5hdHRyKCAndmFsdWUnLCB1aS5jb2xvci50b1N0cmluZygpICk7XG5cdFx0XHRcdCQodGhpcykudHJpZ2dlciggJ2NoYW5nZScgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRzZXRBdHRyOiBmdW5jdGlvbiggYXR0cmlidXRlLCB2YWx1ZSApIHtcblxuXHRcdHZhciBhdHRyID0gdGhpcy5tb2RlbC5nZXQoICdhdHRyJyApLmZpbmRXaGVyZSggeyBuYW1lOiBhdHRyaWJ1dGUgfSApO1xuXG5cdFx0aWYgKCBhdHRyICkge1xuXHRcdFx0YXR0ci5zZXQoICd2YWx1ZScsIHZhbHVlICk7XG5cdFx0XHR0aGlzLm1vZGVsLnRyaWdnZXIoJ2NoYW5nZTphdHRyJyk7XG5cdFx0fVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIENoYW5nZSBldmVudCBoYW5kbGVyLlxuXHQgKiBVcGRhdGUgYXR0cmlidXRlIGZvbGxvd2luZyB2YWx1ZSBjaGFuZ2UuXG5cdCAqL1xuXHRhdHRyRmllbGRDaGFuZ2VkOiBmdW5jdGlvbihlKSB7XG5cblx0XHR2YXIgYXR0ciA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSggJ2RhdGEtbW9kdWxlLWF0dHItbmFtZScgKTtcblxuICAgICAgICBpZiAoIGUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSggJ2NvbnRlbnRlZGl0YWJsZScgKSApIHtcbiAgICAgICAgXHR0aGlzLnNldEF0dHIoIGF0dHIsICQoZS50YXJnZXQpLmh0bWwoKSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICBcdHRoaXMuc2V0QXR0ciggYXR0ciwgZS50YXJnZXQudmFsdWUgKTtcbiAgICAgICAgfVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlbW92ZSBtb2RlbCBoYW5kbGVyLlxuXHQgKi9cblx0cmVtb3ZlTW9kZWw6IGZ1bmN0aW9uKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dGhpcy5yZW1vdmUoKTtcblx0XHR0aGlzLm1vZGVsLmRlc3Ryb3koKTtcblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlRWRpdDtcbiJdfQ==
