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

},{"./models/builder.js":4,"./utils/edit-view-map.js":8,"./utils/module-factory.js":9,"./views/builder.js":10,"./views/module-edit.js":18}],4:[function(require,module,exports){
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

},{"./../views/module-edit-blockquote.js":12,"./../views/module-edit-header.js":13,"./../views/module-edit-image.js":14,"./../views/module-edit-text.js":15,"./../views/module-edit-textarea.js":16,"./../views/module-edit-video.js":17}],9:[function(require,module,exports){
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

},{"./module-edit.js":18}],13:[function(require,module,exports){
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

},{"./module-edit.js":18}],14:[function(require,module,exports){
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

},{"./field-image.js":11,"./module-edit.js":18}],15:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var HighlightModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-mpb-module-edit-text' ).html(),

	initialize: function() {

		ModuleEdit.prototype.initialize.apply( this );

		// Make sure the template for this module is unique to this instance.
		this.editor = {
			id           : 'mpb-text-body-' + this.model.cid,
			nameRegex    : new RegExp( 'mpb-placeholder-name', 'g' ),
			idRegex      : new RegExp( 'mpb-placeholder-id', 'g' ),
			contentRegex : new RegExp( 'mpb-placeholder-content', 'g' ),
		};

		this.template  = this.template.replace( this.editor.nameRegex, this.editor.id );
		this.template  = this.template.replace( this.editor.idRegex, this.editor.id );
		this.template  = this.template.replace( this.editor.contentRegex, '<%= attr.body.value %>' );

		this.test = this.model.cid;
	},

	render: function () {

		ModuleEdit.prototype.render.apply( this );

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

		var self = this, id, ed, $el, prop;

		id  = this.editor.id;
		ed  = tinyMCE.get( id );
		$el = $( '#wp-' + id + '-wrap', this.$el );

		if ( ed ) {
			return;
		}

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

		// If no Quicktag settings for this field. Clone from placeholder.
		if ( typeof( tinyMCEPreInit.qtInit[ id ] ) === 'undefined' ) {
			var newQTS = jQuery.extend( {}, tinyMCEPreInit.qtInit[ 'mpb-placeholder-id' ] );
			for ( prop in newQTS ) {
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

			this.on( 'init', function() {
				window.setTimeout( function() {
					$el.css( 'display', 'block' );
				}, 100 );
			});

		};

		// If current mode is visual, create the tinyMCE.
		if ( 'tmce' === mode ) {
			tinyMCE.init( tinyMCEPreInit.mceInit[id] );
		} else {
			$el.css( 'display', 'block' );
		}

		// Init quicktags.
		setTimeout( function() {
			quicktags( tinyMCEPreInit.qtInit[ id ] );
			QTags._buttonsInit();
		}, 100 );

		// Handle temporarily remove tinyMCE when sorting.
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

},{"./module-edit.js":18}],16:[function(require,module,exports){
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

},{"./module-edit.js":18}],17:[function(require,module,exports){
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

},{"./module-edit.js":18}],18:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvc3JjL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9nbG9iYWxzLmpzIiwiYXNzZXRzL2pzL3NyYy9tb2RlbHMvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMiLCJhc3NldHMvanMvc3JjL21vZGVscy9tb2R1bGUuanMiLCJhc3NldHMvanMvc3JjL21vZHVsYXItcGFnZS1idWlsZGVyLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9lZGl0LXZpZXctbWFwLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9tb2R1bGUtZmFjdG9yeS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvZmllbGQtaW1hZ2UuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWJsb2NrcXVvdGUuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWhlYWRlci5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtaW1hZ2UuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LXRleHQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LXRleHRhcmVhLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC12aWRlby5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDL1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZUF0dHJpYnV0ZSA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMnKTtcblxuLyoqXG4gKiBTaG9ydGNvZGUgQXR0cmlidXRlcyBjb2xsZWN0aW9uLlxuICovXG52YXIgU2hvcnRjb2RlQXR0cmlidXRlcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblxuXHRtb2RlbCA6IE1vZHVsZUF0dHJpYnV0ZSxcblxuXHQvLyBEZWVwIENsb25lLlxuXHRjbG9uZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCBfLm1hcCggdGhpcy5tb2RlbHMsIGZ1bmN0aW9uKG0pIHtcblx0XHRcdHJldHVybiBtLmNsb25lKCk7XG5cdFx0fSkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGpzb24gPSB7fTtcblxuXHRcdHRoaXMuZWFjaCggZnVuY3Rpb24oIG1vZGVsICkge1xuXHRcdFx0anNvblsgbW9kZWwuZ2V0KCAnbmFtZScgKSBdID0gbW9kZWwudG9NaWNyb0pTT04oKTtcblx0XHR9ICk7XG5cblx0XHRyZXR1cm4ganNvbjtcblx0fSxcblxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaG9ydGNvZGVBdHRyaWJ1dGVzO1xuIiwidmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgTW9kdWxlICAgPSByZXF1aXJlKCcuLy4uL21vZGVscy9tb2R1bGUuanMnKTtcblxuLy8gU2hvcnRjb2RlIENvbGxlY3Rpb25cbnZhciBNb2R1bGVzID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXG5cdG1vZGVsIDogTW9kdWxlLFxuXG5cdC8vICBEZWVwIENsb25lLlxuXHRjbG9uZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvciggXy5tYXAoIHRoaXMubW9kZWxzLCBmdW5jdGlvbihtKSB7XG5cdFx0XHRyZXR1cm4gbS5jbG9uZSgpO1xuXHRcdH0pKTtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIG9ubHkgdGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBzYXZlZC5cblx0ICpcblx0ICogQHJldHVybiBvYmplY3Rcblx0ICovXG5cdHRvTWljcm9KU09OOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoIGZ1bmN0aW9uKG1vZGVsKSB7IHJldHVybiBtb2RlbC50b01pY3JvSlNPTiggb3B0aW9ucyApOyB9ICk7XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZXM7XG4iLCIvLyBFeHBvc2Ugc29tZSBmdW5jdGlvbmFsaXR5IGdsb2JhbGx5LlxudmFyIGdsb2JhbHMgPSB7XG5cdEJ1aWxkZXI6ICAgICAgIHJlcXVpcmUoJy4vbW9kZWxzL2J1aWxkZXIuanMnKSxcblx0TW9kdWxlRmFjdG9yeTogcmVxdWlyZSgnLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpLFxuXHRlZGl0Vmlld01hcDogICByZXF1aXJlKCcuL3V0aWxzL2VkaXQtdmlldy1tYXAuanMnKSxcblx0dmlld3M6IHtcblx0XHRCdWlsZGVyVmlldzogcmVxdWlyZSgnLi92aWV3cy9idWlsZGVyLmpzJyksXG5cdFx0TW9kdWxlRWRpdDogIHJlcXVpcmUoJy4vdmlld3MvbW9kdWxlLWVkaXQuanMnKSxcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnbG9iYWxzO1xuIiwidmFyIEJhY2tib25lICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGVzICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzJyk7XG52YXIgTW9kdWxlRmFjdG9yeSAgICA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMnKTtcblxudmFyIEJ1aWxkZXIgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXG5cdGRlZmF1bHRzOiB7XG5cdFx0c2VsZWN0RGVmYXVsdDogIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEubDEwbi5zZWxlY3REZWZhdWx0LFxuXHRcdGFkZE5ld0J1dHRvbjogICBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhLmwxMG4uYWRkTmV3QnV0dG9uLFxuXHRcdHNlbGVjdGlvbjogICAgICBbXSwgLy8gSW5zdGFuY2Ugb2YgTW9kdWxlcy4gQ2FuJ3QgdXNlIGEgZGVmYXVsdCwgb3RoZXJ3aXNlIHRoZXkgd29uJ3QgYmUgdW5pcXVlLlxuXHRcdGFsbG93ZWRNb2R1bGVzOiBbXSwgLy8gTW9kdWxlIG5hbWVzIGFsbG93ZWQgZm9yIHRoaXMgYnVpbGRlci5cblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblxuXHRcdC8vIFNldCBkZWZhdWx0IHNlbGVjdGlvbiB0byBlbnN1cmUgaXQgaXNuJ3QgYSByZWZlcmVuY2UuXG5cdFx0aWYgKCAhICggdGhpcy5nZXQoJ3NlbGVjdGlvbicpIGluc3RhbmNlb2YgTW9kdWxlcyApICkge1xuXHRcdFx0dGhpcy5zZXQoICdzZWxlY3Rpb24nLCBuZXcgTW9kdWxlcygpICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0c2V0RGF0YTogZnVuY3Rpb24oIGRhdGEgKSB7XG5cblx0XHR2YXIgc2VsZWN0aW9uO1xuXG5cdFx0aWYgKCAnJyA9PT0gZGF0YSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBIYW5kbGUgZWl0aGVyIEpTT04gc3RyaW5nIG9yIHByb3BlciBvYmhlY3QuXG5cdFx0ZGF0YSA9ICggJ3N0cmluZycgPT09IHR5cGVvZiBkYXRhICkgPyBKU09OLnBhcnNlKCBkYXRhICkgOiBkYXRhO1xuXG5cdFx0Ly8gQ29udmVydCBzYXZlZCBkYXRhIHRvIE1vZHVsZSBtb2RlbHMuXG5cdFx0aWYgKCBkYXRhICYmIEFycmF5LmlzQXJyYXkoIGRhdGEgKSApIHtcblx0XHRcdHNlbGVjdGlvbiA9IGRhdGEubWFwKCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0XHRyZXR1cm4gTW9kdWxlRmFjdG9yeS5jcmVhdGUoIG1vZHVsZS5uYW1lLCBtb2R1bGUuYXR0ciApO1xuXHRcdFx0fSApO1xuXHRcdH1cblxuXHRcdC8vIFJlc2V0IHNlbGVjdGlvbiB1c2luZyBkYXRhIGZyb20gaGlkZGVuIGlucHV0LlxuXHRcdGlmICggc2VsZWN0aW9uICYmIHNlbGVjdGlvbi5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLmdldCgnc2VsZWN0aW9uJykuYWRkKCBzZWxlY3Rpb24gKTtcblx0XHR9XG5cblx0fSxcblxuXHRzYXZlRGF0YTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZGF0YSA9IFtdO1xuXG5cdFx0dGhpcy5nZXQoJ3NlbGVjdGlvbicpLmVhY2goIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cblx0XHRcdC8vIFNraXAgZW1wdHkvYnJva2VuIG1vZHVsZXMuXG5cdFx0XHRpZiAoICEgbW9kdWxlLmdldCgnbmFtZScgKSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRkYXRhLnB1c2goIG1vZHVsZS50b01pY3JvSlNPTigpICk7XG5cblx0XHR9ICk7XG5cblx0XHR0aGlzLnRyaWdnZXIoICdzYXZlJywgZGF0YSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIExpc3QgYWxsIGF2YWlsYWJsZSBtb2R1bGVzIGZvciB0aGlzIGJ1aWxkZXIuXG5cdCAqIEFsbCBtb2R1bGVzLCBmaWx0ZXJlZCBieSB0aGlzLmFsbG93ZWRNb2R1bGVzLlxuXHQgKi9cblx0Z2V0QXZhaWxhYmxlTW9kdWxlczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIF8uZmlsdGVyKCBNb2R1bGVGYWN0b3J5LmF2YWlsYWJsZU1vZHVsZXMsIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5pc01vZHVsZUFsbG93ZWQoIG1vZHVsZS5uYW1lICk7XG5cdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0fSxcblxuXHRpc01vZHVsZUFsbG93ZWQ6IGZ1bmN0aW9uKCBtb2R1bGVOYW1lICkge1xuXHRcdHJldHVybiB0aGlzLmdldCgnYWxsb3dlZE1vZHVsZXMnKS5pbmRleE9mKCBtb2R1bGVOYW1lICkgPj0gMDtcblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCdWlsZGVyO1xuIiwidmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5cbnZhciBNb2R1bGVBdHRyaWJ1dGUgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXG5cdGRlZmF1bHRzOiB7XG5cdFx0bmFtZTogICAgICAgICAnJyxcblx0XHRsYWJlbDogICAgICAgICcnLFxuXHRcdHZhbHVlOiAgICAgICAgJycsXG5cdFx0dHlwZTogICAgICAgICAndGV4dCcsXG5cdFx0ZGVzY3JpcHRpb246ICAnJyxcblx0XHRkZWZhdWx0VmFsdWU6ICcnLFxuXHRcdGNvbmZpZzogICAgICAge31cblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIG9ubHkgdGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBzYXZlZC5cblx0ICpcblx0ICogQHJldHVybiBvYmplY3Rcblx0ICovXG5cdHRvTWljcm9KU09OOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciByID0ge307XG5cdFx0dmFyIGFsbG93ZWRBdHRyUHJvcGVydGllcyA9IFsgJ25hbWUnLCAndmFsdWUnLCAndHlwZScgXTtcblxuXHRcdF8uZWFjaCggYWxsb3dlZEF0dHJQcm9wZXJ0aWVzLCBmdW5jdGlvbiggcHJvcCApIHtcblx0XHRcdHJbIHByb3AgXSA9IHRoaXMuZ2V0KCBwcm9wICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHRyZXR1cm4gcjtcblxuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZUF0dHJpYnV0ZTtcbiIsInZhciBCYWNrYm9uZSAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgTW9kdWxlQXR0cyA9IHJlcXVpcmUoJy4vLi4vY29sbGVjdGlvbnMvbW9kdWxlLWF0dHJpYnV0ZXMuanMnKTtcblxudmFyIE1vZHVsZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRuYW1lOiAgJycsXG5cdFx0bGFiZWw6ICcnLFxuXHRcdGF0dHI6ICBbXSxcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblxuXHRcdC8vIFNldCBkZWZhdWx0IHNlbGVjdGlvbiB0byBlbnN1cmUgaXQgaXNuJ3QgYSByZWZlcmVuY2UuXG5cdFx0aWYgKCAhICggdGhpcy5nZXQoJ2F0dHInKSBpbnN0YW5jZW9mIE1vZHVsZUF0dHMgKSApIHtcblx0XHRcdHRoaXMuc2V0KCAnYXR0cicsIG5ldyBNb2R1bGVBdHRzKCkgKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogR2V0IGFuIGF0dHJpYnV0ZSBtb2RlbCBieSBuYW1lLlxuXHQgKi9cblx0Z2V0QXR0cjogZnVuY3Rpb24oIGF0dHJOYW1lICkge1xuXHRcdHJldHVybiB0aGlzLmdldCgnYXR0cicpLmZpbmRXaGVyZSggeyBuYW1lOiBhdHRyTmFtZSB9KTtcblx0fSxcblxuXHQvKipcblx0ICogQ3VzdG9tIFBhcnNlLlxuXHQgKiBFbnN1cmVzIGF0dHJpYnV0ZXMgaXMgYW4gaW5zdGFuY2Ugb2YgTW9kdWxlQXR0c1xuXHQgKi9cblx0cGFyc2U6IGZ1bmN0aW9uKCByZXNwb25zZSApIHtcblxuXHRcdGlmICggJ2F0dHInIGluIHJlc3BvbnNlICYmICEgKCByZXNwb25zZS5hdHRyIGluc3RhbmNlb2YgTW9kdWxlQXR0cyApICkge1xuXHRcdFx0cmVzcG9uc2UuYXR0ciA9IG5ldyBNb2R1bGVBdHRzKCByZXNwb25zZS5hdHRyICk7XG5cdFx0fVxuXG5cdCAgICByZXR1cm4gcmVzcG9uc2U7XG5cblx0fSxcblxuXHR0b0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGpzb24gPSBfLmNsb25lKCB0aGlzLmF0dHJpYnV0ZXMgKTtcblxuXHRcdGlmICggJ2F0dHInIGluIGpzb24gJiYgKCBqc29uLmF0dHIgaW5zdGFuY2VvZiBNb2R1bGVBdHRzICkgKSB7XG5cdFx0XHRqc29uLmF0dHIgPSBqc29uLmF0dHIudG9KU09OKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGpzb247XG5cblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIG9ubHkgdGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBzYXZlZC5cblx0ICpcblx0ICogQHJldHVybiBvYmplY3Rcblx0ICovXG5cdHRvTWljcm9KU09OOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bmFtZTogdGhpcy5nZXQoJ25hbWUnKSxcblx0XHRcdGF0dHI6IHRoaXMuZ2V0KCdhdHRyJykudG9NaWNyb0pTT04oKVxuXHRcdH07XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZTtcbiIsInZhciAkICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBCdWlsZGVyICAgICAgID0gcmVxdWlyZSgnLi9tb2RlbHMvYnVpbGRlci5qcycpO1xudmFyIEJ1aWxkZXJWaWV3ICAgPSByZXF1aXJlKCcuL3ZpZXdzL2J1aWxkZXIuanMnKTtcbnZhciBNb2R1bGVGYWN0b3J5ID0gcmVxdWlyZSgnLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpO1xuXG4vLyBFeHBvc2Ugc29tZSBmdW5jdGlvbmFsaXR5IHRvIGdsb2JhbCBuYW1lc3BhY2UuXG53aW5kb3cubW9kdWxhclBhZ2VCdWlsZGVyID0gcmVxdWlyZSgnLi9nbG9iYWxzJyk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cblx0TW9kdWxlRmFjdG9yeS5pbml0KCk7XG5cblx0Ly8gQSBmaWVsZCBmb3Igc3RvcmluZyB0aGUgYnVpbGRlciBkYXRhLlxuXHR2YXIgJGZpZWxkID0gJCggJ1tuYW1lPW1vZHVsYXItcGFnZS1idWlsZGVyLWRhdGFdJyApO1xuXG5cdGlmICggISAkZmllbGQubGVuZ3RoICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIEEgY29udGFpbmVyIGVsZW1lbnQgZm9yIGRpc3BsYXlpbmcgdGhlIGJ1aWxkZXIuXG5cdHZhciAkY29udGFpbmVyID0gJCggJyNtb2R1bGFyLXBhZ2UtYnVpbGRlcicgKTtcblxuXHQvLyBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQnVpbGRlciBtb2RlbC5cblx0Ly8gUGFzcyBhbiBhcnJheSBvZiBtb2R1bGUgbmFtZXMgdGhhdCBhcmUgYWxsb3dlZCBmb3IgdGhpcyBidWlsZGVyLlxuXHR2YXIgYnVpbGRlciA9IG5ldyBCdWlsZGVyKHtcblx0XHRhbGxvd2VkTW9kdWxlczogJCggJ1tuYW1lPW1vZHVsYXItcGFnZS1idWlsZGVyLWFsbG93ZWQtbW9kdWxlc10nICkudmFsKCkuc3BsaXQoJywnKVxuXHR9KTtcblxuXHQvLyBTZXQgdGhlIGRhdGEgdXNpbmcgdGhlIGN1cnJlbnQgZmllbGQgdmFsdWVcblx0YnVpbGRlci5zZXREYXRhKCBKU09OLnBhcnNlKCAkZmllbGQudmFsKCkgKSApO1xuXG5cdC8vIE9uIHNhdmUsIHVwZGF0ZSB0aGUgZmllbGQgdmFsdWUuXG5cdGJ1aWxkZXIub24oICdzYXZlJywgZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0JGZpZWxkLnZhbCggSlNPTi5zdHJpbmdpZnkoIGRhdGEgKSApO1xuXHR9ICk7XG5cblx0Ly8gQ3JlYXRlIGJ1aWxkZXIgdmlldy5cblx0dmFyIGJ1aWxkZXJWaWV3ID0gbmV3IEJ1aWxkZXJWaWV3KCB7IG1vZGVsOiBidWlsZGVyIH0gKTtcblxuXHQvLyBSZW5kZXIgYnVpbGRlci5cblx0YnVpbGRlclZpZXcucmVuZGVyKCkuJGVsLmFwcGVuZFRvKCAkY29udGFpbmVyICk7XG5cbn0pO1xuIiwiLyoqXG4gKiBNYXAgbW9kdWxlIHR5cGUgdG8gdmlld3MuXG4gKi9cbnZhciBlZGl0Vmlld01hcCA9IHtcblx0J2hlYWRlcic6ICAgICAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LWhlYWRlci5qcycpLFxuXHQndGV4dGFyZWEnOiAgICAgICAgICAgIHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtdGV4dGFyZWEuanMnKSxcblx0J3RleHQnOiAgICAgICAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LXRleHQuanMnKSxcblx0J2ltYWdlJzogICAgICAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LWltYWdlLmpzJyksXG5cdCd2aWRlbyc6ICAgICAgICAgICAgICAgcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC12aWRlby5qcycpLFxuXHQnYmxvY2txdW90ZSc6ICAgICAgICAgIHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtYmxvY2txdW90ZS5qcycpLFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBlZGl0Vmlld01hcDtcbiIsInZhciBNb2R1bGUgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvbW9kdWxlLmpzJyk7XG52YXIgTW9kdWxlQXR0cyAgICAgICA9IHJlcXVpcmUoJy4vLi4vY29sbGVjdGlvbnMvbW9kdWxlLWF0dHJpYnV0ZXMuanMnKTtcbnZhciAkICAgICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxudmFyIE1vZHVsZUZhY3RvcnkgPSB7XG5cblx0YXZhaWxhYmxlTW9kdWxlczogW10sXG5cblx0aW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhICYmICdhdmFpbGFibGVfbW9kdWxlcycgaW4gbW9kdWxhclBhZ2VCdWlsZGVyRGF0YSApIHtcblx0XHRcdF8uZWFjaCggbW9kdWxhclBhZ2VCdWlsZGVyRGF0YS5hdmFpbGFibGVfbW9kdWxlcywgZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdFx0dGhpcy5yZWdpc3Rlck1vZHVsZSggbW9kdWxlICk7XG5cdFx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHRcdH1cblx0fSxcblxuXHRyZWdpc3Rlck1vZHVsZTogZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHR0aGlzLmF2YWlsYWJsZU1vZHVsZXMucHVzaCggbW9kdWxlICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENyZWF0ZSBNb2R1bGUgTW9kZWwuXG5cdCAqIFVzZSBkYXRhIGZyb20gY29uZmlnLCBwbHVzIHNhdmVkIGRhdGEuXG5cdCAqXG5cdCAqIEBwYXJhbSAgc3RyaW5nIG1vZHVsZU5hbWVcblx0ICogQHBhcmFtICBvYmplY3QgYXR0cmlidXRlIEpTT04uIFNhdmVkIGF0dHJpYnV0ZSB2YWx1ZXMuXG5cdCAqIEByZXR1cm4gTW9kdWxlXG5cdCAqL1xuXHRjcmVhdGU6IGZ1bmN0aW9uKCBtb2R1bGVOYW1lLCBhdHRyRGF0YSApIHtcblxuXHRcdHZhciBkYXRhID0gJC5leHRlbmQoIHRydWUsIHt9LCBfLmZpbmRXaGVyZSggdGhpcy5hdmFpbGFibGVNb2R1bGVzLCB7IG5hbWU6IG1vZHVsZU5hbWUgfSApICk7XG5cblx0XHRpZiAoICEgZGF0YSApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXG5cdFx0dmFyIGF0dHJpYnV0ZXMgPSBuZXcgTW9kdWxlQXR0cygpO1xuXG5cdFx0LyoqXG5cdFx0ICogQWRkIGFsbCB0aGUgbW9kdWxlIGF0dHJpYnV0ZXMuXG5cdFx0ICogV2hpdGVsaXN0ZWQgdG8gYXR0cmlidXRlcyBkb2N1bWVudGVkIGluIHNjaGVtYVxuXHRcdCAqIFNldHMgb25seSB2YWx1ZSBmcm9tIGF0dHJEYXRhLlxuXHRcdCAqL1xuXHRcdF8uZWFjaCggZGF0YS5hdHRyLCBmdW5jdGlvbiggYXR0ciApIHtcblxuXHRcdFx0dmFyIGNsb25lQXR0ciA9ICQuZXh0ZW5kKCB0cnVlLCB7fSwgYXR0ciAgKTtcblx0XHRcdHZhciBzYXZlZEF0dHIgPSBfLmZpbmRXaGVyZSggYXR0ckRhdGEsIHsgbmFtZTogYXR0ci5uYW1lIH0gKTtcblxuXHRcdFx0Ly8gQWRkIHNhdmVkIGF0dHJpYnV0ZSB2YWx1ZXMuXG5cdFx0XHRpZiAoIHNhdmVkQXR0ciAmJiAndmFsdWUnIGluIHNhdmVkQXR0ciApIHtcblx0XHRcdFx0Y2xvbmVBdHRyLnZhbHVlID0gc2F2ZWRBdHRyLnZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHRhdHRyaWJ1dGVzLmFkZCggY2xvbmVBdHRyICk7XG5cblx0XHR9ICk7XG5cblx0XHRkYXRhLmF0dHIgPSBhdHRyaWJ1dGVzO1xuXG5cdCAgICByZXR1cm4gbmV3IE1vZHVsZSggZGF0YSApO1xuXG5cdH0sXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlRmFjdG9yeTtcbiIsInZhciBCYWNrYm9uZSAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgQnVpbGRlciAgICAgICA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2J1aWxkZXIuanMnKTtcbnZhciBlZGl0Vmlld01hcCAgID0gcmVxdWlyZSgnLi8uLi91dGlscy9lZGl0LXZpZXctbWFwLmpzJyk7XG52YXIgTW9kdWxlRmFjdG9yeSA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMnKTtcbnZhciAkICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxudmFyIEJ1aWxkZXIgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICQoJyN0bXBsLW1wYi1idWlsZGVyJyApLmh0bWwoKSxcblx0Y2xhc3NOYW1lOiAnbW9kdWxhci1wYWdlLWJ1aWxkZXInLFxuXHRtb2RlbDogbnVsbCxcblx0bmV3TW9kdWxlTmFtZTogbnVsbCxcblxuXHRldmVudHM6IHtcblx0XHQnY2hhbmdlID4gLmFkZC1uZXcgLmFkZC1uZXctbW9kdWxlLXNlbGVjdCc6ICd0b2dnbGVCdXR0b25TdGF0dXMnLFxuXHRcdCdjbGljayA+IC5hZGQtbmV3IC5hZGQtbmV3LW1vZHVsZS1idXR0b24nOiAnYWRkTW9kdWxlJyxcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLm1vZGVsLmdldCgnc2VsZWN0aW9uJyk7XG5cblx0XHRzZWxlY3Rpb24ub24oICdhZGQnLCB0aGlzLmFkZE5ld1NlbGVjdGlvbkl0ZW1WaWV3LCB0aGlzICk7XG5cdFx0c2VsZWN0aW9uLm9uKCAnYWxsJywgdGhpcy5tb2RlbC5zYXZlRGF0YSwgdGhpcy5tb2RlbCApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBkYXRhID0gdGhpcy5tb2RlbC50b0pTT04oKTtcblxuXHRcdHRoaXMuJGVsLmh0bWwoIF8udGVtcGxhdGUoIHRoaXMudGVtcGxhdGUsIGRhdGEgICkgKTtcblxuXHRcdHRoaXMubW9kZWwuZ2V0KCdzZWxlY3Rpb24nKS5lYWNoKCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0dGhpcy5hZGROZXdTZWxlY3Rpb25JdGVtVmlldyggbW9kdWxlICk7XG5cdFx0fS5iaW5kKCB0aGlzICkgKTtcblxuXHRcdHRoaXMucmVuZGVyQWRkTmV3KCk7XG5cdFx0dGhpcy5pbml0U29ydGFibGUoKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlbmRlciB0aGUgQWRkIE5ldyBtb2R1bGUgY29udHJvbHMuXG5cdCAqL1xuXHRyZW5kZXJBZGROZXc6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyICRzZWxlY3QgPSB0aGlzLiRlbC5maW5kKCAnPiAuYWRkLW5ldyBzZWxlY3QuYWRkLW5ldy1tb2R1bGUtc2VsZWN0JyApO1xuXG5cdFx0JHNlbGVjdC5hcHBlbmQoXG5cdFx0XHQkKCAnPG9wdGlvbi8+JywgeyB0ZXh0OiBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhLmwxMG4uc2VsZWN0RGVmYXVsdCB9IClcblx0XHQpO1xuXG5cdFx0Xy5lYWNoKCB0aGlzLm1vZGVsLmdldEF2YWlsYWJsZU1vZHVsZXMoKSwgZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdHZhciB0ZW1wbGF0ZSA9ICc8b3B0aW9uIHZhbHVlPVwiPCU9IG5hbWUgJT5cIj48JT0gbGFiZWwgJT48L29wdGlvbj4nO1xuXHRcdFx0JHNlbGVjdC5hcHBlbmQoIF8udGVtcGxhdGUoIHRlbXBsYXRlLCBtb2R1bGUgKSApO1xuXHRcdH0gKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIFNvcnRhYmxlLlxuXHQgKi9cblx0aW5pdFNvcnRhYmxlOiBmdW5jdGlvbigpIHtcblx0XHQkKCAnPiAuc2VsZWN0aW9uJywgdGhpcy4kZWwgKS5zb3J0YWJsZSh7XG5cdFx0XHRoYW5kbGU6ICcubW9kdWxlLWVkaXQtdG9vbHMnLFxuXHRcdFx0aXRlbXM6ICc+IC5tb2R1bGUtZWRpdCcsXG5cdFx0XHRzdG9wOiB0aGlzLnVwZGF0ZVNlbGVjdGlvbk9yZGVyLmJpbmQoIHRoaXMgKSxcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogU29ydGFibGUgZW5kIGNhbGxiYWNrLlxuXHQgKiBBZnRlciByZW9yZGVyaW5nLCB1cGRhdGUgdGhlIHNlbGVjdGlvbiBvcmRlci5cblx0ICogTm90ZSAtIHVzZXMgZGlyZWN0IG1hbmlwdWxhdGlvbiBvZiBjb2xsZWN0aW9uIG1vZGVscyBwcm9wZXJ0eS5cblx0ICogVGhpcyBpcyB0byBhdm9pZCBoYXZpbmcgdG8gbWVzcyBhYm91dCB3aXRoIHRoZSB2aWV3cyB0aGVtc2VsdmVzLlxuXHQgKi9cblx0dXBkYXRlU2VsZWN0aW9uT3JkZXI6IGZ1bmN0aW9uKCBlLCB1aSApIHtcblxuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLm1vZGVsLmdldCgnc2VsZWN0aW9uJyk7XG5cdFx0dmFyIGl0ZW0gICAgICA9IHNlbGVjdGlvbi5nZXQoeyBjaWQ6IHVpLml0ZW0uYXR0ciggJ2RhdGEtY2lkJykgfSk7XG5cdFx0dmFyIG5ld0luZGV4ICA9IHVpLml0ZW0uaW5kZXgoKTtcblx0XHR2YXIgb2xkSW5kZXggID0gc2VsZWN0aW9uLmluZGV4T2YoIGl0ZW0gKTtcblxuXHRcdGlmICggbmV3SW5kZXggIT09IG9sZEluZGV4ICkge1xuXHRcdFx0dmFyIGRyb3BwZWQgPSBzZWxlY3Rpb24ubW9kZWxzLnNwbGljZSggb2xkSW5kZXgsIDEgKTtcblx0XHRcdHNlbGVjdGlvbi5tb2RlbHMuc3BsaWNlKCBuZXdJbmRleCwgMCwgZHJvcHBlZFswXSApO1xuXHRcdFx0dGhpcy5tb2RlbC5zYXZlRGF0YSgpO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBUb2dnbGUgYnV0dG9uIHN0YXR1cy5cblx0ICogRW5hYmxlL0Rpc2FibGUgYnV0dG9uIGRlcGVuZGluZyBvbiB3aGV0aGVyXG5cdCAqIHBsYWNlaG9sZGVyIG9yIHZhbGlkIG1vZHVsZSBpcyBzZWxlY3RlZC5cblx0ICovXG5cdHRvZ2dsZUJ1dHRvblN0YXR1czogZnVuY3Rpb24oZSkge1xuXHRcdHZhciB2YWx1ZSAgICAgICAgID0gJChlLnRhcmdldCkudmFsKCk7XG5cdFx0dmFyIGRlZmF1bHRPcHRpb24gPSAkKGUudGFyZ2V0KS5jaGlsZHJlbigpLmZpcnN0KCkuYXR0cigndmFsdWUnKTtcblx0XHQkKCcuYWRkLW5ldy1tb2R1bGUtYnV0dG9uJywgdGhpcy4kZWwgKS5hdHRyKCAnZGlzYWJsZWQnLCB2YWx1ZSA9PT0gZGVmYXVsdE9wdGlvbiApO1xuXHRcdHRoaXMubmV3TW9kdWxlTmFtZSA9ICggdmFsdWUgIT09IGRlZmF1bHRPcHRpb24gKSA/IHZhbHVlIDogbnVsbDtcblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlIGFkZGluZyBtb2R1bGUuXG5cdCAqXG5cdCAqIEZpbmQgbW9kdWxlIG1vZGVsLiBDbG9uZSBpdC4gQWRkIHRvIHNlbGVjdGlvbi5cblx0ICovXG5cdGFkZE1vZHVsZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0aWYgKCB0aGlzLm5ld01vZHVsZU5hbWUgJiYgdGhpcy5tb2RlbC5pc01vZHVsZUFsbG93ZWQoIHRoaXMubmV3TW9kdWxlTmFtZSApICkge1xuXHRcdFx0dmFyIG1vZGVsID0gTW9kdWxlRmFjdG9yeS5jcmVhdGUoIHRoaXMubmV3TW9kdWxlTmFtZSApO1xuXHRcdFx0dGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpLmFkZCggbW9kZWwgKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogQXBwZW5kIG5ldyBzZWxlY3Rpb24gaXRlbSB2aWV3LlxuXHQgKi9cblx0YWRkTmV3U2VsZWN0aW9uSXRlbVZpZXc6IGZ1bmN0aW9uKCBpdGVtICkge1xuXG5cdFx0dmFyIGVkaXRWaWV3LCB2aWV3O1xuXG5cdFx0ZWRpdFZpZXcgPSAoIGl0ZW0uZ2V0KCduYW1lJykgaW4gZWRpdFZpZXdNYXAgKSA/IGVkaXRWaWV3TWFwWyBpdGVtLmdldCgnbmFtZScpIF0gOiBudWxsO1xuXG5cdFx0aWYgKCAhIGVkaXRWaWV3IHx8ICEgdGhpcy5tb2RlbC5pc01vZHVsZUFsbG93ZWQoIGl0ZW0uZ2V0KCduYW1lJykgKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2aWV3ID0gbmV3IGVkaXRWaWV3KCB7IG1vZGVsOiBpdGVtIH0gKTtcblxuXHRcdCQoICc+IC5zZWxlY3Rpb24nLCB0aGlzLiRlbCApLmFwcGVuZCggdmlldy5yZW5kZXIoKS4kZWwgKTtcblxuXHRcdHZhciAkc2VsZWN0aW9uID0gJCggJz4gLnNlbGVjdGlvbicsIHRoaXMuJGVsICk7XG5cdFx0aWYgKCAkc2VsZWN0aW9uLmhhc0NsYXNzKCd1aS1zb3J0YWJsZScpICkge1xuXHRcdFx0JHNlbGVjdGlvbi5zb3J0YWJsZSgncmVmcmVzaCcpO1xuXHRcdH1cblxuXG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1aWxkZXI7XG4iLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbi8qKlxuICogSW1hZ2UgRmllbGRcbiAqXG4gKiBJbml0aWFsaXplIGFuZCBsaXN0ZW4gZm9yIHRoZSAnY2hhbmdlJyBldmVudCB0byBnZXQgdXBkYXRlZCBkYXRhLlxuICpcbiAqL1xudmFyIEZpZWxkSW1hZ2UgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICAkKCAnI3RtcGwtbXBiLWZpZWxkLWltYWdlJyApLmh0bWwoKSxcblx0ZnJhbWU6ICAgICBudWxsLFxuXHRpbWFnZUF0dHI6IG51bGwsXG5cdGNvbmZpZzogICAge30sXG5cdHZhbHVlOiAgICAgW10sIC8vIEF0dGFjaG1lbnQgSURzLlxuXHRzZWxlY3Rpb246IHt9LCAvLyBBdHRhY2htZW50cyBjb2xsZWN0aW9uIGZvciB0aGlzLnZhbHVlLlxuXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayAuaW1hZ2UtcGxhY2Vob2xkZXIgLmJ1dHRvbi5hZGQnOiAnZWRpdEltYWdlJyxcblx0XHQnY2xpY2sgLmltYWdlLXBsYWNlaG9sZGVyIGltZyc6ICdlZGl0SW1hZ2UnLFxuXHRcdCdjbGljayAuaW1hZ2UtcGxhY2Vob2xkZXIgLmJ1dHRvbi5yZW1vdmUnOiAncmVtb3ZlSW1hZ2UnLFxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplLlxuXHQgKlxuXHQgKiBQYXNzIHZhbHVlIGFuZCBjb25maWcgYXMgcHJvcGVydGllcyBvbiB0aGUgb3B0aW9ucyBvYmplY3QuXG5cdCAqIEF2YWlsYWJsZSBvcHRpb25zXG5cdCAqIC0gbXVsdGlwbGU6IGJvb2xcblx0ICogLSBzaXplUmVxOiBlZyB7IHdpZHRoOiAxMDAsIGhlaWdodDogMTAwIH1cblx0ICpcblx0ICogQHBhcmFtICBvYmplY3Qgb3B0aW9uc1xuXHQgKiBAcmV0dXJuIG51bGxcblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0Xy5iaW5kQWxsKCB0aGlzLCAncmVuZGVyJywgJ2VkaXRJbWFnZScsICdvblNlbGVjdEltYWdlJywgJ3JlbW92ZUltYWdlJywgJ2lzQXR0YWNobWVudFNpemVPaycgKTtcblxuXHRcdGlmICggJ3ZhbHVlJyBpbiBvcHRpb25zICkge1xuXHRcdFx0dGhpcy52YWx1ZSA9IG9wdGlvbnMudmFsdWU7XG5cdFx0fVxuXG5cdFx0Ly8gRW5zdXJlIHZhbHVlIGlzIGFycmF5LlxuXHRcdGlmICggISB0aGlzLnZhbHVlIHx8ICEgQXJyYXkuaXNBcnJheSggdGhpcy52YWx1ZSApICkge1xuXHRcdFx0dGhpcy52YWx1ZSA9IFtdO1xuXHRcdH1cblxuXHRcdGlmICggJ2NvbmZpZycgaW4gb3B0aW9ucyApIHtcblx0XHRcdHRoaXMuY29uZmlnID0gXy5leHRlbmQoIHtcblx0XHRcdFx0bXVsdGlwbGU6IGZhbHNlLFxuXHRcdFx0fSwgb3B0aW9ucy5jb25maWcgKTtcblx0XHR9XG5cblx0XHR0aGlzLm9uKCAnY2hhbmdlJywgdGhpcy5yZW5kZXIgKTtcblxuXHRcdHRoaXMuaW5pdFNlbGVjdGlvbigpO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgU2VsZWN0aW9uLlxuXHQgKlxuXHQgKiBTZWxlY3Rpb24gaXMgYW4gQXR0YWNobWVudCBjb2xsZWN0aW9uIGNvbnRhaW5pbmcgZnVsbCBtb2RlbHMgZm9yIHRoZSBjdXJyZW50IHZhbHVlLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG51bGxcblx0ICovXG5cdGluaXRTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5zZWxlY3Rpb24gPSBuZXcgd3AubWVkaWEubW9kZWwuQXR0YWNobWVudHMoKTtcblxuXHRcdC8vIEluaXRpYWxpemUgc2VsZWN0aW9uLlxuXHRcdF8uZWFjaCggdGhpcy52YWx1ZSwgZnVuY3Rpb24oIGl0ZW0gKSB7XG5cblx0XHRcdHZhciBtb2RlbDtcblxuXHRcdFx0Ly8gTGVnYWN5LiBIYW5kbGUgc3RvcmluZyBmdWxsIG9iamVjdHMuXG5cdFx0XHRpdGVtICA9ICggJ29iamVjdCcgPT09IHR5cGVvZiggaXRlbSApICkgPyBpdGVtLmlkIDogaXRlbTtcblx0XHRcdG1vZGVsID0gbmV3IHdwLm1lZGlhLmF0dGFjaG1lbnQoIGl0ZW0gKTtcblxuXHRcdFx0dGhpcy5zZWxlY3Rpb24uYWRkKCBtb2RlbCApO1xuXG5cdFx0XHQvLyBSZS1yZW5kZXIgYWZ0ZXIgYXR0YWNobWVudHMgaGF2ZSBzeW5jZWQuXG5cdFx0XHRtb2RlbC5mZXRjaCgpO1xuXHRcdFx0bW9kZWwub24oICdzeW5jJywgdGhpcy5yZW5kZXIgKTtcblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciB0ZW1wbGF0ZTtcblxuXHRcdHRlbXBsYXRlID0gXy5tZW1vaXplKCBmdW5jdGlvbiggdmFsdWUsIGNvbmZpZyApIHtcblx0XHRcdHJldHVybiBfLnRlbXBsYXRlKCB0aGlzLnRlbXBsYXRlLCB7XG5cdFx0XHRcdHZhbHVlOiB2YWx1ZSxcblx0XHRcdFx0Y29uZmlnOiBjb25maWcsXG5cdFx0XHR9ICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHR0aGlzLiRlbC5odG1sKCB0ZW1wbGF0ZSggdGhpcy5zZWxlY3Rpb24udG9KU09OKCksIHRoaXMuY29uZmlnICkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZSB0aGUgc2VsZWN0IGV2ZW50LlxuXHQgKlxuXHQgKiBJbnNlcnQgYW4gaW1hZ2Ugb3IgbXVsdGlwbGUgaW1hZ2VzLlxuXHQgKi9cblx0b25TZWxlY3RJbWFnZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZnJhbWUgPSB0aGlzLmZyYW1lIHx8IG51bGw7XG5cblx0XHRpZiAoICEgZnJhbWUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy52YWx1ZSA9IFtdO1xuXHRcdHRoaXMuc2VsZWN0aW9uLnJlc2V0KFtdKTtcblxuXHRcdGZyYW1lLnN0YXRlKCkuZ2V0KCdzZWxlY3Rpb24nKS5lYWNoKCBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblxuXHRcdFx0aWYgKCB0aGlzLmlzQXR0YWNobWVudFNpemVPayggYXR0YWNobWVudCApICkge1xuXHRcdFx0XHR0aGlzLnZhbHVlLnB1c2goIGF0dGFjaG1lbnQuZ2V0KCdpZCcpICk7XG5cdFx0XHRcdHRoaXMuc2VsZWN0aW9uLmFkZCggYXR0YWNobWVudCApO1xuXHRcdFx0fVxuXG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHR0aGlzLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLnZhbHVlICk7XG5cblx0XHRmcmFtZS5jbG9zZSgpO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZSB0aGUgZWRpdCBhY3Rpb24uXG5cdCAqL1xuXHRlZGl0SW1hZ2U6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciBmcmFtZSA9IHRoaXMuZnJhbWU7XG5cblx0XHRpZiAoICEgZnJhbWUgKSB7XG5cblx0XHRcdHZhciBmcmFtZUFyZ3MgPSB7XG5cdFx0XHRcdGxpYnJhcnk6IHsgdHlwZTogJ2ltYWdlJyB9LFxuXHRcdFx0XHRtdWx0aXBsZTogdGhpcy5jb25maWcubXVsdGlwbGUsXG5cdFx0XHRcdHRpdGxlOiAnU2VsZWN0IEltYWdlJyxcblx0XHRcdFx0ZnJhbWU6ICdzZWxlY3QnLFxuXHRcdFx0fTtcblxuXHRcdFx0ZnJhbWUgPSB0aGlzLmZyYW1lID0gd3AubWVkaWEoIGZyYW1lQXJncyApO1xuXG5cdFx0XHRmcmFtZS5vbiggJ2NvbnRlbnQ6Y3JlYXRlOmJyb3dzZScsIHRoaXMuc2V0dXBGaWx0ZXJzLCB0aGlzICk7XG5cdFx0XHRmcmFtZS5vbiggJ2NvbnRlbnQ6cmVuZGVyOmJyb3dzZScsIHRoaXMuc2l6ZUZpbHRlck5vdGljZSwgdGhpcyApO1xuXHRcdFx0ZnJhbWUub24oICdzZWxlY3QnLCB0aGlzLm9uU2VsZWN0SW1hZ2UsIHRoaXMgKTtcblxuXHRcdH1cblxuXHRcdC8vIFdoZW4gdGhlIGZyYW1lIG9wZW5zLCBzZXQgdGhlIHNlbGVjdGlvbi5cblx0XHRmcmFtZS5vbiggJ29wZW4nLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHNlbGVjdGlvbiA9IGZyYW1lLnN0YXRlKCkuZ2V0KCdzZWxlY3Rpb24nKTtcblxuXHRcdFx0Ly8gU2V0IHRoZSBzZWxlY3Rpb24uXG5cdFx0XHQvLyBOb3RlIC0gZXhwZWN0cyBhcnJheSBvZiBvYmplY3RzLCBub3QgYSBjb2xsZWN0aW9uLlxuXHRcdFx0c2VsZWN0aW9uLnNldCggdGhpcy5zZWxlY3Rpb24ubW9kZWxzICk7XG5cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdGZyYW1lLm9wZW4oKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGQgZmlsdGVycyB0byB0aGUgZnJhbWUgbGlicmFyeSBjb2xsZWN0aW9uLlxuXHQgKlxuXHQgKiAgLSBmaWx0ZXIgdG8gbGltaXQgdG8gcmVxdWlyZWQgc2l6ZS5cblx0ICovXG5cdHNldHVwRmlsdGVyczogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgbGliICAgID0gdGhpcy5mcmFtZS5zdGF0ZSgpLmdldCgnbGlicmFyeScpO1xuXG5cdFx0aWYgKCAnc2l6ZVJlcScgaW4gdGhpcy5jb25maWcgKSB7XG5cdFx0XHRsaWIuZmlsdGVycy5zaXplID0gdGhpcy5pc0F0dGFjaG1lbnRTaXplT2s7XG5cdFx0fVxuXG5cdH0sXG5cblxuXHQvKipcblx0ICogSGFuZGxlIGRpc3BsYXkgb2Ygc2l6ZSBmaWx0ZXIgbm90aWNlLlxuXHQgKi9cblx0c2l6ZUZpbHRlck5vdGljZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgbGliID0gdGhpcy5mcmFtZS5zdGF0ZSgpLmdldCgnbGlicmFyeScpO1xuXG5cdFx0aWYgKCAhIGxpYi5maWx0ZXJzLnNpemUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gV2FpdCB0byBiZSBzdXJlIHRoZSBmcmFtZSBpcyByZW5kZXJlZC5cblx0XHR3aW5kb3cuc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciByZXEsICRub3RpY2UsIHRlbXBsYXRlLCAkdG9vbGJhcjtcblxuXHRcdFx0cmVxID0gXy5leHRlbmQoIHtcblx0XHRcdFx0d2lkdGg6IDAsXG5cdFx0XHRcdGhlaWdodDogMCxcblx0XHRcdH0sIHRoaXMuY29uZmlnLnNpemVSZXEgKTtcblxuXHRcdFx0Ly8gRGlzcGxheSBub3RpY2Ugb24gbWFpbiBncmlkIHZpZXcuXG5cdFx0XHR0ZW1wbGF0ZSA9ICc8cCBjbGFzcz1cImZpbHRlci1ub3RpY2VcIj5Pbmx5IHNob3dpbmcgaW1hZ2VzIHRoYXQgbWVldCBzaXplIHJlcXVpcmVtZW50czogPCU9IHdpZHRoICU+cHggJnRpbWVzOyA8JT0gaGVpZ2h0ICU+cHg8L3A+Jztcblx0XHRcdCRub3RpY2UgID0gJCggXy50ZW1wbGF0ZSggdGVtcGxhdGUsIHJlcSApICk7XG5cdFx0XHQkdG9vbGJhciA9ICQoICcuYXR0YWNobWVudHMtYnJvd3NlciAubWVkaWEtdG9vbGJhcicsIHRoaXMuZnJhbWUuJGVsICkuZmlyc3QoKTtcblx0XHRcdCR0b29sYmFyLnByZXBlbmQoICRub3RpY2UgKTtcblxuXHRcdFx0dmFyIGNvbnRlbnRWaWV3ID0gdGhpcy5mcmFtZS52aWV3cy5nZXQoICcubWVkaWEtZnJhbWUtY29udGVudCcgKTtcblx0XHRcdGNvbnRlbnRWaWV3ID0gY29udGVudFZpZXdbMF07XG5cblx0XHRcdCRub3RpY2UgPSAkKCAnPHAgY2xhc3M9XCJmaWx0ZXItbm90aWNlXCI+SW1hZ2UgZG9lcyBub3QgbWVldCBzaXplIHJlcXVpcmVtZW50cy48L3A+JyApO1xuXG5cdFx0XHQvLyBEaXNwbGF5IGFkZGl0aW9uYWwgbm90aWNlIHdoZW4gc2VsZWN0aW5nIGFuIGltYWdlLlxuXHRcdFx0Ly8gUmVxdWlyZWQgdG8gaW5kaWNhdGUgYSBiYWQgaW1hZ2UgaGFzIGp1c3QgYmVlbiB1cGxvYWRlZC5cblx0XHRcdGNvbnRlbnRWaWV3Lm9wdGlvbnMuc2VsZWN0aW9uLm9uKCAnc2VsZWN0aW9uOnNpbmdsZScsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdHZhciBhdHRhY2htZW50ID0gY29udGVudFZpZXcub3B0aW9ucy5zZWxlY3Rpb24uc2luZ2xlKCk7XG5cblx0XHRcdFx0dmFyIGRpc3BsYXlOb3RpY2UgPSBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRcdC8vIElmIHN0aWxsIHVwbG9hZGluZywgd2FpdCBhbmQgdHJ5IGRpc3BsYXlpbmcgbm90aWNlIGFnYWluLlxuXHRcdFx0XHRcdGlmICggYXR0YWNobWVudC5nZXQoICd1cGxvYWRpbmcnICkgKSB7XG5cdFx0XHRcdFx0XHR3aW5kb3cuc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGRpc3BsYXlOb3RpY2UoKTtcblx0XHRcdFx0XHRcdH0sIDUwMCApO1xuXG5cdFx0XHRcdFx0Ly8gT0suIERpc3BsYXkgbm90aWNlIGFzIHJlcXVpcmVkLlxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRcdGlmICggISB0aGlzLmlzQXR0YWNobWVudFNpemVPayggYXR0YWNobWVudCApICkge1xuXHRcdFx0XHRcdFx0XHQkKCAnLmF0dGFjaG1lbnRzLWJyb3dzZXIgLmF0dGFjaG1lbnQtaW5mbycgKS5wcmVwZW5kKCAkbm90aWNlICk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQkbm90aWNlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0uYmluZCh0aGlzKTtcblxuXHRcdFx0XHRkaXNwbGF5Tm90aWNlKCk7XG5cblx0XHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0fS5iaW5kKHRoaXMpLCAxMDAgICk7XG5cblx0fSxcblxuXHRyZW1vdmVJbWFnZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0dmFyICR0YXJnZXQsIGlkO1xuXG5cdFx0JHRhcmdldCAgID0gJChlLnRhcmdldCk7XG5cdFx0JHRhcmdldCAgID0gKCAkdGFyZ2V0LnByb3AoJ3RhZ05hbWUnKSA9PT0gJ0JVVFRPTicgKSA/ICR0YXJnZXQgOiAkdGFyZ2V0LmNsb3Nlc3QoJ2J1dHRvbi5yZW1vdmUnKTtcblx0XHRpZCAgICAgICAgPSAkdGFyZ2V0LmRhdGEoICdpbWFnZS1pZCcgKTtcblxuXHRcdGlmICggISBpZCAgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy52YWx1ZSA9IF8uZmlsdGVyKCB0aGlzLnZhbHVlLCBmdW5jdGlvbiggdmFsICkge1xuXHRcdFx0cmV0dXJuICggdmFsICE9PSBpZCApO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMudmFsdWUgPSAoIHRoaXMudmFsdWUubGVuZ3RoID4gMCApID8gdGhpcy52YWx1ZSA6IFtdO1xuXG5cdFx0Ly8gVXBkYXRlIHNlbGVjdGlvbi5cblx0XHR2YXIgcmVtb3ZlID0gdGhpcy5zZWxlY3Rpb24uZmlsdGVyKCBmdW5jdGlvbiggaXRlbSApIHtcblx0XHRcdHJldHVybiB0aGlzLnZhbHVlLmluZGV4T2YoIGl0ZW0uZ2V0KCdpZCcpICkgPCAwO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0dGhpcy5zZWxlY3Rpb24ucmVtb3ZlKCByZW1vdmUgKTtcblxuXHRcdHRoaXMudHJpZ2dlciggJ2NoYW5nZScsIHRoaXMudmFsdWUgKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBEb2VzIGF0dGFjaG1lbnQgbWVldCBzaXplIHJlcXVpcmVtZW50cz9cblx0ICpcblx0ICogQHBhcmFtICBBdHRhY2htZW50XG5cdCAqIEByZXR1cm4gYm9vbGVhblxuXHQgKi9cblx0aXNBdHRhY2htZW50U2l6ZU9rOiBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblxuXHRcdGlmICggISAoICdzaXplUmVxJyBpbiB0aGlzLmNvbmZpZyApICkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0dGhpcy5jb25maWcuc2l6ZVJlcSA9IF8uZXh0ZW5kKCB7XG5cdFx0XHR3aWR0aDogMCxcblx0XHRcdGhlaWdodDogMCxcblx0XHR9LCB0aGlzLmNvbmZpZy5zaXplUmVxICk7XG5cblx0XHR2YXIgd2lkdGhSZXEgID0gYXR0YWNobWVudC5nZXQoJ3dpZHRoJykgID49IHRoaXMuY29uZmlnLnNpemVSZXEud2lkdGg7XG5cdFx0dmFyIGhlaWdodFJlcSA9IGF0dGFjaG1lbnQuZ2V0KCdoZWlnaHQnKSA+PSB0aGlzLmNvbmZpZy5zaXplUmVxLmhlaWdodDtcblxuXHRcdHJldHVybiB3aWR0aFJlcSAmJiBoZWlnaHRSZXE7XG5cblx0fVxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRJbWFnZTtcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xuXG4vKipcbiAqIEhpZ2hsaWdodCBNb2R1bGUuXG4gKiBFeHRlbmRzIGRlZmF1bHQgbW91ZHVsZSxcbiAqIGN1c3RvbSBkaWZmZXJlbnQgdGVtcGxhdGUuXG4gKi9cbnZhciBIaWdobGlnaHRNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblx0dGVtcGxhdGU6ICQoICcjdG1wbC1tcGItbW9kdWxlLWVkaXQtYmxvY2txdW90ZScgKS5odG1sKCksXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIaWdobGlnaHRNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xuXG4vKipcbiAqIEhlYWRlciBNb2R1bGUuXG4gKiBFeHRlbmRzIGRlZmF1bHQgbW91ZHVsZSB3aXRoIGN1c3RvbSBkaWZmZXJlbnQgdGVtcGxhdGUuXG4gKi9cbnZhciBIZWFkZXJNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblx0dGVtcGxhdGU6ICQoICcjdG1wbC1tcGItbW9kdWxlLWVkaXQtaGVhZGVyJyApLmh0bWwoKSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlck1vZHVsZUVkaXRWaWV3O1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG52YXIgRmllbGRJbWFnZSA9IHJlcXVpcmUoJy4vZmllbGQtaW1hZ2UuanMnKTtcblxuLyoqXG4gKiBIaWdobGlnaHQgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUsXG4gKiBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgSW1hZ2VNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLW1wYi1tb2R1bGUtZWRpdC1pbWFnZScgKS5odG1sKCksXG5cdGltYWdlRmllbGQ6IG51bGwsXG5cdGltYWdlQXR0cjogbnVsbCxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggYXR0cmlidXRlcywgb3B0aW9ucyApIHtcblxuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgYXR0cmlidXRlcywgb3B0aW9ucyBdICk7XG5cblx0XHR0aGlzLmltYWdlQXR0ciA9IHRoaXMubW9kZWwuZ2V0QXR0cignaW1hZ2UnKTtcblxuXHRcdHZhciBjb25maWcgPSB0aGlzLmltYWdlQXR0ci5nZXQoJ2NvbmZpZycpIHx8IHt9O1xuXG5cdFx0Y29uZmlnID0gXy5leHRlbmQoIHtcblx0XHRcdG11bHRpcGxlOiBmYWxzZSxcblx0XHR9LCBjb25maWcgKTtcblxuXHRcdHRoaXMuaW1hZ2VGaWVsZCA9IG5ldyBGaWVsZEltYWdlKCB7XG5cdFx0XHR2YWx1ZTogdGhpcy5pbWFnZUF0dHIuZ2V0KCd2YWx1ZScpLFxuXHRcdFx0Y29uZmlnOiBjb25maWcsXG5cdFx0fSApO1xuXG5cdFx0dGhpcy5pbWFnZUZpZWxkLm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XHR0aGlzLmltYWdlQXR0ci5zZXQoICd2YWx1ZScsIGRhdGEgKTtcblx0XHRcdHRoaXMubW9kZWwudHJpZ2dlciggJ2NoYW5nZScsIHRoaXMubW9kZWwgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMgKTtcblxuXHRcdCQoICcuaW1hZ2UtZmllbGQnLCB0aGlzLiRlbCApLmFwcGVuZChcblx0XHRcdHRoaXMuaW1hZ2VGaWVsZC5yZW5kZXIoKS4kZWxcblx0XHQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xuXG4vKipcbiAqIEhpZ2hsaWdodCBNb2R1bGUuXG4gKiBFeHRlbmRzIGRlZmF1bHQgbW91ZHVsZSxcbiAqIGN1c3RvbSBkaWZmZXJlbnQgdGVtcGxhdGUuXG4gKi9cbnZhciBIaWdobGlnaHRNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLW1wYi1tb2R1bGUtZWRpdC10ZXh0JyApLmh0bWwoKSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblxuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMgKTtcblxuXHRcdC8vIE1ha2Ugc3VyZSB0aGUgdGVtcGxhdGUgZm9yIHRoaXMgbW9kdWxlIGlzIHVuaXF1ZSB0byB0aGlzIGluc3RhbmNlLlxuXHRcdHRoaXMuZWRpdG9yID0ge1xuXHRcdFx0aWQgICAgICAgICAgIDogJ21wYi10ZXh0LWJvZHktJyArIHRoaXMubW9kZWwuY2lkLFxuXHRcdFx0bmFtZVJlZ2V4ICAgIDogbmV3IFJlZ0V4cCggJ21wYi1wbGFjZWhvbGRlci1uYW1lJywgJ2cnICksXG5cdFx0XHRpZFJlZ2V4ICAgICAgOiBuZXcgUmVnRXhwKCAnbXBiLXBsYWNlaG9sZGVyLWlkJywgJ2cnICksXG5cdFx0XHRjb250ZW50UmVnZXggOiBuZXcgUmVnRXhwKCAnbXBiLXBsYWNlaG9sZGVyLWNvbnRlbnQnLCAnZycgKSxcblx0XHR9O1xuXG5cdFx0dGhpcy50ZW1wbGF0ZSAgPSB0aGlzLnRlbXBsYXRlLnJlcGxhY2UoIHRoaXMuZWRpdG9yLm5hbWVSZWdleCwgdGhpcy5lZGl0b3IuaWQgKTtcblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IuaWRSZWdleCwgdGhpcy5lZGl0b3IuaWQgKTtcblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IuY29udGVudFJlZ2V4LCAnPCU9IGF0dHIuYm9keS52YWx1ZSAlPicgKTtcblxuXHRcdHRoaXMudGVzdCA9IHRoaXMubW9kZWwuY2lkO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzICk7XG5cblx0XHQvLyBQcmV2ZW50IEZPVUMuIFNob3cgYWdhaW4gb24gaW5pdC4gU2VlIHNldHVwLlxuXHRcdCQoICcud3AtZWRpdG9yLXdyYXAnLCB0aGlzLiRlbCApLmNzcyggJ2Rpc3BsYXknLCAnbm9uZScgKTtcblxuXHRcdHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuaW5pdFRpbnlNQ0UoKTtcblx0XHR9LmJpbmQoIHRoaXMgKSwgMTAwICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIHRoZSBUaW55TUNFIGVkaXRvci5cblx0ICpcblx0ICogQHJldHVybiBudWxsLlxuXHQgKi9cblx0aW5pdFRpbnlNQ0U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHNlbGYgPSB0aGlzLCBpZCwgZWQsICRlbCwgcHJvcDtcblxuXHRcdGlkICA9IHRoaXMuZWRpdG9yLmlkO1xuXHRcdGVkICA9IHRpbnlNQ0UuZ2V0KCBpZCApO1xuXHRcdCRlbCA9ICQoICcjd3AtJyArIGlkICsgJy13cmFwJywgdGhpcy4kZWwgKTtcblxuXHRcdGlmICggZWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gSWYgbm8gc2V0dGluZ3MgZm9yIHRoaXMgZmllbGQuIENsb25lIGZyb20gcGxhY2Vob2xkZXIuXG5cdFx0aWYgKCB0eXBlb2YoIHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0gKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHR2YXIgbmV3U2V0dGluZ3MgPSBqUXVlcnkuZXh0ZW5kKCB7fSwgdGlueU1DRVByZUluaXQubWNlSW5pdFsgJ21wYi1wbGFjZWhvbGRlci1pZCcgXSApO1xuXHRcdFx0Zm9yICggcHJvcCBpbiBuZXdTZXR0aW5ncyApIHtcblx0XHRcdFx0aWYgKCAnc3RyaW5nJyA9PT0gdHlwZW9mKCBuZXdTZXR0aW5nc1twcm9wXSApICkge1xuXHRcdFx0XHRcdG5ld1NldHRpbmdzW3Byb3BdID0gbmV3U2V0dGluZ3NbcHJvcF0ucmVwbGFjZSggdGhpcy5lZGl0b3IuaWRSZWdleCwgaWQgKS5yZXBsYWNlKCB0aGlzLmVkaXRvci5uYW1lUmVnZXgsIG5hbWUgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGlueU1DRVByZUluaXQubWNlSW5pdFsgaWQgXSA9IG5ld1NldHRpbmdzO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBmdWxsc2NyZWVuIHBsdWdpbi5cblx0XHR0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdLnBsdWdpbnMgPSB0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdLnBsdWdpbnMucmVwbGFjZSggJ2Z1bGxzY3JlZW4sJywgJycgKTtcblxuXHRcdC8vIElmIG5vIFF1aWNrdGFnIHNldHRpbmdzIGZvciB0aGlzIGZpZWxkLiBDbG9uZSBmcm9tIHBsYWNlaG9sZGVyLlxuXHRcdGlmICggdHlwZW9mKCB0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHR2YXIgbmV3UVRTID0galF1ZXJ5LmV4dGVuZCgge30sIHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgJ21wYi1wbGFjZWhvbGRlci1pZCcgXSApO1xuXHRcdFx0Zm9yICggcHJvcCBpbiBuZXdRVFMgKSB7XG5cdFx0XHRcdGlmICggJ3N0cmluZycgPT09IHR5cGVvZiggbmV3UVRTW3Byb3BdICkgKSB7XG5cdFx0XHRcdFx0bmV3UVRTW3Byb3BdID0gbmV3UVRTW3Byb3BdLnJlcGxhY2UoIHRoaXMuZWRpdG9yLmlkUmVnZXgsIGlkICkucmVwbGFjZSggdGhpcy5lZGl0b3IubmFtZVJlZ2V4LCBuYW1lICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgaWQgXSA9IG5ld1FUUztcblx0XHR9XG5cblx0XHR2YXIgbW9kZSA9ICRlbC5oYXNDbGFzcygndG1jZS1hY3RpdmUnKSA/ICd0bWNlJyA6ICdodG1sJztcblxuXHRcdC8vIFdoZW4gZWRpdG9yIGluaXRzLCBhdHRhY2ggc2F2ZSBjYWxsYmFjayB0byBjaGFuZ2UgZXZlbnQuXG5cdFx0dGlueU1DRVByZUluaXQubWNlSW5pdFtpZF0uc2V0dXAgPSBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy5vbignY2hhbmdlJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRzZWxmLnNldEF0dHIoICdib2R5JywgZS50YXJnZXQuZ2V0Q29udGVudCgpICk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdHRoaXMub24oICdpbml0JywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQkZWwuY3NzKCAnZGlzcGxheScsICdibG9jaycgKTtcblx0XHRcdFx0fSwgMTAwICk7XG5cdFx0XHR9KTtcblxuXHRcdH07XG5cblx0XHQvLyBJZiBjdXJyZW50IG1vZGUgaXMgdmlzdWFsLCBjcmVhdGUgdGhlIHRpbnlNQ0UuXG5cdFx0aWYgKCAndG1jZScgPT09IG1vZGUgKSB7XG5cdFx0XHR0aW55TUNFLmluaXQoIHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbaWRdICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRlbC5jc3MoICdkaXNwbGF5JywgJ2Jsb2NrJyApO1xuXHRcdH1cblxuXHRcdC8vIEluaXQgcXVpY2t0YWdzLlxuXHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0cXVpY2t0YWdzKCB0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gKTtcblx0XHRcdFFUYWdzLl9idXR0b25zSW5pdCgpO1xuXHRcdH0sIDEwMCApO1xuXG5cdFx0Ly8gSGFuZGxlIHRlbXBvcmFyaWx5IHJlbW92ZSB0aW55TUNFIHdoZW4gc29ydGluZy5cblx0XHR0aGlzLiRlbC5jbG9zZXN0KCcudWktc29ydGFibGUnKS5vbiggJ3NvcnRzdGFydCcsIGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG5cdFx0XHRpZiAoIHVpLml0ZW1bMF0uZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpID09PSB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSApIHtcblx0XHRcdFx0dGlueU1DRS5leGVjQ29tbWFuZCggJ21jZVJlbW92ZUVkaXRvcicsIGZhbHNlLCBpZCApO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0Ly8gSGFuZGxlIHJlLWluaXQgYWZ0ZXIgc29ydGluZy5cblx0XHR0aGlzLiRlbC5jbG9zZXN0KCcudWktc29ydGFibGUnKS5vbiggJ3NvcnRzdG9wJywgZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblx0XHRcdGlmICggdWkuaXRlbVswXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2lkJykgPT09IHRoaXMuZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpICkge1xuXHRcdFx0XHR0aW55TUNFLmV4ZWNDb21tYW5kKCdtY2VBZGRFZGl0b3InLCBmYWxzZSwgaWQpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlbW92ZSBtb2RlbCBoYW5kbGVyLlxuXHQgKi9cblx0cmVtb3ZlTW9kZWw6IGZ1bmN0aW9uKGUpIHtcblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5yZW1vdmVNb2RlbC5hcHBseSggdGhpcywgW2VdICk7XG5cdFx0dGlueU1DRS5leGVjQ29tbWFuZCggJ21jZVJlbW92ZUVkaXRvcicsIGZhbHNlLCB0aGlzLmVkaXRvci5pZCApO1xuXHR9LFxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSGlnaGxpZ2h0TW9kdWxlRWRpdFZpZXc7XG4iLCJ2YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdCA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcblxuLyoqXG4gKiBIZWFkZXIgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUgd2l0aCBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgSGVhZGVyTW9kdWxlRWRpdFZpZXcgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cdHRlbXBsYXRlOiAkKCAnI3RtcGwtbXBiLW1vZHVsZS1lZGl0LXRleHRhcmVhJyApLmh0bWwoKSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlck1vZHVsZUVkaXRWaWV3O1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG5cbi8qKlxuICogSGlnaGxpZ2h0IE1vZHVsZS5cbiAqIEV4dGVuZHMgZGVmYXVsdCBtb3VkdWxlLFxuICogY3VzdG9tIGRpZmZlcmVudCB0ZW1wbGF0ZS5cbiAqL1xudmFyIEhpZ2hsaWdodE1vZHVsZUVkaXRWaWV3ID0gTW9kdWxlRWRpdC5leHRlbmQoe1xuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLW1wYi1tb2R1bGUtZWRpdC12aWRlbycgKS5odG1sKCksXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIaWdobGlnaHRNb2R1bGVFZGl0VmlldztcbiIsInZhciBCYWNrYm9uZSAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbnZhciBNb2R1bGVFZGl0ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdGNsYXNzTmFtZTogICAgICdtb2R1bGUtZWRpdCcsXG5cdHRvb2xzVGVtcGxhdGU6ICQoJyN0bXBsLW1wYi1tb2R1bGUtZWRpdC10b29scycgKS5odG1sKCksXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NoYW5nZSAqW2RhdGEtbW9kdWxlLWF0dHItbmFtZV0nOiAnYXR0ckZpZWxkQ2hhbmdlZCcsXG5cdFx0J2tleXVwICAqW2RhdGEtbW9kdWxlLWF0dHItbmFtZV0nOiAnYXR0ckZpZWxkQ2hhbmdlZCcsXG5cdFx0J2lucHV0ICAqW2RhdGEtbW9kdWxlLWF0dHItbmFtZV0nOiAnYXR0ckZpZWxkQ2hhbmdlZCcsXG5cdFx0J2NsaWNrICAuYnV0dG9uLXNlbGVjdGlvbi1pdGVtLXJlbW92ZSc6ICdyZW1vdmVNb2RlbCcsXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0Xy5iaW5kQWxsKCB0aGlzLCAnYXR0ckZpZWxkQ2hhbmdlZCcsICdyZW1vdmVNb2RlbCcsICdzZXRBdHRyJyApO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZGF0YSAgPSB0aGlzLm1vZGVsLnRvSlNPTigpO1xuXHRcdGRhdGEuYXR0ciA9IHt9O1xuXG5cdFx0Ly8gRm9ybWF0IGF0dHJpYnV0ZSBhcnJheSBmb3IgZWFzeSB0ZW1wbGF0aW5nLlxuXHRcdC8vIEJlY2F1c2UgYXR0cmlidXRlcyBpbiAgYXJyYXkgaXMgZGlmZmljdWx0IHRvIGFjY2Vzcy5cblx0XHR0aGlzLm1vZGVsLmdldCgnYXR0cicpLmVhY2goIGZ1bmN0aW9uKCBhdHRyICkge1xuXHRcdFx0ZGF0YS5hdHRyWyBhdHRyLmdldCgnbmFtZScpIF0gPSBhdHRyLnRvSlNPTigpO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJGVsLmh0bWwoIF8udGVtcGxhdGUoIHRoaXMudGVtcGxhdGUsIGRhdGEgKSApO1xuXG5cdFx0dGhpcy5pbml0aWFsaXplQ29sb3JwaWNrZXIoKTtcblxuXHRcdC8vIElEIGF0dHJpYnV0ZSwgc28gd2UgY2FuIGNvbm5lY3QgdGhlIHZpZXcgYW5kIG1vZGVsIGFnYWluIGxhdGVyLlxuXHRcdHRoaXMuJGVsLmF0dHIoICdkYXRhLWNpZCcsIHRoaXMubW9kZWwuY2lkICk7XG5cblx0XHQvLyBBcHBlbmQgdGhlIG1vZHVsZSB0b29scy5cblx0XHR0aGlzLiRlbC5wcmVwZW5kKCBfLnRlbXBsYXRlKCB0aGlzLnRvb2xzVGVtcGxhdGUsIGRhdGEgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHRpbml0aWFsaXplQ29sb3JwaWNrZXI6IGZ1bmN0aW9uKCkge1xuXHRcdCQoJy5tcGItY29sb3ItcGlja2VyJywgdGhpcy4kZWwgKS53cENvbG9yUGlja2VyKHtcblx0XHQgICAgcGFsZXR0ZXM6IFsnI2VkMDA4MicsICcjZTYwYzI5JywnI2ZmNTUxOScsJyNmZmJmMDAnLCcjOTZjYzI5JywnIzE0YzA0ZCcsJyMxNmQ1ZDknLCcjMDA5Y2YzJywnIzE0M2ZjYycsJyM2MTE0Y2MnLCcjMzMzMzMzJ10sXG5cdFx0XHRjaGFuZ2U6IGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG5cdFx0XHRcdCQodGhpcykuYXR0ciggJ3ZhbHVlJywgdWkuY29sb3IudG9TdHJpbmcoKSApO1xuXHRcdFx0XHQkKHRoaXMpLnRyaWdnZXIoICdjaGFuZ2UnICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0c2V0QXR0cjogZnVuY3Rpb24oIGF0dHJpYnV0ZSwgdmFsdWUgKSB7XG5cblx0XHR2YXIgYXR0ciA9IHRoaXMubW9kZWwuZ2V0KCAnYXR0cicgKS5maW5kV2hlcmUoIHsgbmFtZTogYXR0cmlidXRlIH0gKTtcblxuXHRcdGlmICggYXR0ciApIHtcblx0XHRcdGF0dHIuc2V0KCAndmFsdWUnLCB2YWx1ZSApO1xuXHRcdFx0dGhpcy5tb2RlbC50cmlnZ2VyKCdjaGFuZ2U6YXR0cicpO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGFuZ2UgZXZlbnQgaGFuZGxlci5cblx0ICogVXBkYXRlIGF0dHJpYnV0ZSBmb2xsb3dpbmcgdmFsdWUgY2hhbmdlLlxuXHQgKi9cblx0YXR0ckZpZWxkQ2hhbmdlZDogZnVuY3Rpb24oZSkge1xuXG5cdFx0dmFyIGF0dHIgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoICdkYXRhLW1vZHVsZS1hdHRyLW5hbWUnICk7XG5cbiAgICAgICAgaWYgKCBlLnRhcmdldC5oYXNBdHRyaWJ1dGUoICdjb250ZW50ZWRpdGFibGUnICkgKSB7XG4gICAgICAgIFx0dGhpcy5zZXRBdHRyKCBhdHRyLCAkKGUudGFyZ2V0KS5odG1sKCkgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgXHR0aGlzLnNldEF0dHIoIGF0dHIsIGUudGFyZ2V0LnZhbHVlICk7XG4gICAgICAgIH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgbW9kZWwgaGFuZGxlci5cblx0ICovXG5cdHJlbW92ZU1vZGVsOiBmdW5jdGlvbihlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHRoaXMucmVtb3ZlKCk7XG5cdFx0dGhpcy5tb2RlbC5kZXN0cm95KCk7XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZUVkaXQ7XG4iXX0=
