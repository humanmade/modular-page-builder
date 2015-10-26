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
		BuilderView:     require('./views/builder.js'),
		ModuleEdit:      require('./views/module-edit.js'),
		Field:           require('./views/field-attachment.js'),
		FieldAttachment: require('./views/field-attachment.js'),
		FieldText:       require('./views/field-text.js'),
		FieldWysiwyg:    require('./views/field-wysiwyg.js'),
	}
};

module.exports = globals;

},{"./models/builder.js":4,"./utils/edit-view-map.js":8,"./utils/module-factory.js":9,"./views/builder.js":10,"./views/field-attachment.js":11,"./views/field-text.js":12,"./views/field-wysiwyg.js":13,"./views/module-edit.js":21}],4:[function(require,module,exports){
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

},{"./../views/module-edit-blockquote.js":15,"./../views/module-edit-header.js":16,"./../views/module-edit-image.js":17,"./../views/module-edit-text.js":18,"./../views/module-edit-textarea.js":19,"./../views/module-edit-video.js":20}],9:[function(require,module,exports){
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
var Field = require('./field.js');

/**
 * Image Field
 *
 * Initialize and listen for the 'change' event to get updated data.
 *
 */
var FieldAttachment = Field.extend({

	template:  $( '#tmpl-mpb-field-attachment' ).html(),
	frame:     null,
	value:     [], // Attachment IDs.
	selection: {}, // Attachments collection for this.value.

	config:    {},
	defaultConfig: {
		multiple: false,
		library: { type: 'image' },
		button_text: 'Select Image',
	},

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

		// Call default initialize.
		Field.prototype.initialize.apply( this, [ options ] );

		_.bindAll( this, 'render', 'editImage', 'onSelectImage', 'removeImage', 'isAttachmentSizeOk' );

		this.on( 'change', this.render );

		this.initSelection();

	},

	setValue: function( value ) {

		// Ensure value is array.
		if ( ! value || ! Array.isArray( value ) ) {
			value = [];
		}

		Field.prototype.setValue.apply( this, [ value ] );

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
		_.each( this.getValue(), function( item ) {

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

		this.selection.reset([]);

		frame.state().get('selection').each( function( attachment ) {

			if ( this.isAttachmentSizeOk( attachment ) ) {
				this.selection.add( attachment );
			}

		}.bind(this) );

		this.setValue( this.selection.pluck('id') );

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
				library: this.config.library,
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

		$target = $(e.target);
		$target = ( $target.prop('tagName') === 'BUTTON' ) ? $target : $target.closest('button.remove');
		id      = $target.data( 'image-id' );

		if ( ! id  ) {
			return;
		}

		this.selection.remove( this.selection.where( { id: id } ) );
		this.setValue( this.selection.pluck('id') );

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

module.exports = FieldAttachment;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field.js":14}],12:[function(require,module,exports){
(function (global){
var $     = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Field = require('./field.js');

var FieldText = Field.extend({

	template:  $( '#tmpl-mpb-field-text' ).html(),


	events: {
		'keyup   input': 'inputChanged',
		'change  input': 'inputChanged',
	},

	inputChanged: _.debounce( function(e) {
		if ( e && e.target ) {
			this.setValue( e.target.value );
		}
	} )

} );

module.exports = FieldText;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field.js":14}],13:[function(require,module,exports){
(function (global){
var $     = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Field = require('./field.js');

/**
 * Text Field View
 *
 * You can use this anywhere.
 * Just listen for 'change' event on the view.
 */
var FieldWYSIWYG = Field.extend({

	template:  $( '#tmpl-mpb-field-wysiwyg' ).html(),
	editor: null,
	value: null,

	/**
	 * Init.
	 *
	 * options.value is used to pass initial value.
	 */
	initialize: function( options ) {

		Field.prototype.initialize.apply( this, [ options ] );

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
		this.$el.html( _.template( this.template, { value: this.getValue() } ) );

		// Hide editor to prevent FOUC. Show again on init. See setup.
		$( '.wp-editor-wrap', this.$el ).css( 'display', 'none' );

		// Init. Defferred to make sure container element has been rendered.
		_.defer( this.initTinyMCE.bind( this ) );

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
				self.setValue( e.target.getContent() );
			} );

			// Prevent FOUC. Show element after init.
			this.on( 'init', function() {
				$el.css( 'display', 'block' );
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
		quicktags( tinyMCEPreInit.qtInit[ id ] );
		QTags._buttonsInit();

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

},{"./field.js":14}],14:[function(require,module,exports){
/**
 * Abstract Field Class.
 *
 * Handles setup as well as getting and setting values.
 * Provides a very generic render method - but probably be OK for most simple fields.
 */
var Field = Backbone.View.extend({

	template:      null,
	value:         null,
	config:        {},
	defaultConfig: {},

	/**
	 * Initialize.
	 * If you extend this view - it is reccommeded to call this.
	 *
	 * Expects options.value and options.config.
	 */
	initialize: function( options ) {

		var config;

		_.bindAll( this, 'getValue', 'setValue' );

		if ( 'value' in options ) {
			this.setValue( options.value );
		}

		config = ( 'config' in options ) ? options.config : {};
		this.config = _.extend( this.defaultConfig, config );

	},

	getValue: function() {
		return this.value;
	},

	setValue: function( value ) {

		this.value = value;

		this.trigger( 'change', this.getValue() );

	},

	render: function() {

		var data = {
			id:     this.cid,
			value:  this.value,
			config: this.config
		};

		this.$el.html( _.template( this.template, data ) );
		return this;
	}

} );

module.exports = Field;

},{}],15:[function(require,module,exports){
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

},{"./module-edit.js":21}],16:[function(require,module,exports){
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

},{"./module-edit.js":21}],17:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');
var FieldAttachment = require('./field-attachment.js');

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

		this.imageField = new FieldAttachment( {
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

},{"./field-attachment.js":11,"./module-edit.js":21}],18:[function(require,module,exports){
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

		/**
		 * Destroy the text field when model is removed.
		 */
		this.model.on( 'destroy', function() {
			this.textField.remove();
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

});

module.exports = TextModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field-wysiwyg.js":13,"./module-edit.js":21}],19:[function(require,module,exports){
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

},{"./module-edit.js":21}],20:[function(require,module,exports){
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

},{"./module-edit.js":21}],21:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvc3JjL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9nbG9iYWxzLmpzIiwiYXNzZXRzL2pzL3NyYy9tb2RlbHMvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMiLCJhc3NldHMvanMvc3JjL21vZGVscy9tb2R1bGUuanMiLCJhc3NldHMvanMvc3JjL21vZHVsYXItcGFnZS1idWlsZGVyLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9lZGl0LXZpZXctbWFwLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9tb2R1bGUtZmFjdG9yeS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvZmllbGQtYXR0YWNobWVudC5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvZmllbGQtdGV4dC5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvZmllbGQtd3lzaXd5Zy5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvZmllbGQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWJsb2NrcXVvdGUuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWhlYWRlci5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtaW1hZ2UuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LXRleHQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LXRleHRhcmVhLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC12aWRlby5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGVBdHRyaWJ1dGUgPSByZXF1aXJlKCcuLy4uL21vZGVscy9tb2R1bGUtYXR0cmlidXRlLmpzJyk7XG5cbi8qKlxuICogU2hvcnRjb2RlIEF0dHJpYnV0ZXMgY29sbGVjdGlvbi5cbiAqL1xudmFyIFNob3J0Y29kZUF0dHJpYnV0ZXMgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cblx0bW9kZWwgOiBNb2R1bGVBdHRyaWJ1dGUsXG5cblx0Ly8gRGVlcCBDbG9uZS5cblx0Y2xvbmU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvciggXy5tYXAoIHRoaXMubW9kZWxzLCBmdW5jdGlvbihtKSB7XG5cdFx0XHRyZXR1cm4gbS5jbG9uZSgpO1xuXHRcdH0pKTtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIG9ubHkgdGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBzYXZlZC5cblx0ICpcblx0ICogQHJldHVybiBvYmplY3Rcblx0ICovXG5cdHRvTWljcm9KU09OOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBqc29uID0ge307XG5cblx0XHR0aGlzLmVhY2goIGZ1bmN0aW9uKCBtb2RlbCApIHtcblx0XHRcdGpzb25bIG1vZGVsLmdldCggJ25hbWUnICkgXSA9IG1vZGVsLnRvTWljcm9KU09OKCk7XG5cdFx0fSApO1xuXG5cdFx0cmV0dXJuIGpzb247XG5cdH0sXG5cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2hvcnRjb2RlQXR0cmlidXRlcztcbiIsInZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZSAgID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvbW9kdWxlLmpzJyk7XG5cbi8vIFNob3J0Y29kZSBDb2xsZWN0aW9uXG52YXIgTW9kdWxlcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblxuXHRtb2RlbCA6IE1vZHVsZSxcblxuXHQvLyAgRGVlcCBDbG9uZS5cblx0Y2xvbmUgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoIF8ubWFwKCB0aGlzLm1vZGVscywgZnVuY3Rpb24obSkge1xuXHRcdFx0cmV0dXJuIG0uY2xvbmUoKTtcblx0XHR9KSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybiBvbmx5IHRoZSBkYXRhIHRoYXQgbmVlZHMgdG8gYmUgc2F2ZWQuXG5cdCAqXG5cdCAqIEByZXR1cm4gb2JqZWN0XG5cdCAqL1xuXHR0b01pY3JvSlNPTjogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0cmV0dXJuIHRoaXMubWFwKCBmdW5jdGlvbihtb2RlbCkgeyByZXR1cm4gbW9kZWwudG9NaWNyb0pTT04oIG9wdGlvbnMgKTsgfSApO1xuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGVzO1xuIiwiLy8gRXhwb3NlIHNvbWUgZnVuY3Rpb25hbGl0eSBnbG9iYWxseS5cbnZhciBnbG9iYWxzID0ge1xuXHRCdWlsZGVyOiAgICAgICByZXF1aXJlKCcuL21vZGVscy9idWlsZGVyLmpzJyksXG5cdE1vZHVsZUZhY3Rvcnk6IHJlcXVpcmUoJy4vdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMnKSxcblx0ZWRpdFZpZXdNYXA6ICAgcmVxdWlyZSgnLi91dGlscy9lZGl0LXZpZXctbWFwLmpzJyksXG5cdHZpZXdzOiB7XG5cdFx0QnVpbGRlclZpZXc6ICAgICByZXF1aXJlKCcuL3ZpZXdzL2J1aWxkZXIuanMnKSxcblx0XHRNb2R1bGVFZGl0OiAgICAgIHJlcXVpcmUoJy4vdmlld3MvbW9kdWxlLWVkaXQuanMnKSxcblx0XHRGaWVsZDogICAgICAgICAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGQtYXR0YWNobWVudC5qcycpLFxuXHRcdEZpZWxkQXR0YWNobWVudDogcmVxdWlyZSgnLi92aWV3cy9maWVsZC1hdHRhY2htZW50LmpzJyksXG5cdFx0RmllbGRUZXh0OiAgICAgICByZXF1aXJlKCcuL3ZpZXdzL2ZpZWxkLXRleHQuanMnKSxcblx0XHRGaWVsZFd5c2l3eWc6ICAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGQtd3lzaXd5Zy5qcycpLFxuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdsb2JhbHM7XG4iLCJ2YXIgQmFja2JvbmUgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZXMgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2NvbGxlY3Rpb25zL21vZHVsZXMuanMnKTtcbnZhciBNb2R1bGVGYWN0b3J5ICAgID0gcmVxdWlyZSgnLi8uLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpO1xuXG52YXIgQnVpbGRlciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRzZWxlY3REZWZhdWx0OiAgbW9kdWxhclBhZ2VCdWlsZGVyRGF0YS5sMTBuLnNlbGVjdERlZmF1bHQsXG5cdFx0YWRkTmV3QnV0dG9uOiAgIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEubDEwbi5hZGROZXdCdXR0b24sXG5cdFx0c2VsZWN0aW9uOiAgICAgIFtdLCAvLyBJbnN0YW5jZSBvZiBNb2R1bGVzLiBDYW4ndCB1c2UgYSBkZWZhdWx0LCBvdGhlcndpc2UgdGhleSB3b24ndCBiZSB1bmlxdWUuXG5cdFx0YWxsb3dlZE1vZHVsZXM6IFtdLCAvLyBNb2R1bGUgbmFtZXMgYWxsb3dlZCBmb3IgdGhpcyBidWlsZGVyLlxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gU2V0IGRlZmF1bHQgc2VsZWN0aW9uIHRvIGVuc3VyZSBpdCBpc24ndCBhIHJlZmVyZW5jZS5cblx0XHRpZiAoICEgKCB0aGlzLmdldCgnc2VsZWN0aW9uJykgaW5zdGFuY2VvZiBNb2R1bGVzICkgKSB7XG5cdFx0XHR0aGlzLnNldCggJ3NlbGVjdGlvbicsIG5ldyBNb2R1bGVzKCkgKTtcblx0XHR9XG5cblx0fSxcblxuXHRzZXREYXRhOiBmdW5jdGlvbiggZGF0YSApIHtcblxuXHRcdHZhciBzZWxlY3Rpb247XG5cblx0XHRpZiAoICcnID09PSBkYXRhICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEhhbmRsZSBlaXRoZXIgSlNPTiBzdHJpbmcgb3IgcHJvcGVyIG9iaGVjdC5cblx0XHRkYXRhID0gKCAnc3RyaW5nJyA9PT0gdHlwZW9mIGRhdGEgKSA/IEpTT04ucGFyc2UoIGRhdGEgKSA6IGRhdGE7XG5cblx0XHQvLyBDb252ZXJ0IHNhdmVkIGRhdGEgdG8gTW9kdWxlIG1vZGVscy5cblx0XHRpZiAoIGRhdGEgJiYgQXJyYXkuaXNBcnJheSggZGF0YSApICkge1xuXHRcdFx0c2VsZWN0aW9uID0gZGF0YS5tYXAoIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHRcdHJldHVybiBNb2R1bGVGYWN0b3J5LmNyZWF0ZSggbW9kdWxlLm5hbWUsIG1vZHVsZS5hdHRyICk7XG5cdFx0XHR9ICk7XG5cdFx0fVxuXG5cdFx0Ly8gUmVzZXQgc2VsZWN0aW9uIHVzaW5nIGRhdGEgZnJvbSBoaWRkZW4gaW5wdXQuXG5cdFx0aWYgKCBzZWxlY3Rpb24gJiYgc2VsZWN0aW9uLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuZ2V0KCdzZWxlY3Rpb24nKS5hZGQoIHNlbGVjdGlvbiApO1xuXHRcdH1cblxuXHR9LFxuXG5cdHNhdmVEYXRhOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBkYXRhID0gW107XG5cblx0XHR0aGlzLmdldCgnc2VsZWN0aW9uJykuZWFjaCggZnVuY3Rpb24oIG1vZHVsZSApIHtcblxuXHRcdFx0Ly8gU2tpcCBlbXB0eS9icm9rZW4gbW9kdWxlcy5cblx0XHRcdGlmICggISBtb2R1bGUuZ2V0KCduYW1lJyApICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGRhdGEucHVzaCggbW9kdWxlLnRvTWljcm9KU09OKCkgKTtcblxuXHRcdH0gKTtcblxuXHRcdHRoaXMudHJpZ2dlciggJ3NhdmUnLCBkYXRhICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogTGlzdCBhbGwgYXZhaWxhYmxlIG1vZHVsZXMgZm9yIHRoaXMgYnVpbGRlci5cblx0ICogQWxsIG1vZHVsZXMsIGZpbHRlcmVkIGJ5IHRoaXMuYWxsb3dlZE1vZHVsZXMuXG5cdCAqL1xuXHRnZXRBdmFpbGFibGVNb2R1bGVzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gXy5maWx0ZXIoIE1vZHVsZUZhY3RvcnkuYXZhaWxhYmxlTW9kdWxlcywgZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdHJldHVybiB0aGlzLmlzTW9kdWxlQWxsb3dlZCggbW9kdWxlLm5hbWUgKTtcblx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHR9LFxuXG5cdGlzTW9kdWxlQWxsb3dlZDogZnVuY3Rpb24oIG1vZHVsZU5hbWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCdhbGxvd2VkTW9kdWxlcycpLmluZGV4T2YoIG1vZHVsZU5hbWUgKSA+PSAwO1xuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1aWxkZXI7XG4iLCJ2YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcblxudmFyIE1vZHVsZUF0dHJpYnV0ZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRuYW1lOiAgICAgICAgICcnLFxuXHRcdGxhYmVsOiAgICAgICAgJycsXG5cdFx0dmFsdWU6ICAgICAgICAnJyxcblx0XHR0eXBlOiAgICAgICAgICd0ZXh0Jyxcblx0XHRkZXNjcmlwdGlvbjogICcnLFxuXHRcdGRlZmF1bHRWYWx1ZTogJycsXG5cdFx0Y29uZmlnOiAgICAgICB7fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHIgPSB7fTtcblx0XHR2YXIgYWxsb3dlZEF0dHJQcm9wZXJ0aWVzID0gWyAnbmFtZScsICd2YWx1ZScsICd0eXBlJyBdO1xuXG5cdFx0Xy5lYWNoKCBhbGxvd2VkQXR0clByb3BlcnRpZXMsIGZ1bmN0aW9uKCBwcm9wICkge1xuXHRcdFx0clsgcHJvcCBdID0gdGhpcy5nZXQoIHByb3AgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHJldHVybiByO1xuXG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlQXR0cmlidXRlO1xuIiwidmFyIEJhY2tib25lICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGVBdHRzID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGUtYXR0cmlidXRlcy5qcycpO1xuXG52YXIgTW9kdWxlID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuXHRkZWZhdWx0czoge1xuXHRcdG5hbWU6ICAnJyxcblx0XHRsYWJlbDogJycsXG5cdFx0YXR0cjogIFtdLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gU2V0IGRlZmF1bHQgc2VsZWN0aW9uIHRvIGVuc3VyZSBpdCBpc24ndCBhIHJlZmVyZW5jZS5cblx0XHRpZiAoICEgKCB0aGlzLmdldCgnYXR0cicpIGluc3RhbmNlb2YgTW9kdWxlQXR0cyApICkge1xuXHRcdFx0dGhpcy5zZXQoICdhdHRyJywgbmV3IE1vZHVsZUF0dHMoKSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgYW4gYXR0cmlidXRlIG1vZGVsIGJ5IG5hbWUuXG5cdCAqL1xuXHRnZXRBdHRyOiBmdW5jdGlvbiggYXR0ck5hbWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCdhdHRyJykuZmluZFdoZXJlKCB7IG5hbWU6IGF0dHJOYW1lIH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDdXN0b20gUGFyc2UuXG5cdCAqIEVuc3VyZXMgYXR0cmlidXRlcyBpcyBhbiBpbnN0YW5jZSBvZiBNb2R1bGVBdHRzXG5cdCAqL1xuXHRwYXJzZTogZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXG5cdFx0aWYgKCAnYXR0cicgaW4gcmVzcG9uc2UgJiYgISAoIHJlc3BvbnNlLmF0dHIgaW5zdGFuY2VvZiBNb2R1bGVBdHRzICkgKSB7XG5cdFx0XHRyZXNwb25zZS5hdHRyID0gbmV3IE1vZHVsZUF0dHMoIHJlc3BvbnNlLmF0dHIgKTtcblx0XHR9XG5cblx0ICAgIHJldHVybiByZXNwb25zZTtcblxuXHR9LFxuXG5cdHRvSlNPTjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIganNvbiA9IF8uY2xvbmUoIHRoaXMuYXR0cmlidXRlcyApO1xuXG5cdFx0aWYgKCAnYXR0cicgaW4ganNvbiAmJiAoIGpzb24uYXR0ciBpbnN0YW5jZW9mIE1vZHVsZUF0dHMgKSApIHtcblx0XHRcdGpzb24uYXR0ciA9IGpzb24uYXR0ci50b0pTT04oKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ganNvbjtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRuYW1lOiB0aGlzLmdldCgnbmFtZScpLFxuXHRcdFx0YXR0cjogdGhpcy5nZXQoJ2F0dHInKS50b01pY3JvSlNPTigpXG5cdFx0fTtcblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlO1xuIiwidmFyICQgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEJ1aWxkZXIgICAgICAgPSByZXF1aXJlKCcuL21vZGVscy9idWlsZGVyLmpzJyk7XG52YXIgQnVpbGRlclZpZXcgICA9IHJlcXVpcmUoJy4vdmlld3MvYnVpbGRlci5qcycpO1xudmFyIE1vZHVsZUZhY3RvcnkgPSByZXF1aXJlKCcuL3V0aWxzL21vZHVsZS1mYWN0b3J5LmpzJyk7XG5cbi8vIEV4cG9zZSBzb21lIGZ1bmN0aW9uYWxpdHkgdG8gZ2xvYmFsIG5hbWVzcGFjZS5cbndpbmRvdy5tb2R1bGFyUGFnZUJ1aWxkZXIgPSByZXF1aXJlKCcuL2dsb2JhbHMnKTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuXHRNb2R1bGVGYWN0b3J5LmluaXQoKTtcblxuXHQvLyBBIGZpZWxkIGZvciBzdG9yaW5nIHRoZSBidWlsZGVyIGRhdGEuXG5cdHZhciAkZmllbGQgPSAkKCAnW25hbWU9bW9kdWxhci1wYWdlLWJ1aWxkZXItZGF0YV0nICk7XG5cblx0aWYgKCAhICRmaWVsZC5sZW5ndGggKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gQSBjb250YWluZXIgZWxlbWVudCBmb3IgZGlzcGxheWluZyB0aGUgYnVpbGRlci5cblx0dmFyICRjb250YWluZXIgPSAkKCAnI21vZHVsYXItcGFnZS1idWlsZGVyJyApO1xuXG5cdC8vIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBCdWlsZGVyIG1vZGVsLlxuXHQvLyBQYXNzIGFuIGFycmF5IG9mIG1vZHVsZSBuYW1lcyB0aGF0IGFyZSBhbGxvd2VkIGZvciB0aGlzIGJ1aWxkZXIuXG5cdHZhciBidWlsZGVyID0gbmV3IEJ1aWxkZXIoe1xuXHRcdGFsbG93ZWRNb2R1bGVzOiAkKCAnW25hbWU9bW9kdWxhci1wYWdlLWJ1aWxkZXItYWxsb3dlZC1tb2R1bGVzXScgKS52YWwoKS5zcGxpdCgnLCcpXG5cdH0pO1xuXG5cdC8vIFNldCB0aGUgZGF0YSB1c2luZyB0aGUgY3VycmVudCBmaWVsZCB2YWx1ZVxuXHRidWlsZGVyLnNldERhdGEoIEpTT04ucGFyc2UoICRmaWVsZC52YWwoKSApICk7XG5cblx0Ly8gT24gc2F2ZSwgdXBkYXRlIHRoZSBmaWVsZCB2YWx1ZS5cblx0YnVpbGRlci5vbiggJ3NhdmUnLCBmdW5jdGlvbiggZGF0YSApIHtcblx0XHQkZmllbGQudmFsKCBKU09OLnN0cmluZ2lmeSggZGF0YSApICk7XG5cdH0gKTtcblxuXHQvLyBDcmVhdGUgYnVpbGRlciB2aWV3LlxuXHR2YXIgYnVpbGRlclZpZXcgPSBuZXcgQnVpbGRlclZpZXcoIHsgbW9kZWw6IGJ1aWxkZXIgfSApO1xuXG5cdC8vIFJlbmRlciBidWlsZGVyLlxuXHRidWlsZGVyVmlldy5yZW5kZXIoKS4kZWwuYXBwZW5kVG8oICRjb250YWluZXIgKTtcblxufSk7XG4iLCIvKipcbiAqIE1hcCBtb2R1bGUgdHlwZSB0byB2aWV3cy5cbiAqL1xudmFyIGVkaXRWaWV3TWFwID0ge1xuXHQnaGVhZGVyJzogICAgICAgICAgICAgIHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtaGVhZGVyLmpzJyksXG5cdCd0ZXh0YXJlYSc6ICAgICAgICAgICAgcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC10ZXh0YXJlYS5qcycpLFxuXHQndGV4dCc6ICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtdGV4dC5qcycpLFxuXHQnaW1hZ2UnOiAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtaW1hZ2UuanMnKSxcblx0J3ZpZGVvJzogICAgICAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LXZpZGVvLmpzJyksXG5cdCdibG9ja3F1b3RlJzogICAgICAgICAgcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC1ibG9ja3F1b3RlLmpzJyksXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVkaXRWaWV3TWFwO1xuIiwidmFyIE1vZHVsZSAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL21vZGVscy9tb2R1bGUuanMnKTtcbnZhciBNb2R1bGVBdHRzICAgICAgID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGUtYXR0cmlidXRlcy5qcycpO1xudmFyICQgICAgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG52YXIgTW9kdWxlRmFjdG9yeSA9IHtcblxuXHRhdmFpbGFibGVNb2R1bGVzOiBbXSxcblxuXHRpbml0OiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEgJiYgJ2F2YWlsYWJsZV9tb2R1bGVzJyBpbiBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhICkge1xuXHRcdFx0Xy5lYWNoKCBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhLmF2YWlsYWJsZV9tb2R1bGVzLCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0XHR0aGlzLnJlZ2lzdGVyTW9kdWxlKCBtb2R1bGUgKTtcblx0XHRcdH0uYmluZCggdGhpcyApICk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlZ2lzdGVyTW9kdWxlOiBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdHRoaXMuYXZhaWxhYmxlTW9kdWxlcy5wdXNoKCBtb2R1bGUgKTtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIE1vZHVsZSBNb2RlbC5cblx0ICogVXNlIGRhdGEgZnJvbSBjb25maWcsIHBsdXMgc2F2ZWQgZGF0YS5cblx0ICpcblx0ICogQHBhcmFtICBzdHJpbmcgbW9kdWxlTmFtZVxuXHQgKiBAcGFyYW0gIG9iamVjdCBhdHRyaWJ1dGUgSlNPTi4gU2F2ZWQgYXR0cmlidXRlIHZhbHVlcy5cblx0ICogQHJldHVybiBNb2R1bGVcblx0ICovXG5cdGNyZWF0ZTogZnVuY3Rpb24oIG1vZHVsZU5hbWUsIGF0dHJEYXRhICkge1xuXG5cdFx0dmFyIGRhdGEgPSAkLmV4dGVuZCggdHJ1ZSwge30sIF8uZmluZFdoZXJlKCB0aGlzLmF2YWlsYWJsZU1vZHVsZXMsIHsgbmFtZTogbW9kdWxlTmFtZSB9ICkgKTtcblxuXHRcdGlmICggISBkYXRhICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cblx0XHR2YXIgYXR0cmlidXRlcyA9IG5ldyBNb2R1bGVBdHRzKCk7XG5cblx0XHQvKipcblx0XHQgKiBBZGQgYWxsIHRoZSBtb2R1bGUgYXR0cmlidXRlcy5cblx0XHQgKiBXaGl0ZWxpc3RlZCB0byBhdHRyaWJ1dGVzIGRvY3VtZW50ZWQgaW4gc2NoZW1hXG5cdFx0ICogU2V0cyBvbmx5IHZhbHVlIGZyb20gYXR0ckRhdGEuXG5cdFx0ICovXG5cdFx0Xy5lYWNoKCBkYXRhLmF0dHIsIGZ1bmN0aW9uKCBhdHRyICkge1xuXG5cdFx0XHR2YXIgY2xvbmVBdHRyID0gJC5leHRlbmQoIHRydWUsIHt9LCBhdHRyICApO1xuXHRcdFx0dmFyIHNhdmVkQXR0ciA9IF8uZmluZFdoZXJlKCBhdHRyRGF0YSwgeyBuYW1lOiBhdHRyLm5hbWUgfSApO1xuXG5cdFx0XHQvLyBBZGQgc2F2ZWQgYXR0cmlidXRlIHZhbHVlcy5cblx0XHRcdGlmICggc2F2ZWRBdHRyICYmICd2YWx1ZScgaW4gc2F2ZWRBdHRyICkge1xuXHRcdFx0XHRjbG9uZUF0dHIudmFsdWUgPSBzYXZlZEF0dHIudmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdGF0dHJpYnV0ZXMuYWRkKCBjbG9uZUF0dHIgKTtcblxuXHRcdH0gKTtcblxuXHRcdGRhdGEuYXR0ciA9IGF0dHJpYnV0ZXM7XG5cblx0ICAgIHJldHVybiBuZXcgTW9kdWxlKCBkYXRhICk7XG5cblx0fSxcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGVGYWN0b3J5O1xuIiwidmFyIEJhY2tib25lICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBCdWlsZGVyICAgICAgID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvYnVpbGRlci5qcycpO1xudmFyIGVkaXRWaWV3TWFwICAgPSByZXF1aXJlKCcuLy4uL3V0aWxzL2VkaXQtdmlldy1tYXAuanMnKTtcbnZhciBNb2R1bGVGYWN0b3J5ID0gcmVxdWlyZSgnLi8uLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpO1xudmFyICQgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG52YXIgQnVpbGRlciA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJCgnI3RtcGwtbXBiLWJ1aWxkZXInICkuaHRtbCgpLFxuXHRjbGFzc05hbWU6ICdtb2R1bGFyLXBhZ2UtYnVpbGRlcicsXG5cdG1vZGVsOiBudWxsLFxuXHRuZXdNb2R1bGVOYW1lOiBudWxsLFxuXG5cdGV2ZW50czoge1xuXHRcdCdjaGFuZ2UgPiAuYWRkLW5ldyAuYWRkLW5ldy1tb2R1bGUtc2VsZWN0JzogJ3RvZ2dsZUJ1dHRvblN0YXR1cycsXG5cdFx0J2NsaWNrID4gLmFkZC1uZXcgLmFkZC1uZXctbW9kdWxlLWJ1dHRvbic6ICdhZGRNb2R1bGUnLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMubW9kZWwuZ2V0KCdzZWxlY3Rpb24nKTtcblxuXHRcdHNlbGVjdGlvbi5vbiggJ2FkZCcsIHRoaXMuYWRkTmV3U2VsZWN0aW9uSXRlbVZpZXcsIHRoaXMgKTtcblx0XHRzZWxlY3Rpb24ub24oICdhbGwnLCB0aGlzLm1vZGVsLnNhdmVEYXRhLCB0aGlzLm1vZGVsICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGRhdGEgPSB0aGlzLm1vZGVsLnRvSlNPTigpO1xuXG5cdFx0dGhpcy4kZWwuaHRtbCggXy50ZW1wbGF0ZSggdGhpcy50ZW1wbGF0ZSwgZGF0YSAgKSApO1xuXG5cdFx0dGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpLmVhY2goIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHR0aGlzLmFkZE5ld1NlbGVjdGlvbkl0ZW1WaWV3KCBtb2R1bGUgKTtcblx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXG5cdFx0dGhpcy5yZW5kZXJBZGROZXcoKTtcblx0XHR0aGlzLmluaXRTb3J0YWJsZSgpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHQvKipcblx0ICogUmVuZGVyIHRoZSBBZGQgTmV3IG1vZHVsZSBjb250cm9scy5cblx0ICovXG5cdHJlbmRlckFkZE5ldzogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgJHNlbGVjdCA9IHRoaXMuJGVsLmZpbmQoICc+IC5hZGQtbmV3IHNlbGVjdC5hZGQtbmV3LW1vZHVsZS1zZWxlY3QnICk7XG5cblx0XHQkc2VsZWN0LmFwcGVuZChcblx0XHRcdCQoICc8b3B0aW9uLz4nLCB7IHRleHQ6IG1vZHVsYXJQYWdlQnVpbGRlckRhdGEubDEwbi5zZWxlY3REZWZhdWx0IH0gKVxuXHRcdCk7XG5cblx0XHRfLmVhY2goIHRoaXMubW9kZWwuZ2V0QXZhaWxhYmxlTW9kdWxlcygpLCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0dmFyIHRlbXBsYXRlID0gJzxvcHRpb24gdmFsdWU9XCI8JT0gbmFtZSAlPlwiPjwlPSBsYWJlbCAlPjwvb3B0aW9uPic7XG5cdFx0XHQkc2VsZWN0LmFwcGVuZCggXy50ZW1wbGF0ZSggdGVtcGxhdGUsIG1vZHVsZSApICk7XG5cdFx0fSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgU29ydGFibGUuXG5cdCAqL1xuXHRpbml0U29ydGFibGU6IGZ1bmN0aW9uKCkge1xuXHRcdCQoICc+IC5zZWxlY3Rpb24nLCB0aGlzLiRlbCApLnNvcnRhYmxlKHtcblx0XHRcdGhhbmRsZTogJy5tb2R1bGUtZWRpdC10b29scycsXG5cdFx0XHRpdGVtczogJz4gLm1vZHVsZS1lZGl0Jyxcblx0XHRcdHN0b3A6IHRoaXMudXBkYXRlU2VsZWN0aW9uT3JkZXIuYmluZCggdGhpcyApLFxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTb3J0YWJsZSBlbmQgY2FsbGJhY2suXG5cdCAqIEFmdGVyIHJlb3JkZXJpbmcsIHVwZGF0ZSB0aGUgc2VsZWN0aW9uIG9yZGVyLlxuXHQgKiBOb3RlIC0gdXNlcyBkaXJlY3QgbWFuaXB1bGF0aW9uIG9mIGNvbGxlY3Rpb24gbW9kZWxzIHByb3BlcnR5LlxuXHQgKiBUaGlzIGlzIHRvIGF2b2lkIGhhdmluZyB0byBtZXNzIGFib3V0IHdpdGggdGhlIHZpZXdzIHRoZW1zZWx2ZXMuXG5cdCAqL1xuXHR1cGRhdGVTZWxlY3Rpb25PcmRlcjogZnVuY3Rpb24oIGUsIHVpICkge1xuXG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMubW9kZWwuZ2V0KCdzZWxlY3Rpb24nKTtcblx0XHR2YXIgaXRlbSAgICAgID0gc2VsZWN0aW9uLmdldCh7IGNpZDogdWkuaXRlbS5hdHRyKCAnZGF0YS1jaWQnKSB9KTtcblx0XHR2YXIgbmV3SW5kZXggID0gdWkuaXRlbS5pbmRleCgpO1xuXHRcdHZhciBvbGRJbmRleCAgPSBzZWxlY3Rpb24uaW5kZXhPZiggaXRlbSApO1xuXG5cdFx0aWYgKCBuZXdJbmRleCAhPT0gb2xkSW5kZXggKSB7XG5cdFx0XHR2YXIgZHJvcHBlZCA9IHNlbGVjdGlvbi5tb2RlbHMuc3BsaWNlKCBvbGRJbmRleCwgMSApO1xuXHRcdFx0c2VsZWN0aW9uLm1vZGVscy5zcGxpY2UoIG5ld0luZGV4LCAwLCBkcm9wcGVkWzBdICk7XG5cdFx0XHR0aGlzLm1vZGVsLnNhdmVEYXRhKCk7XG5cdFx0fVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIFRvZ2dsZSBidXR0b24gc3RhdHVzLlxuXHQgKiBFbmFibGUvRGlzYWJsZSBidXR0b24gZGVwZW5kaW5nIG9uIHdoZXRoZXJcblx0ICogcGxhY2Vob2xkZXIgb3IgdmFsaWQgbW9kdWxlIGlzIHNlbGVjdGVkLlxuXHQgKi9cblx0dG9nZ2xlQnV0dG9uU3RhdHVzOiBmdW5jdGlvbihlKSB7XG5cdFx0dmFyIHZhbHVlICAgICAgICAgPSAkKGUudGFyZ2V0KS52YWwoKTtcblx0XHR2YXIgZGVmYXVsdE9wdGlvbiA9ICQoZS50YXJnZXQpLmNoaWxkcmVuKCkuZmlyc3QoKS5hdHRyKCd2YWx1ZScpO1xuXHRcdCQoJy5hZGQtbmV3LW1vZHVsZS1idXR0b24nLCB0aGlzLiRlbCApLmF0dHIoICdkaXNhYmxlZCcsIHZhbHVlID09PSBkZWZhdWx0T3B0aW9uICk7XG5cdFx0dGhpcy5uZXdNb2R1bGVOYW1lID0gKCB2YWx1ZSAhPT0gZGVmYXVsdE9wdGlvbiApID8gdmFsdWUgOiBudWxsO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgYWRkaW5nIG1vZHVsZS5cblx0ICpcblx0ICogRmluZCBtb2R1bGUgbW9kZWwuIENsb25lIGl0LiBBZGQgdG8gc2VsZWN0aW9uLlxuXHQgKi9cblx0YWRkTW9kdWxlOiBmdW5jdGlvbihlKSB7XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRpZiAoIHRoaXMubmV3TW9kdWxlTmFtZSAmJiB0aGlzLm1vZGVsLmlzTW9kdWxlQWxsb3dlZCggdGhpcy5uZXdNb2R1bGVOYW1lICkgKSB7XG5cdFx0XHR2YXIgbW9kZWwgPSBNb2R1bGVGYWN0b3J5LmNyZWF0ZSggdGhpcy5uZXdNb2R1bGVOYW1lICk7XG5cdFx0XHR0aGlzLm1vZGVsLmdldCgnc2VsZWN0aW9uJykuYWRkKCBtb2RlbCApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBBcHBlbmQgbmV3IHNlbGVjdGlvbiBpdGVtIHZpZXcuXG5cdCAqL1xuXHRhZGROZXdTZWxlY3Rpb25JdGVtVmlldzogZnVuY3Rpb24oIGl0ZW0gKSB7XG5cblx0XHR2YXIgZWRpdFZpZXcsIHZpZXc7XG5cblx0XHRlZGl0VmlldyA9ICggaXRlbS5nZXQoJ25hbWUnKSBpbiBlZGl0Vmlld01hcCApID8gZWRpdFZpZXdNYXBbIGl0ZW0uZ2V0KCduYW1lJykgXSA6IG51bGw7XG5cblx0XHRpZiAoICEgZWRpdFZpZXcgfHwgISB0aGlzLm1vZGVsLmlzTW9kdWxlQWxsb3dlZCggaXRlbS5nZXQoJ25hbWUnKSApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZpZXcgPSBuZXcgZWRpdFZpZXcoIHsgbW9kZWw6IGl0ZW0gfSApO1xuXG5cdFx0JCggJz4gLnNlbGVjdGlvbicsIHRoaXMuJGVsICkuYXBwZW5kKCB2aWV3LnJlbmRlcigpLiRlbCApO1xuXG5cdFx0dmFyICRzZWxlY3Rpb24gPSAkKCAnPiAuc2VsZWN0aW9uJywgdGhpcy4kZWwgKTtcblx0XHRpZiAoICRzZWxlY3Rpb24uaGFzQ2xhc3MoJ3VpLXNvcnRhYmxlJykgKSB7XG5cdFx0XHQkc2VsZWN0aW9uLnNvcnRhYmxlKCdyZWZyZXNoJyk7XG5cdFx0fVxuXG5cblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQnVpbGRlcjtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxuLyoqXG4gKiBJbWFnZSBGaWVsZFxuICpcbiAqIEluaXRpYWxpemUgYW5kIGxpc3RlbiBmb3IgdGhlICdjaGFuZ2UnIGV2ZW50IHRvIGdldCB1cGRhdGVkIGRhdGEuXG4gKlxuICovXG52YXIgRmllbGRBdHRhY2htZW50ID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogICQoICcjdG1wbC1tcGItZmllbGQtYXR0YWNobWVudCcgKS5odG1sKCksXG5cdGZyYW1lOiAgICAgbnVsbCxcblx0dmFsdWU6ICAgICBbXSwgLy8gQXR0YWNobWVudCBJRHMuXG5cdHNlbGVjdGlvbjoge30sIC8vIEF0dGFjaG1lbnRzIGNvbGxlY3Rpb24gZm9yIHRoaXMudmFsdWUuXG5cblx0Y29uZmlnOiAgICB7fSxcblx0ZGVmYXVsdENvbmZpZzoge1xuXHRcdG11bHRpcGxlOiBmYWxzZSxcblx0XHRsaWJyYXJ5OiB7IHR5cGU6ICdpbWFnZScgfSxcblx0XHRidXR0b25fdGV4dDogJ1NlbGVjdCBJbWFnZScsXG5cdH0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIC5pbWFnZS1wbGFjZWhvbGRlciAuYnV0dG9uLmFkZCc6ICdlZGl0SW1hZ2UnLFxuXHRcdCdjbGljayAuaW1hZ2UtcGxhY2Vob2xkZXIgaW1nJzogJ2VkaXRJbWFnZScsXG5cdFx0J2NsaWNrIC5pbWFnZS1wbGFjZWhvbGRlciAuYnV0dG9uLnJlbW92ZSc6ICdyZW1vdmVJbWFnZScsXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUuXG5cdCAqXG5cdCAqIFBhc3MgdmFsdWUgYW5kIGNvbmZpZyBhcyBwcm9wZXJ0aWVzIG9uIHRoZSBvcHRpb25zIG9iamVjdC5cblx0ICogQXZhaWxhYmxlIG9wdGlvbnNcblx0ICogLSBtdWx0aXBsZTogYm9vbFxuXHQgKiAtIHNpemVSZXE6IGVnIHsgd2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDAgfVxuXHQgKlxuXHQgKiBAcGFyYW0gIG9iamVjdCBvcHRpb25zXG5cdCAqIEByZXR1cm4gbnVsbFxuXHQgKi9cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cblx0XHQvLyBDYWxsIGRlZmF1bHQgaW5pdGlhbGl6ZS5cblx0XHRGaWVsZC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBvcHRpb25zIF0gKTtcblxuXHRcdF8uYmluZEFsbCggdGhpcywgJ3JlbmRlcicsICdlZGl0SW1hZ2UnLCAnb25TZWxlY3RJbWFnZScsICdyZW1vdmVJbWFnZScsICdpc0F0dGFjaG1lbnRTaXplT2snICk7XG5cblx0XHR0aGlzLm9uKCAnY2hhbmdlJywgdGhpcy5yZW5kZXIgKTtcblxuXHRcdHRoaXMuaW5pdFNlbGVjdGlvbigpO1xuXG5cdH0sXG5cblx0c2V0VmFsdWU6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblxuXHRcdC8vIEVuc3VyZSB2YWx1ZSBpcyBhcnJheS5cblx0XHRpZiAoICEgdmFsdWUgfHwgISBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXHRcdFx0dmFsdWUgPSBbXTtcblx0XHR9XG5cblx0XHRGaWVsZC5wcm90b3R5cGUuc2V0VmFsdWUuYXBwbHkoIHRoaXMsIFsgdmFsdWUgXSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgU2VsZWN0aW9uLlxuXHQgKlxuXHQgKiBTZWxlY3Rpb24gaXMgYW4gQXR0YWNobWVudCBjb2xsZWN0aW9uIGNvbnRhaW5pbmcgZnVsbCBtb2RlbHMgZm9yIHRoZSBjdXJyZW50IHZhbHVlLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG51bGxcblx0ICovXG5cdGluaXRTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5zZWxlY3Rpb24gPSBuZXcgd3AubWVkaWEubW9kZWwuQXR0YWNobWVudHMoKTtcblxuXHRcdC8vIEluaXRpYWxpemUgc2VsZWN0aW9uLlxuXHRcdF8uZWFjaCggdGhpcy5nZXRWYWx1ZSgpLCBmdW5jdGlvbiggaXRlbSApIHtcblxuXHRcdFx0dmFyIG1vZGVsO1xuXG5cdFx0XHQvLyBMZWdhY3kuIEhhbmRsZSBzdG9yaW5nIGZ1bGwgb2JqZWN0cy5cblx0XHRcdGl0ZW0gID0gKCAnb2JqZWN0JyA9PT0gdHlwZW9mKCBpdGVtICkgKSA/IGl0ZW0uaWQgOiBpdGVtO1xuXHRcdFx0bW9kZWwgPSBuZXcgd3AubWVkaWEuYXR0YWNobWVudCggaXRlbSApO1xuXG5cdFx0XHR0aGlzLnNlbGVjdGlvbi5hZGQoIG1vZGVsICk7XG5cblx0XHRcdC8vIFJlLXJlbmRlciBhZnRlciBhdHRhY2htZW50cyBoYXZlIHN5bmNlZC5cblx0XHRcdG1vZGVsLmZldGNoKCk7XG5cdFx0XHRtb2RlbC5vbiggJ3N5bmMnLCB0aGlzLnJlbmRlciApO1xuXG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHRlbXBsYXRlO1xuXG5cdFx0dGVtcGxhdGUgPSBfLm1lbW9pemUoIGZ1bmN0aW9uKCB2YWx1ZSwgY29uZmlnICkge1xuXHRcdFx0cmV0dXJuIF8udGVtcGxhdGUoIHRoaXMudGVtcGxhdGUsIHtcblx0XHRcdFx0dmFsdWU6IHZhbHVlLFxuXHRcdFx0XHRjb25maWc6IGNvbmZpZyxcblx0XHRcdH0gKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHRoaXMuJGVsLmh0bWwoIHRlbXBsYXRlKCB0aGlzLnNlbGVjdGlvbi50b0pTT04oKSwgdGhpcy5jb25maWcgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlIHRoZSBzZWxlY3QgZXZlbnQuXG5cdCAqXG5cdCAqIEluc2VydCBhbiBpbWFnZSBvciBtdWx0aXBsZSBpbWFnZXMuXG5cdCAqL1xuXHRvblNlbGVjdEltYWdlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBmcmFtZSA9IHRoaXMuZnJhbWUgfHwgbnVsbDtcblxuXHRcdGlmICggISBmcmFtZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnNlbGVjdGlvbi5yZXNldChbXSk7XG5cblx0XHRmcmFtZS5zdGF0ZSgpLmdldCgnc2VsZWN0aW9uJykuZWFjaCggZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cblx0XHRcdGlmICggdGhpcy5pc0F0dGFjaG1lbnRTaXplT2soIGF0dGFjaG1lbnQgKSApIHtcblx0XHRcdFx0dGhpcy5zZWxlY3Rpb24uYWRkKCBhdHRhY2htZW50ICk7XG5cdFx0XHR9XG5cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuc2VsZWN0aW9uLnBsdWNrKCdpZCcpICk7XG5cblx0XHRmcmFtZS5jbG9zZSgpO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZSB0aGUgZWRpdCBhY3Rpb24uXG5cdCAqL1xuXHRlZGl0SW1hZ2U6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciBmcmFtZSA9IHRoaXMuZnJhbWU7XG5cblx0XHRpZiAoICEgZnJhbWUgKSB7XG5cblx0XHRcdHZhciBmcmFtZUFyZ3MgPSB7XG5cdFx0XHRcdGxpYnJhcnk6IHRoaXMuY29uZmlnLmxpYnJhcnksXG5cdFx0XHRcdG11bHRpcGxlOiB0aGlzLmNvbmZpZy5tdWx0aXBsZSxcblx0XHRcdFx0dGl0bGU6ICdTZWxlY3QgSW1hZ2UnLFxuXHRcdFx0XHRmcmFtZTogJ3NlbGVjdCcsXG5cdFx0XHR9O1xuXG5cdFx0XHRmcmFtZSA9IHRoaXMuZnJhbWUgPSB3cC5tZWRpYSggZnJhbWVBcmdzICk7XG5cblx0XHRcdGZyYW1lLm9uKCAnY29udGVudDpjcmVhdGU6YnJvd3NlJywgdGhpcy5zZXR1cEZpbHRlcnMsIHRoaXMgKTtcblx0XHRcdGZyYW1lLm9uKCAnY29udGVudDpyZW5kZXI6YnJvd3NlJywgdGhpcy5zaXplRmlsdGVyTm90aWNlLCB0aGlzICk7XG5cdFx0XHRmcmFtZS5vbiggJ3NlbGVjdCcsIHRoaXMub25TZWxlY3RJbWFnZSwgdGhpcyApO1xuXG5cdFx0fVxuXG5cdFx0Ly8gV2hlbiB0aGUgZnJhbWUgb3BlbnMsIHNldCB0aGUgc2VsZWN0aW9uLlxuXHRcdGZyYW1lLm9uKCAnb3BlbicsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgc2VsZWN0aW9uID0gZnJhbWUuc3RhdGUoKS5nZXQoJ3NlbGVjdGlvbicpO1xuXG5cdFx0XHQvLyBTZXQgdGhlIHNlbGVjdGlvbi5cblx0XHRcdC8vIE5vdGUgLSBleHBlY3RzIGFycmF5IG9mIG9iamVjdHMsIG5vdCBhIGNvbGxlY3Rpb24uXG5cdFx0XHRzZWxlY3Rpb24uc2V0KCB0aGlzLnNlbGVjdGlvbi5tb2RlbHMgKTtcblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0ZnJhbWUub3BlbigpO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEFkZCBmaWx0ZXJzIHRvIHRoZSBmcmFtZSBsaWJyYXJ5IGNvbGxlY3Rpb24uXG5cdCAqXG5cdCAqICAtIGZpbHRlciB0byBsaW1pdCB0byByZXF1aXJlZCBzaXplLlxuXHQgKi9cblx0c2V0dXBGaWx0ZXJzOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBsaWIgICAgPSB0aGlzLmZyYW1lLnN0YXRlKCkuZ2V0KCdsaWJyYXJ5Jyk7XG5cblx0XHRpZiAoICdzaXplUmVxJyBpbiB0aGlzLmNvbmZpZyApIHtcblx0XHRcdGxpYi5maWx0ZXJzLnNpemUgPSB0aGlzLmlzQXR0YWNobWVudFNpemVPaztcblx0XHR9XG5cblx0fSxcblxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgZGlzcGxheSBvZiBzaXplIGZpbHRlciBub3RpY2UuXG5cdCAqL1xuXHRzaXplRmlsdGVyTm90aWNlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBsaWIgPSB0aGlzLmZyYW1lLnN0YXRlKCkuZ2V0KCdsaWJyYXJ5Jyk7XG5cblx0XHRpZiAoICEgbGliLmZpbHRlcnMuc2l6ZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBXYWl0IHRvIGJlIHN1cmUgdGhlIGZyYW1lIGlzIHJlbmRlcmVkLlxuXHRcdHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHJlcSwgJG5vdGljZSwgdGVtcGxhdGUsICR0b29sYmFyO1xuXG5cdFx0XHRyZXEgPSBfLmV4dGVuZCgge1xuXHRcdFx0XHR3aWR0aDogMCxcblx0XHRcdFx0aGVpZ2h0OiAwLFxuXHRcdFx0fSwgdGhpcy5jb25maWcuc2l6ZVJlcSApO1xuXG5cdFx0XHQvLyBEaXNwbGF5IG5vdGljZSBvbiBtYWluIGdyaWQgdmlldy5cblx0XHRcdHRlbXBsYXRlID0gJzxwIGNsYXNzPVwiZmlsdGVyLW5vdGljZVwiPk9ubHkgc2hvd2luZyBpbWFnZXMgdGhhdCBtZWV0IHNpemUgcmVxdWlyZW1lbnRzOiA8JT0gd2lkdGggJT5weCAmdGltZXM7IDwlPSBoZWlnaHQgJT5weDwvcD4nO1xuXHRcdFx0JG5vdGljZSAgPSAkKCBfLnRlbXBsYXRlKCB0ZW1wbGF0ZSwgcmVxICkgKTtcblx0XHRcdCR0b29sYmFyID0gJCggJy5hdHRhY2htZW50cy1icm93c2VyIC5tZWRpYS10b29sYmFyJywgdGhpcy5mcmFtZS4kZWwgKS5maXJzdCgpO1xuXHRcdFx0JHRvb2xiYXIucHJlcGVuZCggJG5vdGljZSApO1xuXG5cdFx0XHR2YXIgY29udGVudFZpZXcgPSB0aGlzLmZyYW1lLnZpZXdzLmdldCggJy5tZWRpYS1mcmFtZS1jb250ZW50JyApO1xuXHRcdFx0Y29udGVudFZpZXcgPSBjb250ZW50Vmlld1swXTtcblxuXHRcdFx0JG5vdGljZSA9ICQoICc8cCBjbGFzcz1cImZpbHRlci1ub3RpY2VcIj5JbWFnZSBkb2VzIG5vdCBtZWV0IHNpemUgcmVxdWlyZW1lbnRzLjwvcD4nICk7XG5cblx0XHRcdC8vIERpc3BsYXkgYWRkaXRpb25hbCBub3RpY2Ugd2hlbiBzZWxlY3RpbmcgYW4gaW1hZ2UuXG5cdFx0XHQvLyBSZXF1aXJlZCB0byBpbmRpY2F0ZSBhIGJhZCBpbWFnZSBoYXMganVzdCBiZWVuIHVwbG9hZGVkLlxuXHRcdFx0Y29udGVudFZpZXcub3B0aW9ucy5zZWxlY3Rpb24ub24oICdzZWxlY3Rpb246c2luZ2xlJywgZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dmFyIGF0dGFjaG1lbnQgPSBjb250ZW50Vmlldy5vcHRpb25zLnNlbGVjdGlvbi5zaW5nbGUoKTtcblxuXHRcdFx0XHR2YXIgZGlzcGxheU5vdGljZSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdFx0Ly8gSWYgc3RpbGwgdXBsb2FkaW5nLCB3YWl0IGFuZCB0cnkgZGlzcGxheWluZyBub3RpY2UgYWdhaW4uXG5cdFx0XHRcdFx0aWYgKCBhdHRhY2htZW50LmdldCggJ3VwbG9hZGluZycgKSApIHtcblx0XHRcdFx0XHRcdHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0ZGlzcGxheU5vdGljZSgpO1xuXHRcdFx0XHRcdFx0fSwgNTAwICk7XG5cblx0XHRcdFx0XHQvLyBPSy4gRGlzcGxheSBub3RpY2UgYXMgcmVxdWlyZWQuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0aWYgKCAhIHRoaXMuaXNBdHRhY2htZW50U2l6ZU9rKCBhdHRhY2htZW50ICkgKSB7XG5cdFx0XHRcdFx0XHRcdCQoICcuYXR0YWNobWVudHMtYnJvd3NlciAuYXR0YWNobWVudC1pbmZvJyApLnByZXBlbmQoICRub3RpY2UgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdCRub3RpY2UucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fS5iaW5kKHRoaXMpO1xuXG5cdFx0XHRcdGRpc3BsYXlOb3RpY2UoKTtcblxuXHRcdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHR9LmJpbmQodGhpcyksIDEwMCAgKTtcblxuXHR9LFxuXG5cdHJlbW92ZUltYWdlOiBmdW5jdGlvbihlKSB7XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR2YXIgJHRhcmdldCwgaWQ7XG5cblx0XHQkdGFyZ2V0ID0gJChlLnRhcmdldCk7XG5cdFx0JHRhcmdldCA9ICggJHRhcmdldC5wcm9wKCd0YWdOYW1lJykgPT09ICdCVVRUT04nICkgPyAkdGFyZ2V0IDogJHRhcmdldC5jbG9zZXN0KCdidXR0b24ucmVtb3ZlJyk7XG5cdFx0aWQgICAgICA9ICR0YXJnZXQuZGF0YSggJ2ltYWdlLWlkJyApO1xuXG5cdFx0aWYgKCAhIGlkICApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnNlbGVjdGlvbi5yZW1vdmUoIHRoaXMuc2VsZWN0aW9uLndoZXJlKCB7IGlkOiBpZCB9ICkgKTtcblx0XHR0aGlzLnNldFZhbHVlKCB0aGlzLnNlbGVjdGlvbi5wbHVjaygnaWQnKSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIERvZXMgYXR0YWNobWVudCBtZWV0IHNpemUgcmVxdWlyZW1lbnRzP1xuXHQgKlxuXHQgKiBAcGFyYW0gIEF0dGFjaG1lbnRcblx0ICogQHJldHVybiBib29sZWFuXG5cdCAqL1xuXHRpc0F0dGFjaG1lbnRTaXplT2s6IGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXG5cdFx0aWYgKCAhICggJ3NpemVSZXEnIGluIHRoaXMuY29uZmlnICkgKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHR0aGlzLmNvbmZpZy5zaXplUmVxID0gXy5leHRlbmQoIHtcblx0XHRcdHdpZHRoOiAwLFxuXHRcdFx0aGVpZ2h0OiAwLFxuXHRcdH0sIHRoaXMuY29uZmlnLnNpemVSZXEgKTtcblxuXHRcdHZhciB3aWR0aFJlcSAgPSBhdHRhY2htZW50LmdldCgnd2lkdGgnKSAgPj0gdGhpcy5jb25maWcuc2l6ZVJlcS53aWR0aDtcblx0XHR2YXIgaGVpZ2h0UmVxID0gYXR0YWNobWVudC5nZXQoJ2hlaWdodCcpID49IHRoaXMuY29uZmlnLnNpemVSZXEuaGVpZ2h0O1xuXG5cdFx0cmV0dXJuIHdpZHRoUmVxICYmIGhlaWdodFJlcTtcblxuXHR9XG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZEF0dGFjaG1lbnQ7XG4iLCJ2YXIgJCAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG52YXIgRmllbGRUZXh0ID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogICQoICcjdG1wbC1tcGItZmllbGQtdGV4dCcgKS5odG1sKCksXG5cblxuXHRldmVudHM6IHtcblx0XHQna2V5dXAgICBpbnB1dCc6ICdpbnB1dENoYW5nZWQnLFxuXHRcdCdjaGFuZ2UgIGlucHV0JzogJ2lucHV0Q2hhbmdlZCcsXG5cdH0sXG5cblx0aW5wdXRDaGFuZ2VkOiBfLmRlYm91bmNlKCBmdW5jdGlvbihlKSB7XG5cdFx0aWYgKCBlICYmIGUudGFyZ2V0ICkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggZS50YXJnZXQudmFsdWUgKTtcblx0XHR9XG5cdH0gKVxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRUZXh0O1xuIiwidmFyICQgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxuLyoqXG4gKiBUZXh0IEZpZWxkIFZpZXdcbiAqXG4gKiBZb3UgY2FuIHVzZSB0aGlzIGFueXdoZXJlLlxuICogSnVzdCBsaXN0ZW4gZm9yICdjaGFuZ2UnIGV2ZW50IG9uIHRoZSB2aWV3LlxuICovXG52YXIgRmllbGRXWVNJV1lHID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogICQoICcjdG1wbC1tcGItZmllbGQtd3lzaXd5ZycgKS5odG1sKCksXG5cdGVkaXRvcjogbnVsbCxcblx0dmFsdWU6IG51bGwsXG5cblx0LyoqXG5cdCAqIEluaXQuXG5cdCAqXG5cdCAqIG9wdGlvbnMudmFsdWUgaXMgdXNlZCB0byBwYXNzIGluaXRpYWwgdmFsdWUuXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblxuXHRcdEZpZWxkLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIG9wdGlvbnMgXSApO1xuXG5cdFx0Ly8gQSBmZXcgaGVscGVycy5cblx0XHR0aGlzLmVkaXRvciA9IHtcblx0XHRcdGlkICAgICAgICAgICA6ICdtcGItdGV4dC1ib2R5LScgKyB0aGlzLmNpZCxcblx0XHRcdG5hbWVSZWdleCAgICA6IG5ldyBSZWdFeHAoICdtcGItcGxhY2Vob2xkZXItbmFtZScsICdnJyApLFxuXHRcdFx0aWRSZWdleCAgICAgIDogbmV3IFJlZ0V4cCggJ21wYi1wbGFjZWhvbGRlci1pZCcsICdnJyApLFxuXHRcdFx0Y29udGVudFJlZ2V4IDogbmV3IFJlZ0V4cCggJ21wYi1wbGFjZWhvbGRlci1jb250ZW50JywgJ2cnICksXG5cdFx0fTtcblxuXHRcdC8vIFRoZSB0ZW1wbGF0ZSBwcm92aWRlZCBpcyBnZW5lcmljIG1hcmt1cCB1c2VkIGJ5IFRpbnlNQ0UuXG5cdFx0Ly8gV2UgbmVlZCBhIHRlbXBsYXRlIHVuaXF1ZSB0byB0aGlzIHZpZXcuXG5cdFx0dGhpcy50ZW1wbGF0ZSAgPSB0aGlzLnRlbXBsYXRlLnJlcGxhY2UoIHRoaXMuZWRpdG9yLm5hbWVSZWdleCwgdGhpcy5lZGl0b3IuaWQgKTtcblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IuaWRSZWdleCwgdGhpcy5lZGl0b3IuaWQgKTtcblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IuY29udGVudFJlZ2V4LCAnPCU9IHZhbHVlICU+JyApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cblx0XHQvLyBDcmVhdGUgZWxlbWVudCBmcm9tIHRlbXBsYXRlLlxuXHRcdHRoaXMuJGVsLmh0bWwoIF8udGVtcGxhdGUoIHRoaXMudGVtcGxhdGUsIHsgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKSB9ICkgKTtcblxuXHRcdC8vIEhpZGUgZWRpdG9yIHRvIHByZXZlbnQgRk9VQy4gU2hvdyBhZ2FpbiBvbiBpbml0LiBTZWUgc2V0dXAuXG5cdFx0JCggJy53cC1lZGl0b3Itd3JhcCcsIHRoaXMuJGVsICkuY3NzKCAnZGlzcGxheScsICdub25lJyApO1xuXG5cdFx0Ly8gSW5pdC4gRGVmZmVycmVkIHRvIG1ha2Ugc3VyZSBjb250YWluZXIgZWxlbWVudCBoYXMgYmVlbiByZW5kZXJlZC5cblx0XHRfLmRlZmVyKCB0aGlzLmluaXRUaW55TUNFLmJpbmQoIHRoaXMgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZSB0aGUgVGlueU1DRSBlZGl0b3IuXG5cdCAqXG5cdCAqIEJpdCBoYWNreSB0aGlzLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG51bGwuXG5cdCAqL1xuXHRpbml0VGlueU1DRTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgc2VsZiA9IHRoaXMsIGlkLCBlZCwgJGVsLCBwcm9wO1xuXG5cdFx0aWQgID0gdGhpcy5lZGl0b3IuaWQ7XG5cdFx0ZWQgID0gdGlueU1DRS5nZXQoIGlkICk7XG5cdFx0JGVsID0gJCggJyN3cC0nICsgaWQgKyAnLXdyYXAnLCB0aGlzLiRlbCApO1xuXG5cdFx0aWYgKCBlZCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBHZXQgc2V0dGluZ3MgZm9yIHRoaXMgZmllbGQuXG5cdFx0Ly8gSWYgbm8gc2V0dGluZ3MgZm9yIHRoaXMgZmllbGQuIENsb25lIGZyb20gcGxhY2Vob2xkZXIuXG5cdFx0aWYgKCB0eXBlb2YoIHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0gKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHR2YXIgbmV3U2V0dGluZ3MgPSBqUXVlcnkuZXh0ZW5kKCB7fSwgdGlueU1DRVByZUluaXQubWNlSW5pdFsgJ21wYi1wbGFjZWhvbGRlci1pZCcgXSApO1xuXHRcdFx0Zm9yICggcHJvcCBpbiBuZXdTZXR0aW5ncyApIHtcblx0XHRcdFx0aWYgKCAnc3RyaW5nJyA9PT0gdHlwZW9mKCBuZXdTZXR0aW5nc1twcm9wXSApICkge1xuXHRcdFx0XHRcdG5ld1NldHRpbmdzW3Byb3BdID0gbmV3U2V0dGluZ3NbcHJvcF0ucmVwbGFjZSggdGhpcy5lZGl0b3IuaWRSZWdleCwgaWQgKS5yZXBsYWNlKCB0aGlzLmVkaXRvci5uYW1lUmVnZXgsIG5hbWUgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGlueU1DRVByZUluaXQubWNlSW5pdFsgaWQgXSA9IG5ld1NldHRpbmdzO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBmdWxsc2NyZWVuIHBsdWdpbi5cblx0XHR0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdLnBsdWdpbnMgPSB0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdLnBsdWdpbnMucmVwbGFjZSggJ2Z1bGxzY3JlZW4sJywgJycgKTtcblxuXHRcdC8vIEdldCBxdWlja3RhZyBzZXR0aW5ncyBmb3IgdGhpcyBmaWVsZC5cblx0XHQvLyBJZiBub25lIGV4aXN0cyBmb3IgdGhpcyBmaWVsZC4gQ2xvbmUgZnJvbSBwbGFjZWhvbGRlci5cblx0XHRpZiAoIHR5cGVvZiggdGlueU1DRVByZUluaXQucXRJbml0WyBpZCBdICkgPT09ICd1bmRlZmluZWQnICkge1xuXHRcdFx0dmFyIG5ld1FUUyA9IGpRdWVyeS5leHRlbmQoIHt9LCB0aW55TUNFUHJlSW5pdC5xdEluaXRbICdtcGItcGxhY2Vob2xkZXItaWQnIF0gKTtcblx0XHRcdGZvciAoIHByb3AgaW4gbmV3UVRTICkge1xuXHRcdFx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YoIG5ld1FUU1twcm9wXSApICkge1xuXHRcdFx0XHRcdG5ld1FUU1twcm9wXSA9IG5ld1FUU1twcm9wXS5yZXBsYWNlKCB0aGlzLmVkaXRvci5pZFJlZ2V4LCBpZCApLnJlcGxhY2UoIHRoaXMuZWRpdG9yLm5hbWVSZWdleCwgbmFtZSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gPSBuZXdRVFM7XG5cdFx0fVxuXG5cdFx0Ly8gV2hlbiBlZGl0b3IgaW5pdHMsIGF0dGFjaCBzYXZlIGNhbGxiYWNrIHRvIGNoYW5nZSBldmVudC5cblx0XHR0aW55TUNFUHJlSW5pdC5tY2VJbml0W2lkXS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdHNlbGYuc2V0VmFsdWUoIGUudGFyZ2V0LmdldENvbnRlbnQoKSApO1xuXHRcdFx0fSApO1xuXG5cdFx0XHQvLyBQcmV2ZW50IEZPVUMuIFNob3cgZWxlbWVudCBhZnRlciBpbml0LlxuXHRcdFx0dGhpcy5vbiggJ2luaXQnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JGVsLmNzcyggJ2Rpc3BsYXknLCAnYmxvY2snICk7XG5cdFx0XHR9KTtcblxuXHRcdH07XG5cblx0XHQvLyBDdXJyZW50IG1vZGUgZGV0ZXJtaW5lZCBieSBjbGFzcyBvbiBlbGVtZW50LlxuXHRcdC8vIElmIG1vZGUgaXMgdmlzdWFsLCBjcmVhdGUgdGhlIHRpbnlNQ0UuXG5cdFx0aWYgKCAkZWwuaGFzQ2xhc3MoJ3RtY2UtYWN0aXZlJykgKSB7XG5cdFx0XHR0aW55TUNFLmluaXQoIHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbaWRdICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRlbC5jc3MoICdkaXNwbGF5JywgJ2Jsb2NrJyApO1xuXHRcdH1cblxuXHRcdC8vIEluaXQgcXVpY2t0YWdzLlxuXHRcdHF1aWNrdGFncyggdGlueU1DRVByZUluaXQucXRJbml0WyBpZCBdICk7XG5cdFx0UVRhZ3MuX2J1dHRvbnNJbml0KCk7XG5cblx0XHQvLyBIYW5kbGUgdGVtcG9yYXJ5IHJlbW92YWwgb2YgdGlueU1DRSB3aGVuIHNvcnRpbmcuXG5cdFx0dGhpcy4kZWwuY2xvc2VzdCgnLnVpLXNvcnRhYmxlJykub24oICdzb3J0c3RhcnQnLCBmdW5jdGlvbiggZXZlbnQsIHVpICkge1xuXHRcdFx0aWYgKCB1aS5pdGVtWzBdLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSA9PT0gdGhpcy5lbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2lkJykgKSB7XG5cdFx0XHRcdHRpbnlNQ0UuZXhlY0NvbW1hbmQoICdtY2VSZW1vdmVFZGl0b3InLCBmYWxzZSwgaWQgKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdC8vIEhhbmRsZSByZS1pbml0IGFmdGVyIHNvcnRpbmcuXG5cdFx0dGhpcy4kZWwuY2xvc2VzdCgnLnVpLXNvcnRhYmxlJykub24oICdzb3J0c3RvcCcsIGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG5cdFx0XHRpZiAoIHVpLml0ZW1bMF0uZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpID09PSB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSApIHtcblx0XHRcdFx0dGlueU1DRS5leGVjQ29tbWFuZCgnbWNlQWRkRWRpdG9yJywgZmFsc2UsIGlkKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHR9LFxuXG5cdHJlbW92ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGlueU1DRS5leGVjQ29tbWFuZCggJ21jZVJlbW92ZUVkaXRvcicsIGZhbHNlLCB0aGlzLmVkaXRvci5pZCApO1xuXHR9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRXWVNJV1lHO1xuIiwiLyoqXG4gKiBBYnN0cmFjdCBGaWVsZCBDbGFzcy5cbiAqXG4gKiBIYW5kbGVzIHNldHVwIGFzIHdlbGwgYXMgZ2V0dGluZyBhbmQgc2V0dGluZyB2YWx1ZXMuXG4gKiBQcm92aWRlcyBhIHZlcnkgZ2VuZXJpYyByZW5kZXIgbWV0aG9kIC0gYnV0IHByb2JhYmx5IGJlIE9LIGZvciBtb3N0IHNpbXBsZSBmaWVsZHMuXG4gKi9cbnZhciBGaWVsZCA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogICAgICBudWxsLFxuXHR2YWx1ZTogICAgICAgICBudWxsLFxuXHRjb25maWc6ICAgICAgICB7fSxcblx0ZGVmYXVsdENvbmZpZzoge30sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUuXG5cdCAqIElmIHlvdSBleHRlbmQgdGhpcyB2aWV3IC0gaXQgaXMgcmVjY29tbWVkZWQgdG8gY2FsbCB0aGlzLlxuXHQgKlxuXHQgKiBFeHBlY3RzIG9wdGlvbnMudmFsdWUgYW5kIG9wdGlvbnMuY29uZmlnLlxuXHQgKi9cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cblx0XHR2YXIgY29uZmlnO1xuXG5cdFx0Xy5iaW5kQWxsKCB0aGlzLCAnZ2V0VmFsdWUnLCAnc2V0VmFsdWUnICk7XG5cblx0XHRpZiAoICd2YWx1ZScgaW4gb3B0aW9ucyApIHtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIG9wdGlvbnMudmFsdWUgKTtcblx0XHR9XG5cblx0XHRjb25maWcgPSAoICdjb25maWcnIGluIG9wdGlvbnMgKSA/IG9wdGlvbnMuY29uZmlnIDoge307XG5cdFx0dGhpcy5jb25maWcgPSBfLmV4dGVuZCggdGhpcy5kZWZhdWx0Q29uZmlnLCBjb25maWcgKTtcblxuXHR9LFxuXG5cdGdldFZhbHVlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy52YWx1ZTtcblx0fSxcblxuXHRzZXRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXG5cdFx0dGhpcy52YWx1ZSA9IHZhbHVlO1xuXG5cdFx0dGhpcy50cmlnZ2VyKCAnY2hhbmdlJywgdGhpcy5nZXRWYWx1ZSgpICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRpZDogICAgIHRoaXMuY2lkLFxuXHRcdFx0dmFsdWU6ICB0aGlzLnZhbHVlLFxuXHRcdFx0Y29uZmlnOiB0aGlzLmNvbmZpZ1xuXHRcdH07XG5cblx0XHR0aGlzLiRlbC5odG1sKCBfLnRlbXBsYXRlKCB0aGlzLnRlbXBsYXRlLCBkYXRhICkgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGQ7XG4iLCJ2YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdCA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcblxuLyoqXG4gKiBIaWdobGlnaHQgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUsXG4gKiBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgSGlnaGxpZ2h0TW9kdWxlRWRpdFZpZXcgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cdHRlbXBsYXRlOiAkKCAnI3RtcGwtbXBiLW1vZHVsZS1lZGl0LWJsb2NrcXVvdGUnICkuaHRtbCgpLFxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSGlnaGxpZ2h0TW9kdWxlRWRpdFZpZXc7XG4iLCJ2YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdCA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcblxuLyoqXG4gKiBIZWFkZXIgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUgd2l0aCBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgSGVhZGVyTW9kdWxlRWRpdFZpZXcgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cdHRlbXBsYXRlOiAkKCAnI3RtcGwtbXBiLW1vZHVsZS1lZGl0LWhlYWRlcicgKS5odG1sKCksXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xudmFyIEZpZWxkQXR0YWNobWVudCA9IHJlcXVpcmUoJy4vZmllbGQtYXR0YWNobWVudC5qcycpO1xuXG4vKipcbiAqIEhpZ2hsaWdodCBNb2R1bGUuXG4gKiBFeHRlbmRzIGRlZmF1bHQgbW91ZHVsZSxcbiAqIGN1c3RvbSBkaWZmZXJlbnQgdGVtcGxhdGUuXG4gKi9cbnZhciBJbWFnZU1vZHVsZUVkaXRWaWV3ID0gTW9kdWxlRWRpdC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAkKCAnI3RtcGwtbXBiLW1vZHVsZS1lZGl0LWltYWdlJyApLmh0bWwoKSxcblx0aW1hZ2VGaWVsZDogbnVsbCxcblx0aW1hZ2VBdHRyOiBudWxsLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBhdHRyaWJ1dGVzLCBvcHRpb25zIF0gKTtcblxuXHRcdHRoaXMuaW1hZ2VBdHRyID0gdGhpcy5tb2RlbC5nZXRBdHRyKCdpbWFnZScpO1xuXG5cdFx0dmFyIGNvbmZpZyA9IHRoaXMuaW1hZ2VBdHRyLmdldCgnY29uZmlnJykgfHwge307XG5cblx0XHRjb25maWcgPSBfLmV4dGVuZCgge1xuXHRcdFx0bXVsdGlwbGU6IGZhbHNlLFxuXHRcdH0sIGNvbmZpZyApO1xuXG5cdFx0dGhpcy5pbWFnZUZpZWxkID0gbmV3IEZpZWxkQXR0YWNobWVudCgge1xuXHRcdFx0dmFsdWU6IHRoaXMuaW1hZ2VBdHRyLmdldCgndmFsdWUnKSxcblx0XHRcdGNvbmZpZzogY29uZmlnLFxuXHRcdH0gKTtcblxuXHRcdHRoaXMuaW1hZ2VGaWVsZC5vbiggJ2NoYW5nZScsIGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0dGhpcy5pbWFnZUF0dHIuc2V0KCAndmFsdWUnLCBkYXRhICk7XG5cdFx0XHR0aGlzLm1vZGVsLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLm1vZGVsICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzICk7XG5cblx0XHQkKCAnLmltYWdlLWZpZWxkJywgdGhpcy4kZWwgKS5hcHBlbmQoXG5cdFx0XHR0aGlzLmltYWdlRmllbGQucmVuZGVyKCkuJGVsXG5cdFx0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlTW9kdWxlRWRpdFZpZXc7XG4iLCJ2YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdCA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcbnZhciBGaWVsZFRleHQgID0gcmVxdWlyZSgnLi9maWVsZC13eXNpd3lnLmpzJyk7XG5cbnZhciBUZXh0TW9kdWxlRWRpdFZpZXcgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICQoICcjdG1wbC1tcGItbW9kdWxlLWVkaXQtdGV4dCcgKS5odG1sKCksXG5cdHRleHRGaWVsZDogbnVsbCxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggYXR0cmlidXRlcywgb3B0aW9ucyApIHtcblxuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgYXR0cmlidXRlcywgb3B0aW9ucyBdICk7XG5cblx0XHQvLyBJbml0aWFsaXplIG91ciB0ZXh0ZmllbGQgc3Vidmlldy5cblx0XHR0aGlzLnRleHRGaWVsZCA9IG5ldyBGaWVsZFRleHQoIHtcblx0XHRcdHZhbHVlOiB0aGlzLm1vZGVsLmdldEF0dHIoJ2JvZHknKS5nZXQoJ3ZhbHVlJyksXG5cdFx0fSApO1xuXG5cdFx0Ly8gTGlzdGVuIGZvciBjaGFuZ2UgZXZlbnQgaW4gc3VidmlldyBhbmQgdXBkYXRlIGN1cnJlbnQgdmFsdWUuXG5cdFx0Ly8gTm90ZSBtYW51YWwgY2hhbmdlIGV2ZW50IHRyaWdnZXIgdG8gZW5zdXJlIGV2ZXJ5dGhpbmcgaXMgdXBkYXRlZC5cblx0XHR0aGlzLnRleHRGaWVsZC5vbiggJ2NoYW5nZScsIGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0dGhpcy5tb2RlbC5nZXRBdHRyKCdib2R5Jykuc2V0KCAndmFsdWUnLCBkYXRhICk7XG5cdFx0XHR0aGlzLm1vZGVsLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLm1vZGVsICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHQvKipcblx0XHQgKiBEZXN0cm95IHRoZSB0ZXh0IGZpZWxkIHdoZW4gbW9kZWwgaXMgcmVtb3ZlZC5cblx0XHQgKi9cblx0XHR0aGlzLm1vZGVsLm9uKCAnZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy50ZXh0RmllbGQucmVtb3ZlKCk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gQ2FsbCBkZWZhdWx0IE1vZHVsZUVkZWl0IHJlbmRlci5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMgKTtcblxuXHRcdC8vIFJlbmRlciBhbmQgaW5zZXJ0IHRleHRGaWVsZCB2aWV3LlxuXHRcdCQoICcudGV4dC1maWVsZCcsIHRoaXMuJGVsICkuYXBwZW5kKFxuXHRcdFx0dGhpcy50ZXh0RmllbGQucmVuZGVyKCkuJGVsXG5cdFx0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRleHRNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xuXG4vKipcbiAqIEhlYWRlciBNb2R1bGUuXG4gKiBFeHRlbmRzIGRlZmF1bHQgbW91ZHVsZSB3aXRoIGN1c3RvbSBkaWZmZXJlbnQgdGVtcGxhdGUuXG4gKi9cbnZhciBIZWFkZXJNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblx0dGVtcGxhdGU6ICQoICcjdG1wbC1tcGItbW9kdWxlLWVkaXQtdGV4dGFyZWEnICkuaHRtbCgpLFxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyTW9kdWxlRWRpdFZpZXc7XG4iLCJ2YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdCA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcblxuLyoqXG4gKiBIaWdobGlnaHQgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUsXG4gKiBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgSGlnaGxpZ2h0TW9kdWxlRWRpdFZpZXcgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cdHRlbXBsYXRlOiAkKCAnI3RtcGwtbXBiLW1vZHVsZS1lZGl0LXZpZGVvJyApLmh0bWwoKSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhpZ2hsaWdodE1vZHVsZUVkaXRWaWV3O1xuIiwidmFyIEJhY2tib25lICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxudmFyIE1vZHVsZUVkaXQgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0Y2xhc3NOYW1lOiAgICAgJ21vZHVsZS1lZGl0Jyxcblx0dG9vbHNUZW1wbGF0ZTogJCgnI3RtcGwtbXBiLW1vZHVsZS1lZGl0LXRvb2xzJyApLmh0bWwoKSxcblxuXHRldmVudHM6IHtcblx0XHQnY2hhbmdlICpbZGF0YS1tb2R1bGUtYXR0ci1uYW1lXSc6ICdhdHRyRmllbGRDaGFuZ2VkJyxcblx0XHQna2V5dXAgICpbZGF0YS1tb2R1bGUtYXR0ci1uYW1lXSc6ICdhdHRyRmllbGRDaGFuZ2VkJyxcblx0XHQnaW5wdXQgICpbZGF0YS1tb2R1bGUtYXR0ci1uYW1lXSc6ICdhdHRyRmllbGRDaGFuZ2VkJyxcblx0XHQnY2xpY2sgIC5idXR0b24tc2VsZWN0aW9uLWl0ZW0tcmVtb3ZlJzogJ3JlbW92ZU1vZGVsJyxcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRfLmJpbmRBbGwoIHRoaXMsICdhdHRyRmllbGRDaGFuZ2VkJywgJ3JlbW92ZU1vZGVsJywgJ3NldEF0dHInICk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBkYXRhICA9IHRoaXMubW9kZWwudG9KU09OKCk7XG5cdFx0ZGF0YS5hdHRyID0ge307XG5cblx0XHQvLyBGb3JtYXQgYXR0cmlidXRlIGFycmF5IGZvciBlYXN5IHRlbXBsYXRpbmcuXG5cdFx0Ly8gQmVjYXVzZSBhdHRyaWJ1dGVzIGluICBhcnJheSBpcyBkaWZmaWN1bHQgdG8gYWNjZXNzLlxuXHRcdHRoaXMubW9kZWwuZ2V0KCdhdHRyJykuZWFjaCggZnVuY3Rpb24oIGF0dHIgKSB7XG5cdFx0XHRkYXRhLmF0dHJbIGF0dHIuZ2V0KCduYW1lJykgXSA9IGF0dHIudG9KU09OKCk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kZWwuaHRtbCggXy50ZW1wbGF0ZSggdGhpcy50ZW1wbGF0ZSwgZGF0YSApICk7XG5cblx0XHR0aGlzLmluaXRpYWxpemVDb2xvcnBpY2tlcigpO1xuXG5cdFx0Ly8gSUQgYXR0cmlidXRlLCBzbyB3ZSBjYW4gY29ubmVjdCB0aGUgdmlldyBhbmQgbW9kZWwgYWdhaW4gbGF0ZXIuXG5cdFx0dGhpcy4kZWwuYXR0ciggJ2RhdGEtY2lkJywgdGhpcy5tb2RlbC5jaWQgKTtcblxuXHRcdC8vIEFwcGVuZCB0aGUgbW9kdWxlIHRvb2xzLlxuXHRcdHRoaXMuJGVsLnByZXBlbmQoIF8udGVtcGxhdGUoIHRoaXMudG9vbHNUZW1wbGF0ZSwgZGF0YSApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdGluaXRpYWxpemVDb2xvcnBpY2tlcjogZnVuY3Rpb24oKSB7XG5cdFx0JCgnLm1wYi1jb2xvci1waWNrZXInLCB0aGlzLiRlbCApLndwQ29sb3JQaWNrZXIoe1xuXHRcdCAgICBwYWxldHRlczogWycjZWQwMDgyJywgJyNlNjBjMjknLCcjZmY1NTE5JywnI2ZmYmYwMCcsJyM5NmNjMjknLCcjMTRjMDRkJywnIzE2ZDVkOScsJyMwMDljZjMnLCcjMTQzZmNjJywnIzYxMTRjYycsJyMzMzMzMzMnXSxcblx0XHRcdGNoYW5nZTogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblx0XHRcdFx0JCh0aGlzKS5hdHRyKCAndmFsdWUnLCB1aS5jb2xvci50b1N0cmluZygpICk7XG5cdFx0XHRcdCQodGhpcykudHJpZ2dlciggJ2NoYW5nZScgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRzZXRBdHRyOiBmdW5jdGlvbiggYXR0cmlidXRlLCB2YWx1ZSApIHtcblxuXHRcdHZhciBhdHRyID0gdGhpcy5tb2RlbC5nZXQoICdhdHRyJyApLmZpbmRXaGVyZSggeyBuYW1lOiBhdHRyaWJ1dGUgfSApO1xuXG5cdFx0aWYgKCBhdHRyICkge1xuXHRcdFx0YXR0ci5zZXQoICd2YWx1ZScsIHZhbHVlICk7XG5cdFx0XHR0aGlzLm1vZGVsLnRyaWdnZXIoJ2NoYW5nZTphdHRyJyk7XG5cdFx0fVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIENoYW5nZSBldmVudCBoYW5kbGVyLlxuXHQgKiBVcGRhdGUgYXR0cmlidXRlIGZvbGxvd2luZyB2YWx1ZSBjaGFuZ2UuXG5cdCAqL1xuXHRhdHRyRmllbGRDaGFuZ2VkOiBmdW5jdGlvbihlKSB7XG5cblx0XHR2YXIgYXR0ciA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSggJ2RhdGEtbW9kdWxlLWF0dHItbmFtZScgKTtcblxuICAgICAgICBpZiAoIGUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSggJ2NvbnRlbnRlZGl0YWJsZScgKSApIHtcbiAgICAgICAgXHR0aGlzLnNldEF0dHIoIGF0dHIsICQoZS50YXJnZXQpLmh0bWwoKSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICBcdHRoaXMuc2V0QXR0ciggYXR0ciwgZS50YXJnZXQudmFsdWUgKTtcbiAgICAgICAgfVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlbW92ZSBtb2RlbCBoYW5kbGVyLlxuXHQgKi9cblx0cmVtb3ZlTW9kZWw6IGZ1bmN0aW9uKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dGhpcy5yZW1vdmUoKTtcblx0XHR0aGlzLm1vZGVsLmRlc3Ryb3koKTtcblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlRWRpdDtcbiJdfQ==
