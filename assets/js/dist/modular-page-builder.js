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
		Field:           require('./views/fields/field.js'),
		FieldLink:       require('./views/fields/field-link.js'),
		FieldAttachment: require('./views/fields/field-attachment.js'),
		FieldText:       require('./views/fields/field-text.js'),
		FieldTextarea:   require('./views/fields/field-textarea.js'),
		FieldWysiwyg:    require('./views/fields/field-wysiwyg.js'),
		FieldPostSelect: require('./views/fields/field-post-select.js'),
	}
};

module.exports = globals;

},{"./models/builder.js":4,"./utils/edit-view-map.js":8,"./utils/module-factory.js":9,"./views/builder.js":10,"./views/fields/field-attachment.js":11,"./views/fields/field-link.js":13,"./views/fields/field-post-select.js":14,"./views/fields/field-text.js":15,"./views/fields/field-textarea.js":16,"./views/fields/field-wysiwyg.js":17,"./views/fields/field.js":18,"./views/module-edit.js":23}],4:[function(require,module,exports){
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
	 * Helper for getting an attribute model by name.
	 */
	getAttr: function( attrName ) {
		return this.get('attr').findWhere( { name: attrName });
	},

	/**
	 * Helper for setting an attribute value
	 *
	 * Note manual change event trigger to ensure everything is updated.
	 *
	 * @param string attribute
	 * @param mixed  value
	 */
	setAttrValue: function( attribute, value ) {

		var attr = this.getAttr( attribute );

		if ( attr ) {
			attr.set( 'value', value );
			this.trigger( 'change', this.model );
		}

	},

	/**
	 * Helper for getting an attribute value.
	 *
	 * Defaults to null.
	 *
	 * @param string attribute
	 */
	getAttrValue: function( attribute ) {

		var attr = this.getAttr( attribute );

		if ( attr ) {
			return attr.get( 'value' );
		}

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
	'text':                require('./../views/module-edit-text.js'),
	'image':               require('./../views/module-edit-image.js'),
	'blockquote':          require('./../views/module-edit-blockquote.js'),
};

module.exports = editViewMap;

},{"./../views/module-edit-blockquote.js":19,"./../views/module-edit-header.js":20,"./../views/module-edit-image.js":21,"./../views/module-edit-text.js":22}],9:[function(require,module,exports){
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

},{"./field.js":18}],12:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Field = require('./field.js');

var FieldContentEditable = Field.extend({

	template:  $( '#tmpl-mpb-field-content-editable' ).html(),

	events: {
		'keyup  .content-editable-field': 'inputChanged',
		'change .content-editable-field': 'inputChanged',
	},

	inputChanged: _.debounce( function(e) {
		if ( e && e.target ) {
        	this.setValue( $(e.target).html() );
        }
	} ),

} );

module.exports = FieldContentEditable;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field.js":18}],13:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Field = require('./field.js');

var FieldLink = Field.extend({

	template:  $( '#tmpl-mpb-field-link' ).html(),

	events: {
		'keyup   input.field-text': 'textInputChanged',
		'change  input.field-text': 'textInputChanged',
		'keyup   input.field-link': 'linkInputChanged',
		'change  input.field-link': 'linkInputChanged',
	},

	textInputChanged: _.debounce( function(e) {
		if ( e && e.target ) {
			var value = this.getValue();
			value.text = e.target.value;
			this.setValue( value );
		}
	} ),

	linkInputChanged: _.debounce( function(e) {
		if ( e && e.target ) {
			var value = this.getValue();
			value.link = e.target.value;
			this.setValue( value );
		}
	} ),

});

module.exports = FieldLink;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field.js":18}],14:[function(require,module,exports){
(function (global){
/* global ajaxurl */

var $     = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Field = require('./field.js');

/**
 * Text Field View
 *
 * You can use this anywhere.
 * Just listen for 'change' event on the view.
 */
var FieldPostSelect = Field.extend({

	template:  $( '#tmpl-mpb-field-text' ).html(),
	value: [],
	multiple: true,

	defaultConfig: {
		multiple: true,
	},

	events: {
		'change input.select2': 'inputChanged'
	},

	/**
	 * Init.
	 *
	 * options.value is used to pass initial value.
	 */
	initialize: function( options ) {
		Field.prototype.initialize.apply( this, [ options ] );
	},

	render: function () {

		var data = {
			id: this.cid,
			value: '',
			config: {}
		};

		// Create element from template.
		this.$el.html( _.template( this.template, data ) );

		this.initSelect2();

		return this;

	},

	setValue: function( value ) {

		if ( this.multiple && ! Array.isArray( value ) ) {
			value = [ value ];
		} else if ( ! this.multiple && Array.isArray( value ) ) {
			value = value[0];
		}

		Field.prototype.setValue.apply( this, [ value ] );

	},

	getValue: function() {

		var value = this.value;

		if ( this.multiple && ! Array.isArray( value ) ) {
			value = [ value ];
		} else if ( ! this.multiple && Array.isArray( value ) ) {
			value = value[0];
		}

		return value;

	},

	initSelect2: function() {

		var $field = $( '#' + this.cid, this.$el );

		var formatRequest =function ( term, page ) {
			return {
				action: 'mce_get_posts',
				s: term,
				page: page
			};
		};

		var parseResults = function ( response ) {
			return {
				results: response.results,
				more: response.more
			};
		};

		var initSelection = function( el, callback ) {

			var value = this.getValue().join(',');

			if ( value.length ) {
				$.get( ajaxurl, {
					action: 'mce_get_posts',
					post__in: value,
				} ).done( function( data ) {
					callback( parseResults( data ).results );
				} );
			}

		}.bind(this);

		$field.select2({
			minimumInputLength: 1,
			multiple: this.config.multiple,
			initSelection: initSelection,
			ajax: {
				url: ajaxurl,
				dataType: 'json',
			    delay: 250,
			    cache: false,
				data: formatRequest,
				results: parseResults,
			}
		});

	},

	inputChanged: function() {

		var value = $( 'input.select2', this.$el ).val();

		if ( this.config.multiple ) {
			value = value.split( ',' ).map( Number );
		} else {
			value = parseInt( value );
		}

		this.setValue( value );

	},

	remove: function() {
	},

} );

module.exports = FieldPostSelect;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field.js":18}],15:[function(require,module,exports){
(function (global){
var $     = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Field = require('./field.js');

var FieldText = Field.extend({

	template:  $( '#tmpl-mpb-field-text' ).html(),

	defaultConfig: {
		classes: 'regular-text',
		placeholder: null,
	},

	events: {
		'keyup   input': 'inputChanged',
		'change  input': 'inputChanged',
	},

	inputChanged: _.debounce( function(e) {
		if ( e && e.target ) {
			this.setValue( e.target.value );
		}
	} ),

} );

module.exports = FieldText;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field.js":18}],16:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var FieldText = require('./field-text.js');

var FieldTextarea = FieldText.extend({

	template:  $( '#tmpl-mpb-field-textarea' ).html(),

	events: {
		'keyup  textarea': 'inputChanged',
		'change textarea': 'inputChanged',
	},

} );

module.exports = FieldTextarea;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field-text.js":15}],17:[function(require,module,exports){
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

},{"./field.js":18}],18:[function(require,module,exports){
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

		// If a change callback is provided, call this on change.
		if ( 'onChange' in options ) {
			this.on( 'change', options.onChange );
		}

		config = ( 'config' in options ) ? options.config : {};
		this.config = _.extend( {}, this.defaultConfig, config );

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

},{}],19:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');
var FieldText = require('./fields/field-text.js');
var FieldContentEditable = require('./fields/field-content-editable.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var HighlightModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-mpb-module-edit-blockquote' ).html(),

	fields: {
		text: null,
		source: null,
	},

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		this.fields.text = new FieldContentEditable( {
			value: this.model.getAttr('text').get('value'),
		} );

		this.fields.text.on( 'change', function( value ) {
			this.model.setAttrValue( 'text', value );
		}.bind(this) );

		this.fields.source = new FieldText( {
			value: this.model.getAttr('source').get('value'),
		} );

		this.fields.source.on( 'change', function( value ) {
			this.model.setAttrValue( 'source', value );
		}.bind(this) );

	},

	render: function() {

		ModuleEdit.prototype.render.apply( this );

		$( '.field-text', this.$el ).append( this.fields.text.render().$el );
		$( '.field-source', this.$el ).append( this.fields.source.render().$el );

		return this;

	},

});

module.exports = HighlightModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./fields/field-content-editable.js":12,"./fields/field-text.js":15,"./module-edit.js":23}],20:[function(require,module,exports){
(function (global){
var $             = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit    = require('./module-edit.js');
var FieldText     = require('./fields/field-text.js');
var FieldTextarea = require('./fields/field-textarea.js');

/**
 * Header Module.
 * Extends default moudule with custom different template.
 */
var HeaderModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-mpb-module-edit-header' ).html(),

	fields: {
		heading: null,
		subheading: null,
	},

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		this.fields.heading = new FieldText( {
			value: this.model.getAttr('heading').get('value'),
		} );

		this.fields.heading.on( 'change', function( value ) {
			this.model.setAttrValue( 'heading', value );
		}.bind(this) );

		this.fields.subheading = new FieldTextarea( {
			value: this.model.getAttr('subheading').get('value'),
		} );

		this.fields.subheading.on( 'change', function( value ) {
			this.model.setAttrValue( 'subheading', value );
		}.bind(this) );

	},

	render: function() {
		ModuleEdit.prototype.render.apply( this );
		$( '.field-heading', this.$el ).append( this.fields.heading.render().$el );
		$( '.field-subheading', this.$el ).append( this.fields.subheading.render().$el );
		return this;
	},

});

module.exports = HeaderModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./fields/field-text.js":15,"./fields/field-textarea.js":16,"./module-edit.js":23}],21:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');
var FieldAttachment = require('./fields/field-attachment.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var ImageModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-mpb-module-edit-image' ).html(),

	fields: {
		image: null
	},

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		this.imageAttr = this.model.getAttr('image');

		var config = this.imageAttr.get('config') || {};

		config = _.extend( {
			multiple: false,
		}, config );

		this.fields.image = new FieldAttachment( {
			value: this.imageAttr.get('value'),
			config: config,
		} );

		this.fields.image.on( 'change', function( data ) {
			this.model.setAttrValue( 'image', data );
		}.bind(this) );

	},

	render: function() {

		ModuleEdit.prototype.render.apply( this );

		$( '.image-field', this.$el ).append(
			this.fields.image.render().$el
		);

		return this;

	},

});

module.exports = ImageModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./fields/field-attachment.js":11,"./module-edit.js":23}],22:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');
var FieldText  = require('./fields/field-wysiwyg.js');

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
		this.textField.on( 'change', function( value ) {
			this.model.setAttrValue( 'body', value );
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

},{"./fields/field-wysiwyg.js":17,"./module-edit.js":23}],23:[function(require,module,exports){
(function (global){
var Backbone   = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

/**
 * Very generic form view handler.
 * This does some basic magic based on data attributes to update simple text fields.
 */
var ModuleEdit = Backbone.View.extend({

	className:     'module-edit',
	toolsTemplate: $('#tmpl-mpb-module-edit-tools' ).html(),

	initialize: function() {
		_.bindAll( this, 'removeModel' );
	},

	events: {
		'click .button-selection-item-remove': 'removeModel',
	},

	render: function() {

		var data  = this.model.toJSON();
		data.attr = {};

		// Format attribute array for easy templating.
		// Because attributes in an array is difficult to access.
		this.model.get('attr').each( function( attr ) {
			data.attr[ attr.get('name') ] = attr.toJSON();
		} );

		this.$el.html( _.template( this.template, data ) );

		// ID attribute, so we can connect the view and model again later.
		this.$el.attr( 'data-cid', this.model.cid );

		// Append the module tools.
		this.$el.prepend( _.template( this.toolsTemplate, data ) );

		return this;

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvc3JjL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9nbG9iYWxzLmpzIiwiYXNzZXRzL2pzL3NyYy9tb2RlbHMvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMiLCJhc3NldHMvanMvc3JjL21vZGVscy9tb2R1bGUuanMiLCJhc3NldHMvanMvc3JjL21vZHVsYXItcGFnZS1idWlsZGVyLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9lZGl0LXZpZXctbWFwLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9tb2R1bGUtZmFjdG9yeS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvZmllbGRzL2ZpZWxkLWF0dGFjaG1lbnQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1jb250ZW50LWVkaXRhYmxlLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtbGluay5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvZmllbGRzL2ZpZWxkLXBvc3Qtc2VsZWN0LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtdGV4dC5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvZmllbGRzL2ZpZWxkLXRleHRhcmVhLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtd3lzaXd5Zy5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvZmllbGRzL2ZpZWxkLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC1ibG9ja3F1b3RlLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC1oZWFkZXIuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWltYWdlLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC10ZXh0LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3RUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZUF0dHJpYnV0ZSA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMnKTtcblxuLyoqXG4gKiBTaG9ydGNvZGUgQXR0cmlidXRlcyBjb2xsZWN0aW9uLlxuICovXG52YXIgU2hvcnRjb2RlQXR0cmlidXRlcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblxuXHRtb2RlbCA6IE1vZHVsZUF0dHJpYnV0ZSxcblxuXHQvLyBEZWVwIENsb25lLlxuXHRjbG9uZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCBfLm1hcCggdGhpcy5tb2RlbHMsIGZ1bmN0aW9uKG0pIHtcblx0XHRcdHJldHVybiBtLmNsb25lKCk7XG5cdFx0fSkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGpzb24gPSB7fTtcblxuXHRcdHRoaXMuZWFjaCggZnVuY3Rpb24oIG1vZGVsICkge1xuXHRcdFx0anNvblsgbW9kZWwuZ2V0KCAnbmFtZScgKSBdID0gbW9kZWwudG9NaWNyb0pTT04oKTtcblx0XHR9ICk7XG5cblx0XHRyZXR1cm4ganNvbjtcblx0fSxcblxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaG9ydGNvZGVBdHRyaWJ1dGVzO1xuIiwidmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgTW9kdWxlICAgPSByZXF1aXJlKCcuLy4uL21vZGVscy9tb2R1bGUuanMnKTtcblxuLy8gU2hvcnRjb2RlIENvbGxlY3Rpb25cbnZhciBNb2R1bGVzID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXG5cdG1vZGVsIDogTW9kdWxlLFxuXG5cdC8vICBEZWVwIENsb25lLlxuXHRjbG9uZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvciggXy5tYXAoIHRoaXMubW9kZWxzLCBmdW5jdGlvbihtKSB7XG5cdFx0XHRyZXR1cm4gbS5jbG9uZSgpO1xuXHRcdH0pKTtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIG9ubHkgdGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBzYXZlZC5cblx0ICpcblx0ICogQHJldHVybiBvYmplY3Rcblx0ICovXG5cdHRvTWljcm9KU09OOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoIGZ1bmN0aW9uKG1vZGVsKSB7IHJldHVybiBtb2RlbC50b01pY3JvSlNPTiggb3B0aW9ucyApOyB9ICk7XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZXM7XG4iLCIvLyBFeHBvc2Ugc29tZSBmdW5jdGlvbmFsaXR5IGdsb2JhbGx5LlxudmFyIGdsb2JhbHMgPSB7XG5cdEJ1aWxkZXI6ICAgICAgIHJlcXVpcmUoJy4vbW9kZWxzL2J1aWxkZXIuanMnKSxcblx0TW9kdWxlRmFjdG9yeTogcmVxdWlyZSgnLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpLFxuXHRlZGl0Vmlld01hcDogICByZXF1aXJlKCcuL3V0aWxzL2VkaXQtdmlldy1tYXAuanMnKSxcblx0dmlld3M6IHtcblx0XHRCdWlsZGVyVmlldzogICAgIHJlcXVpcmUoJy4vdmlld3MvYnVpbGRlci5qcycpLFxuXHRcdE1vZHVsZUVkaXQ6ICAgICAgcmVxdWlyZSgnLi92aWV3cy9tb2R1bGUtZWRpdC5qcycpLFxuXHRcdEZpZWxkOiAgICAgICAgICAgcmVxdWlyZSgnLi92aWV3cy9maWVsZHMvZmllbGQuanMnKSxcblx0XHRGaWVsZExpbms6ICAgICAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLWxpbmsuanMnKSxcblx0XHRGaWVsZEF0dGFjaG1lbnQ6IHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLWF0dGFjaG1lbnQuanMnKSxcblx0XHRGaWVsZFRleHQ6ICAgICAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLXRleHQuanMnKSxcblx0XHRGaWVsZFRleHRhcmVhOiAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLXRleHRhcmVhLmpzJyksXG5cdFx0RmllbGRXeXNpd3lnOiAgICByZXF1aXJlKCcuL3ZpZXdzL2ZpZWxkcy9maWVsZC13eXNpd3lnLmpzJyksXG5cdFx0RmllbGRQb3N0U2VsZWN0OiByZXF1aXJlKCcuL3ZpZXdzL2ZpZWxkcy9maWVsZC1wb3N0LXNlbGVjdC5qcycpLFxuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdsb2JhbHM7XG4iLCJ2YXIgQmFja2JvbmUgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZXMgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2NvbGxlY3Rpb25zL21vZHVsZXMuanMnKTtcbnZhciBNb2R1bGVGYWN0b3J5ICAgID0gcmVxdWlyZSgnLi8uLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpO1xuXG52YXIgQnVpbGRlciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRzZWxlY3REZWZhdWx0OiAgbW9kdWxhclBhZ2VCdWlsZGVyRGF0YS5sMTBuLnNlbGVjdERlZmF1bHQsXG5cdFx0YWRkTmV3QnV0dG9uOiAgIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEubDEwbi5hZGROZXdCdXR0b24sXG5cdFx0c2VsZWN0aW9uOiAgICAgIFtdLCAvLyBJbnN0YW5jZSBvZiBNb2R1bGVzLiBDYW4ndCB1c2UgYSBkZWZhdWx0LCBvdGhlcndpc2UgdGhleSB3b24ndCBiZSB1bmlxdWUuXG5cdFx0YWxsb3dlZE1vZHVsZXM6IFtdLCAvLyBNb2R1bGUgbmFtZXMgYWxsb3dlZCBmb3IgdGhpcyBidWlsZGVyLlxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gU2V0IGRlZmF1bHQgc2VsZWN0aW9uIHRvIGVuc3VyZSBpdCBpc24ndCBhIHJlZmVyZW5jZS5cblx0XHRpZiAoICEgKCB0aGlzLmdldCgnc2VsZWN0aW9uJykgaW5zdGFuY2VvZiBNb2R1bGVzICkgKSB7XG5cdFx0XHR0aGlzLnNldCggJ3NlbGVjdGlvbicsIG5ldyBNb2R1bGVzKCkgKTtcblx0XHR9XG5cblx0fSxcblxuXHRzZXREYXRhOiBmdW5jdGlvbiggZGF0YSApIHtcblxuXHRcdHZhciBzZWxlY3Rpb247XG5cblx0XHRpZiAoICcnID09PSBkYXRhICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEhhbmRsZSBlaXRoZXIgSlNPTiBzdHJpbmcgb3IgcHJvcGVyIG9iaGVjdC5cblx0XHRkYXRhID0gKCAnc3RyaW5nJyA9PT0gdHlwZW9mIGRhdGEgKSA/IEpTT04ucGFyc2UoIGRhdGEgKSA6IGRhdGE7XG5cblx0XHQvLyBDb252ZXJ0IHNhdmVkIGRhdGEgdG8gTW9kdWxlIG1vZGVscy5cblx0XHRpZiAoIGRhdGEgJiYgQXJyYXkuaXNBcnJheSggZGF0YSApICkge1xuXHRcdFx0c2VsZWN0aW9uID0gZGF0YS5tYXAoIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHRcdHJldHVybiBNb2R1bGVGYWN0b3J5LmNyZWF0ZSggbW9kdWxlLm5hbWUsIG1vZHVsZS5hdHRyICk7XG5cdFx0XHR9ICk7XG5cdFx0fVxuXG5cdFx0Ly8gUmVzZXQgc2VsZWN0aW9uIHVzaW5nIGRhdGEgZnJvbSBoaWRkZW4gaW5wdXQuXG5cdFx0aWYgKCBzZWxlY3Rpb24gJiYgc2VsZWN0aW9uLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuZ2V0KCdzZWxlY3Rpb24nKS5hZGQoIHNlbGVjdGlvbiApO1xuXHRcdH1cblxuXHR9LFxuXG5cdHNhdmVEYXRhOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBkYXRhID0gW107XG5cblx0XHR0aGlzLmdldCgnc2VsZWN0aW9uJykuZWFjaCggZnVuY3Rpb24oIG1vZHVsZSApIHtcblxuXHRcdFx0Ly8gU2tpcCBlbXB0eS9icm9rZW4gbW9kdWxlcy5cblx0XHRcdGlmICggISBtb2R1bGUuZ2V0KCduYW1lJyApICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGRhdGEucHVzaCggbW9kdWxlLnRvTWljcm9KU09OKCkgKTtcblxuXHRcdH0gKTtcblxuXHRcdHRoaXMudHJpZ2dlciggJ3NhdmUnLCBkYXRhICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogTGlzdCBhbGwgYXZhaWxhYmxlIG1vZHVsZXMgZm9yIHRoaXMgYnVpbGRlci5cblx0ICogQWxsIG1vZHVsZXMsIGZpbHRlcmVkIGJ5IHRoaXMuYWxsb3dlZE1vZHVsZXMuXG5cdCAqL1xuXHRnZXRBdmFpbGFibGVNb2R1bGVzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gXy5maWx0ZXIoIE1vZHVsZUZhY3RvcnkuYXZhaWxhYmxlTW9kdWxlcywgZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdHJldHVybiB0aGlzLmlzTW9kdWxlQWxsb3dlZCggbW9kdWxlLm5hbWUgKTtcblx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHR9LFxuXG5cdGlzTW9kdWxlQWxsb3dlZDogZnVuY3Rpb24oIG1vZHVsZU5hbWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCdhbGxvd2VkTW9kdWxlcycpLmluZGV4T2YoIG1vZHVsZU5hbWUgKSA+PSAwO1xuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1aWxkZXI7XG4iLCJ2YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcblxudmFyIE1vZHVsZUF0dHJpYnV0ZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRuYW1lOiAgICAgICAgICcnLFxuXHRcdGxhYmVsOiAgICAgICAgJycsXG5cdFx0dmFsdWU6ICAgICAgICAnJyxcblx0XHR0eXBlOiAgICAgICAgICd0ZXh0Jyxcblx0XHRkZXNjcmlwdGlvbjogICcnLFxuXHRcdGRlZmF1bHRWYWx1ZTogJycsXG5cdFx0Y29uZmlnOiAgICAgICB7fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHIgPSB7fTtcblx0XHR2YXIgYWxsb3dlZEF0dHJQcm9wZXJ0aWVzID0gWyAnbmFtZScsICd2YWx1ZScsICd0eXBlJyBdO1xuXG5cdFx0Xy5lYWNoKCBhbGxvd2VkQXR0clByb3BlcnRpZXMsIGZ1bmN0aW9uKCBwcm9wICkge1xuXHRcdFx0clsgcHJvcCBdID0gdGhpcy5nZXQoIHByb3AgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHJldHVybiByO1xuXG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlQXR0cmlidXRlO1xuIiwidmFyIEJhY2tib25lICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGVBdHRzID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGUtYXR0cmlidXRlcy5qcycpO1xuXG52YXIgTW9kdWxlID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuXHRkZWZhdWx0czoge1xuXHRcdG5hbWU6ICAnJyxcblx0XHRsYWJlbDogJycsXG5cdFx0YXR0cjogIFtdLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gU2V0IGRlZmF1bHQgc2VsZWN0aW9uIHRvIGVuc3VyZSBpdCBpc24ndCBhIHJlZmVyZW5jZS5cblx0XHRpZiAoICEgKCB0aGlzLmdldCgnYXR0cicpIGluc3RhbmNlb2YgTW9kdWxlQXR0cyApICkge1xuXHRcdFx0dGhpcy5zZXQoICdhdHRyJywgbmV3IE1vZHVsZUF0dHMoKSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgZm9yIGdldHRpbmcgYW4gYXR0cmlidXRlIG1vZGVsIGJ5IG5hbWUuXG5cdCAqL1xuXHRnZXRBdHRyOiBmdW5jdGlvbiggYXR0ck5hbWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCdhdHRyJykuZmluZFdoZXJlKCB7IG5hbWU6IGF0dHJOYW1lIH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgZm9yIHNldHRpbmcgYW4gYXR0cmlidXRlIHZhbHVlXG5cdCAqXG5cdCAqIE5vdGUgbWFudWFsIGNoYW5nZSBldmVudCB0cmlnZ2VyIHRvIGVuc3VyZSBldmVyeXRoaW5nIGlzIHVwZGF0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzdHJpbmcgYXR0cmlidXRlXG5cdCAqIEBwYXJhbSBtaXhlZCAgdmFsdWVcblx0ICovXG5cdHNldEF0dHJWYWx1ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZSwgdmFsdWUgKSB7XG5cblx0XHR2YXIgYXR0ciA9IHRoaXMuZ2V0QXR0ciggYXR0cmlidXRlICk7XG5cblx0XHRpZiAoIGF0dHIgKSB7XG5cdFx0XHRhdHRyLnNldCggJ3ZhbHVlJywgdmFsdWUgKTtcblx0XHRcdHRoaXMudHJpZ2dlciggJ2NoYW5nZScsIHRoaXMubW9kZWwgKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogSGVscGVyIGZvciBnZXR0aW5nIGFuIGF0dHJpYnV0ZSB2YWx1ZS5cblx0ICpcblx0ICogRGVmYXVsdHMgdG8gbnVsbC5cblx0ICpcblx0ICogQHBhcmFtIHN0cmluZyBhdHRyaWJ1dGVcblx0ICovXG5cdGdldEF0dHJWYWx1ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZSApIHtcblxuXHRcdHZhciBhdHRyID0gdGhpcy5nZXRBdHRyKCBhdHRyaWJ1dGUgKTtcblxuXHRcdGlmICggYXR0ciApIHtcblx0XHRcdHJldHVybiBhdHRyLmdldCggJ3ZhbHVlJyApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBDdXN0b20gUGFyc2UuXG5cdCAqIEVuc3VyZXMgYXR0cmlidXRlcyBpcyBhbiBpbnN0YW5jZSBvZiBNb2R1bGVBdHRzXG5cdCAqL1xuXHRwYXJzZTogZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXG5cdFx0aWYgKCAnYXR0cicgaW4gcmVzcG9uc2UgJiYgISAoIHJlc3BvbnNlLmF0dHIgaW5zdGFuY2VvZiBNb2R1bGVBdHRzICkgKSB7XG5cdFx0XHRyZXNwb25zZS5hdHRyID0gbmV3IE1vZHVsZUF0dHMoIHJlc3BvbnNlLmF0dHIgKTtcblx0XHR9XG5cblx0ICAgIHJldHVybiByZXNwb25zZTtcblxuXHR9LFxuXG5cdHRvSlNPTjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIganNvbiA9IF8uY2xvbmUoIHRoaXMuYXR0cmlidXRlcyApO1xuXG5cdFx0aWYgKCAnYXR0cicgaW4ganNvbiAmJiAoIGpzb24uYXR0ciBpbnN0YW5jZW9mIE1vZHVsZUF0dHMgKSApIHtcblx0XHRcdGpzb24uYXR0ciA9IGpzb24uYXR0ci50b0pTT04oKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ganNvbjtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRuYW1lOiB0aGlzLmdldCgnbmFtZScpLFxuXHRcdFx0YXR0cjogdGhpcy5nZXQoJ2F0dHInKS50b01pY3JvSlNPTigpXG5cdFx0fTtcblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlO1xuIiwidmFyICQgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEJ1aWxkZXIgICAgICAgPSByZXF1aXJlKCcuL21vZGVscy9idWlsZGVyLmpzJyk7XG52YXIgQnVpbGRlclZpZXcgICA9IHJlcXVpcmUoJy4vdmlld3MvYnVpbGRlci5qcycpO1xudmFyIE1vZHVsZUZhY3RvcnkgPSByZXF1aXJlKCcuL3V0aWxzL21vZHVsZS1mYWN0b3J5LmpzJyk7XG5cbi8vIEV4cG9zZSBzb21lIGZ1bmN0aW9uYWxpdHkgdG8gZ2xvYmFsIG5hbWVzcGFjZS5cbndpbmRvdy5tb2R1bGFyUGFnZUJ1aWxkZXIgPSByZXF1aXJlKCcuL2dsb2JhbHMnKTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuXHRNb2R1bGVGYWN0b3J5LmluaXQoKTtcblxuXHQvLyBBIGZpZWxkIGZvciBzdG9yaW5nIHRoZSBidWlsZGVyIGRhdGEuXG5cdHZhciAkZmllbGQgPSAkKCAnW25hbWU9bW9kdWxhci1wYWdlLWJ1aWxkZXItZGF0YV0nICk7XG5cblx0aWYgKCAhICRmaWVsZC5sZW5ndGggKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gQSBjb250YWluZXIgZWxlbWVudCBmb3IgZGlzcGxheWluZyB0aGUgYnVpbGRlci5cblx0dmFyICRjb250YWluZXIgPSAkKCAnI21vZHVsYXItcGFnZS1idWlsZGVyJyApO1xuXG5cdC8vIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBCdWlsZGVyIG1vZGVsLlxuXHQvLyBQYXNzIGFuIGFycmF5IG9mIG1vZHVsZSBuYW1lcyB0aGF0IGFyZSBhbGxvd2VkIGZvciB0aGlzIGJ1aWxkZXIuXG5cdHZhciBidWlsZGVyID0gbmV3IEJ1aWxkZXIoe1xuXHRcdGFsbG93ZWRNb2R1bGVzOiAkKCAnW25hbWU9bW9kdWxhci1wYWdlLWJ1aWxkZXItYWxsb3dlZC1tb2R1bGVzXScgKS52YWwoKS5zcGxpdCgnLCcpXG5cdH0pO1xuXG5cdC8vIFNldCB0aGUgZGF0YSB1c2luZyB0aGUgY3VycmVudCBmaWVsZCB2YWx1ZVxuXHRidWlsZGVyLnNldERhdGEoIEpTT04ucGFyc2UoICRmaWVsZC52YWwoKSApICk7XG5cblx0Ly8gT24gc2F2ZSwgdXBkYXRlIHRoZSBmaWVsZCB2YWx1ZS5cblx0YnVpbGRlci5vbiggJ3NhdmUnLCBmdW5jdGlvbiggZGF0YSApIHtcblx0XHQkZmllbGQudmFsKCBKU09OLnN0cmluZ2lmeSggZGF0YSApICk7XG5cdH0gKTtcblxuXHQvLyBDcmVhdGUgYnVpbGRlciB2aWV3LlxuXHR2YXIgYnVpbGRlclZpZXcgPSBuZXcgQnVpbGRlclZpZXcoIHsgbW9kZWw6IGJ1aWxkZXIgfSApO1xuXG5cdC8vIFJlbmRlciBidWlsZGVyLlxuXHRidWlsZGVyVmlldy5yZW5kZXIoKS4kZWwuYXBwZW5kVG8oICRjb250YWluZXIgKTtcblxufSk7XG4iLCIvKipcbiAqIE1hcCBtb2R1bGUgdHlwZSB0byB2aWV3cy5cbiAqL1xudmFyIGVkaXRWaWV3TWFwID0ge1xuXHQnaGVhZGVyJzogICAgICAgICAgICAgIHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtaGVhZGVyLmpzJyksXG5cdCd0ZXh0JzogICAgICAgICAgICAgICAgcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC10ZXh0LmpzJyksXG5cdCdpbWFnZSc6ICAgICAgICAgICAgICAgcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC1pbWFnZS5qcycpLFxuXHQnYmxvY2txdW90ZSc6ICAgICAgICAgIHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtYmxvY2txdW90ZS5qcycpLFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBlZGl0Vmlld01hcDtcbiIsInZhciBNb2R1bGUgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvbW9kdWxlLmpzJyk7XG52YXIgTW9kdWxlQXR0cyAgICAgICA9IHJlcXVpcmUoJy4vLi4vY29sbGVjdGlvbnMvbW9kdWxlLWF0dHJpYnV0ZXMuanMnKTtcbnZhciAkICAgICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxudmFyIE1vZHVsZUZhY3RvcnkgPSB7XG5cblx0YXZhaWxhYmxlTW9kdWxlczogW10sXG5cblx0aW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhICYmICdhdmFpbGFibGVfbW9kdWxlcycgaW4gbW9kdWxhclBhZ2VCdWlsZGVyRGF0YSApIHtcblx0XHRcdF8uZWFjaCggbW9kdWxhclBhZ2VCdWlsZGVyRGF0YS5hdmFpbGFibGVfbW9kdWxlcywgZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdFx0dGhpcy5yZWdpc3Rlck1vZHVsZSggbW9kdWxlICk7XG5cdFx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHRcdH1cblx0fSxcblxuXHRyZWdpc3Rlck1vZHVsZTogZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHR0aGlzLmF2YWlsYWJsZU1vZHVsZXMucHVzaCggbW9kdWxlICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENyZWF0ZSBNb2R1bGUgTW9kZWwuXG5cdCAqIFVzZSBkYXRhIGZyb20gY29uZmlnLCBwbHVzIHNhdmVkIGRhdGEuXG5cdCAqXG5cdCAqIEBwYXJhbSAgc3RyaW5nIG1vZHVsZU5hbWVcblx0ICogQHBhcmFtICBvYmplY3QgYXR0cmlidXRlIEpTT04uIFNhdmVkIGF0dHJpYnV0ZSB2YWx1ZXMuXG5cdCAqIEByZXR1cm4gTW9kdWxlXG5cdCAqL1xuXHRjcmVhdGU6IGZ1bmN0aW9uKCBtb2R1bGVOYW1lLCBhdHRyRGF0YSApIHtcblxuXHRcdHZhciBkYXRhID0gJC5leHRlbmQoIHRydWUsIHt9LCBfLmZpbmRXaGVyZSggdGhpcy5hdmFpbGFibGVNb2R1bGVzLCB7IG5hbWU6IG1vZHVsZU5hbWUgfSApICk7XG5cblx0XHRpZiAoICEgZGF0YSApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXG5cdFx0dmFyIGF0dHJpYnV0ZXMgPSBuZXcgTW9kdWxlQXR0cygpO1xuXG5cdFx0LyoqXG5cdFx0ICogQWRkIGFsbCB0aGUgbW9kdWxlIGF0dHJpYnV0ZXMuXG5cdFx0ICogV2hpdGVsaXN0ZWQgdG8gYXR0cmlidXRlcyBkb2N1bWVudGVkIGluIHNjaGVtYVxuXHRcdCAqIFNldHMgb25seSB2YWx1ZSBmcm9tIGF0dHJEYXRhLlxuXHRcdCAqL1xuXHRcdF8uZWFjaCggZGF0YS5hdHRyLCBmdW5jdGlvbiggYXR0ciApIHtcblxuXHRcdFx0dmFyIGNsb25lQXR0ciA9ICQuZXh0ZW5kKCB0cnVlLCB7fSwgYXR0ciAgKTtcblx0XHRcdHZhciBzYXZlZEF0dHIgPSBfLmZpbmRXaGVyZSggYXR0ckRhdGEsIHsgbmFtZTogYXR0ci5uYW1lIH0gKTtcblxuXHRcdFx0Ly8gQWRkIHNhdmVkIGF0dHJpYnV0ZSB2YWx1ZXMuXG5cdFx0XHRpZiAoIHNhdmVkQXR0ciAmJiAndmFsdWUnIGluIHNhdmVkQXR0ciApIHtcblx0XHRcdFx0Y2xvbmVBdHRyLnZhbHVlID0gc2F2ZWRBdHRyLnZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHRhdHRyaWJ1dGVzLmFkZCggY2xvbmVBdHRyICk7XG5cblx0XHR9ICk7XG5cblx0XHRkYXRhLmF0dHIgPSBhdHRyaWJ1dGVzO1xuXG5cdCAgICByZXR1cm4gbmV3IE1vZHVsZSggZGF0YSApO1xuXG5cdH0sXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlRmFjdG9yeTtcbiIsInZhciBCYWNrYm9uZSAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgQnVpbGRlciAgICAgICA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2J1aWxkZXIuanMnKTtcbnZhciBlZGl0Vmlld01hcCAgID0gcmVxdWlyZSgnLi8uLi91dGlscy9lZGl0LXZpZXctbWFwLmpzJyk7XG52YXIgTW9kdWxlRmFjdG9yeSA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMnKTtcbnZhciAkICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxudmFyIEJ1aWxkZXIgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICQoJyN0bXBsLW1wYi1idWlsZGVyJyApLmh0bWwoKSxcblx0Y2xhc3NOYW1lOiAnbW9kdWxhci1wYWdlLWJ1aWxkZXInLFxuXHRtb2RlbDogbnVsbCxcblx0bmV3TW9kdWxlTmFtZTogbnVsbCxcblxuXHRldmVudHM6IHtcblx0XHQnY2hhbmdlID4gLmFkZC1uZXcgLmFkZC1uZXctbW9kdWxlLXNlbGVjdCc6ICd0b2dnbGVCdXR0b25TdGF0dXMnLFxuXHRcdCdjbGljayA+IC5hZGQtbmV3IC5hZGQtbmV3LW1vZHVsZS1idXR0b24nOiAnYWRkTW9kdWxlJyxcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLm1vZGVsLmdldCgnc2VsZWN0aW9uJyk7XG5cblx0XHRzZWxlY3Rpb24ub24oICdhZGQnLCB0aGlzLmFkZE5ld1NlbGVjdGlvbkl0ZW1WaWV3LCB0aGlzICk7XG5cdFx0c2VsZWN0aW9uLm9uKCAnYWxsJywgdGhpcy5tb2RlbC5zYXZlRGF0YSwgdGhpcy5tb2RlbCApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBkYXRhID0gdGhpcy5tb2RlbC50b0pTT04oKTtcblxuXHRcdHRoaXMuJGVsLmh0bWwoIF8udGVtcGxhdGUoIHRoaXMudGVtcGxhdGUsIGRhdGEgICkgKTtcblxuXHRcdHRoaXMubW9kZWwuZ2V0KCdzZWxlY3Rpb24nKS5lYWNoKCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0dGhpcy5hZGROZXdTZWxlY3Rpb25JdGVtVmlldyggbW9kdWxlICk7XG5cdFx0fS5iaW5kKCB0aGlzICkgKTtcblxuXHRcdHRoaXMucmVuZGVyQWRkTmV3KCk7XG5cdFx0dGhpcy5pbml0U29ydGFibGUoKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlbmRlciB0aGUgQWRkIE5ldyBtb2R1bGUgY29udHJvbHMuXG5cdCAqL1xuXHRyZW5kZXJBZGROZXc6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyICRzZWxlY3QgPSB0aGlzLiRlbC5maW5kKCAnPiAuYWRkLW5ldyBzZWxlY3QuYWRkLW5ldy1tb2R1bGUtc2VsZWN0JyApO1xuXG5cdFx0JHNlbGVjdC5hcHBlbmQoXG5cdFx0XHQkKCAnPG9wdGlvbi8+JywgeyB0ZXh0OiBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhLmwxMG4uc2VsZWN0RGVmYXVsdCB9IClcblx0XHQpO1xuXG5cdFx0Xy5lYWNoKCB0aGlzLm1vZGVsLmdldEF2YWlsYWJsZU1vZHVsZXMoKSwgZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdHZhciB0ZW1wbGF0ZSA9ICc8b3B0aW9uIHZhbHVlPVwiPCU9IG5hbWUgJT5cIj48JT0gbGFiZWwgJT48L29wdGlvbj4nO1xuXHRcdFx0JHNlbGVjdC5hcHBlbmQoIF8udGVtcGxhdGUoIHRlbXBsYXRlLCBtb2R1bGUgKSApO1xuXHRcdH0gKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIFNvcnRhYmxlLlxuXHQgKi9cblx0aW5pdFNvcnRhYmxlOiBmdW5jdGlvbigpIHtcblx0XHQkKCAnPiAuc2VsZWN0aW9uJywgdGhpcy4kZWwgKS5zb3J0YWJsZSh7XG5cdFx0XHRoYW5kbGU6ICcubW9kdWxlLWVkaXQtdG9vbHMnLFxuXHRcdFx0aXRlbXM6ICc+IC5tb2R1bGUtZWRpdCcsXG5cdFx0XHRzdG9wOiB0aGlzLnVwZGF0ZVNlbGVjdGlvbk9yZGVyLmJpbmQoIHRoaXMgKSxcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogU29ydGFibGUgZW5kIGNhbGxiYWNrLlxuXHQgKiBBZnRlciByZW9yZGVyaW5nLCB1cGRhdGUgdGhlIHNlbGVjdGlvbiBvcmRlci5cblx0ICogTm90ZSAtIHVzZXMgZGlyZWN0IG1hbmlwdWxhdGlvbiBvZiBjb2xsZWN0aW9uIG1vZGVscyBwcm9wZXJ0eS5cblx0ICogVGhpcyBpcyB0byBhdm9pZCBoYXZpbmcgdG8gbWVzcyBhYm91dCB3aXRoIHRoZSB2aWV3cyB0aGVtc2VsdmVzLlxuXHQgKi9cblx0dXBkYXRlU2VsZWN0aW9uT3JkZXI6IGZ1bmN0aW9uKCBlLCB1aSApIHtcblxuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLm1vZGVsLmdldCgnc2VsZWN0aW9uJyk7XG5cdFx0dmFyIGl0ZW0gICAgICA9IHNlbGVjdGlvbi5nZXQoeyBjaWQ6IHVpLml0ZW0uYXR0ciggJ2RhdGEtY2lkJykgfSk7XG5cdFx0dmFyIG5ld0luZGV4ICA9IHVpLml0ZW0uaW5kZXgoKTtcblx0XHR2YXIgb2xkSW5kZXggID0gc2VsZWN0aW9uLmluZGV4T2YoIGl0ZW0gKTtcblxuXHRcdGlmICggbmV3SW5kZXggIT09IG9sZEluZGV4ICkge1xuXHRcdFx0dmFyIGRyb3BwZWQgPSBzZWxlY3Rpb24ubW9kZWxzLnNwbGljZSggb2xkSW5kZXgsIDEgKTtcblx0XHRcdHNlbGVjdGlvbi5tb2RlbHMuc3BsaWNlKCBuZXdJbmRleCwgMCwgZHJvcHBlZFswXSApO1xuXHRcdFx0dGhpcy5tb2RlbC5zYXZlRGF0YSgpO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBUb2dnbGUgYnV0dG9uIHN0YXR1cy5cblx0ICogRW5hYmxlL0Rpc2FibGUgYnV0dG9uIGRlcGVuZGluZyBvbiB3aGV0aGVyXG5cdCAqIHBsYWNlaG9sZGVyIG9yIHZhbGlkIG1vZHVsZSBpcyBzZWxlY3RlZC5cblx0ICovXG5cdHRvZ2dsZUJ1dHRvblN0YXR1czogZnVuY3Rpb24oZSkge1xuXHRcdHZhciB2YWx1ZSAgICAgICAgID0gJChlLnRhcmdldCkudmFsKCk7XG5cdFx0dmFyIGRlZmF1bHRPcHRpb24gPSAkKGUudGFyZ2V0KS5jaGlsZHJlbigpLmZpcnN0KCkuYXR0cigndmFsdWUnKTtcblx0XHQkKCcuYWRkLW5ldy1tb2R1bGUtYnV0dG9uJywgdGhpcy4kZWwgKS5hdHRyKCAnZGlzYWJsZWQnLCB2YWx1ZSA9PT0gZGVmYXVsdE9wdGlvbiApO1xuXHRcdHRoaXMubmV3TW9kdWxlTmFtZSA9ICggdmFsdWUgIT09IGRlZmF1bHRPcHRpb24gKSA/IHZhbHVlIDogbnVsbDtcblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlIGFkZGluZyBtb2R1bGUuXG5cdCAqXG5cdCAqIEZpbmQgbW9kdWxlIG1vZGVsLiBDbG9uZSBpdC4gQWRkIHRvIHNlbGVjdGlvbi5cblx0ICovXG5cdGFkZE1vZHVsZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0aWYgKCB0aGlzLm5ld01vZHVsZU5hbWUgJiYgdGhpcy5tb2RlbC5pc01vZHVsZUFsbG93ZWQoIHRoaXMubmV3TW9kdWxlTmFtZSApICkge1xuXHRcdFx0dmFyIG1vZGVsID0gTW9kdWxlRmFjdG9yeS5jcmVhdGUoIHRoaXMubmV3TW9kdWxlTmFtZSApO1xuXHRcdFx0dGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpLmFkZCggbW9kZWwgKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogQXBwZW5kIG5ldyBzZWxlY3Rpb24gaXRlbSB2aWV3LlxuXHQgKi9cblx0YWRkTmV3U2VsZWN0aW9uSXRlbVZpZXc6IGZ1bmN0aW9uKCBpdGVtICkge1xuXG5cdFx0dmFyIGVkaXRWaWV3LCB2aWV3O1xuXG5cdFx0ZWRpdFZpZXcgPSAoIGl0ZW0uZ2V0KCduYW1lJykgaW4gZWRpdFZpZXdNYXAgKSA/IGVkaXRWaWV3TWFwWyBpdGVtLmdldCgnbmFtZScpIF0gOiBudWxsO1xuXG5cdFx0aWYgKCAhIGVkaXRWaWV3IHx8ICEgdGhpcy5tb2RlbC5pc01vZHVsZUFsbG93ZWQoIGl0ZW0uZ2V0KCduYW1lJykgKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2aWV3ID0gbmV3IGVkaXRWaWV3KCB7IG1vZGVsOiBpdGVtIH0gKTtcblxuXHRcdCQoICc+IC5zZWxlY3Rpb24nLCB0aGlzLiRlbCApLmFwcGVuZCggdmlldy5yZW5kZXIoKS4kZWwgKTtcblxuXHRcdHZhciAkc2VsZWN0aW9uID0gJCggJz4gLnNlbGVjdGlvbicsIHRoaXMuJGVsICk7XG5cdFx0aWYgKCAkc2VsZWN0aW9uLmhhc0NsYXNzKCd1aS1zb3J0YWJsZScpICkge1xuXHRcdFx0JHNlbGVjdGlvbi5zb3J0YWJsZSgncmVmcmVzaCcpO1xuXHRcdH1cblxuXG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1aWxkZXI7XG4iLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgRmllbGQgPSByZXF1aXJlKCcuL2ZpZWxkLmpzJyk7XG5cbi8qKlxuICogSW1hZ2UgRmllbGRcbiAqXG4gKiBJbml0aWFsaXplIGFuZCBsaXN0ZW4gZm9yIHRoZSAnY2hhbmdlJyBldmVudCB0byBnZXQgdXBkYXRlZCBkYXRhLlxuICpcbiAqL1xudmFyIEZpZWxkQXR0YWNobWVudCA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICAkKCAnI3RtcGwtbXBiLWZpZWxkLWF0dGFjaG1lbnQnICkuaHRtbCgpLFxuXHRmcmFtZTogICAgIG51bGwsXG5cdHZhbHVlOiAgICAgW10sIC8vIEF0dGFjaG1lbnQgSURzLlxuXHRzZWxlY3Rpb246IHt9LCAvLyBBdHRhY2htZW50cyBjb2xsZWN0aW9uIGZvciB0aGlzLnZhbHVlLlxuXG5cdGNvbmZpZzogICAge30sXG5cdGRlZmF1bHRDb25maWc6IHtcblx0XHRtdWx0aXBsZTogZmFsc2UsXG5cdFx0bGlicmFyeTogeyB0eXBlOiAnaW1hZ2UnIH0sXG5cdFx0YnV0dG9uX3RleHQ6ICdTZWxlY3QgSW1hZ2UnLFxuXHR9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayAuaW1hZ2UtcGxhY2Vob2xkZXIgLmJ1dHRvbi5hZGQnOiAnZWRpdEltYWdlJyxcblx0XHQnY2xpY2sgLmltYWdlLXBsYWNlaG9sZGVyIGltZyc6ICdlZGl0SW1hZ2UnLFxuXHRcdCdjbGljayAuaW1hZ2UtcGxhY2Vob2xkZXIgLmJ1dHRvbi5yZW1vdmUnOiAncmVtb3ZlSW1hZ2UnLFxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplLlxuXHQgKlxuXHQgKiBQYXNzIHZhbHVlIGFuZCBjb25maWcgYXMgcHJvcGVydGllcyBvbiB0aGUgb3B0aW9ucyBvYmplY3QuXG5cdCAqIEF2YWlsYWJsZSBvcHRpb25zXG5cdCAqIC0gbXVsdGlwbGU6IGJvb2xcblx0ICogLSBzaXplUmVxOiBlZyB7IHdpZHRoOiAxMDAsIGhlaWdodDogMTAwIH1cblx0ICpcblx0ICogQHBhcmFtICBvYmplY3Qgb3B0aW9uc1xuXHQgKiBAcmV0dXJuIG51bGxcblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0Ly8gQ2FsbCBkZWZhdWx0IGluaXRpYWxpemUuXG5cdFx0RmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgb3B0aW9ucyBdICk7XG5cblx0XHRfLmJpbmRBbGwoIHRoaXMsICdyZW5kZXInLCAnZWRpdEltYWdlJywgJ29uU2VsZWN0SW1hZ2UnLCAncmVtb3ZlSW1hZ2UnLCAnaXNBdHRhY2htZW50U2l6ZU9rJyApO1xuXG5cdFx0dGhpcy5vbiggJ2NoYW5nZScsIHRoaXMucmVuZGVyICk7XG5cblx0XHR0aGlzLmluaXRTZWxlY3Rpb24oKTtcblxuXHR9LFxuXG5cdHNldFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cblx0XHQvLyBFbnN1cmUgdmFsdWUgaXMgYXJyYXkuXG5cdFx0aWYgKCAhIHZhbHVlIHx8ICEgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gW107XG5cdFx0fVxuXG5cdFx0RmllbGQucHJvdG90eXBlLnNldFZhbHVlLmFwcGx5KCB0aGlzLCBbIHZhbHVlIF0gKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIFNlbGVjdGlvbi5cblx0ICpcblx0ICogU2VsZWN0aW9uIGlzIGFuIEF0dGFjaG1lbnQgY29sbGVjdGlvbiBjb250YWluaW5nIGZ1bGwgbW9kZWxzIGZvciB0aGUgY3VycmVudCB2YWx1ZS5cblx0ICpcblx0ICogQHJldHVybiBudWxsXG5cdCAqL1xuXHRpbml0U2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMuc2VsZWN0aW9uID0gbmV3IHdwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzKCk7XG5cblx0XHQvLyBJbml0aWFsaXplIHNlbGVjdGlvbi5cblx0XHRfLmVhY2goIHRoaXMuZ2V0VmFsdWUoKSwgZnVuY3Rpb24oIGl0ZW0gKSB7XG5cblx0XHRcdHZhciBtb2RlbDtcblxuXHRcdFx0Ly8gTGVnYWN5LiBIYW5kbGUgc3RvcmluZyBmdWxsIG9iamVjdHMuXG5cdFx0XHRpdGVtICA9ICggJ29iamVjdCcgPT09IHR5cGVvZiggaXRlbSApICkgPyBpdGVtLmlkIDogaXRlbTtcblx0XHRcdG1vZGVsID0gbmV3IHdwLm1lZGlhLmF0dGFjaG1lbnQoIGl0ZW0gKTtcblxuXHRcdFx0dGhpcy5zZWxlY3Rpb24uYWRkKCBtb2RlbCApO1xuXG5cdFx0XHQvLyBSZS1yZW5kZXIgYWZ0ZXIgYXR0YWNobWVudHMgaGF2ZSBzeW5jZWQuXG5cdFx0XHRtb2RlbC5mZXRjaCgpO1xuXHRcdFx0bW9kZWwub24oICdzeW5jJywgdGhpcy5yZW5kZXIgKTtcblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciB0ZW1wbGF0ZTtcblxuXHRcdHRlbXBsYXRlID0gXy5tZW1vaXplKCBmdW5jdGlvbiggdmFsdWUsIGNvbmZpZyApIHtcblx0XHRcdHJldHVybiBfLnRlbXBsYXRlKCB0aGlzLnRlbXBsYXRlLCB7XG5cdFx0XHRcdHZhbHVlOiB2YWx1ZSxcblx0XHRcdFx0Y29uZmlnOiBjb25maWcsXG5cdFx0XHR9ICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHR0aGlzLiRlbC5odG1sKCB0ZW1wbGF0ZSggdGhpcy5zZWxlY3Rpb24udG9KU09OKCksIHRoaXMuY29uZmlnICkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZSB0aGUgc2VsZWN0IGV2ZW50LlxuXHQgKlxuXHQgKiBJbnNlcnQgYW4gaW1hZ2Ugb3IgbXVsdGlwbGUgaW1hZ2VzLlxuXHQgKi9cblx0b25TZWxlY3RJbWFnZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZnJhbWUgPSB0aGlzLmZyYW1lIHx8IG51bGw7XG5cblx0XHRpZiAoICEgZnJhbWUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5zZWxlY3Rpb24ucmVzZXQoW10pO1xuXG5cdFx0ZnJhbWUuc3RhdGUoKS5nZXQoJ3NlbGVjdGlvbicpLmVhY2goIGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXG5cdFx0XHRpZiAoIHRoaXMuaXNBdHRhY2htZW50U2l6ZU9rKCBhdHRhY2htZW50ICkgKSB7XG5cdFx0XHRcdHRoaXMuc2VsZWN0aW9uLmFkZCggYXR0YWNobWVudCApO1xuXHRcdFx0fVxuXG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHR0aGlzLnNldFZhbHVlKCB0aGlzLnNlbGVjdGlvbi5wbHVjaygnaWQnKSApO1xuXG5cdFx0ZnJhbWUuY2xvc2UoKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgdGhlIGVkaXQgYWN0aW9uLlxuXHQgKi9cblx0ZWRpdEltYWdlOiBmdW5jdGlvbihlKSB7XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR2YXIgZnJhbWUgPSB0aGlzLmZyYW1lO1xuXG5cdFx0aWYgKCAhIGZyYW1lICkge1xuXG5cdFx0XHR2YXIgZnJhbWVBcmdzID0ge1xuXHRcdFx0XHRsaWJyYXJ5OiB0aGlzLmNvbmZpZy5saWJyYXJ5LFxuXHRcdFx0XHRtdWx0aXBsZTogdGhpcy5jb25maWcubXVsdGlwbGUsXG5cdFx0XHRcdHRpdGxlOiAnU2VsZWN0IEltYWdlJyxcblx0XHRcdFx0ZnJhbWU6ICdzZWxlY3QnLFxuXHRcdFx0fTtcblxuXHRcdFx0ZnJhbWUgPSB0aGlzLmZyYW1lID0gd3AubWVkaWEoIGZyYW1lQXJncyApO1xuXG5cdFx0XHRmcmFtZS5vbiggJ2NvbnRlbnQ6Y3JlYXRlOmJyb3dzZScsIHRoaXMuc2V0dXBGaWx0ZXJzLCB0aGlzICk7XG5cdFx0XHRmcmFtZS5vbiggJ2NvbnRlbnQ6cmVuZGVyOmJyb3dzZScsIHRoaXMuc2l6ZUZpbHRlck5vdGljZSwgdGhpcyApO1xuXHRcdFx0ZnJhbWUub24oICdzZWxlY3QnLCB0aGlzLm9uU2VsZWN0SW1hZ2UsIHRoaXMgKTtcblxuXHRcdH1cblxuXHRcdC8vIFdoZW4gdGhlIGZyYW1lIG9wZW5zLCBzZXQgdGhlIHNlbGVjdGlvbi5cblx0XHRmcmFtZS5vbiggJ29wZW4nLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHNlbGVjdGlvbiA9IGZyYW1lLnN0YXRlKCkuZ2V0KCdzZWxlY3Rpb24nKTtcblxuXHRcdFx0Ly8gU2V0IHRoZSBzZWxlY3Rpb24uXG5cdFx0XHQvLyBOb3RlIC0gZXhwZWN0cyBhcnJheSBvZiBvYmplY3RzLCBub3QgYSBjb2xsZWN0aW9uLlxuXHRcdFx0c2VsZWN0aW9uLnNldCggdGhpcy5zZWxlY3Rpb24ubW9kZWxzICk7XG5cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdGZyYW1lLm9wZW4oKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGQgZmlsdGVycyB0byB0aGUgZnJhbWUgbGlicmFyeSBjb2xsZWN0aW9uLlxuXHQgKlxuXHQgKiAgLSBmaWx0ZXIgdG8gbGltaXQgdG8gcmVxdWlyZWQgc2l6ZS5cblx0ICovXG5cdHNldHVwRmlsdGVyczogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgbGliICAgID0gdGhpcy5mcmFtZS5zdGF0ZSgpLmdldCgnbGlicmFyeScpO1xuXG5cdFx0aWYgKCAnc2l6ZVJlcScgaW4gdGhpcy5jb25maWcgKSB7XG5cdFx0XHRsaWIuZmlsdGVycy5zaXplID0gdGhpcy5pc0F0dGFjaG1lbnRTaXplT2s7XG5cdFx0fVxuXG5cdH0sXG5cblxuXHQvKipcblx0ICogSGFuZGxlIGRpc3BsYXkgb2Ygc2l6ZSBmaWx0ZXIgbm90aWNlLlxuXHQgKi9cblx0c2l6ZUZpbHRlck5vdGljZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgbGliID0gdGhpcy5mcmFtZS5zdGF0ZSgpLmdldCgnbGlicmFyeScpO1xuXG5cdFx0aWYgKCAhIGxpYi5maWx0ZXJzLnNpemUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gV2FpdCB0byBiZSBzdXJlIHRoZSBmcmFtZSBpcyByZW5kZXJlZC5cblx0XHR3aW5kb3cuc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciByZXEsICRub3RpY2UsIHRlbXBsYXRlLCAkdG9vbGJhcjtcblxuXHRcdFx0cmVxID0gXy5leHRlbmQoIHtcblx0XHRcdFx0d2lkdGg6IDAsXG5cdFx0XHRcdGhlaWdodDogMCxcblx0XHRcdH0sIHRoaXMuY29uZmlnLnNpemVSZXEgKTtcblxuXHRcdFx0Ly8gRGlzcGxheSBub3RpY2Ugb24gbWFpbiBncmlkIHZpZXcuXG5cdFx0XHR0ZW1wbGF0ZSA9ICc8cCBjbGFzcz1cImZpbHRlci1ub3RpY2VcIj5Pbmx5IHNob3dpbmcgaW1hZ2VzIHRoYXQgbWVldCBzaXplIHJlcXVpcmVtZW50czogPCU9IHdpZHRoICU+cHggJnRpbWVzOyA8JT0gaGVpZ2h0ICU+cHg8L3A+Jztcblx0XHRcdCRub3RpY2UgID0gJCggXy50ZW1wbGF0ZSggdGVtcGxhdGUsIHJlcSApICk7XG5cdFx0XHQkdG9vbGJhciA9ICQoICcuYXR0YWNobWVudHMtYnJvd3NlciAubWVkaWEtdG9vbGJhcicsIHRoaXMuZnJhbWUuJGVsICkuZmlyc3QoKTtcblx0XHRcdCR0b29sYmFyLnByZXBlbmQoICRub3RpY2UgKTtcblxuXHRcdFx0dmFyIGNvbnRlbnRWaWV3ID0gdGhpcy5mcmFtZS52aWV3cy5nZXQoICcubWVkaWEtZnJhbWUtY29udGVudCcgKTtcblx0XHRcdGNvbnRlbnRWaWV3ID0gY29udGVudFZpZXdbMF07XG5cblx0XHRcdCRub3RpY2UgPSAkKCAnPHAgY2xhc3M9XCJmaWx0ZXItbm90aWNlXCI+SW1hZ2UgZG9lcyBub3QgbWVldCBzaXplIHJlcXVpcmVtZW50cy48L3A+JyApO1xuXG5cdFx0XHQvLyBEaXNwbGF5IGFkZGl0aW9uYWwgbm90aWNlIHdoZW4gc2VsZWN0aW5nIGFuIGltYWdlLlxuXHRcdFx0Ly8gUmVxdWlyZWQgdG8gaW5kaWNhdGUgYSBiYWQgaW1hZ2UgaGFzIGp1c3QgYmVlbiB1cGxvYWRlZC5cblx0XHRcdGNvbnRlbnRWaWV3Lm9wdGlvbnMuc2VsZWN0aW9uLm9uKCAnc2VsZWN0aW9uOnNpbmdsZScsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdHZhciBhdHRhY2htZW50ID0gY29udGVudFZpZXcub3B0aW9ucy5zZWxlY3Rpb24uc2luZ2xlKCk7XG5cblx0XHRcdFx0dmFyIGRpc3BsYXlOb3RpY2UgPSBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRcdC8vIElmIHN0aWxsIHVwbG9hZGluZywgd2FpdCBhbmQgdHJ5IGRpc3BsYXlpbmcgbm90aWNlIGFnYWluLlxuXHRcdFx0XHRcdGlmICggYXR0YWNobWVudC5nZXQoICd1cGxvYWRpbmcnICkgKSB7XG5cdFx0XHRcdFx0XHR3aW5kb3cuc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGRpc3BsYXlOb3RpY2UoKTtcblx0XHRcdFx0XHRcdH0sIDUwMCApO1xuXG5cdFx0XHRcdFx0Ly8gT0suIERpc3BsYXkgbm90aWNlIGFzIHJlcXVpcmVkLlxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRcdGlmICggISB0aGlzLmlzQXR0YWNobWVudFNpemVPayggYXR0YWNobWVudCApICkge1xuXHRcdFx0XHRcdFx0XHQkKCAnLmF0dGFjaG1lbnRzLWJyb3dzZXIgLmF0dGFjaG1lbnQtaW5mbycgKS5wcmVwZW5kKCAkbm90aWNlICk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQkbm90aWNlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0uYmluZCh0aGlzKTtcblxuXHRcdFx0XHRkaXNwbGF5Tm90aWNlKCk7XG5cblx0XHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0fS5iaW5kKHRoaXMpLCAxMDAgICk7XG5cblx0fSxcblxuXHRyZW1vdmVJbWFnZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0dmFyICR0YXJnZXQsIGlkO1xuXG5cdFx0JHRhcmdldCA9ICQoZS50YXJnZXQpO1xuXHRcdCR0YXJnZXQgPSAoICR0YXJnZXQucHJvcCgndGFnTmFtZScpID09PSAnQlVUVE9OJyApID8gJHRhcmdldCA6ICR0YXJnZXQuY2xvc2VzdCgnYnV0dG9uLnJlbW92ZScpO1xuXHRcdGlkICAgICAgPSAkdGFyZ2V0LmRhdGEoICdpbWFnZS1pZCcgKTtcblxuXHRcdGlmICggISBpZCAgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5zZWxlY3Rpb24ucmVtb3ZlKCB0aGlzLnNlbGVjdGlvbi53aGVyZSggeyBpZDogaWQgfSApICk7XG5cdFx0dGhpcy5zZXRWYWx1ZSggdGhpcy5zZWxlY3Rpb24ucGx1Y2soJ2lkJykgKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBEb2VzIGF0dGFjaG1lbnQgbWVldCBzaXplIHJlcXVpcmVtZW50cz9cblx0ICpcblx0ICogQHBhcmFtICBBdHRhY2htZW50XG5cdCAqIEByZXR1cm4gYm9vbGVhblxuXHQgKi9cblx0aXNBdHRhY2htZW50U2l6ZU9rOiBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblxuXHRcdGlmICggISAoICdzaXplUmVxJyBpbiB0aGlzLmNvbmZpZyApICkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0dGhpcy5jb25maWcuc2l6ZVJlcSA9IF8uZXh0ZW5kKCB7XG5cdFx0XHR3aWR0aDogMCxcblx0XHRcdGhlaWdodDogMCxcblx0XHR9LCB0aGlzLmNvbmZpZy5zaXplUmVxICk7XG5cblx0XHR2YXIgd2lkdGhSZXEgID0gYXR0YWNobWVudC5nZXQoJ3dpZHRoJykgID49IHRoaXMuY29uZmlnLnNpemVSZXEud2lkdGg7XG5cdFx0dmFyIGhlaWdodFJlcSA9IGF0dGFjaG1lbnQuZ2V0KCdoZWlnaHQnKSA+PSB0aGlzLmNvbmZpZy5zaXplUmVxLmhlaWdodDtcblxuXHRcdHJldHVybiB3aWR0aFJlcSAmJiBoZWlnaHRSZXE7XG5cblx0fVxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRBdHRhY2htZW50O1xuIiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG52YXIgRmllbGRDb250ZW50RWRpdGFibGUgPSBGaWVsZC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAgJCggJyN0bXBsLW1wYi1maWVsZC1jb250ZW50LWVkaXRhYmxlJyApLmh0bWwoKSxcblxuXHRldmVudHM6IHtcblx0XHQna2V5dXAgIC5jb250ZW50LWVkaXRhYmxlLWZpZWxkJzogJ2lucHV0Q2hhbmdlZCcsXG5cdFx0J2NoYW5nZSAuY29udGVudC1lZGl0YWJsZS1maWVsZCc6ICdpbnB1dENoYW5nZWQnLFxuXHR9LFxuXG5cdGlucHV0Q2hhbmdlZDogXy5kZWJvdW5jZSggZnVuY3Rpb24oZSkge1xuXHRcdGlmICggZSAmJiBlLnRhcmdldCApIHtcbiAgICAgICAgXHR0aGlzLnNldFZhbHVlKCAkKGUudGFyZ2V0KS5odG1sKCkgKTtcbiAgICAgICAgfVxuXHR9ICksXG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZENvbnRlbnRFZGl0YWJsZTtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxudmFyIEZpZWxkTGluayA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICAkKCAnI3RtcGwtbXBiLWZpZWxkLWxpbmsnICkuaHRtbCgpLFxuXG5cdGV2ZW50czoge1xuXHRcdCdrZXl1cCAgIGlucHV0LmZpZWxkLXRleHQnOiAndGV4dElucHV0Q2hhbmdlZCcsXG5cdFx0J2NoYW5nZSAgaW5wdXQuZmllbGQtdGV4dCc6ICd0ZXh0SW5wdXRDaGFuZ2VkJyxcblx0XHQna2V5dXAgICBpbnB1dC5maWVsZC1saW5rJzogJ2xpbmtJbnB1dENoYW5nZWQnLFxuXHRcdCdjaGFuZ2UgIGlucHV0LmZpZWxkLWxpbmsnOiAnbGlua0lucHV0Q2hhbmdlZCcsXG5cdH0sXG5cblx0dGV4dElucHV0Q2hhbmdlZDogXy5kZWJvdW5jZSggZnVuY3Rpb24oZSkge1xuXHRcdGlmICggZSAmJiBlLnRhcmdldCApIHtcblx0XHRcdHZhciB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblx0XHRcdHZhbHVlLnRleHQgPSBlLnRhcmdldC52YWx1ZTtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIHZhbHVlICk7XG5cdFx0fVxuXHR9ICksXG5cblx0bGlua0lucHV0Q2hhbmdlZDogXy5kZWJvdW5jZSggZnVuY3Rpb24oZSkge1xuXHRcdGlmICggZSAmJiBlLnRhcmdldCApIHtcblx0XHRcdHZhciB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblx0XHRcdHZhbHVlLmxpbmsgPSBlLnRhcmdldC52YWx1ZTtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIHZhbHVlICk7XG5cdFx0fVxuXHR9ICksXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkTGluaztcbiIsIi8qIGdsb2JhbCBhamF4dXJsICovXG5cbnZhciAkICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgRmllbGQgPSByZXF1aXJlKCcuL2ZpZWxkLmpzJyk7XG5cbi8qKlxuICogVGV4dCBGaWVsZCBWaWV3XG4gKlxuICogWW91IGNhbiB1c2UgdGhpcyBhbnl3aGVyZS5cbiAqIEp1c3QgbGlzdGVuIGZvciAnY2hhbmdlJyBldmVudCBvbiB0aGUgdmlldy5cbiAqL1xudmFyIEZpZWxkUG9zdFNlbGVjdCA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICAkKCAnI3RtcGwtbXBiLWZpZWxkLXRleHQnICkuaHRtbCgpLFxuXHR2YWx1ZTogW10sXG5cdG11bHRpcGxlOiB0cnVlLFxuXG5cdGRlZmF1bHRDb25maWc6IHtcblx0XHRtdWx0aXBsZTogdHJ1ZSxcblx0fSxcblxuXHRldmVudHM6IHtcblx0XHQnY2hhbmdlIGlucHV0LnNlbGVjdDInOiAnaW5wdXRDaGFuZ2VkJ1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0LlxuXHQgKlxuXHQgKiBvcHRpb25zLnZhbHVlIGlzIHVzZWQgdG8gcGFzcyBpbml0aWFsIHZhbHVlLlxuXHQgKi9cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0RmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgb3B0aW9ucyBdICk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdGlkOiB0aGlzLmNpZCxcblx0XHRcdHZhbHVlOiAnJyxcblx0XHRcdGNvbmZpZzoge31cblx0XHR9O1xuXG5cdFx0Ly8gQ3JlYXRlIGVsZW1lbnQgZnJvbSB0ZW1wbGF0ZS5cblx0XHR0aGlzLiRlbC5odG1sKCBfLnRlbXBsYXRlKCB0aGlzLnRlbXBsYXRlLCBkYXRhICkgKTtcblxuXHRcdHRoaXMuaW5pdFNlbGVjdDIoKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0c2V0VmFsdWU6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblxuXHRcdGlmICggdGhpcy5tdWx0aXBsZSAmJiAhIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IFsgdmFsdWUgXTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMubXVsdGlwbGUgJiYgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gdmFsdWVbMF07XG5cdFx0fVxuXG5cdFx0RmllbGQucHJvdG90eXBlLnNldFZhbHVlLmFwcGx5KCB0aGlzLCBbIHZhbHVlIF0gKTtcblxuXHR9LFxuXG5cdGdldFZhbHVlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciB2YWx1ZSA9IHRoaXMudmFsdWU7XG5cblx0XHRpZiAoIHRoaXMubXVsdGlwbGUgJiYgISBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXHRcdFx0dmFsdWUgPSBbIHZhbHVlIF07XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLm11bHRpcGxlICYmIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IHZhbHVlWzBdO1xuXHRcdH1cblxuXHRcdHJldHVybiB2YWx1ZTtcblxuXHR9LFxuXG5cdGluaXRTZWxlY3QyOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciAkZmllbGQgPSAkKCAnIycgKyB0aGlzLmNpZCwgdGhpcy4kZWwgKTtcblxuXHRcdHZhciBmb3JtYXRSZXF1ZXN0ID1mdW5jdGlvbiAoIHRlcm0sIHBhZ2UgKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRhY3Rpb246ICdtY2VfZ2V0X3Bvc3RzJyxcblx0XHRcdFx0czogdGVybSxcblx0XHRcdFx0cGFnZTogcGFnZVxuXHRcdFx0fTtcblx0XHR9O1xuXG5cdFx0dmFyIHBhcnNlUmVzdWx0cyA9IGZ1bmN0aW9uICggcmVzcG9uc2UgKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyZXN1bHRzOiByZXNwb25zZS5yZXN1bHRzLFxuXHRcdFx0XHRtb3JlOiByZXNwb25zZS5tb3JlXG5cdFx0XHR9O1xuXHRcdH07XG5cblx0XHR2YXIgaW5pdFNlbGVjdGlvbiA9IGZ1bmN0aW9uKCBlbCwgY2FsbGJhY2sgKSB7XG5cblx0XHRcdHZhciB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKS5qb2luKCcsJyk7XG5cblx0XHRcdGlmICggdmFsdWUubGVuZ3RoICkge1xuXHRcdFx0XHQkLmdldCggYWpheHVybCwge1xuXHRcdFx0XHRcdGFjdGlvbjogJ21jZV9nZXRfcG9zdHMnLFxuXHRcdFx0XHRcdHBvc3RfX2luOiB2YWx1ZSxcblx0XHRcdFx0fSApLmRvbmUoIGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKCBwYXJzZVJlc3VsdHMoIGRhdGEgKS5yZXN1bHRzICk7XG5cdFx0XHRcdH0gKTtcblx0XHRcdH1cblxuXHRcdH0uYmluZCh0aGlzKTtcblxuXHRcdCRmaWVsZC5zZWxlY3QyKHtcblx0XHRcdG1pbmltdW1JbnB1dExlbmd0aDogMSxcblx0XHRcdG11bHRpcGxlOiB0aGlzLmNvbmZpZy5tdWx0aXBsZSxcblx0XHRcdGluaXRTZWxlY3Rpb246IGluaXRTZWxlY3Rpb24sXG5cdFx0XHRhamF4OiB7XG5cdFx0XHRcdHVybDogYWpheHVybCxcblx0XHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRcdCAgICBkZWxheTogMjUwLFxuXHRcdFx0ICAgIGNhY2hlOiBmYWxzZSxcblx0XHRcdFx0ZGF0YTogZm9ybWF0UmVxdWVzdCxcblx0XHRcdFx0cmVzdWx0czogcGFyc2VSZXN1bHRzLFxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdH0sXG5cblx0aW5wdXRDaGFuZ2VkOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciB2YWx1ZSA9ICQoICdpbnB1dC5zZWxlY3QyJywgdGhpcy4kZWwgKS52YWwoKTtcblxuXHRcdGlmICggdGhpcy5jb25maWcubXVsdGlwbGUgKSB7XG5cdFx0XHR2YWx1ZSA9IHZhbHVlLnNwbGl0KCAnLCcgKS5tYXAoIE51bWJlciApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YWx1ZSA9IHBhcnNlSW50KCB2YWx1ZSApO1xuXHRcdH1cblxuXHRcdHRoaXMuc2V0VmFsdWUoIHZhbHVlICk7XG5cblx0fSxcblxuXHRyZW1vdmU6IGZ1bmN0aW9uKCkge1xuXHR9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRQb3N0U2VsZWN0O1xuIiwidmFyICQgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxudmFyIEZpZWxkVGV4dCA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICAkKCAnI3RtcGwtbXBiLWZpZWxkLXRleHQnICkuaHRtbCgpLFxuXG5cdGRlZmF1bHRDb25maWc6IHtcblx0XHRjbGFzc2VzOiAncmVndWxhci10ZXh0Jyxcblx0XHRwbGFjZWhvbGRlcjogbnVsbCxcblx0fSxcblxuXHRldmVudHM6IHtcblx0XHQna2V5dXAgICBpbnB1dCc6ICdpbnB1dENoYW5nZWQnLFxuXHRcdCdjaGFuZ2UgIGlucHV0JzogJ2lucHV0Q2hhbmdlZCcsXG5cdH0sXG5cblx0aW5wdXRDaGFuZ2VkOiBfLmRlYm91bmNlKCBmdW5jdGlvbihlKSB7XG5cdFx0aWYgKCBlICYmIGUudGFyZ2V0ICkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggZS50YXJnZXQudmFsdWUgKTtcblx0XHR9XG5cdH0gKSxcblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkVGV4dDtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBGaWVsZFRleHQgPSByZXF1aXJlKCcuL2ZpZWxkLXRleHQuanMnKTtcblxudmFyIEZpZWxkVGV4dGFyZWEgPSBGaWVsZFRleHQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogICQoICcjdG1wbC1tcGItZmllbGQtdGV4dGFyZWEnICkuaHRtbCgpLFxuXG5cdGV2ZW50czoge1xuXHRcdCdrZXl1cCAgdGV4dGFyZWEnOiAnaW5wdXRDaGFuZ2VkJyxcblx0XHQnY2hhbmdlIHRleHRhcmVhJzogJ2lucHV0Q2hhbmdlZCcsXG5cdH0sXG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFRleHRhcmVhO1xuIiwidmFyICQgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxuLyoqXG4gKiBUZXh0IEZpZWxkIFZpZXdcbiAqXG4gKiBZb3UgY2FuIHVzZSB0aGlzIGFueXdoZXJlLlxuICogSnVzdCBsaXN0ZW4gZm9yICdjaGFuZ2UnIGV2ZW50IG9uIHRoZSB2aWV3LlxuICovXG52YXIgRmllbGRXWVNJV1lHID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogICQoICcjdG1wbC1tcGItZmllbGQtd3lzaXd5ZycgKS5odG1sKCksXG5cdGVkaXRvcjogbnVsbCxcblx0dmFsdWU6IG51bGwsXG5cblx0LyoqXG5cdCAqIEluaXQuXG5cdCAqXG5cdCAqIG9wdGlvbnMudmFsdWUgaXMgdXNlZCB0byBwYXNzIGluaXRpYWwgdmFsdWUuXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblxuXHRcdEZpZWxkLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIG9wdGlvbnMgXSApO1xuXG5cdFx0Ly8gQSBmZXcgaGVscGVycy5cblx0XHR0aGlzLmVkaXRvciA9IHtcblx0XHRcdGlkICAgICAgICAgICA6ICdtcGItdGV4dC1ib2R5LScgKyB0aGlzLmNpZCxcblx0XHRcdG5hbWVSZWdleCAgICA6IG5ldyBSZWdFeHAoICdtcGItcGxhY2Vob2xkZXItbmFtZScsICdnJyApLFxuXHRcdFx0aWRSZWdleCAgICAgIDogbmV3IFJlZ0V4cCggJ21wYi1wbGFjZWhvbGRlci1pZCcsICdnJyApLFxuXHRcdFx0Y29udGVudFJlZ2V4IDogbmV3IFJlZ0V4cCggJ21wYi1wbGFjZWhvbGRlci1jb250ZW50JywgJ2cnICksXG5cdFx0fTtcblxuXHRcdC8vIFRoZSB0ZW1wbGF0ZSBwcm92aWRlZCBpcyBnZW5lcmljIG1hcmt1cCB1c2VkIGJ5IFRpbnlNQ0UuXG5cdFx0Ly8gV2UgbmVlZCBhIHRlbXBsYXRlIHVuaXF1ZSB0byB0aGlzIHZpZXcuXG5cdFx0dGhpcy50ZW1wbGF0ZSAgPSB0aGlzLnRlbXBsYXRlLnJlcGxhY2UoIHRoaXMuZWRpdG9yLm5hbWVSZWdleCwgdGhpcy5lZGl0b3IuaWQgKTtcblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IuaWRSZWdleCwgdGhpcy5lZGl0b3IuaWQgKTtcblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IuY29udGVudFJlZ2V4LCAnPCU9IHZhbHVlICU+JyApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cblx0XHQvLyBDcmVhdGUgZWxlbWVudCBmcm9tIHRlbXBsYXRlLlxuXHRcdHRoaXMuJGVsLmh0bWwoIF8udGVtcGxhdGUoIHRoaXMudGVtcGxhdGUsIHsgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKSB9ICkgKTtcblxuXHRcdC8vIEhpZGUgZWRpdG9yIHRvIHByZXZlbnQgRk9VQy4gU2hvdyBhZ2FpbiBvbiBpbml0LiBTZWUgc2V0dXAuXG5cdFx0JCggJy53cC1lZGl0b3Itd3JhcCcsIHRoaXMuJGVsICkuY3NzKCAnZGlzcGxheScsICdub25lJyApO1xuXG5cdFx0Ly8gSW5pdC4gRGVmZmVycmVkIHRvIG1ha2Ugc3VyZSBjb250YWluZXIgZWxlbWVudCBoYXMgYmVlbiByZW5kZXJlZC5cblx0XHRfLmRlZmVyKCB0aGlzLmluaXRUaW55TUNFLmJpbmQoIHRoaXMgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZSB0aGUgVGlueU1DRSBlZGl0b3IuXG5cdCAqXG5cdCAqIEJpdCBoYWNreSB0aGlzLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG51bGwuXG5cdCAqL1xuXHRpbml0VGlueU1DRTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgc2VsZiA9IHRoaXMsIGlkLCBlZCwgJGVsLCBwcm9wO1xuXG5cdFx0aWQgID0gdGhpcy5lZGl0b3IuaWQ7XG5cdFx0ZWQgID0gdGlueU1DRS5nZXQoIGlkICk7XG5cdFx0JGVsID0gJCggJyN3cC0nICsgaWQgKyAnLXdyYXAnLCB0aGlzLiRlbCApO1xuXG5cdFx0aWYgKCBlZCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBHZXQgc2V0dGluZ3MgZm9yIHRoaXMgZmllbGQuXG5cdFx0Ly8gSWYgbm8gc2V0dGluZ3MgZm9yIHRoaXMgZmllbGQuIENsb25lIGZyb20gcGxhY2Vob2xkZXIuXG5cdFx0aWYgKCB0eXBlb2YoIHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0gKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHR2YXIgbmV3U2V0dGluZ3MgPSBqUXVlcnkuZXh0ZW5kKCB7fSwgdGlueU1DRVByZUluaXQubWNlSW5pdFsgJ21wYi1wbGFjZWhvbGRlci1pZCcgXSApO1xuXHRcdFx0Zm9yICggcHJvcCBpbiBuZXdTZXR0aW5ncyApIHtcblx0XHRcdFx0aWYgKCAnc3RyaW5nJyA9PT0gdHlwZW9mKCBuZXdTZXR0aW5nc1twcm9wXSApICkge1xuXHRcdFx0XHRcdG5ld1NldHRpbmdzW3Byb3BdID0gbmV3U2V0dGluZ3NbcHJvcF0ucmVwbGFjZSggdGhpcy5lZGl0b3IuaWRSZWdleCwgaWQgKS5yZXBsYWNlKCB0aGlzLmVkaXRvci5uYW1lUmVnZXgsIG5hbWUgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGlueU1DRVByZUluaXQubWNlSW5pdFsgaWQgXSA9IG5ld1NldHRpbmdzO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBmdWxsc2NyZWVuIHBsdWdpbi5cblx0XHR0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdLnBsdWdpbnMgPSB0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdLnBsdWdpbnMucmVwbGFjZSggJ2Z1bGxzY3JlZW4sJywgJycgKTtcblxuXHRcdC8vIEdldCBxdWlja3RhZyBzZXR0aW5ncyBmb3IgdGhpcyBmaWVsZC5cblx0XHQvLyBJZiBub25lIGV4aXN0cyBmb3IgdGhpcyBmaWVsZC4gQ2xvbmUgZnJvbSBwbGFjZWhvbGRlci5cblx0XHRpZiAoIHR5cGVvZiggdGlueU1DRVByZUluaXQucXRJbml0WyBpZCBdICkgPT09ICd1bmRlZmluZWQnICkge1xuXHRcdFx0dmFyIG5ld1FUUyA9IGpRdWVyeS5leHRlbmQoIHt9LCB0aW55TUNFUHJlSW5pdC5xdEluaXRbICdtcGItcGxhY2Vob2xkZXItaWQnIF0gKTtcblx0XHRcdGZvciAoIHByb3AgaW4gbmV3UVRTICkge1xuXHRcdFx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YoIG5ld1FUU1twcm9wXSApICkge1xuXHRcdFx0XHRcdG5ld1FUU1twcm9wXSA9IG5ld1FUU1twcm9wXS5yZXBsYWNlKCB0aGlzLmVkaXRvci5pZFJlZ2V4LCBpZCApLnJlcGxhY2UoIHRoaXMuZWRpdG9yLm5hbWVSZWdleCwgbmFtZSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gPSBuZXdRVFM7XG5cdFx0fVxuXG5cdFx0Ly8gV2hlbiBlZGl0b3IgaW5pdHMsIGF0dGFjaCBzYXZlIGNhbGxiYWNrIHRvIGNoYW5nZSBldmVudC5cblx0XHR0aW55TUNFUHJlSW5pdC5tY2VJbml0W2lkXS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdHNlbGYuc2V0VmFsdWUoIGUudGFyZ2V0LmdldENvbnRlbnQoKSApO1xuXHRcdFx0fSApO1xuXG5cdFx0XHQvLyBQcmV2ZW50IEZPVUMuIFNob3cgZWxlbWVudCBhZnRlciBpbml0LlxuXHRcdFx0dGhpcy5vbiggJ2luaXQnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JGVsLmNzcyggJ2Rpc3BsYXknLCAnYmxvY2snICk7XG5cdFx0XHR9KTtcblxuXHRcdH07XG5cblx0XHQvLyBDdXJyZW50IG1vZGUgZGV0ZXJtaW5lZCBieSBjbGFzcyBvbiBlbGVtZW50LlxuXHRcdC8vIElmIG1vZGUgaXMgdmlzdWFsLCBjcmVhdGUgdGhlIHRpbnlNQ0UuXG5cdFx0aWYgKCAkZWwuaGFzQ2xhc3MoJ3RtY2UtYWN0aXZlJykgKSB7XG5cdFx0XHR0aW55TUNFLmluaXQoIHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbaWRdICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRlbC5jc3MoICdkaXNwbGF5JywgJ2Jsb2NrJyApO1xuXHRcdH1cblxuXHRcdC8vIEluaXQgcXVpY2t0YWdzLlxuXHRcdHF1aWNrdGFncyggdGlueU1DRVByZUluaXQucXRJbml0WyBpZCBdICk7XG5cdFx0UVRhZ3MuX2J1dHRvbnNJbml0KCk7XG5cblx0XHQvLyBIYW5kbGUgdGVtcG9yYXJ5IHJlbW92YWwgb2YgdGlueU1DRSB3aGVuIHNvcnRpbmcuXG5cdFx0dGhpcy4kZWwuY2xvc2VzdCgnLnVpLXNvcnRhYmxlJykub24oICdzb3J0c3RhcnQnLCBmdW5jdGlvbiggZXZlbnQsIHVpICkge1xuXHRcdFx0aWYgKCB1aS5pdGVtWzBdLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSA9PT0gdGhpcy5lbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2lkJykgKSB7XG5cdFx0XHRcdHRpbnlNQ0UuZXhlY0NvbW1hbmQoICdtY2VSZW1vdmVFZGl0b3InLCBmYWxzZSwgaWQgKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdC8vIEhhbmRsZSByZS1pbml0IGFmdGVyIHNvcnRpbmcuXG5cdFx0dGhpcy4kZWwuY2xvc2VzdCgnLnVpLXNvcnRhYmxlJykub24oICdzb3J0c3RvcCcsIGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG5cdFx0XHRpZiAoIHVpLml0ZW1bMF0uZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpID09PSB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSApIHtcblx0XHRcdFx0dGlueU1DRS5leGVjQ29tbWFuZCgnbWNlQWRkRWRpdG9yJywgZmFsc2UsIGlkKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHR9LFxuXG5cdHJlbW92ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGlueU1DRS5leGVjQ29tbWFuZCggJ21jZVJlbW92ZUVkaXRvcicsIGZhbHNlLCB0aGlzLmVkaXRvci5pZCApO1xuXHR9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRXWVNJV1lHO1xuIiwiLyoqXG4gKiBBYnN0cmFjdCBGaWVsZCBDbGFzcy5cbiAqXG4gKiBIYW5kbGVzIHNldHVwIGFzIHdlbGwgYXMgZ2V0dGluZyBhbmQgc2V0dGluZyB2YWx1ZXMuXG4gKiBQcm92aWRlcyBhIHZlcnkgZ2VuZXJpYyByZW5kZXIgbWV0aG9kIC0gYnV0IHByb2JhYmx5IGJlIE9LIGZvciBtb3N0IHNpbXBsZSBmaWVsZHMuXG4gKi9cbnZhciBGaWVsZCA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogICAgICBudWxsLFxuXHR2YWx1ZTogICAgICAgICBudWxsLFxuXHRjb25maWc6ICAgICAgICB7fSxcblx0ZGVmYXVsdENvbmZpZzoge30sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUuXG5cdCAqIElmIHlvdSBleHRlbmQgdGhpcyB2aWV3IC0gaXQgaXMgcmVjY29tbWVkZWQgdG8gY2FsbCB0aGlzLlxuXHQgKlxuXHQgKiBFeHBlY3RzIG9wdGlvbnMudmFsdWUgYW5kIG9wdGlvbnMuY29uZmlnLlxuXHQgKi9cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cblx0XHR2YXIgY29uZmlnO1xuXG5cdFx0Xy5iaW5kQWxsKCB0aGlzLCAnZ2V0VmFsdWUnLCAnc2V0VmFsdWUnICk7XG5cblx0XHRpZiAoICd2YWx1ZScgaW4gb3B0aW9ucyApIHtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIG9wdGlvbnMudmFsdWUgKTtcblx0XHR9XG5cblx0XHQvLyBJZiBhIGNoYW5nZSBjYWxsYmFjayBpcyBwcm92aWRlZCwgY2FsbCB0aGlzIG9uIGNoYW5nZS5cblx0XHRpZiAoICdvbkNoYW5nZScgaW4gb3B0aW9ucyApIHtcblx0XHRcdHRoaXMub24oICdjaGFuZ2UnLCBvcHRpb25zLm9uQ2hhbmdlICk7XG5cdFx0fVxuXG5cdFx0Y29uZmlnID0gKCAnY29uZmlnJyBpbiBvcHRpb25zICkgPyBvcHRpb25zLmNvbmZpZyA6IHt9O1xuXHRcdHRoaXMuY29uZmlnID0gXy5leHRlbmQoIHt9LCB0aGlzLmRlZmF1bHRDb25maWcsIGNvbmZpZyApO1xuXG5cdH0sXG5cblx0Z2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnZhbHVlO1xuXHR9LFxuXG5cdHNldFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cblx0XHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cblx0XHR0aGlzLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLmdldFZhbHVlKCkgKTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdGlkOiAgICAgdGhpcy5jaWQsXG5cdFx0XHR2YWx1ZTogIHRoaXMudmFsdWUsXG5cdFx0XHRjb25maWc6IHRoaXMuY29uZmlnXG5cdFx0fTtcblxuXHRcdHRoaXMuJGVsLmh0bWwoIF8udGVtcGxhdGUoIHRoaXMudGVtcGxhdGUsIGRhdGEgKSApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZDtcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xudmFyIEZpZWxkVGV4dCA9IHJlcXVpcmUoJy4vZmllbGRzL2ZpZWxkLXRleHQuanMnKTtcbnZhciBGaWVsZENvbnRlbnRFZGl0YWJsZSA9IHJlcXVpcmUoJy4vZmllbGRzL2ZpZWxkLWNvbnRlbnQtZWRpdGFibGUuanMnKTtcblxuLyoqXG4gKiBIaWdobGlnaHQgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUsXG4gKiBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgSGlnaGxpZ2h0TW9kdWxlRWRpdFZpZXcgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICQoICcjdG1wbC1tcGItbW9kdWxlLWVkaXQtYmxvY2txdW90ZScgKS5odG1sKCksXG5cblx0ZmllbGRzOiB7XG5cdFx0dGV4dDogbnVsbCxcblx0XHRzb3VyY2U6IG51bGwsXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIGF0dHJpYnV0ZXMsIG9wdGlvbnMgXSApO1xuXG5cdFx0dGhpcy5maWVsZHMudGV4dCA9IG5ldyBGaWVsZENvbnRlbnRFZGl0YWJsZSgge1xuXHRcdFx0dmFsdWU6IHRoaXMubW9kZWwuZ2V0QXR0cigndGV4dCcpLmdldCgndmFsdWUnKSxcblx0XHR9ICk7XG5cblx0XHR0aGlzLmZpZWxkcy50ZXh0Lm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdFx0dGhpcy5tb2RlbC5zZXRBdHRyVmFsdWUoICd0ZXh0JywgdmFsdWUgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHRoaXMuZmllbGRzLnNvdXJjZSA9IG5ldyBGaWVsZFRleHQoIHtcblx0XHRcdHZhbHVlOiB0aGlzLm1vZGVsLmdldEF0dHIoJ3NvdXJjZScpLmdldCgndmFsdWUnKSxcblx0XHR9ICk7XG5cblx0XHR0aGlzLmZpZWxkcy5zb3VyY2Uub24oICdjaGFuZ2UnLCBmdW5jdGlvbiggdmFsdWUgKSB7XG5cdFx0XHR0aGlzLm1vZGVsLnNldEF0dHJWYWx1ZSggJ3NvdXJjZScsIHZhbHVlICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzICk7XG5cblx0XHQkKCAnLmZpZWxkLXRleHQnLCB0aGlzLiRlbCApLmFwcGVuZCggdGhpcy5maWVsZHMudGV4dC5yZW5kZXIoKS4kZWwgKTtcblx0XHQkKCAnLmZpZWxkLXNvdXJjZScsIHRoaXMuJGVsICkuYXBwZW5kKCB0aGlzLmZpZWxkcy5zb3VyY2UucmVuZGVyKCkuJGVsICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIaWdobGlnaHRNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ICAgID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xudmFyIEZpZWxkVGV4dCAgICAgPSByZXF1aXJlKCcuL2ZpZWxkcy9maWVsZC10ZXh0LmpzJyk7XG52YXIgRmllbGRUZXh0YXJlYSA9IHJlcXVpcmUoJy4vZmllbGRzL2ZpZWxkLXRleHRhcmVhLmpzJyk7XG5cbi8qKlxuICogSGVhZGVyIE1vZHVsZS5cbiAqIEV4dGVuZHMgZGVmYXVsdCBtb3VkdWxlIHdpdGggY3VzdG9tIGRpZmZlcmVudCB0ZW1wbGF0ZS5cbiAqL1xudmFyIEhlYWRlck1vZHVsZUVkaXRWaWV3ID0gTW9kdWxlRWRpdC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAkKCAnI3RtcGwtbXBiLW1vZHVsZS1lZGl0LWhlYWRlcicgKS5odG1sKCksXG5cblx0ZmllbGRzOiB7XG5cdFx0aGVhZGluZzogbnVsbCxcblx0XHRzdWJoZWFkaW5nOiBudWxsLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBhdHRyaWJ1dGVzLCBvcHRpb25zIF0gKTtcblxuXHRcdHRoaXMuZmllbGRzLmhlYWRpbmcgPSBuZXcgRmllbGRUZXh0KCB7XG5cdFx0XHR2YWx1ZTogdGhpcy5tb2RlbC5nZXRBdHRyKCdoZWFkaW5nJykuZ2V0KCd2YWx1ZScpLFxuXHRcdH0gKTtcblxuXHRcdHRoaXMuZmllbGRzLmhlYWRpbmcub24oICdjaGFuZ2UnLCBmdW5jdGlvbiggdmFsdWUgKSB7XG5cdFx0XHR0aGlzLm1vZGVsLnNldEF0dHJWYWx1ZSggJ2hlYWRpbmcnLCB2YWx1ZSApO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0dGhpcy5maWVsZHMuc3ViaGVhZGluZyA9IG5ldyBGaWVsZFRleHRhcmVhKCB7XG5cdFx0XHR2YWx1ZTogdGhpcy5tb2RlbC5nZXRBdHRyKCdzdWJoZWFkaW5nJykuZ2V0KCd2YWx1ZScpLFxuXHRcdH0gKTtcblxuXHRcdHRoaXMuZmllbGRzLnN1YmhlYWRpbmcub24oICdjaGFuZ2UnLCBmdW5jdGlvbiggdmFsdWUgKSB7XG5cdFx0XHR0aGlzLm1vZGVsLnNldEF0dHJWYWx1ZSggJ3N1YmhlYWRpbmcnLCB2YWx1ZSApO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMgKTtcblx0XHQkKCAnLmZpZWxkLWhlYWRpbmcnLCB0aGlzLiRlbCApLmFwcGVuZCggdGhpcy5maWVsZHMuaGVhZGluZy5yZW5kZXIoKS4kZWwgKTtcblx0XHQkKCAnLmZpZWxkLXN1YmhlYWRpbmcnLCB0aGlzLiRlbCApLmFwcGVuZCggdGhpcy5maWVsZHMuc3ViaGVhZGluZy5yZW5kZXIoKS4kZWwgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyTW9kdWxlRWRpdFZpZXc7XG4iLCJ2YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdCA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcbnZhciBGaWVsZEF0dGFjaG1lbnQgPSByZXF1aXJlKCcuL2ZpZWxkcy9maWVsZC1hdHRhY2htZW50LmpzJyk7XG5cbi8qKlxuICogSGlnaGxpZ2h0IE1vZHVsZS5cbiAqIEV4dGVuZHMgZGVmYXVsdCBtb3VkdWxlLFxuICogY3VzdG9tIGRpZmZlcmVudCB0ZW1wbGF0ZS5cbiAqL1xudmFyIEltYWdlTW9kdWxlRWRpdFZpZXcgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICQoICcjdG1wbC1tcGItbW9kdWxlLWVkaXQtaW1hZ2UnICkuaHRtbCgpLFxuXG5cdGZpZWxkczoge1xuXHRcdGltYWdlOiBudWxsXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIGF0dHJpYnV0ZXMsIG9wdGlvbnMgXSApO1xuXG5cdFx0dGhpcy5pbWFnZUF0dHIgPSB0aGlzLm1vZGVsLmdldEF0dHIoJ2ltYWdlJyk7XG5cblx0XHR2YXIgY29uZmlnID0gdGhpcy5pbWFnZUF0dHIuZ2V0KCdjb25maWcnKSB8fCB7fTtcblxuXHRcdGNvbmZpZyA9IF8uZXh0ZW5kKCB7XG5cdFx0XHRtdWx0aXBsZTogZmFsc2UsXG5cdFx0fSwgY29uZmlnICk7XG5cblx0XHR0aGlzLmZpZWxkcy5pbWFnZSA9IG5ldyBGaWVsZEF0dGFjaG1lbnQoIHtcblx0XHRcdHZhbHVlOiB0aGlzLmltYWdlQXR0ci5nZXQoJ3ZhbHVlJyksXG5cdFx0XHRjb25maWc6IGNvbmZpZyxcblx0XHR9ICk7XG5cblx0XHR0aGlzLmZpZWxkcy5pbWFnZS5vbiggJ2NoYW5nZScsIGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0dGhpcy5tb2RlbC5zZXRBdHRyVmFsdWUoICdpbWFnZScsIGRhdGEgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMgKTtcblxuXHRcdCQoICcuaW1hZ2UtZmllbGQnLCB0aGlzLiRlbCApLmFwcGVuZChcblx0XHRcdHRoaXMuZmllbGRzLmltYWdlLnJlbmRlcigpLiRlbFxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZU1vZHVsZUVkaXRWaWV3O1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG52YXIgRmllbGRUZXh0ICA9IHJlcXVpcmUoJy4vZmllbGRzL2ZpZWxkLXd5c2l3eWcuanMnKTtcblxudmFyIFRleHRNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLW1wYi1tb2R1bGUtZWRpdC10ZXh0JyApLmh0bWwoKSxcblx0dGV4dEZpZWxkOiBudWxsLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBhdHRyaWJ1dGVzLCBvcHRpb25zIF0gKTtcblxuXHRcdC8vIEluaXRpYWxpemUgb3VyIHRleHRmaWVsZCBzdWJ2aWV3LlxuXHRcdHRoaXMudGV4dEZpZWxkID0gbmV3IEZpZWxkVGV4dCgge1xuXHRcdFx0dmFsdWU6IHRoaXMubW9kZWwuZ2V0QXR0cignYm9keScpLmdldCgndmFsdWUnKSxcblx0XHR9ICk7XG5cblx0XHQvLyBMaXN0ZW4gZm9yIGNoYW5nZSBldmVudCBpbiBzdWJ2aWV3IGFuZCB1cGRhdGUgY3VycmVudCB2YWx1ZS5cblx0XHR0aGlzLnRleHRGaWVsZC5vbiggJ2NoYW5nZScsIGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRcdHRoaXMubW9kZWwuc2V0QXR0clZhbHVlKCAnYm9keScsIHZhbHVlICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHQvKipcblx0XHQgKiBEZXN0cm95IHRoZSB0ZXh0IGZpZWxkIHdoZW4gbW9kZWwgaXMgcmVtb3ZlZC5cblx0XHQgKi9cblx0XHR0aGlzLm1vZGVsLm9uKCAnZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy50ZXh0RmllbGQucmVtb3ZlKCk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gQ2FsbCBkZWZhdWx0IE1vZHVsZUVkZWl0IHJlbmRlci5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMgKTtcblxuXHRcdC8vIFJlbmRlciBhbmQgaW5zZXJ0IHRleHRGaWVsZCB2aWV3LlxuXHRcdCQoICcudGV4dC1maWVsZCcsIHRoaXMuJGVsICkuYXBwZW5kKFxuXHRcdFx0dGhpcy50ZXh0RmllbGQucmVuZGVyKCkuJGVsXG5cdFx0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRleHRNb2R1bGVFZGl0VmlldztcbiIsInZhciBCYWNrYm9uZSAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbi8qKlxuICogVmVyeSBnZW5lcmljIGZvcm0gdmlldyBoYW5kbGVyLlxuICogVGhpcyBkb2VzIHNvbWUgYmFzaWMgbWFnaWMgYmFzZWQgb24gZGF0YSBhdHRyaWJ1dGVzIHRvIHVwZGF0ZSBzaW1wbGUgdGV4dCBmaWVsZHMuXG4gKi9cbnZhciBNb2R1bGVFZGl0ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdGNsYXNzTmFtZTogICAgICdtb2R1bGUtZWRpdCcsXG5cdHRvb2xzVGVtcGxhdGU6ICQoJyN0bXBsLW1wYi1tb2R1bGUtZWRpdC10b29scycgKS5odG1sKCksXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0Xy5iaW5kQWxsKCB0aGlzLCAncmVtb3ZlTW9kZWwnICk7XG5cdH0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIC5idXR0b24tc2VsZWN0aW9uLWl0ZW0tcmVtb3ZlJzogJ3JlbW92ZU1vZGVsJyxcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGRhdGEgID0gdGhpcy5tb2RlbC50b0pTT04oKTtcblx0XHRkYXRhLmF0dHIgPSB7fTtcblxuXHRcdC8vIEZvcm1hdCBhdHRyaWJ1dGUgYXJyYXkgZm9yIGVhc3kgdGVtcGxhdGluZy5cblx0XHQvLyBCZWNhdXNlIGF0dHJpYnV0ZXMgaW4gYW4gYXJyYXkgaXMgZGlmZmljdWx0IHRvIGFjY2Vzcy5cblx0XHR0aGlzLm1vZGVsLmdldCgnYXR0cicpLmVhY2goIGZ1bmN0aW9uKCBhdHRyICkge1xuXHRcdFx0ZGF0YS5hdHRyWyBhdHRyLmdldCgnbmFtZScpIF0gPSBhdHRyLnRvSlNPTigpO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJGVsLmh0bWwoIF8udGVtcGxhdGUoIHRoaXMudGVtcGxhdGUsIGRhdGEgKSApO1xuXG5cdFx0Ly8gSUQgYXR0cmlidXRlLCBzbyB3ZSBjYW4gY29ubmVjdCB0aGUgdmlldyBhbmQgbW9kZWwgYWdhaW4gbGF0ZXIuXG5cdFx0dGhpcy4kZWwuYXR0ciggJ2RhdGEtY2lkJywgdGhpcy5tb2RlbC5jaWQgKTtcblxuXHRcdC8vIEFwcGVuZCB0aGUgbW9kdWxlIHRvb2xzLlxuXHRcdHRoaXMuJGVsLnByZXBlbmQoIF8udGVtcGxhdGUoIHRoaXMudG9vbHNUZW1wbGF0ZSwgZGF0YSApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgbW9kZWwgaGFuZGxlci5cblx0ICovXG5cdHJlbW92ZU1vZGVsOiBmdW5jdGlvbihlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHRoaXMucmVtb3ZlKCk7XG5cdFx0dGhpcy5tb2RlbC5kZXN0cm95KCk7XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZUVkaXQ7XG4iXX0=
