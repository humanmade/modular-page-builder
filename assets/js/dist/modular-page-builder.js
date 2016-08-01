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
	editViews:     require('./utils/edit-views.js'),
	fieldViews:    require('./utils/field-views.js'),
	views: {
		BuilderView:     require('./views/builder.js'),
		ModuleEdit:      require('./views/module-edit.js'),
		ModuleEditDefault: require('./views/module-edit-default.js'),
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

},{"./models/builder.js":4,"./utils/edit-views.js":8,"./utils/field-views.js":9,"./utils/module-factory.js":10,"./views/builder.js":11,"./views/fields/field-attachment.js":12,"./views/fields/field-link.js":14,"./views/fields/field-post-select.js":16,"./views/fields/field-text.js":18,"./views/fields/field-textarea.js":19,"./views/fields/field-wysiwyg.js":20,"./views/fields/field.js":21,"./views/module-edit-default.js":22,"./views/module-edit.js":25}],4:[function(require,module,exports){
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

},{"./../collections/modules.js":2,"./../utils/module-factory.js":10}],5:[function(require,module,exports){
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
			this.trigger( 'change', this );
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

},{"./globals":3,"./models/builder.js":4,"./utils/module-factory.js":10,"./views/builder.js":11}],8:[function(require,module,exports){
var ModuleEditDefault = require('./../views/module-edit-default.js');

/**
 * Map module type to views.
 */
var editViews = {
	'default': ModuleEditDefault
};

module.exports = editViews;

},{"./../views/module-edit-default.js":22}],9:[function(require,module,exports){
var FieldText       = require('./../views/fields/field-text.js');
var FieldTextarea   = require('./../views/fields/field-textarea.js');
var FieldWYSIWYG    = require('./../views/fields/field-wysiwyg.js');
var FieldAttachment = require('./../views/fields/field-attachment.js');
var FieldLink       = require('./../views/fields/field-link.js');
var FieldNumber     = require('./../views/fields/field-number.js');
var FieldCheckbox   = require('./../views/fields/field-checkbox.js');
var FieldSelect     = require('./../views/fields/field-select.js');
var FieldPostSelect = require('./../views/fields/field-post-select.js');

var fieldViews = {
	text:        FieldText,
	textarea:    FieldTextarea,
	html:        FieldWYSIWYG,
	number:      FieldNumber,
	attachment:  FieldAttachment,
	link:        FieldLink,
	checkbox:    FieldCheckbox,
	select:      FieldSelect,
	post_select: FieldPostSelect,
};

module.exports = fieldViews;

},{"./../views/fields/field-attachment.js":12,"./../views/fields/field-checkbox.js":13,"./../views/fields/field-link.js":14,"./../views/fields/field-number.js":15,"./../views/fields/field-post-select.js":16,"./../views/fields/field-select.js":17,"./../views/fields/field-text.js":18,"./../views/fields/field-textarea.js":19,"./../views/fields/field-wysiwyg.js":20}],10:[function(require,module,exports){
(function (global){
var Module           = require('./../models/module.js');
var ModuleAtts       = require('./../collections/module-attributes.js');
var editViews        = require('./edit-views.js');
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

	createEditView: function( model ) {

		var editView, moduleName;

		moduleName = model.get('name');
		editView   = ( name in editViews ) ? editViews[ moduleName ] : editViews['default'];

		return new editView( { model: model } );

	},

};

module.exports = ModuleFactory;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../collections/module-attributes.js":1,"./../models/module.js":6,"./edit-views.js":8}],11:[function(require,module,exports){
(function (global){
var wp            = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);
var ModuleFactory = require('./../utils/module-factory.js');
var $             = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

module.exports = wp.Backbone.View.extend({

	template: wp.template( 'mpb-builder' ),
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

		this.model.get('selection').each( function( module ) {
			this.addNewSelectionItemView( module );
		}.bind(this) );

		this.on( 'mpb:rendered', this.rendered );

	},

	prepare: function() {
		var options = this.model.toJSON();
		options.defaultLabel     = modularPageBuilderData.l10n.selectDefault;
		options.availableModules = this.model.getAvailableModules();
		return options;
	},

	render: function() {
		wp.Backbone.View.prototype.render.apply( this, arguments );
		this.trigger( 'mpb:rendered' );
		return this;
	},

	rendered: function() {
		this.initSortable();
	},

	/**
	 * Initialize Sortable.
	 */
	initSortable: function() {
		$( '> .selection', this.$el ).sortable({
			handle: '.module-edit-tools',
			items:  '> .module-edit',
			stop:   function( e, ui ) {
				this.updateSelectionOrder( ui );
				this.triggerSortStop( ui.item.attr( 'data-cid') );
			}.bind( this )
		});
	},

	/**
	 * Sortable end callback.
	 * After reordering, update the selection order.
	 * Note - uses direct manipulation of collection models property.
	 * This is to avoid having to mess about with the views themselves.
	 */
	updateSelectionOrder: function( ui ) {

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
	 * Trigger sort stop on subView (by model CID).
	 */
	triggerSortStop: function( cid ) {

		var views = this.views.get( '> .selection' );

		if ( views && views.length ) {

			var view = _.find( views, function( view ) {
				return cid === view.model.cid;
			} );

			if ( view && ( 'refresh' in view ) ) {
				view.refresh();
			}

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

		if ( ! this.model.isModuleAllowed( item.get('name') ) ) {
			return;
		}

		var view = ModuleFactory.createEditView( item );
		this.views.add( '> .selection', view );

		var $selection = $( '> .selection', this.$el );
		if ( $selection.hasClass('ui-sortable') ) {
			$selection.sortable('refresh');
		}

	},

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../utils/module-factory.js":10}],12:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var wp    = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);
var Field = require('./field.js');

/**
 * Image Field
 *
 * Initialize and listen for the 'change' event to get updated data.
 *
 */
var FieldAttachment = Field.extend({

	template:  wp.template( 'mpb-field-attachment' ),
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
		'click .button.add': 'editImage',
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
		this.on( 'mpb:rendered', this.rendered );

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

		this.selection.comparator = 'menu-order';

		// Initialize selection.
		_.each( this.getValue(), function( item, i ) {

			var model;

			// Legacy. Handle storing full objects.
			item  = ( 'object' === typeof( item ) ) ? item.id : item;
			model = new wp.media.attachment( item );

			model.set( 'menu-order', i );

			this.selection.add( model );

			// Re-render after attachments have synced.
			model.fetch();
			model.on( 'sync', this.render );

		}.bind(this) );

	},

	prepare: function() {
		return {
			id:     this.cid,
			value:  this.selection.toJSON(),
		 	config: this.config,
		};
	},

	rendered: function() {

		this.$el.sortable({
			delay: 150,
			items: '> .image-placeholder',
			stop: function() {

				var selection = this.selection;

				this.$el.children( '.image-placeholder' ).each( function( i ) {

					var id    = parseInt( this.getAttribute( 'data-id' ) );
					var model = selection.findWhere( { id: id } );

					if ( model ) {
						model.set( 'menu-order', i );
					}

				} );

				selection.sort();
				this.setValue( selection.pluck('id') );

			}.bind(this)
		});

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
			$notice  = $( _.template( template )( req ) );
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

},{"./field.js":21}],13:[function(require,module,exports){
(function (global){
var $     = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var wp    = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);
var Field = require('./field.js');

var FieldText = Field.extend({

	template: wp.template( 'mpb-field-checkbox' ),

	defaultConfig: {
		label: 'Test Label',
	},

	events: {
		'change  input': 'inputChanged',
	},

	inputChanged: _.debounce( function() {
		this.setValue( $( 'input', this.$el ).prop( 'checked' ) );
	} ),

} );

module.exports = FieldText;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field.js":21}],14:[function(require,module,exports){
(function (global){
var wp    = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);
var Field = require('./field.js');

var FieldLink = Field.extend({

	template: wp.template( 'mpb-field-link' ),

	events: {
		'keyup   input.field-text': 'textInputChanged',
		'change  input.field-text': 'textInputChanged',
		'keyup   input.field-link': 'linkInputChanged',
		'change  input.field-link': 'linkInputChanged',
	},

	initialize: function( options ) {

		Field.prototype.initialize.apply( this, [ options ] );

		this.value = this.value || {};
		this.value = _.defaults( this.value, { link: '', text: '' } );

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

},{"./field.js":21}],15:[function(require,module,exports){
(function (global){
var wp        = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);
var FieldText = require('./field-text.js');

var FieldNumber = FieldText.extend({

	template: wp.template( 'mpb-field-number' ),

	getValue: function() {
		return parseFloat( this.value );
	},

	setValue: function( value ) {
		this.value = parseFloat( value );
		this.trigger( 'change', this.getValue() );
	},

} );

module.exports = FieldNumber;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field-text.js":18}],16:[function(require,module,exports){
(function (global){
/* global ajaxurl */

var $     = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var wp    = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);
var Field = require('./field.js');

/**
 * Text Field View
 *
 * You can use this anywhere.
 * Just listen for 'change' event on the view.
 */
var FieldPostSelect = Field.extend({

	template: wp.template( 'mpb-field-text' ),

	defaultConfig: {
		multiple: true,
		postType: 'post'
	},

	events: {
		'change input': 'inputChanged'
	},

	initialize: function( options ) {
		Field.prototype.initialize.apply( this, [ options ] );
		this.on( 'mpb:rendered', this.rendered );
	},

	setValue: function( value ) {

		if ( this.config.multiple && ! Array.isArray( value ) ) {
			value = [ value ];
		} else if ( ! this.config.multiple && Array.isArray( value ) ) {
			value = value[0];
		}

		Field.prototype.setValue.apply( this, [ value ] );

	},

	/**
	 * Get Value.
	 *
	 * @param  Return value as an array even if multiple is false.
	 */
	getValue: function() {

		var value = this.value;

		if ( this.config.multiple && ! Array.isArray( value ) ) {
			value = [ value ];
		} else if ( ! this.config.multiple && Array.isArray( value ) ) {
			value = value[0];
		}

		return value;

	},

	prepare: function() {

		var value = this.getValue();
		value = Array.isArray( value ) ? value.join( ',' ) : value;

		return {
			id:     this.cid,
			value:  value,
			config: {}
		};

	},

	rendered: function () {
		this.initSelect2();
	},

	initSelect2: function() {

		var $field = $( '#' + this.cid, this.$el );
		var postType = this.config.postType;

		var formatRequest =function ( term, page ) {
			return {
				action: 'mce_get_posts',
				s: term,
				page: page,
				post_type: postType
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
					post_type: postType
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
			},
		});

	},

	inputChanged: function() {
		var value = $( 'input#' + this.cid, this.$el ).val();
		value = value.split( ',' ).map( Number );
		this.setValue( value );
	},

	remove: function() {
	},

} );

module.exports = FieldPostSelect;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field.js":21}],17:[function(require,module,exports){
(function (global){
var $     = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var wp    = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);
var Field = require('./field.js');

/**
 * Text Field View
 *
 * You can use this anywhere.
 * Just listen for 'change' event on the view.
 */
var FieldSelect = Field.extend({

	template: wp.template( 'mpb-field-select' ),
	value: [],

	defaultConfig: {
		multiple: false,
		options: [],
	},

	events: {
		'change select': 'inputChanged'
	},

	initialize: function( options ) {
		_.bindAll( this, 'parseOption' );
		Field.prototype.initialize.apply( this, [ options ] );
		this.options = options.config.options || [];
	},

	inputChanged: function() {
		this.setValue( $( 'select', this.$el ).val() );
	},

	getOptions: function() {
		return this.options.map( this.parseOption );
	},

	parseOption: function( option ) {
		option = _.defaults( option, { value: '', text: '', selected: false } );
		option.selected = this.isSelected( option.value );
		return option;
	},

	isSelected: function( value ) {
		if ( this.config.multiple ) {
			return this.getValue().indexOf( value ) >= 0;
		} else {
			return value === this.getValue();
		}
	},

	setValue: function( value ) {

		if ( this.config.multiple && ! Array.isArray( value ) ) {
			value = [ value ];
		} else if ( ! this.config.multiple && Array.isArray( value ) ) {
			value = value[0];
		}

		Field.prototype.setValue.apply( this, [ value ] );

	},

	/**
	 * Get Value.
	 *
	 * @param  Return value as an array even if multiple is false.
	 */
	getValue: function() {

		var value = this.value;

		if ( this.config.multiple && ! Array.isArray( value ) ) {
			value = [ value ];
		} else if ( ! this.config.multiple && Array.isArray( value ) ) {
			value = value[0];
		}

		return value;

	},

	render: function () {

		var data = {
			id: this.cid,
			options: this.getOptions(),
		};

		// Create element from template.
		this.$el.html( this.template( data ) );

		return this;

	},

} );

module.exports = FieldSelect;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field.js":21}],18:[function(require,module,exports){
(function (global){
var wp    = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);
var Field = require('./field.js');

var FieldText = Field.extend({

	template: wp.template( 'mpb-field-text' ),

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

},{"./field.js":21}],19:[function(require,module,exports){
(function (global){
var wp        = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);
var FieldText = require('./field-text.js');

var FieldTextarea = FieldText.extend({

	template: wp.template( 'mpb-field-textarea' ),

	events: {
		'keyup  textarea': 'inputChanged',
		'change textarea': 'inputChanged',
	},

} );

module.exports = FieldTextarea;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field-text.js":18}],20:[function(require,module,exports){
(function (global){
var $     = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var wp    = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);
var Field = require('./field.js');

/**
 * Text Field View
 *
 * You can use this anywhere.
 * Just listen for 'change' event on the view.
 */
var FieldWYSIWYG = Field.extend({

	template: wp.template( 'mpb-field-wysiwyg' ),
	editor: null,
	value: null,

	/**
	 * Init.
	 *
	 * options.value is used to pass initial value.
	 */
	initialize: function( options ) {

		Field.prototype.initialize.apply( this, [ options ] );

		this.on( 'mpb:rendered', this.rendered );

	},

	rendered: function () {

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

		var self = this, prop;

		var id    = 'mpb-text-body-' + this.cid;
		var regex = new RegExp( 'mpb-placeholder-(id|name)', 'g' );
		var ed    = tinyMCE.get( id );
		var $el   = $( '#wp-mpb-text-body-' + this.cid + '-wrap', this.$el );

		// If found. Remove so we can re-init.
		if ( ed ) {
			tinyMCE.execCommand( 'mceRemoveEditor', false, id );
		}

		// Get settings for this field.
		// If no settings for this field. Clone from placeholder.
		if ( typeof( tinyMCEPreInit.mceInit[ id ] ) === 'undefined' ) {
			var newSettings = jQuery.extend( {}, tinyMCEPreInit.mceInit[ 'mpb-placeholder-id' ] );
			for ( prop in newSettings ) {
				if ( 'string' === typeof( newSettings[prop] ) ) {
					newSettings[prop] = newSettings[prop].replace( regex, id );
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
					newQTS[prop] = newQTS[prop].replace( regex, id );
				}
			}
			tinyMCEPreInit.qtInit[ id ] = newQTS;
		}

		// When editor inits, attach save callback to change event.
		tinyMCEPreInit.mceInit[id].setup = function() {

			// Listen for changes in the MCE editor.
			this.on( 'change', function( e ) {
				self.setValue( e.target.getContent() );
			} );

			// Prevent FOUC. Show element after init.
			this.on( 'init', function() {
				$el.css( 'display', 'block' );
			});

		};

		// Listen for changes in the HTML editor.
		$('#' + id ).on( 'keydown change', function() {
			self.setValue( this.value );
		} );

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

		var $builder = this.$el.closest( '.ui-sortable' );

		// Handle temporary removal of tinyMCE when sorting.
		$builder.on( 'sortstart', function( event, ui ) {

			if ( event.currentTarget !== $builder ) {
				return;
			}

			if ( ui.item[0].getAttribute('data-cid') === this.el.getAttribute('data-cid') ) {
				tinyMCE.execCommand( 'mceRemoveEditor', false, id );
			}

		}.bind(this) );

		// Handle re-init after sorting.
		$builder.on( 'sortstop', function( event, ui ) {

			if ( event.currentTarget !== $builder ) {
				return;
			}

			if ( ui.item[0].getAttribute('data-cid') === this.el.getAttribute('data-cid') ) {
				tinyMCE.execCommand('mceAddEditor', false, id);
			}

		}.bind(this) );

	},

	remove: function() {
		tinyMCE.execCommand( 'mceRemoveEditor', false, 'mpb-text-body-' + this.cid );
	},

	/**
	 * Refresh view after sort/collapse etc.
	 */
	refresh: function() {
		this.render();
	},

} );

module.exports = FieldWYSIWYG;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field.js":21}],21:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);

/**
 * Abstract Field Class.
 *
 * Handles setup as well as getting and setting values.
 * Provides a very generic render method - but probably be OK for most simple fields.
 */
var Field = wp.Backbone.View.extend({

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

		// If a change callback is provided, call this on change.
		if ( 'onChange' in options ) {
			this.on( 'change', options.onChange );
		}

		config = ( 'config' in options ) ? options.config : {};
		this.config = _.extend( {}, this.defaultConfig, config );

		if ( 'value' in options ) {
			this.setValue( options.value );
		}

	},

	getValue: function() {
		return this.value;
	},

	setValue: function( value ) {
		this.value = value;
		this.trigger( 'change', this.value );
	},

	prepare: function() {
		return {
			id:     this.cid,
			value:  this.value,
			config: this.config
		};
	},

	render: function() {
		wp.Backbone.View.prototype.render.apply( this, arguments );
		this.trigger( 'mpb:rendered' );
		return this;
	},

	/**
	 * Refresh view after sort/collapse etc.
	 */
	refresh: function() {},

} );

module.exports = Field;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],22:[function(require,module,exports){
var ModuleEdit = require('./module-edit.js');
var ModuleEditFormRow = require('./module-edit-form-row.js');
var fieldViews = require('./../utils/field-views.js');

/**
 * Generic Edit Form.
 *
 * Handles a wide range of generic field types.
 * For each attribute, it creates a field based on the attribute 'type'
 * Also uses optional attribute 'config' property when initializing field.
 */
module.exports = ModuleEdit.extend({

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		// this.fields is an easy reference for the field views.
		var fieldsViews = this.fields = [];
		var model       = this.model;

		// For each attribute -
		// initialize a field for that attribute 'type'
		// Store in this.fields
		// Use config from the attribute
		this.model.get('attr').each( function( attr ) {

			var fieldView, type, name, config, view;

			type = attr.get('type');

			if ( ! type || ! ( type in fieldViews ) ) {
				return;
			}

			fieldView = fieldViews[ type ];
			name      = attr.get('name');
			config    = attr.get('config') || {};

			view = new fieldView( {
				value: model.getAttrValue( name ),
				config: config,
				onChange: function( value ) {
					model.setAttrValue( name, value );
				},
			});

			this.views.add( '.module-edit-view', new ModuleEditFormRow( {
				label: attr.get('label'),
				desc:  attr.get('description' ),
				fieldView: view
			} ) );

			fieldsViews.push( view );

		}.bind( this ) );

		// Cleanup.
		// Remove each field view when this model is destroyed.
		this.model.on( 'destroy', function() {
			_.each( this.fields, function( field ) {
				field.remove();
			} );
		} );

	},

	/**
	 * Refresh view.
	 * Required after sort/collapse etc.
	 */
	refresh: function() {
		_.each( this.fields, function( field ) {
			field.refresh();
		} );
	},

});

},{"./../utils/field-views.js":9,"./module-edit-form-row.js":23,"./module-edit.js":25}],23:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);

module.exports = wp.Backbone.View.extend({

	template: wp.template( 'mpb-form-row' ),
	className: 'form-row',

	initialize: function( options ) {
		if ( 'fieldView' in options ) {
			this.views.set( '.field', options.fieldView );
		}
	},

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],24:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);

module.exports = wp.Backbone.View.extend({

	template: wp.template( 'mpb-module-edit-tools' ),
	className: 'module-edit-tools',

	events: {
		'click .button-selection-item-remove': function(e) {
			e.preventDefault();
			this.trigger( 'mpb:module-remove' );
		},
		'click .button-selection-item-toggle': function(e) {
			e.preventDefault();
			this.trigger( 'mpb:module-toggle-collapsed' );
			e.target.blur();
		},
	},

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],25:[function(require,module,exports){
(function (global){
var wp              = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);
var ModuleEditTools = require('./module-edit-tools.js');

/**
 * Very generic form view handler.
 * This does some basic magic based on data attributes to update simple text fields.
 */
module.exports = wp.Backbone.View.extend({

	template:  wp.template( 'mpb-module-edit' ),
	className: 'module-edit',

	initialize: function() {

		_.bindAll( this, 'removeModel', 'refresh', 'toggleCollapsed' );

		var tools = new ModuleEditTools( {
			label: this.model.get( 'label' )
		} );

		this.views.set( '.module-edit-tools-container', tools );

		tools.on( 'mpb:module-remove', this.removeModel );
		tools.on( 'mpb:module-toggle-collapsed', this.toggleCollapsed );

	},

	render: function() {
		wp.Backbone.View.prototype.render.apply( this, arguments );
		this.$el.attr( 'data-cid', this.model.cid );
		return this;
	},

	/**
	 * Remove model handler.
	 */
	removeModel: function() {
		this.remove();
		this.model.destroy();
	},

	/**
	 * Refresh view.
	 * Required after sort/collapse etc.
	 */
	refresh: function() {},

	toggleCollapsed: function() {
		this.$el.toggleClass( 'module-collapsed' );
	}

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit-tools.js":24}]},{},[7])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvc3JjL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9nbG9iYWxzLmpzIiwiYXNzZXRzL2pzL3NyYy9tb2RlbHMvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMiLCJhc3NldHMvanMvc3JjL21vZGVscy9tb2R1bGUuanMiLCJhc3NldHMvanMvc3JjL21vZHVsYXItcGFnZS1idWlsZGVyLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9lZGl0LXZpZXdzLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9maWVsZC12aWV3cy5qcyIsImFzc2V0cy9qcy9zcmMvdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2J1aWxkZXIuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1hdHRhY2htZW50LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtY2hlY2tib3guanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1saW5rLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtbnVtYmVyLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtcG9zdC1zZWxlY3QuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1zZWxlY3QuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC10ZXh0LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtdGV4dGFyZWEuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC13eXNpd3lnLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWRlZmF1bHQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWZvcm0tcm93LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC10b29scy5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDL1VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMvSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgTW9kdWxlQXR0cmlidXRlID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvbW9kdWxlLWF0dHJpYnV0ZS5qcycpO1xuXG4vKipcbiAqIFNob3J0Y29kZSBBdHRyaWJ1dGVzIGNvbGxlY3Rpb24uXG4gKi9cbnZhciBTaG9ydGNvZGVBdHRyaWJ1dGVzID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXG5cdG1vZGVsIDogTW9kdWxlQXR0cmlidXRlLFxuXG5cdC8vIERlZXAgQ2xvbmUuXG5cdGNsb25lOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoIF8ubWFwKCB0aGlzLm1vZGVscywgZnVuY3Rpb24obSkge1xuXHRcdFx0cmV0dXJuIG0uY2xvbmUoKTtcblx0XHR9KSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybiBvbmx5IHRoZSBkYXRhIHRoYXQgbmVlZHMgdG8gYmUgc2F2ZWQuXG5cdCAqXG5cdCAqIEByZXR1cm4gb2JqZWN0XG5cdCAqL1xuXHR0b01pY3JvSlNPTjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIganNvbiA9IHt9O1xuXG5cdFx0dGhpcy5lYWNoKCBmdW5jdGlvbiggbW9kZWwgKSB7XG5cdFx0XHRqc29uWyBtb2RlbC5nZXQoICduYW1lJyApIF0gPSBtb2RlbC50b01pY3JvSlNPTigpO1xuXHRcdH0gKTtcblxuXHRcdHJldHVybiBqc29uO1xuXHR9LFxuXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNob3J0Y29kZUF0dHJpYnV0ZXM7XG4iLCJ2YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGUgICA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL21vZHVsZS5qcycpO1xuXG4vLyBTaG9ydGNvZGUgQ29sbGVjdGlvblxudmFyIE1vZHVsZXMgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cblx0bW9kZWwgOiBNb2R1bGUsXG5cblx0Ly8gIERlZXAgQ2xvbmUuXG5cdGNsb25lIDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCBfLm1hcCggdGhpcy5tb2RlbHMsIGZ1bmN0aW9uKG0pIHtcblx0XHRcdHJldHVybiBtLmNsb25lKCk7XG5cdFx0fSkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdHJldHVybiB0aGlzLm1hcCggZnVuY3Rpb24obW9kZWwpIHsgcmV0dXJuIG1vZGVsLnRvTWljcm9KU09OKCBvcHRpb25zICk7IH0gKTtcblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlcztcbiIsIi8vIEV4cG9zZSBzb21lIGZ1bmN0aW9uYWxpdHkgZ2xvYmFsbHkuXG52YXIgZ2xvYmFscyA9IHtcblx0QnVpbGRlcjogICAgICAgcmVxdWlyZSgnLi9tb2RlbHMvYnVpbGRlci5qcycpLFxuXHRNb2R1bGVGYWN0b3J5OiByZXF1aXJlKCcuL3V0aWxzL21vZHVsZS1mYWN0b3J5LmpzJyksXG5cdGVkaXRWaWV3czogICAgIHJlcXVpcmUoJy4vdXRpbHMvZWRpdC12aWV3cy5qcycpLFxuXHRmaWVsZFZpZXdzOiAgICByZXF1aXJlKCcuL3V0aWxzL2ZpZWxkLXZpZXdzLmpzJyksXG5cdHZpZXdzOiB7XG5cdFx0QnVpbGRlclZpZXc6ICAgICByZXF1aXJlKCcuL3ZpZXdzL2J1aWxkZXIuanMnKSxcblx0XHRNb2R1bGVFZGl0OiAgICAgIHJlcXVpcmUoJy4vdmlld3MvbW9kdWxlLWVkaXQuanMnKSxcblx0XHRNb2R1bGVFZGl0RGVmYXVsdDogcmVxdWlyZSgnLi92aWV3cy9tb2R1bGUtZWRpdC1kZWZhdWx0LmpzJyksXG5cdFx0RmllbGQ6ICAgICAgICAgICByZXF1aXJlKCcuL3ZpZXdzL2ZpZWxkcy9maWVsZC5qcycpLFxuXHRcdEZpZWxkTGluazogICAgICAgcmVxdWlyZSgnLi92aWV3cy9maWVsZHMvZmllbGQtbGluay5qcycpLFxuXHRcdEZpZWxkQXR0YWNobWVudDogcmVxdWlyZSgnLi92aWV3cy9maWVsZHMvZmllbGQtYXR0YWNobWVudC5qcycpLFxuXHRcdEZpZWxkVGV4dDogICAgICAgcmVxdWlyZSgnLi92aWV3cy9maWVsZHMvZmllbGQtdGV4dC5qcycpLFxuXHRcdEZpZWxkVGV4dGFyZWE6ICAgcmVxdWlyZSgnLi92aWV3cy9maWVsZHMvZmllbGQtdGV4dGFyZWEuanMnKSxcblx0XHRGaWVsZFd5c2l3eWc6ICAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLXd5c2l3eWcuanMnKSxcblx0XHRGaWVsZFBvc3RTZWxlY3Q6IHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLXBvc3Qtc2VsZWN0LmpzJyksXG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2xvYmFscztcbiIsInZhciBCYWNrYm9uZSAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgTW9kdWxlcyAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vY29sbGVjdGlvbnMvbW9kdWxlcy5qcycpO1xudmFyIE1vZHVsZUZhY3RvcnkgICAgPSByZXF1aXJlKCcuLy4uL3V0aWxzL21vZHVsZS1mYWN0b3J5LmpzJyk7XG5cbnZhciBCdWlsZGVyID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuXHRkZWZhdWx0czoge1xuXHRcdHNlbGVjdERlZmF1bHQ6ICBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhLmwxMG4uc2VsZWN0RGVmYXVsdCxcblx0XHRhZGROZXdCdXR0b246ICAgbW9kdWxhclBhZ2VCdWlsZGVyRGF0YS5sMTBuLmFkZE5ld0J1dHRvbixcblx0XHRzZWxlY3Rpb246ICAgICAgW10sIC8vIEluc3RhbmNlIG9mIE1vZHVsZXMuIENhbid0IHVzZSBhIGRlZmF1bHQsIG90aGVyd2lzZSB0aGV5IHdvbid0IGJlIHVuaXF1ZS5cblx0XHRhbGxvd2VkTW9kdWxlczogW10sIC8vIE1vZHVsZSBuYW1lcyBhbGxvd2VkIGZvciB0aGlzIGJ1aWxkZXIuXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cblx0XHQvLyBTZXQgZGVmYXVsdCBzZWxlY3Rpb24gdG8gZW5zdXJlIGl0IGlzbid0IGEgcmVmZXJlbmNlLlxuXHRcdGlmICggISAoIHRoaXMuZ2V0KCdzZWxlY3Rpb24nKSBpbnN0YW5jZW9mIE1vZHVsZXMgKSApIHtcblx0XHRcdHRoaXMuc2V0KCAnc2VsZWN0aW9uJywgbmV3IE1vZHVsZXMoKSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdHNldERhdGE6IGZ1bmN0aW9uKCBkYXRhICkge1xuXG5cdFx0dmFyIHNlbGVjdGlvbjtcblxuXHRcdGlmICggJycgPT09IGRhdGEgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gSGFuZGxlIGVpdGhlciBKU09OIHN0cmluZyBvciBwcm9wZXIgb2JoZWN0LlxuXHRcdGRhdGEgPSAoICdzdHJpbmcnID09PSB0eXBlb2YgZGF0YSApID8gSlNPTi5wYXJzZSggZGF0YSApIDogZGF0YTtcblxuXHRcdC8vIENvbnZlcnQgc2F2ZWQgZGF0YSB0byBNb2R1bGUgbW9kZWxzLlxuXHRcdGlmICggZGF0YSAmJiBBcnJheS5pc0FycmF5KCBkYXRhICkgKSB7XG5cdFx0XHRzZWxlY3Rpb24gPSBkYXRhLm1hcCggZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdFx0cmV0dXJuIE1vZHVsZUZhY3RvcnkuY3JlYXRlKCBtb2R1bGUubmFtZSwgbW9kdWxlLmF0dHIgKTtcblx0XHRcdH0gKTtcblx0XHR9XG5cblx0XHQvLyBSZXNldCBzZWxlY3Rpb24gdXNpbmcgZGF0YSBmcm9tIGhpZGRlbiBpbnB1dC5cblx0XHRpZiAoIHNlbGVjdGlvbiAmJiBzZWxlY3Rpb24ubGVuZ3RoICkge1xuXHRcdFx0dGhpcy5nZXQoJ3NlbGVjdGlvbicpLmFkZCggc2VsZWN0aW9uICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0c2F2ZURhdGE6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGRhdGEgPSBbXTtcblxuXHRcdHRoaXMuZ2V0KCdzZWxlY3Rpb24nKS5lYWNoKCBmdW5jdGlvbiggbW9kdWxlICkge1xuXG5cdFx0XHQvLyBTa2lwIGVtcHR5L2Jyb2tlbiBtb2R1bGVzLlxuXHRcdFx0aWYgKCAhIG1vZHVsZS5nZXQoJ25hbWUnICkgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0ZGF0YS5wdXNoKCBtb2R1bGUudG9NaWNyb0pTT04oKSApO1xuXG5cdFx0fSApO1xuXG5cdFx0dGhpcy50cmlnZ2VyKCAnc2F2ZScsIGRhdGEgKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBMaXN0IGFsbCBhdmFpbGFibGUgbW9kdWxlcyBmb3IgdGhpcyBidWlsZGVyLlxuXHQgKiBBbGwgbW9kdWxlcywgZmlsdGVyZWQgYnkgdGhpcy5hbGxvd2VkTW9kdWxlcy5cblx0ICovXG5cdGdldEF2YWlsYWJsZU1vZHVsZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBfLmZpbHRlciggTW9kdWxlRmFjdG9yeS5hdmFpbGFibGVNb2R1bGVzLCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuaXNNb2R1bGVBbGxvd2VkKCBtb2R1bGUubmFtZSApO1xuXHRcdH0uYmluZCggdGhpcyApICk7XG5cdH0sXG5cblx0aXNNb2R1bGVBbGxvd2VkOiBmdW5jdGlvbiggbW9kdWxlTmFtZSApIHtcblx0XHRyZXR1cm4gdGhpcy5nZXQoJ2FsbG93ZWRNb2R1bGVzJykuaW5kZXhPZiggbW9kdWxlTmFtZSApID49IDA7XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQnVpbGRlcjtcbiIsInZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuXG52YXIgTW9kdWxlQXR0cmlidXRlID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuXHRkZWZhdWx0czoge1xuXHRcdG5hbWU6ICAgICAgICAgJycsXG5cdFx0bGFiZWw6ICAgICAgICAnJyxcblx0XHR2YWx1ZTogICAgICAgICcnLFxuXHRcdHR5cGU6ICAgICAgICAgJ3RleHQnLFxuXHRcdGRlc2NyaXB0aW9uOiAgJycsXG5cdFx0ZGVmYXVsdFZhbHVlOiAnJyxcblx0XHRjb25maWc6ICAgICAgIHt9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybiBvbmx5IHRoZSBkYXRhIHRoYXQgbmVlZHMgdG8gYmUgc2F2ZWQuXG5cdCAqXG5cdCAqIEByZXR1cm4gb2JqZWN0XG5cdCAqL1xuXHR0b01pY3JvSlNPTjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgciA9IHt9O1xuXHRcdHZhciBhbGxvd2VkQXR0clByb3BlcnRpZXMgPSBbICduYW1lJywgJ3ZhbHVlJywgJ3R5cGUnIF07XG5cblx0XHRfLmVhY2goIGFsbG93ZWRBdHRyUHJvcGVydGllcywgZnVuY3Rpb24oIHByb3AgKSB7XG5cdFx0XHRyWyBwcm9wIF0gPSB0aGlzLmdldCggcHJvcCApO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0cmV0dXJuIHI7XG5cblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGVBdHRyaWJ1dGU7XG4iLCJ2YXIgQmFja2JvbmUgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZUF0dHMgPSByZXF1aXJlKCcuLy4uL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzJyk7XG5cbnZhciBNb2R1bGUgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXG5cdGRlZmF1bHRzOiB7XG5cdFx0bmFtZTogICcnLFxuXHRcdGxhYmVsOiAnJyxcblx0XHRhdHRyOiAgW10sXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cblx0XHQvLyBTZXQgZGVmYXVsdCBzZWxlY3Rpb24gdG8gZW5zdXJlIGl0IGlzbid0IGEgcmVmZXJlbmNlLlxuXHRcdGlmICggISAoIHRoaXMuZ2V0KCdhdHRyJykgaW5zdGFuY2VvZiBNb2R1bGVBdHRzICkgKSB7XG5cdFx0XHR0aGlzLnNldCggJ2F0dHInLCBuZXcgTW9kdWxlQXR0cygpICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEhlbHBlciBmb3IgZ2V0dGluZyBhbiBhdHRyaWJ1dGUgbW9kZWwgYnkgbmFtZS5cblx0ICovXG5cdGdldEF0dHI6IGZ1bmN0aW9uKCBhdHRyTmFtZSApIHtcblx0XHRyZXR1cm4gdGhpcy5nZXQoJ2F0dHInKS5maW5kV2hlcmUoIHsgbmFtZTogYXR0ck5hbWUgfSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEhlbHBlciBmb3Igc2V0dGluZyBhbiBhdHRyaWJ1dGUgdmFsdWVcblx0ICpcblx0ICogTm90ZSBtYW51YWwgY2hhbmdlIGV2ZW50IHRyaWdnZXIgdG8gZW5zdXJlIGV2ZXJ5dGhpbmcgaXMgdXBkYXRlZC5cblx0ICpcblx0ICogQHBhcmFtIHN0cmluZyBhdHRyaWJ1dGVcblx0ICogQHBhcmFtIG1peGVkICB2YWx1ZVxuXHQgKi9cblx0c2V0QXR0clZhbHVlOiBmdW5jdGlvbiggYXR0cmlidXRlLCB2YWx1ZSApIHtcblxuXHRcdHZhciBhdHRyID0gdGhpcy5nZXRBdHRyKCBhdHRyaWJ1dGUgKTtcblxuXHRcdGlmICggYXR0ciApIHtcblx0XHRcdGF0dHIuc2V0KCAndmFsdWUnLCB2YWx1ZSApO1xuXHRcdFx0dGhpcy50cmlnZ2VyKCAnY2hhbmdlJywgdGhpcyApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgZm9yIGdldHRpbmcgYW4gYXR0cmlidXRlIHZhbHVlLlxuXHQgKlxuXHQgKiBEZWZhdWx0cyB0byBudWxsLlxuXHQgKlxuXHQgKiBAcGFyYW0gc3RyaW5nIGF0dHJpYnV0ZVxuXHQgKi9cblx0Z2V0QXR0clZhbHVlOiBmdW5jdGlvbiggYXR0cmlidXRlICkge1xuXG5cdFx0dmFyIGF0dHIgPSB0aGlzLmdldEF0dHIoIGF0dHJpYnV0ZSApO1xuXG5cdFx0aWYgKCBhdHRyICkge1xuXHRcdFx0cmV0dXJuIGF0dHIuZ2V0KCAndmFsdWUnICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEN1c3RvbSBQYXJzZS5cblx0ICogRW5zdXJlcyBhdHRyaWJ1dGVzIGlzIGFuIGluc3RhbmNlIG9mIE1vZHVsZUF0dHNcblx0ICovXG5cdHBhcnNlOiBmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cblx0XHRpZiAoICdhdHRyJyBpbiByZXNwb25zZSAmJiAhICggcmVzcG9uc2UuYXR0ciBpbnN0YW5jZW9mIE1vZHVsZUF0dHMgKSApIHtcblx0XHRcdHJlc3BvbnNlLmF0dHIgPSBuZXcgTW9kdWxlQXR0cyggcmVzcG9uc2UuYXR0ciApO1xuXHRcdH1cblxuXHQgICAgcmV0dXJuIHJlc3BvbnNlO1xuXG5cdH0sXG5cblx0dG9KU09OOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBqc29uID0gXy5jbG9uZSggdGhpcy5hdHRyaWJ1dGVzICk7XG5cblx0XHRpZiAoICdhdHRyJyBpbiBqc29uICYmICgganNvbi5hdHRyIGluc3RhbmNlb2YgTW9kdWxlQXR0cyApICkge1xuXHRcdFx0anNvbi5hdHRyID0ganNvbi5hdHRyLnRvSlNPTigpO1xuXHRcdH1cblxuXHRcdHJldHVybiBqc29uO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybiBvbmx5IHRoZSBkYXRhIHRoYXQgbmVlZHMgdG8gYmUgc2F2ZWQuXG5cdCAqXG5cdCAqIEByZXR1cm4gb2JqZWN0XG5cdCAqL1xuXHR0b01pY3JvSlNPTjogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG5hbWU6IHRoaXMuZ2V0KCduYW1lJyksXG5cdFx0XHRhdHRyOiB0aGlzLmdldCgnYXR0cicpLnRvTWljcm9KU09OKClcblx0XHR9O1xuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGU7XG4iLCJ2YXIgJCAgICAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgQnVpbGRlciAgICAgICA9IHJlcXVpcmUoJy4vbW9kZWxzL2J1aWxkZXIuanMnKTtcbnZhciBCdWlsZGVyVmlldyAgID0gcmVxdWlyZSgnLi92aWV3cy9idWlsZGVyLmpzJyk7XG52YXIgTW9kdWxlRmFjdG9yeSA9IHJlcXVpcmUoJy4vdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMnKTtcblxuLy8gRXhwb3NlIHNvbWUgZnVuY3Rpb25hbGl0eSB0byBnbG9iYWwgbmFtZXNwYWNlLlxud2luZG93Lm1vZHVsYXJQYWdlQnVpbGRlciA9IHJlcXVpcmUoJy4vZ2xvYmFscycpO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuXG5cdE1vZHVsZUZhY3RvcnkuaW5pdCgpO1xuXG5cdC8vIEEgZmllbGQgZm9yIHN0b3JpbmcgdGhlIGJ1aWxkZXIgZGF0YS5cblx0dmFyICRmaWVsZCA9ICQoICdbbmFtZT1tb2R1bGFyLXBhZ2UtYnVpbGRlci1kYXRhXScgKTtcblxuXHRpZiAoICEgJGZpZWxkLmxlbmd0aCApIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyBBIGNvbnRhaW5lciBlbGVtZW50IGZvciBkaXNwbGF5aW5nIHRoZSBidWlsZGVyLlxuXHR2YXIgJGNvbnRhaW5lciA9ICQoICcjbW9kdWxhci1wYWdlLWJ1aWxkZXInICk7XG5cblx0Ly8gQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEJ1aWxkZXIgbW9kZWwuXG5cdC8vIFBhc3MgYW4gYXJyYXkgb2YgbW9kdWxlIG5hbWVzIHRoYXQgYXJlIGFsbG93ZWQgZm9yIHRoaXMgYnVpbGRlci5cblx0dmFyIGJ1aWxkZXIgPSBuZXcgQnVpbGRlcih7XG5cdFx0YWxsb3dlZE1vZHVsZXM6ICQoICdbbmFtZT1tb2R1bGFyLXBhZ2UtYnVpbGRlci1hbGxvd2VkLW1vZHVsZXNdJyApLnZhbCgpLnNwbGl0KCcsJylcblx0fSk7XG5cblx0Ly8gU2V0IHRoZSBkYXRhIHVzaW5nIHRoZSBjdXJyZW50IGZpZWxkIHZhbHVlXG5cdGJ1aWxkZXIuc2V0RGF0YSggSlNPTi5wYXJzZSggJGZpZWxkLnZhbCgpICkgKTtcblxuXHQvLyBPbiBzYXZlLCB1cGRhdGUgdGhlIGZpZWxkIHZhbHVlLlxuXHRidWlsZGVyLm9uKCAnc2F2ZScsIGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdCRmaWVsZC52YWwoIEpTT04uc3RyaW5naWZ5KCBkYXRhICkgKTtcblx0fSApO1xuXG5cdC8vIENyZWF0ZSBidWlsZGVyIHZpZXcuXG5cdHZhciBidWlsZGVyVmlldyA9IG5ldyBCdWlsZGVyVmlldyggeyBtb2RlbDogYnVpbGRlciB9ICk7XG5cblx0Ly8gUmVuZGVyIGJ1aWxkZXIuXG5cdGJ1aWxkZXJWaWV3LnJlbmRlcigpLiRlbC5hcHBlbmRUbyggJGNvbnRhaW5lciApO1xuXG59KTtcbiIsInZhciBNb2R1bGVFZGl0RGVmYXVsdCA9IHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtZGVmYXVsdC5qcycpO1xuXG4vKipcbiAqIE1hcCBtb2R1bGUgdHlwZSB0byB2aWV3cy5cbiAqL1xudmFyIGVkaXRWaWV3cyA9IHtcblx0J2RlZmF1bHQnOiBNb2R1bGVFZGl0RGVmYXVsdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBlZGl0Vmlld3M7XG4iLCJ2YXIgRmllbGRUZXh0ICAgICAgID0gcmVxdWlyZSgnLi8uLi92aWV3cy9maWVsZHMvZmllbGQtdGV4dC5qcycpO1xudmFyIEZpZWxkVGV4dGFyZWEgICA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLXRleHRhcmVhLmpzJyk7XG52YXIgRmllbGRXWVNJV1lHICAgID0gcmVxdWlyZSgnLi8uLi92aWV3cy9maWVsZHMvZmllbGQtd3lzaXd5Zy5qcycpO1xudmFyIEZpZWxkQXR0YWNobWVudCA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLWF0dGFjaG1lbnQuanMnKTtcbnZhciBGaWVsZExpbmsgICAgICAgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL2ZpZWxkcy9maWVsZC1saW5rLmpzJyk7XG52YXIgRmllbGROdW1iZXIgICAgID0gcmVxdWlyZSgnLi8uLi92aWV3cy9maWVsZHMvZmllbGQtbnVtYmVyLmpzJyk7XG52YXIgRmllbGRDaGVja2JveCAgID0gcmVxdWlyZSgnLi8uLi92aWV3cy9maWVsZHMvZmllbGQtY2hlY2tib3guanMnKTtcbnZhciBGaWVsZFNlbGVjdCAgICAgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL2ZpZWxkcy9maWVsZC1zZWxlY3QuanMnKTtcbnZhciBGaWVsZFBvc3RTZWxlY3QgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL2ZpZWxkcy9maWVsZC1wb3N0LXNlbGVjdC5qcycpO1xuXG52YXIgZmllbGRWaWV3cyA9IHtcblx0dGV4dDogICAgICAgIEZpZWxkVGV4dCxcblx0dGV4dGFyZWE6ICAgIEZpZWxkVGV4dGFyZWEsXG5cdGh0bWw6ICAgICAgICBGaWVsZFdZU0lXWUcsXG5cdG51bWJlcjogICAgICBGaWVsZE51bWJlcixcblx0YXR0YWNobWVudDogIEZpZWxkQXR0YWNobWVudCxcblx0bGluazogICAgICAgIEZpZWxkTGluayxcblx0Y2hlY2tib3g6ICAgIEZpZWxkQ2hlY2tib3gsXG5cdHNlbGVjdDogICAgICBGaWVsZFNlbGVjdCxcblx0cG9zdF9zZWxlY3Q6IEZpZWxkUG9zdFNlbGVjdCxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZmllbGRWaWV3cztcbiIsInZhciBNb2R1bGUgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvbW9kdWxlLmpzJyk7XG52YXIgTW9kdWxlQXR0cyAgICAgICA9IHJlcXVpcmUoJy4vLi4vY29sbGVjdGlvbnMvbW9kdWxlLWF0dHJpYnV0ZXMuanMnKTtcbnZhciBlZGl0Vmlld3MgICAgICAgID0gcmVxdWlyZSgnLi9lZGl0LXZpZXdzLmpzJyk7XG52YXIgJCAgICAgICAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbnZhciBNb2R1bGVGYWN0b3J5ID0ge1xuXG5cdGF2YWlsYWJsZU1vZHVsZXM6IFtdLFxuXG5cdGluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggbW9kdWxhclBhZ2VCdWlsZGVyRGF0YSAmJiAnYXZhaWxhYmxlX21vZHVsZXMnIGluIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEgKSB7XG5cdFx0XHRfLmVhY2goIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEuYXZhaWxhYmxlX21vZHVsZXMsIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHRcdHRoaXMucmVnaXN0ZXJNb2R1bGUoIG1vZHVsZSApO1xuXHRcdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0XHR9XG5cdH0sXG5cblx0cmVnaXN0ZXJNb2R1bGU6IGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0dGhpcy5hdmFpbGFibGVNb2R1bGVzLnB1c2goIG1vZHVsZSApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgTW9kdWxlIE1vZGVsLlxuXHQgKiBVc2UgZGF0YSBmcm9tIGNvbmZpZywgcGx1cyBzYXZlZCBkYXRhLlxuXHQgKlxuXHQgKiBAcGFyYW0gIHN0cmluZyBtb2R1bGVOYW1lXG5cdCAqIEBwYXJhbSAgb2JqZWN0IGF0dHJpYnV0ZSBKU09OLiBTYXZlZCBhdHRyaWJ1dGUgdmFsdWVzLlxuXHQgKiBAcmV0dXJuIE1vZHVsZVxuXHQgKi9cblx0Y3JlYXRlOiBmdW5jdGlvbiggbW9kdWxlTmFtZSwgYXR0ckRhdGEgKSB7XG5cblx0XHR2YXIgZGF0YSA9ICQuZXh0ZW5kKCB0cnVlLCB7fSwgXy5maW5kV2hlcmUoIHRoaXMuYXZhaWxhYmxlTW9kdWxlcywgeyBuYW1lOiBtb2R1bGVOYW1lIH0gKSApO1xuXG5cdFx0aWYgKCAhIGRhdGEgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblxuXHRcdHZhciBhdHRyaWJ1dGVzID0gbmV3IE1vZHVsZUF0dHMoKTtcblxuXHRcdC8qKlxuXHRcdCAqIEFkZCBhbGwgdGhlIG1vZHVsZSBhdHRyaWJ1dGVzLlxuXHRcdCAqIFdoaXRlbGlzdGVkIHRvIGF0dHJpYnV0ZXMgZG9jdW1lbnRlZCBpbiBzY2hlbWFcblx0XHQgKiBTZXRzIG9ubHkgdmFsdWUgZnJvbSBhdHRyRGF0YS5cblx0XHQgKi9cblx0XHRfLmVhY2goIGRhdGEuYXR0ciwgZnVuY3Rpb24oIGF0dHIgKSB7XG5cblx0XHRcdHZhciBjbG9uZUF0dHIgPSAkLmV4dGVuZCggdHJ1ZSwge30sIGF0dHIgICk7XG5cdFx0XHR2YXIgc2F2ZWRBdHRyID0gXy5maW5kV2hlcmUoIGF0dHJEYXRhLCB7IG5hbWU6IGF0dHIubmFtZSB9ICk7XG5cblx0XHRcdC8vIEFkZCBzYXZlZCBhdHRyaWJ1dGUgdmFsdWVzLlxuXHRcdFx0aWYgKCBzYXZlZEF0dHIgJiYgJ3ZhbHVlJyBpbiBzYXZlZEF0dHIgKSB7XG5cdFx0XHRcdGNsb25lQXR0ci52YWx1ZSA9IHNhdmVkQXR0ci52YWx1ZTtcblx0XHRcdH1cblxuXHRcdFx0YXR0cmlidXRlcy5hZGQoIGNsb25lQXR0ciApO1xuXG5cdFx0fSApO1xuXG5cdFx0ZGF0YS5hdHRyID0gYXR0cmlidXRlcztcblxuXHQgICAgcmV0dXJuIG5ldyBNb2R1bGUoIGRhdGEgKTtcblxuXHR9LFxuXG5cdGNyZWF0ZUVkaXRWaWV3OiBmdW5jdGlvbiggbW9kZWwgKSB7XG5cblx0XHR2YXIgZWRpdFZpZXcsIG1vZHVsZU5hbWU7XG5cblx0XHRtb2R1bGVOYW1lID0gbW9kZWwuZ2V0KCduYW1lJyk7XG5cdFx0ZWRpdFZpZXcgICA9ICggbmFtZSBpbiBlZGl0Vmlld3MgKSA/IGVkaXRWaWV3c1sgbW9kdWxlTmFtZSBdIDogZWRpdFZpZXdzWydkZWZhdWx0J107XG5cblx0XHRyZXR1cm4gbmV3IGVkaXRWaWV3KCB7IG1vZGVsOiBtb2RlbCB9ICk7XG5cblx0fSxcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGVGYWN0b3J5O1xuIiwidmFyIHdwICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ10gOiBudWxsKTtcbnZhciBNb2R1bGVGYWN0b3J5ID0gcmVxdWlyZSgnLi8uLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpO1xudmFyICQgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdwLkJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogd3AudGVtcGxhdGUoICdtcGItYnVpbGRlcicgKSxcblx0Y2xhc3NOYW1lOiAnbW9kdWxhci1wYWdlLWJ1aWxkZXInLFxuXHRtb2RlbDogbnVsbCxcblx0bmV3TW9kdWxlTmFtZTogbnVsbCxcblxuXHRldmVudHM6IHtcblx0XHQnY2hhbmdlID4gLmFkZC1uZXcgLmFkZC1uZXctbW9kdWxlLXNlbGVjdCc6ICd0b2dnbGVCdXR0b25TdGF0dXMnLFxuXHRcdCdjbGljayA+IC5hZGQtbmV3IC5hZGQtbmV3LW1vZHVsZS1idXR0b24nOiAnYWRkTW9kdWxlJyxcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLm1vZGVsLmdldCgnc2VsZWN0aW9uJyk7XG5cblx0XHRzZWxlY3Rpb24ub24oICdhZGQnLCB0aGlzLmFkZE5ld1NlbGVjdGlvbkl0ZW1WaWV3LCB0aGlzICk7XG5cdFx0c2VsZWN0aW9uLm9uKCAnYWxsJywgdGhpcy5tb2RlbC5zYXZlRGF0YSwgdGhpcy5tb2RlbCApO1xuXG5cdFx0dGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpLmVhY2goIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHR0aGlzLmFkZE5ld1NlbGVjdGlvbkl0ZW1WaWV3KCBtb2R1bGUgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHRoaXMub24oICdtcGI6cmVuZGVyZWQnLCB0aGlzLnJlbmRlcmVkICk7XG5cblx0fSxcblxuXHRwcmVwYXJlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMubW9kZWwudG9KU09OKCk7XG5cdFx0b3B0aW9ucy5kZWZhdWx0TGFiZWwgICAgID0gbW9kdWxhclBhZ2VCdWlsZGVyRGF0YS5sMTBuLnNlbGVjdERlZmF1bHQ7XG5cdFx0b3B0aW9ucy5hdmFpbGFibGVNb2R1bGVzID0gdGhpcy5tb2RlbC5nZXRBdmFpbGFibGVNb2R1bGVzKCk7XG5cdFx0cmV0dXJuIG9wdGlvbnM7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR3cC5CYWNrYm9uZS5WaWV3LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHRoaXMudHJpZ2dlciggJ21wYjpyZW5kZXJlZCcgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRyZW5kZXJlZDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5pbml0U29ydGFibGUoKTtcblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZSBTb3J0YWJsZS5cblx0ICovXG5cdGluaXRTb3J0YWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0JCggJz4gLnNlbGVjdGlvbicsIHRoaXMuJGVsICkuc29ydGFibGUoe1xuXHRcdFx0aGFuZGxlOiAnLm1vZHVsZS1lZGl0LXRvb2xzJyxcblx0XHRcdGl0ZW1zOiAgJz4gLm1vZHVsZS1lZGl0Jyxcblx0XHRcdHN0b3A6ICAgZnVuY3Rpb24oIGUsIHVpICkge1xuXHRcdFx0XHR0aGlzLnVwZGF0ZVNlbGVjdGlvbk9yZGVyKCB1aSApO1xuXHRcdFx0XHR0aGlzLnRyaWdnZXJTb3J0U3RvcCggdWkuaXRlbS5hdHRyKCAnZGF0YS1jaWQnKSApO1xuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogU29ydGFibGUgZW5kIGNhbGxiYWNrLlxuXHQgKiBBZnRlciByZW9yZGVyaW5nLCB1cGRhdGUgdGhlIHNlbGVjdGlvbiBvcmRlci5cblx0ICogTm90ZSAtIHVzZXMgZGlyZWN0IG1hbmlwdWxhdGlvbiBvZiBjb2xsZWN0aW9uIG1vZGVscyBwcm9wZXJ0eS5cblx0ICogVGhpcyBpcyB0byBhdm9pZCBoYXZpbmcgdG8gbWVzcyBhYm91dCB3aXRoIHRoZSB2aWV3cyB0aGVtc2VsdmVzLlxuXHQgKi9cblx0dXBkYXRlU2VsZWN0aW9uT3JkZXI6IGZ1bmN0aW9uKCB1aSApIHtcblxuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLm1vZGVsLmdldCgnc2VsZWN0aW9uJyk7XG5cdFx0dmFyIGl0ZW0gICAgICA9IHNlbGVjdGlvbi5nZXQoeyBjaWQ6IHVpLml0ZW0uYXR0ciggJ2RhdGEtY2lkJykgfSk7XG5cdFx0dmFyIG5ld0luZGV4ICA9IHVpLml0ZW0uaW5kZXgoKTtcblx0XHR2YXIgb2xkSW5kZXggID0gc2VsZWN0aW9uLmluZGV4T2YoIGl0ZW0gKTtcblxuXHRcdGlmICggbmV3SW5kZXggIT09IG9sZEluZGV4ICkge1xuXHRcdFx0dmFyIGRyb3BwZWQgPSBzZWxlY3Rpb24ubW9kZWxzLnNwbGljZSggb2xkSW5kZXgsIDEgKTtcblx0XHRcdHNlbGVjdGlvbi5tb2RlbHMuc3BsaWNlKCBuZXdJbmRleCwgMCwgZHJvcHBlZFswXSApO1xuXHRcdFx0dGhpcy5tb2RlbC5zYXZlRGF0YSgpO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBUcmlnZ2VyIHNvcnQgc3RvcCBvbiBzdWJWaWV3IChieSBtb2RlbCBDSUQpLlxuXHQgKi9cblx0dHJpZ2dlclNvcnRTdG9wOiBmdW5jdGlvbiggY2lkICkge1xuXG5cdFx0dmFyIHZpZXdzID0gdGhpcy52aWV3cy5nZXQoICc+IC5zZWxlY3Rpb24nICk7XG5cblx0XHRpZiAoIHZpZXdzICYmIHZpZXdzLmxlbmd0aCApIHtcblxuXHRcdFx0dmFyIHZpZXcgPSBfLmZpbmQoIHZpZXdzLCBmdW5jdGlvbiggdmlldyApIHtcblx0XHRcdFx0cmV0dXJuIGNpZCA9PT0gdmlldy5tb2RlbC5jaWQ7XG5cdFx0XHR9ICk7XG5cblx0XHRcdGlmICggdmlldyAmJiAoICdyZWZyZXNoJyBpbiB2aWV3ICkgKSB7XG5cdFx0XHRcdHZpZXcucmVmcmVzaCgpO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIFRvZ2dsZSBidXR0b24gc3RhdHVzLlxuXHQgKiBFbmFibGUvRGlzYWJsZSBidXR0b24gZGVwZW5kaW5nIG9uIHdoZXRoZXJcblx0ICogcGxhY2Vob2xkZXIgb3IgdmFsaWQgbW9kdWxlIGlzIHNlbGVjdGVkLlxuXHQgKi9cblx0dG9nZ2xlQnV0dG9uU3RhdHVzOiBmdW5jdGlvbihlKSB7XG5cdFx0dmFyIHZhbHVlICAgICAgICAgPSAkKGUudGFyZ2V0KS52YWwoKTtcblx0XHR2YXIgZGVmYXVsdE9wdGlvbiA9ICQoZS50YXJnZXQpLmNoaWxkcmVuKCkuZmlyc3QoKS5hdHRyKCd2YWx1ZScpO1xuXHRcdCQoJy5hZGQtbmV3LW1vZHVsZS1idXR0b24nLCB0aGlzLiRlbCApLmF0dHIoICdkaXNhYmxlZCcsIHZhbHVlID09PSBkZWZhdWx0T3B0aW9uICk7XG5cdFx0dGhpcy5uZXdNb2R1bGVOYW1lID0gKCB2YWx1ZSAhPT0gZGVmYXVsdE9wdGlvbiApID8gdmFsdWUgOiBudWxsO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgYWRkaW5nIG1vZHVsZS5cblx0ICpcblx0ICogRmluZCBtb2R1bGUgbW9kZWwuIENsb25lIGl0LiBBZGQgdG8gc2VsZWN0aW9uLlxuXHQgKi9cblx0YWRkTW9kdWxlOiBmdW5jdGlvbihlKSB7XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRpZiAoIHRoaXMubmV3TW9kdWxlTmFtZSAmJiB0aGlzLm1vZGVsLmlzTW9kdWxlQWxsb3dlZCggdGhpcy5uZXdNb2R1bGVOYW1lICkgKSB7XG5cdFx0XHR2YXIgbW9kZWwgPSBNb2R1bGVGYWN0b3J5LmNyZWF0ZSggdGhpcy5uZXdNb2R1bGVOYW1lICk7XG5cdFx0XHR0aGlzLm1vZGVsLmdldCgnc2VsZWN0aW9uJykuYWRkKCBtb2RlbCApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBBcHBlbmQgbmV3IHNlbGVjdGlvbiBpdGVtIHZpZXcuXG5cdCAqL1xuXHRhZGROZXdTZWxlY3Rpb25JdGVtVmlldzogZnVuY3Rpb24oIGl0ZW0gKSB7XG5cblx0XHRpZiAoICEgdGhpcy5tb2RlbC5pc01vZHVsZUFsbG93ZWQoIGl0ZW0uZ2V0KCduYW1lJykgKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgdmlldyA9IE1vZHVsZUZhY3RvcnkuY3JlYXRlRWRpdFZpZXcoIGl0ZW0gKTtcblx0XHR0aGlzLnZpZXdzLmFkZCggJz4gLnNlbGVjdGlvbicsIHZpZXcgKTtcblxuXHRcdHZhciAkc2VsZWN0aW9uID0gJCggJz4gLnNlbGVjdGlvbicsIHRoaXMuJGVsICk7XG5cdFx0aWYgKCAkc2VsZWN0aW9uLmhhc0NsYXNzKCd1aS1zb3J0YWJsZScpICkge1xuXHRcdFx0JHNlbGVjdGlvbi5zb3J0YWJsZSgncmVmcmVzaCcpO1xuXHRcdH1cblxuXHR9LFxuXG59KTtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciB3cCAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG4vKipcbiAqIEltYWdlIEZpZWxkXG4gKlxuICogSW5pdGlhbGl6ZSBhbmQgbGlzdGVuIGZvciB0aGUgJ2NoYW5nZScgZXZlbnQgdG8gZ2V0IHVwZGF0ZWQgZGF0YS5cbiAqXG4gKi9cbnZhciBGaWVsZEF0dGFjaG1lbnQgPSBGaWVsZC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoICdtcGItZmllbGQtYXR0YWNobWVudCcgKSxcblx0ZnJhbWU6ICAgICBudWxsLFxuXHR2YWx1ZTogICAgIFtdLCAvLyBBdHRhY2htZW50IElEcy5cblx0c2VsZWN0aW9uOiB7fSwgLy8gQXR0YWNobWVudHMgY29sbGVjdGlvbiBmb3IgdGhpcy52YWx1ZS5cblxuXHRjb25maWc6ICAgIHt9LFxuXG5cdGRlZmF1bHRDb25maWc6IHtcblx0XHRtdWx0aXBsZTogZmFsc2UsXG5cdFx0bGlicmFyeTogeyB0eXBlOiAnaW1hZ2UnIH0sXG5cdFx0YnV0dG9uX3RleHQ6ICdTZWxlY3QgSW1hZ2UnLFxuXHR9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayAuYnV0dG9uLmFkZCc6ICdlZGl0SW1hZ2UnLFxuXHRcdCdjbGljayAuaW1hZ2UtcGxhY2Vob2xkZXIgLmJ1dHRvbi5yZW1vdmUnOiAncmVtb3ZlSW1hZ2UnLFxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplLlxuXHQgKlxuXHQgKiBQYXNzIHZhbHVlIGFuZCBjb25maWcgYXMgcHJvcGVydGllcyBvbiB0aGUgb3B0aW9ucyBvYmplY3QuXG5cdCAqIEF2YWlsYWJsZSBvcHRpb25zXG5cdCAqIC0gbXVsdGlwbGU6IGJvb2xcblx0ICogLSBzaXplUmVxOiBlZyB7IHdpZHRoOiAxMDAsIGhlaWdodDogMTAwIH1cblx0ICpcblx0ICogQHBhcmFtICBvYmplY3Qgb3B0aW9uc1xuXHQgKiBAcmV0dXJuIG51bGxcblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0Ly8gQ2FsbCBkZWZhdWx0IGluaXRpYWxpemUuXG5cdFx0RmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgb3B0aW9ucyBdICk7XG5cblx0XHRfLmJpbmRBbGwoIHRoaXMsICdyZW5kZXInLCAnZWRpdEltYWdlJywgJ29uU2VsZWN0SW1hZ2UnLCAncmVtb3ZlSW1hZ2UnLCAnaXNBdHRhY2htZW50U2l6ZU9rJyApO1xuXG5cdFx0dGhpcy5vbiggJ2NoYW5nZScsIHRoaXMucmVuZGVyICk7XG5cdFx0dGhpcy5vbiggJ21wYjpyZW5kZXJlZCcsIHRoaXMucmVuZGVyZWQgKTtcblxuXHRcdHRoaXMuaW5pdFNlbGVjdGlvbigpO1xuXG5cdH0sXG5cblx0c2V0VmFsdWU6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblxuXHRcdC8vIEVuc3VyZSB2YWx1ZSBpcyBhcnJheS5cblx0XHRpZiAoICEgdmFsdWUgfHwgISBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXHRcdFx0dmFsdWUgPSBbXTtcblx0XHR9XG5cblx0XHRGaWVsZC5wcm90b3R5cGUuc2V0VmFsdWUuYXBwbHkoIHRoaXMsIFsgdmFsdWUgXSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgU2VsZWN0aW9uLlxuXHQgKlxuXHQgKiBTZWxlY3Rpb24gaXMgYW4gQXR0YWNobWVudCBjb2xsZWN0aW9uIGNvbnRhaW5pbmcgZnVsbCBtb2RlbHMgZm9yIHRoZSBjdXJyZW50IHZhbHVlLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG51bGxcblx0ICovXG5cdGluaXRTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5zZWxlY3Rpb24gPSBuZXcgd3AubWVkaWEubW9kZWwuQXR0YWNobWVudHMoKTtcblxuXHRcdHRoaXMuc2VsZWN0aW9uLmNvbXBhcmF0b3IgPSAnbWVudS1vcmRlcic7XG5cblx0XHQvLyBJbml0aWFsaXplIHNlbGVjdGlvbi5cblx0XHRfLmVhY2goIHRoaXMuZ2V0VmFsdWUoKSwgZnVuY3Rpb24oIGl0ZW0sIGkgKSB7XG5cblx0XHRcdHZhciBtb2RlbDtcblxuXHRcdFx0Ly8gTGVnYWN5LiBIYW5kbGUgc3RvcmluZyBmdWxsIG9iamVjdHMuXG5cdFx0XHRpdGVtICA9ICggJ29iamVjdCcgPT09IHR5cGVvZiggaXRlbSApICkgPyBpdGVtLmlkIDogaXRlbTtcblx0XHRcdG1vZGVsID0gbmV3IHdwLm1lZGlhLmF0dGFjaG1lbnQoIGl0ZW0gKTtcblxuXHRcdFx0bW9kZWwuc2V0KCAnbWVudS1vcmRlcicsIGkgKTtcblxuXHRcdFx0dGhpcy5zZWxlY3Rpb24uYWRkKCBtb2RlbCApO1xuXG5cdFx0XHQvLyBSZS1yZW5kZXIgYWZ0ZXIgYXR0YWNobWVudHMgaGF2ZSBzeW5jZWQuXG5cdFx0XHRtb2RlbC5mZXRjaCgpO1xuXHRcdFx0bW9kZWwub24oICdzeW5jJywgdGhpcy5yZW5kZXIgKTtcblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdH0sXG5cblx0cHJlcGFyZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGlkOiAgICAgdGhpcy5jaWQsXG5cdFx0XHR2YWx1ZTogIHRoaXMuc2VsZWN0aW9uLnRvSlNPTigpLFxuXHRcdCBcdGNvbmZpZzogdGhpcy5jb25maWcsXG5cdFx0fTtcblx0fSxcblxuXHRyZW5kZXJlZDogZnVuY3Rpb24oKSB7XG5cblx0XHR0aGlzLiRlbC5zb3J0YWJsZSh7XG5cdFx0XHRkZWxheTogMTUwLFxuXHRcdFx0aXRlbXM6ICc+IC5pbWFnZS1wbGFjZWhvbGRlcicsXG5cdFx0XHRzdG9wOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5zZWxlY3Rpb247XG5cblx0XHRcdFx0dGhpcy4kZWwuY2hpbGRyZW4oICcuaW1hZ2UtcGxhY2Vob2xkZXInICkuZWFjaCggZnVuY3Rpb24oIGkgKSB7XG5cblx0XHRcdFx0XHR2YXIgaWQgICAgPSBwYXJzZUludCggdGhpcy5nZXRBdHRyaWJ1dGUoICdkYXRhLWlkJyApICk7XG5cdFx0XHRcdFx0dmFyIG1vZGVsID0gc2VsZWN0aW9uLmZpbmRXaGVyZSggeyBpZDogaWQgfSApO1xuXG5cdFx0XHRcdFx0aWYgKCBtb2RlbCApIHtcblx0XHRcdFx0XHRcdG1vZGVsLnNldCggJ21lbnUtb3JkZXInLCBpICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRzZWxlY3Rpb24uc29ydCgpO1xuXHRcdFx0XHR0aGlzLnNldFZhbHVlKCBzZWxlY3Rpb24ucGx1Y2soJ2lkJykgKTtcblxuXHRcdFx0fS5iaW5kKHRoaXMpXG5cdFx0fSk7XG5cblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlIHRoZSBzZWxlY3QgZXZlbnQuXG5cdCAqXG5cdCAqIEluc2VydCBhbiBpbWFnZSBvciBtdWx0aXBsZSBpbWFnZXMuXG5cdCAqL1xuXHRvblNlbGVjdEltYWdlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBmcmFtZSA9IHRoaXMuZnJhbWUgfHwgbnVsbDtcblxuXHRcdGlmICggISBmcmFtZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnNlbGVjdGlvbi5yZXNldChbXSk7XG5cblx0XHRmcmFtZS5zdGF0ZSgpLmdldCgnc2VsZWN0aW9uJykuZWFjaCggZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cblx0XHRcdGlmICggdGhpcy5pc0F0dGFjaG1lbnRTaXplT2soIGF0dGFjaG1lbnQgKSApIHtcblx0XHRcdFx0dGhpcy5zZWxlY3Rpb24uYWRkKCBhdHRhY2htZW50ICk7XG5cdFx0XHR9XG5cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuc2VsZWN0aW9uLnBsdWNrKCdpZCcpICk7XG5cblx0XHRmcmFtZS5jbG9zZSgpO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZSB0aGUgZWRpdCBhY3Rpb24uXG5cdCAqL1xuXHRlZGl0SW1hZ2U6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciBmcmFtZSA9IHRoaXMuZnJhbWU7XG5cblx0XHRpZiAoICEgZnJhbWUgKSB7XG5cblx0XHRcdHZhciBmcmFtZUFyZ3MgPSB7XG5cdFx0XHRcdGxpYnJhcnk6IHRoaXMuY29uZmlnLmxpYnJhcnksXG5cdFx0XHRcdG11bHRpcGxlOiB0aGlzLmNvbmZpZy5tdWx0aXBsZSxcblx0XHRcdFx0dGl0bGU6ICdTZWxlY3QgSW1hZ2UnLFxuXHRcdFx0XHRmcmFtZTogJ3NlbGVjdCcsXG5cdFx0XHR9O1xuXG5cdFx0XHRmcmFtZSA9IHRoaXMuZnJhbWUgPSB3cC5tZWRpYSggZnJhbWVBcmdzICk7XG5cblx0XHRcdGZyYW1lLm9uKCAnY29udGVudDpjcmVhdGU6YnJvd3NlJywgdGhpcy5zZXR1cEZpbHRlcnMsIHRoaXMgKTtcblx0XHRcdGZyYW1lLm9uKCAnY29udGVudDpyZW5kZXI6YnJvd3NlJywgdGhpcy5zaXplRmlsdGVyTm90aWNlLCB0aGlzICk7XG5cdFx0XHRmcmFtZS5vbiggJ3NlbGVjdCcsIHRoaXMub25TZWxlY3RJbWFnZSwgdGhpcyApO1xuXG5cdFx0fVxuXG5cdFx0Ly8gV2hlbiB0aGUgZnJhbWUgb3BlbnMsIHNldCB0aGUgc2VsZWN0aW9uLlxuXHRcdGZyYW1lLm9uKCAnb3BlbicsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgc2VsZWN0aW9uID0gZnJhbWUuc3RhdGUoKS5nZXQoJ3NlbGVjdGlvbicpO1xuXG5cdFx0XHQvLyBTZXQgdGhlIHNlbGVjdGlvbi5cblx0XHRcdC8vIE5vdGUgLSBleHBlY3RzIGFycmF5IG9mIG9iamVjdHMsIG5vdCBhIGNvbGxlY3Rpb24uXG5cdFx0XHRzZWxlY3Rpb24uc2V0KCB0aGlzLnNlbGVjdGlvbi5tb2RlbHMgKTtcblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0ZnJhbWUub3BlbigpO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEFkZCBmaWx0ZXJzIHRvIHRoZSBmcmFtZSBsaWJyYXJ5IGNvbGxlY3Rpb24uXG5cdCAqXG5cdCAqICAtIGZpbHRlciB0byBsaW1pdCB0byByZXF1aXJlZCBzaXplLlxuXHQgKi9cblx0c2V0dXBGaWx0ZXJzOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBsaWIgICAgPSB0aGlzLmZyYW1lLnN0YXRlKCkuZ2V0KCdsaWJyYXJ5Jyk7XG5cblx0XHRpZiAoICdzaXplUmVxJyBpbiB0aGlzLmNvbmZpZyApIHtcblx0XHRcdGxpYi5maWx0ZXJzLnNpemUgPSB0aGlzLmlzQXR0YWNobWVudFNpemVPaztcblx0XHR9XG5cblx0fSxcblxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgZGlzcGxheSBvZiBzaXplIGZpbHRlciBub3RpY2UuXG5cdCAqL1xuXHRzaXplRmlsdGVyTm90aWNlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBsaWIgPSB0aGlzLmZyYW1lLnN0YXRlKCkuZ2V0KCdsaWJyYXJ5Jyk7XG5cblx0XHRpZiAoICEgbGliLmZpbHRlcnMuc2l6ZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBXYWl0IHRvIGJlIHN1cmUgdGhlIGZyYW1lIGlzIHJlbmRlcmVkLlxuXHRcdHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHJlcSwgJG5vdGljZSwgdGVtcGxhdGUsICR0b29sYmFyO1xuXG5cdFx0XHRyZXEgPSBfLmV4dGVuZCgge1xuXHRcdFx0XHR3aWR0aDogMCxcblx0XHRcdFx0aGVpZ2h0OiAwLFxuXHRcdFx0fSwgdGhpcy5jb25maWcuc2l6ZVJlcSApO1xuXG5cdFx0XHQvLyBEaXNwbGF5IG5vdGljZSBvbiBtYWluIGdyaWQgdmlldy5cblx0XHRcdHRlbXBsYXRlID0gJzxwIGNsYXNzPVwiZmlsdGVyLW5vdGljZVwiPk9ubHkgc2hvd2luZyBpbWFnZXMgdGhhdCBtZWV0IHNpemUgcmVxdWlyZW1lbnRzOiA8JT0gd2lkdGggJT5weCAmdGltZXM7IDwlPSBoZWlnaHQgJT5weDwvcD4nO1xuXHRcdFx0JG5vdGljZSAgPSAkKCBfLnRlbXBsYXRlKCB0ZW1wbGF0ZSApKCByZXEgKSApO1xuXHRcdFx0JHRvb2xiYXIgPSAkKCAnLmF0dGFjaG1lbnRzLWJyb3dzZXIgLm1lZGlhLXRvb2xiYXInLCB0aGlzLmZyYW1lLiRlbCApLmZpcnN0KCk7XG5cdFx0XHQkdG9vbGJhci5wcmVwZW5kKCAkbm90aWNlICk7XG5cblx0XHRcdHZhciBjb250ZW50VmlldyA9IHRoaXMuZnJhbWUudmlld3MuZ2V0KCAnLm1lZGlhLWZyYW1lLWNvbnRlbnQnICk7XG5cdFx0XHRjb250ZW50VmlldyA9IGNvbnRlbnRWaWV3WzBdO1xuXG5cdFx0XHQkbm90aWNlID0gJCggJzxwIGNsYXNzPVwiZmlsdGVyLW5vdGljZVwiPkltYWdlIGRvZXMgbm90IG1lZXQgc2l6ZSByZXF1aXJlbWVudHMuPC9wPicgKTtcblxuXHRcdFx0Ly8gRGlzcGxheSBhZGRpdGlvbmFsIG5vdGljZSB3aGVuIHNlbGVjdGluZyBhbiBpbWFnZS5cblx0XHRcdC8vIFJlcXVpcmVkIHRvIGluZGljYXRlIGEgYmFkIGltYWdlIGhhcyBqdXN0IGJlZW4gdXBsb2FkZWQuXG5cdFx0XHRjb250ZW50Vmlldy5vcHRpb25zLnNlbGVjdGlvbi5vbiggJ3NlbGVjdGlvbjpzaW5nbGUnLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHR2YXIgYXR0YWNobWVudCA9IGNvbnRlbnRWaWV3Lm9wdGlvbnMuc2VsZWN0aW9uLnNpbmdsZSgpO1xuXG5cdFx0XHRcdHZhciBkaXNwbGF5Tm90aWNlID0gZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0XHQvLyBJZiBzdGlsbCB1cGxvYWRpbmcsIHdhaXQgYW5kIHRyeSBkaXNwbGF5aW5nIG5vdGljZSBhZ2Fpbi5cblx0XHRcdFx0XHRpZiAoIGF0dGFjaG1lbnQuZ2V0KCAndXBsb2FkaW5nJyApICkge1xuXHRcdFx0XHRcdFx0d2luZG93LnNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRkaXNwbGF5Tm90aWNlKCk7XG5cdFx0XHRcdFx0XHR9LCA1MDAgKTtcblxuXHRcdFx0XHRcdC8vIE9LLiBEaXNwbGF5IG5vdGljZSBhcyByZXF1aXJlZC5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRpZiAoICEgdGhpcy5pc0F0dGFjaG1lbnRTaXplT2soIGF0dGFjaG1lbnQgKSApIHtcblx0XHRcdFx0XHRcdFx0JCggJy5hdHRhY2htZW50cy1icm93c2VyIC5hdHRhY2htZW50LWluZm8nICkucHJlcGVuZCggJG5vdGljZSApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0JG5vdGljZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9LmJpbmQodGhpcyk7XG5cblx0XHRcdFx0ZGlzcGxheU5vdGljZSgpO1xuXG5cdFx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdH0uYmluZCh0aGlzKSwgMTAwICApO1xuXG5cdH0sXG5cblx0cmVtb3ZlSW1hZ2U6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciAkdGFyZ2V0LCBpZDtcblxuXHRcdCR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcblx0XHQkdGFyZ2V0ID0gKCAkdGFyZ2V0LnByb3AoJ3RhZ05hbWUnKSA9PT0gJ0JVVFRPTicgKSA/ICR0YXJnZXQgOiAkdGFyZ2V0LmNsb3Nlc3QoJ2J1dHRvbi5yZW1vdmUnKTtcblx0XHRpZCAgICAgID0gJHRhcmdldC5kYXRhKCAnaW1hZ2UtaWQnICk7XG5cblx0XHRpZiAoICEgaWQgICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuc2VsZWN0aW9uLnJlbW92ZSggdGhpcy5zZWxlY3Rpb24ud2hlcmUoIHsgaWQ6IGlkIH0gKSApO1xuXHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuc2VsZWN0aW9uLnBsdWNrKCdpZCcpICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogRG9lcyBhdHRhY2htZW50IG1lZXQgc2l6ZSByZXF1aXJlbWVudHM/XG5cdCAqXG5cdCAqIEBwYXJhbSAgQXR0YWNobWVudFxuXHQgKiBAcmV0dXJuIGJvb2xlYW5cblx0ICovXG5cdGlzQXR0YWNobWVudFNpemVPazogZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cblx0XHRpZiAoICEgKCAnc2l6ZVJlcScgaW4gdGhpcy5jb25maWcgKSApIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHRoaXMuY29uZmlnLnNpemVSZXEgPSBfLmV4dGVuZCgge1xuXHRcdFx0d2lkdGg6IDAsXG5cdFx0XHRoZWlnaHQ6IDAsXG5cdFx0fSwgdGhpcy5jb25maWcuc2l6ZVJlcSApO1xuXG5cdFx0dmFyIHdpZHRoUmVxICA9IGF0dGFjaG1lbnQuZ2V0KCd3aWR0aCcpICA+PSB0aGlzLmNvbmZpZy5zaXplUmVxLndpZHRoO1xuXHRcdHZhciBoZWlnaHRSZXEgPSBhdHRhY2htZW50LmdldCgnaGVpZ2h0JykgPj0gdGhpcy5jb25maWcuc2l6ZVJlcS5oZWlnaHQ7XG5cblx0XHRyZXR1cm4gd2lkdGhSZXEgJiYgaGVpZ2h0UmVxO1xuXG5cdH1cblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkQXR0YWNobWVudDtcbiIsInZhciAkICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgd3AgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxudmFyIEZpZWxkVGV4dCA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLWZpZWxkLWNoZWNrYm94JyApLFxuXG5cdGRlZmF1bHRDb25maWc6IHtcblx0XHRsYWJlbDogJ1Rlc3QgTGFiZWwnLFxuXHR9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdjaGFuZ2UgIGlucHV0JzogJ2lucHV0Q2hhbmdlZCcsXG5cdH0sXG5cblx0aW5wdXRDaGFuZ2VkOiBfLmRlYm91bmNlKCBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFZhbHVlKCAkKCAnaW5wdXQnLCB0aGlzLiRlbCApLnByb3AoICdjaGVja2VkJyApICk7XG5cdH0gKSxcblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkVGV4dDtcbiIsInZhciB3cCAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG52YXIgRmllbGRMaW5rID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogd3AudGVtcGxhdGUoICdtcGItZmllbGQtbGluaycgKSxcblxuXHRldmVudHM6IHtcblx0XHQna2V5dXAgICBpbnB1dC5maWVsZC10ZXh0JzogJ3RleHRJbnB1dENoYW5nZWQnLFxuXHRcdCdjaGFuZ2UgIGlucHV0LmZpZWxkLXRleHQnOiAndGV4dElucHV0Q2hhbmdlZCcsXG5cdFx0J2tleXVwICAgaW5wdXQuZmllbGQtbGluayc6ICdsaW5rSW5wdXRDaGFuZ2VkJyxcblx0XHQnY2hhbmdlICBpbnB1dC5maWVsZC1saW5rJzogJ2xpbmtJbnB1dENoYW5nZWQnLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0RmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgb3B0aW9ucyBdICk7XG5cblx0XHR0aGlzLnZhbHVlID0gdGhpcy52YWx1ZSB8fCB7fTtcblx0XHR0aGlzLnZhbHVlID0gXy5kZWZhdWx0cyggdGhpcy52YWx1ZSwgeyBsaW5rOiAnJywgdGV4dDogJycgfSApO1xuXG5cdH0sXG5cblx0dGV4dElucHV0Q2hhbmdlZDogXy5kZWJvdW5jZSggZnVuY3Rpb24oZSkge1xuXHRcdGlmICggZSAmJiBlLnRhcmdldCApIHtcblx0XHRcdHZhciB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblx0XHRcdHZhbHVlLnRleHQgPSBlLnRhcmdldC52YWx1ZTtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIHZhbHVlICk7XG5cdFx0fVxuXHR9ICksXG5cblx0bGlua0lucHV0Q2hhbmdlZDogXy5kZWJvdW5jZSggZnVuY3Rpb24oZSkge1xuXHRcdGlmICggZSAmJiBlLnRhcmdldCApIHtcblx0XHRcdHZhciB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblx0XHRcdHZhbHVlLmxpbmsgPSBlLnRhcmdldC52YWx1ZTtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIHZhbHVlICk7XG5cdFx0fVxuXHR9ICksXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkTGluaztcbiIsInZhciB3cCAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ10gOiBudWxsKTtcbnZhciBGaWVsZFRleHQgPSByZXF1aXJlKCcuL2ZpZWxkLXRleHQuanMnKTtcblxudmFyIEZpZWxkTnVtYmVyID0gRmllbGRUZXh0LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLWZpZWxkLW51bWJlcicgKSxcblxuXHRnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQoIHRoaXMudmFsdWUgKTtcblx0fSxcblxuXHRzZXRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdHRoaXMudmFsdWUgPSBwYXJzZUZsb2F0KCB2YWx1ZSApO1xuXHRcdHRoaXMudHJpZ2dlciggJ2NoYW5nZScsIHRoaXMuZ2V0VmFsdWUoKSApO1xuXHR9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGROdW1iZXI7XG4iLCIvKiBnbG9iYWwgYWpheHVybCAqL1xuXG52YXIgJCAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIHdwICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddIDogbnVsbCk7XG52YXIgRmllbGQgPSByZXF1aXJlKCcuL2ZpZWxkLmpzJyk7XG5cbi8qKlxuICogVGV4dCBGaWVsZCBWaWV3XG4gKlxuICogWW91IGNhbiB1c2UgdGhpcyBhbnl3aGVyZS5cbiAqIEp1c3QgbGlzdGVuIGZvciAnY2hhbmdlJyBldmVudCBvbiB0aGUgdmlldy5cbiAqL1xudmFyIEZpZWxkUG9zdFNlbGVjdCA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLWZpZWxkLXRleHQnICksXG5cblx0ZGVmYXVsdENvbmZpZzoge1xuXHRcdG11bHRpcGxlOiB0cnVlLFxuXHRcdHBvc3RUeXBlOiAncG9zdCdcblx0fSxcblxuXHRldmVudHM6IHtcblx0XHQnY2hhbmdlIGlucHV0JzogJ2lucHV0Q2hhbmdlZCdcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHRGaWVsZC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBvcHRpb25zIF0gKTtcblx0XHR0aGlzLm9uKCAnbXBiOnJlbmRlcmVkJywgdGhpcy5yZW5kZXJlZCApO1xuXHR9LFxuXG5cdHNldFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cblx0XHRpZiAoIHRoaXMuY29uZmlnLm11bHRpcGxlICYmICEgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gWyB2YWx1ZSBdO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5jb25maWcubXVsdGlwbGUgJiYgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gdmFsdWVbMF07XG5cdFx0fVxuXG5cdFx0RmllbGQucHJvdG90eXBlLnNldFZhbHVlLmFwcGx5KCB0aGlzLCBbIHZhbHVlIF0gKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgVmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSAgUmV0dXJuIHZhbHVlIGFzIGFuIGFycmF5IGV2ZW4gaWYgbXVsdGlwbGUgaXMgZmFsc2UuXG5cdCAqL1xuXHRnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgdmFsdWUgPSB0aGlzLnZhbHVlO1xuXG5cdFx0aWYgKCB0aGlzLmNvbmZpZy5tdWx0aXBsZSAmJiAhIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IFsgdmFsdWUgXTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMuY29uZmlnLm11bHRpcGxlICYmIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IHZhbHVlWzBdO1xuXHRcdH1cblxuXHRcdHJldHVybiB2YWx1ZTtcblxuXHR9LFxuXG5cdHByZXBhcmU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdHZhbHVlID0gQXJyYXkuaXNBcnJheSggdmFsdWUgKSA/IHZhbHVlLmpvaW4oICcsJyApIDogdmFsdWU7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0aWQ6ICAgICB0aGlzLmNpZCxcblx0XHRcdHZhbHVlOiAgdmFsdWUsXG5cdFx0XHRjb25maWc6IHt9XG5cdFx0fTtcblxuXHR9LFxuXG5cdHJlbmRlcmVkOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5pbml0U2VsZWN0MigpO1xuXHR9LFxuXG5cdGluaXRTZWxlY3QyOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciAkZmllbGQgPSAkKCAnIycgKyB0aGlzLmNpZCwgdGhpcy4kZWwgKTtcblx0XHR2YXIgcG9zdFR5cGUgPSB0aGlzLmNvbmZpZy5wb3N0VHlwZTtcblxuXHRcdHZhciBmb3JtYXRSZXF1ZXN0ID1mdW5jdGlvbiAoIHRlcm0sIHBhZ2UgKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRhY3Rpb246ICdtY2VfZ2V0X3Bvc3RzJyxcblx0XHRcdFx0czogdGVybSxcblx0XHRcdFx0cGFnZTogcGFnZSxcblx0XHRcdFx0cG9zdF90eXBlOiBwb3N0VHlwZVxuXHRcdFx0fTtcblx0XHR9O1xuXG5cdFx0dmFyIHBhcnNlUmVzdWx0cyA9IGZ1bmN0aW9uICggcmVzcG9uc2UgKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyZXN1bHRzOiByZXNwb25zZS5yZXN1bHRzLFxuXHRcdFx0XHRtb3JlOiByZXNwb25zZS5tb3JlXG5cdFx0XHR9O1xuXHRcdH07XG5cblx0XHR2YXIgaW5pdFNlbGVjdGlvbiA9IGZ1bmN0aW9uKCBlbCwgY2FsbGJhY2sgKSB7XG5cblx0XHRcdHZhciB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKS5qb2luKCcsJyk7XG5cblx0XHRcdGlmICggdmFsdWUubGVuZ3RoICkge1xuXHRcdFx0XHQkLmdldCggYWpheHVybCwge1xuXHRcdFx0XHRcdGFjdGlvbjogJ21jZV9nZXRfcG9zdHMnLFxuXHRcdFx0XHRcdHBvc3RfX2luOiB2YWx1ZSxcblx0XHRcdFx0XHRwb3N0X3R5cGU6IHBvc3RUeXBlXG5cdFx0XHRcdH0gKS5kb25lKCBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdFx0XHRjYWxsYmFjayggcGFyc2VSZXN1bHRzKCBkYXRhICkucmVzdWx0cyApO1xuXHRcdFx0XHR9ICk7XG5cdFx0XHR9XG5cblx0XHR9LmJpbmQodGhpcyk7XG5cblx0XHQkZmllbGQuc2VsZWN0Mih7XG5cdFx0XHRtaW5pbXVtSW5wdXRMZW5ndGg6IDEsXG5cdFx0XHRtdWx0aXBsZTogdGhpcy5jb25maWcubXVsdGlwbGUsXG5cdFx0XHRpbml0U2VsZWN0aW9uOiBpbml0U2VsZWN0aW9uLFxuXHRcdFx0YWpheDoge1xuXHRcdFx0XHR1cmw6IGFqYXh1cmwsXG5cdFx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHQgICAgZGVsYXk6IDI1MCxcblx0XHRcdCAgICBjYWNoZTogZmFsc2UsXG5cdFx0XHRcdGRhdGE6IGZvcm1hdFJlcXVlc3QsXG5cdFx0XHRcdHJlc3VsdHM6IHBhcnNlUmVzdWx0cyxcblx0XHRcdH0sXG5cdFx0fSk7XG5cblx0fSxcblxuXHRpbnB1dENoYW5nZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB2YWx1ZSA9ICQoICdpbnB1dCMnICsgdGhpcy5jaWQsIHRoaXMuJGVsICkudmFsKCk7XG5cdFx0dmFsdWUgPSB2YWx1ZS5zcGxpdCggJywnICkubWFwKCBOdW1iZXIgKTtcblx0XHR0aGlzLnNldFZhbHVlKCB2YWx1ZSApO1xuXHR9LFxuXG5cdHJlbW92ZTogZnVuY3Rpb24oKSB7XG5cdH0sXG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFBvc3RTZWxlY3Q7XG4iLCJ2YXIgJCAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIHdwICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddIDogbnVsbCk7XG52YXIgRmllbGQgPSByZXF1aXJlKCcuL2ZpZWxkLmpzJyk7XG5cbi8qKlxuICogVGV4dCBGaWVsZCBWaWV3XG4gKlxuICogWW91IGNhbiB1c2UgdGhpcyBhbnl3aGVyZS5cbiAqIEp1c3QgbGlzdGVuIGZvciAnY2hhbmdlJyBldmVudCBvbiB0aGUgdmlldy5cbiAqL1xudmFyIEZpZWxkU2VsZWN0ID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogd3AudGVtcGxhdGUoICdtcGItZmllbGQtc2VsZWN0JyApLFxuXHR2YWx1ZTogW10sXG5cblx0ZGVmYXVsdENvbmZpZzoge1xuXHRcdG11bHRpcGxlOiBmYWxzZSxcblx0XHRvcHRpb25zOiBbXSxcblx0fSxcblxuXHRldmVudHM6IHtcblx0XHQnY2hhbmdlIHNlbGVjdCc6ICdpbnB1dENoYW5nZWQnXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0Xy5iaW5kQWxsKCB0aGlzLCAncGFyc2VPcHRpb24nICk7XG5cdFx0RmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgb3B0aW9ucyBdICk7XG5cdFx0dGhpcy5vcHRpb25zID0gb3B0aW9ucy5jb25maWcub3B0aW9ucyB8fCBbXTtcblx0fSxcblxuXHRpbnB1dENoYW5nZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0VmFsdWUoICQoICdzZWxlY3QnLCB0aGlzLiRlbCApLnZhbCgpICk7XG5cdH0sXG5cblx0Z2V0T3B0aW9uczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMub3B0aW9ucy5tYXAoIHRoaXMucGFyc2VPcHRpb24gKTtcblx0fSxcblxuXHRwYXJzZU9wdGlvbjogZnVuY3Rpb24oIG9wdGlvbiApIHtcblx0XHRvcHRpb24gPSBfLmRlZmF1bHRzKCBvcHRpb24sIHsgdmFsdWU6ICcnLCB0ZXh0OiAnJywgc2VsZWN0ZWQ6IGZhbHNlIH0gKTtcblx0XHRvcHRpb24uc2VsZWN0ZWQgPSB0aGlzLmlzU2VsZWN0ZWQoIG9wdGlvbi52YWx1ZSApO1xuXHRcdHJldHVybiBvcHRpb247XG5cdH0sXG5cblx0aXNTZWxlY3RlZDogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdGlmICggdGhpcy5jb25maWcubXVsdGlwbGUgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRWYWx1ZSgpLmluZGV4T2YoIHZhbHVlICkgPj0gMDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHZhbHVlID09PSB0aGlzLmdldFZhbHVlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdHNldFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cblx0XHRpZiAoIHRoaXMuY29uZmlnLm11bHRpcGxlICYmICEgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gWyB2YWx1ZSBdO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5jb25maWcubXVsdGlwbGUgJiYgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gdmFsdWVbMF07XG5cdFx0fVxuXG5cdFx0RmllbGQucHJvdG90eXBlLnNldFZhbHVlLmFwcGx5KCB0aGlzLCBbIHZhbHVlIF0gKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgVmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSAgUmV0dXJuIHZhbHVlIGFzIGFuIGFycmF5IGV2ZW4gaWYgbXVsdGlwbGUgaXMgZmFsc2UuXG5cdCAqL1xuXHRnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgdmFsdWUgPSB0aGlzLnZhbHVlO1xuXG5cdFx0aWYgKCB0aGlzLmNvbmZpZy5tdWx0aXBsZSAmJiAhIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IFsgdmFsdWUgXTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMuY29uZmlnLm11bHRpcGxlICYmIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IHZhbHVlWzBdO1xuXHRcdH1cblxuXHRcdHJldHVybiB2YWx1ZTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRpZDogdGhpcy5jaWQsXG5cdFx0XHRvcHRpb25zOiB0aGlzLmdldE9wdGlvbnMoKSxcblx0XHR9O1xuXG5cdFx0Ly8gQ3JlYXRlIGVsZW1lbnQgZnJvbSB0ZW1wbGF0ZS5cblx0XHR0aGlzLiRlbC5odG1sKCB0aGlzLnRlbXBsYXRlKCBkYXRhICkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFNlbGVjdDtcbiIsInZhciB3cCAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG52YXIgRmllbGRUZXh0ID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogd3AudGVtcGxhdGUoICdtcGItZmllbGQtdGV4dCcgKSxcblxuXHRkZWZhdWx0Q29uZmlnOiB7XG5cdFx0Y2xhc3NlczogJ3JlZ3VsYXItdGV4dCcsXG5cdFx0cGxhY2Vob2xkZXI6IG51bGwsXG5cdH0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2tleXVwICAgaW5wdXQnOiAnaW5wdXRDaGFuZ2VkJyxcblx0XHQnY2hhbmdlICBpbnB1dCc6ICdpbnB1dENoYW5nZWQnLFxuXHR9LFxuXG5cdGlucHV0Q2hhbmdlZDogXy5kZWJvdW5jZSggZnVuY3Rpb24oZSkge1xuXHRcdGlmICggZSAmJiBlLnRhcmdldCApIHtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIGUudGFyZ2V0LnZhbHVlICk7XG5cdFx0fVxuXHR9ICksXG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFRleHQ7XG4iLCJ2YXIgd3AgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddIDogbnVsbCk7XG52YXIgRmllbGRUZXh0ID0gcmVxdWlyZSgnLi9maWVsZC10ZXh0LmpzJyk7XG5cbnZhciBGaWVsZFRleHRhcmVhID0gRmllbGRUZXh0LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLWZpZWxkLXRleHRhcmVhJyApLFxuXG5cdGV2ZW50czoge1xuXHRcdCdrZXl1cCAgdGV4dGFyZWEnOiAnaW5wdXRDaGFuZ2VkJyxcblx0XHQnY2hhbmdlIHRleHRhcmVhJzogJ2lucHV0Q2hhbmdlZCcsXG5cdH0sXG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFRleHRhcmVhO1xuIiwidmFyICQgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciB3cCAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG4vKipcbiAqIFRleHQgRmllbGQgVmlld1xuICpcbiAqIFlvdSBjYW4gdXNlIHRoaXMgYW55d2hlcmUuXG4gKiBKdXN0IGxpc3RlbiBmb3IgJ2NoYW5nZScgZXZlbnQgb24gdGhlIHZpZXcuXG4gKi9cbnZhciBGaWVsZFdZU0lXWUcgPSBGaWVsZC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiB3cC50ZW1wbGF0ZSggJ21wYi1maWVsZC13eXNpd3lnJyApLFxuXHRlZGl0b3I6IG51bGwsXG5cdHZhbHVlOiBudWxsLFxuXG5cdC8qKlxuXHQgKiBJbml0LlxuXHQgKlxuXHQgKiBvcHRpb25zLnZhbHVlIGlzIHVzZWQgdG8gcGFzcyBpbml0aWFsIHZhbHVlLlxuXHQgKi9cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cblx0XHRGaWVsZC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBvcHRpb25zIF0gKTtcblxuXHRcdHRoaXMub24oICdtcGI6cmVuZGVyZWQnLCB0aGlzLnJlbmRlcmVkICk7XG5cblx0fSxcblxuXHRyZW5kZXJlZDogZnVuY3Rpb24gKCkge1xuXG5cdFx0Ly8gSGlkZSBlZGl0b3IgdG8gcHJldmVudCBGT1VDLiBTaG93IGFnYWluIG9uIGluaXQuIFNlZSBzZXR1cC5cblx0XHQkKCAnLndwLWVkaXRvci13cmFwJywgdGhpcy4kZWwgKS5jc3MoICdkaXNwbGF5JywgJ25vbmUnICk7XG5cblx0XHQvLyBJbml0LiBEZWZmZXJyZWQgdG8gbWFrZSBzdXJlIGNvbnRhaW5lciBlbGVtZW50IGhhcyBiZWVuIHJlbmRlcmVkLlxuXHRcdF8uZGVmZXIoIHRoaXMuaW5pdFRpbnlNQ0UuYmluZCggdGhpcyApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIHRoZSBUaW55TUNFIGVkaXRvci5cblx0ICpcblx0ICogQml0IGhhY2t5IHRoaXMuXG5cdCAqXG5cdCAqIEByZXR1cm4gbnVsbC5cblx0ICovXG5cdGluaXRUaW55TUNFOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBzZWxmID0gdGhpcywgcHJvcDtcblxuXHRcdHZhciBpZCAgICA9ICdtcGItdGV4dC1ib2R5LScgKyB0aGlzLmNpZDtcblx0XHR2YXIgcmVnZXggPSBuZXcgUmVnRXhwKCAnbXBiLXBsYWNlaG9sZGVyLShpZHxuYW1lKScsICdnJyApO1xuXHRcdHZhciBlZCAgICA9IHRpbnlNQ0UuZ2V0KCBpZCApO1xuXHRcdHZhciAkZWwgICA9ICQoICcjd3AtbXBiLXRleHQtYm9keS0nICsgdGhpcy5jaWQgKyAnLXdyYXAnLCB0aGlzLiRlbCApO1xuXG5cdFx0Ly8gSWYgZm91bmQuIFJlbW92ZSBzbyB3ZSBjYW4gcmUtaW5pdC5cblx0XHRpZiAoIGVkICkge1xuXHRcdFx0dGlueU1DRS5leGVjQ29tbWFuZCggJ21jZVJlbW92ZUVkaXRvcicsIGZhbHNlLCBpZCApO1xuXHRcdH1cblxuXHRcdC8vIEdldCBzZXR0aW5ncyBmb3IgdGhpcyBmaWVsZC5cblx0XHQvLyBJZiBubyBzZXR0aW5ncyBmb3IgdGhpcyBmaWVsZC4gQ2xvbmUgZnJvbSBwbGFjZWhvbGRlci5cblx0XHRpZiAoIHR5cGVvZiggdGlueU1DRVByZUluaXQubWNlSW5pdFsgaWQgXSApID09PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdHZhciBuZXdTZXR0aW5ncyA9IGpRdWVyeS5leHRlbmQoIHt9LCB0aW55TUNFUHJlSW5pdC5tY2VJbml0WyAnbXBiLXBsYWNlaG9sZGVyLWlkJyBdICk7XG5cdFx0XHRmb3IgKCBwcm9wIGluIG5ld1NldHRpbmdzICkge1xuXHRcdFx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YoIG5ld1NldHRpbmdzW3Byb3BdICkgKSB7XG5cdFx0XHRcdFx0bmV3U2V0dGluZ3NbcHJvcF0gPSBuZXdTZXR0aW5nc1twcm9wXS5yZXBsYWNlKCByZWdleCwgaWQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdID0gbmV3U2V0dGluZ3M7XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGZ1bGxzY3JlZW4gcGx1Z2luLlxuXHRcdHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0ucGx1Z2lucyA9IHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0ucGx1Z2lucy5yZXBsYWNlKCAnZnVsbHNjcmVlbiwnLCAnJyApO1xuXG5cdFx0Ly8gR2V0IHF1aWNrdGFnIHNldHRpbmdzIGZvciB0aGlzIGZpZWxkLlxuXHRcdC8vIElmIG5vbmUgZXhpc3RzIGZvciB0aGlzIGZpZWxkLiBDbG9uZSBmcm9tIHBsYWNlaG9sZGVyLlxuXHRcdGlmICggdHlwZW9mKCB0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHR2YXIgbmV3UVRTID0galF1ZXJ5LmV4dGVuZCgge30sIHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgJ21wYi1wbGFjZWhvbGRlci1pZCcgXSApO1xuXHRcdFx0Zm9yICggcHJvcCBpbiBuZXdRVFMgKSB7XG5cdFx0XHRcdGlmICggJ3N0cmluZycgPT09IHR5cGVvZiggbmV3UVRTW3Byb3BdICkgKSB7XG5cdFx0XHRcdFx0bmV3UVRTW3Byb3BdID0gbmV3UVRTW3Byb3BdLnJlcGxhY2UoIHJlZ2V4LCBpZCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gPSBuZXdRVFM7XG5cdFx0fVxuXG5cdFx0Ly8gV2hlbiBlZGl0b3IgaW5pdHMsIGF0dGFjaCBzYXZlIGNhbGxiYWNrIHRvIGNoYW5nZSBldmVudC5cblx0XHR0aW55TUNFUHJlSW5pdC5tY2VJbml0W2lkXS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHQvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgaW4gdGhlIE1DRSBlZGl0b3IuXG5cdFx0XHR0aGlzLm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHRcdHNlbGYuc2V0VmFsdWUoIGUudGFyZ2V0LmdldENvbnRlbnQoKSApO1xuXHRcdFx0fSApO1xuXG5cdFx0XHQvLyBQcmV2ZW50IEZPVUMuIFNob3cgZWxlbWVudCBhZnRlciBpbml0LlxuXHRcdFx0dGhpcy5vbiggJ2luaXQnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JGVsLmNzcyggJ2Rpc3BsYXknLCAnYmxvY2snICk7XG5cdFx0XHR9KTtcblxuXHRcdH07XG5cblx0XHQvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgaW4gdGhlIEhUTUwgZWRpdG9yLlxuXHRcdCQoJyMnICsgaWQgKS5vbiggJ2tleWRvd24gY2hhbmdlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLnNldFZhbHVlKCB0aGlzLnZhbHVlICk7XG5cdFx0fSApO1xuXG5cdFx0Ly8gQ3VycmVudCBtb2RlIGRldGVybWluZWQgYnkgY2xhc3Mgb24gZWxlbWVudC5cblx0XHQvLyBJZiBtb2RlIGlzIHZpc3VhbCwgY3JlYXRlIHRoZSB0aW55TUNFLlxuXHRcdGlmICggJGVsLmhhc0NsYXNzKCd0bWNlLWFjdGl2ZScpICkge1xuXHRcdFx0dGlueU1DRS5pbml0KCB0aW55TUNFUHJlSW5pdC5tY2VJbml0W2lkXSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkZWwuY3NzKCAnZGlzcGxheScsICdibG9jaycgKTtcblx0XHR9XG5cblx0XHQvLyBJbml0IHF1aWNrdGFncy5cblx0XHRxdWlja3RhZ3MoIHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgaWQgXSApO1xuXHRcdFFUYWdzLl9idXR0b25zSW5pdCgpO1xuXG5cdFx0dmFyICRidWlsZGVyID0gdGhpcy4kZWwuY2xvc2VzdCggJy51aS1zb3J0YWJsZScgKTtcblxuXHRcdC8vIEhhbmRsZSB0ZW1wb3JhcnkgcmVtb3ZhbCBvZiB0aW55TUNFIHdoZW4gc29ydGluZy5cblx0XHQkYnVpbGRlci5vbiggJ3NvcnRzdGFydCcsIGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG5cblx0XHRcdGlmICggZXZlbnQuY3VycmVudFRhcmdldCAhPT0gJGJ1aWxkZXIgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCB1aS5pdGVtWzBdLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSA9PT0gdGhpcy5lbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2lkJykgKSB7XG5cdFx0XHRcdHRpbnlNQ0UuZXhlY0NvbW1hbmQoICdtY2VSZW1vdmVFZGl0b3InLCBmYWxzZSwgaWQgKTtcblx0XHRcdH1cblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0Ly8gSGFuZGxlIHJlLWluaXQgYWZ0ZXIgc29ydGluZy5cblx0XHQkYnVpbGRlci5vbiggJ3NvcnRzdG9wJywgZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblxuXHRcdFx0aWYgKCBldmVudC5jdXJyZW50VGFyZ2V0ICE9PSAkYnVpbGRlciApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIHVpLml0ZW1bMF0uZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpID09PSB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSApIHtcblx0XHRcdFx0dGlueU1DRS5leGVjQ29tbWFuZCgnbWNlQWRkRWRpdG9yJywgZmFsc2UsIGlkKTtcblx0XHRcdH1cblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdH0sXG5cblx0cmVtb3ZlOiBmdW5jdGlvbigpIHtcblx0XHR0aW55TUNFLmV4ZWNDb21tYW5kKCAnbWNlUmVtb3ZlRWRpdG9yJywgZmFsc2UsICdtcGItdGV4dC1ib2R5LScgKyB0aGlzLmNpZCApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZWZyZXNoIHZpZXcgYWZ0ZXIgc29ydC9jb2xsYXBzZSBldGMuXG5cdCAqL1xuXHRyZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnJlbmRlcigpO1xuXHR9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRXWVNJV1lHO1xuIiwidmFyIHdwID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddIDogbnVsbCk7XG5cbi8qKlxuICogQWJzdHJhY3QgRmllbGQgQ2xhc3MuXG4gKlxuICogSGFuZGxlcyBzZXR1cCBhcyB3ZWxsIGFzIGdldHRpbmcgYW5kIHNldHRpbmcgdmFsdWVzLlxuICogUHJvdmlkZXMgYSB2ZXJ5IGdlbmVyaWMgcmVuZGVyIG1ldGhvZCAtIGJ1dCBwcm9iYWJseSBiZSBPSyBmb3IgbW9zdCBzaW1wbGUgZmllbGRzLlxuICovXG52YXIgRmllbGQgPSB3cC5CYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICAgICAgbnVsbCxcblx0dmFsdWU6ICAgICAgICAgbnVsbCxcblx0Y29uZmlnOiAgICAgICAge30sXG5cdGRlZmF1bHRDb25maWc6IHt9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplLlxuXHQgKiBJZiB5b3UgZXh0ZW5kIHRoaXMgdmlldyAtIGl0IGlzIHJlY2NvbW1lZGVkIHRvIGNhbGwgdGhpcy5cblx0ICpcblx0ICogRXhwZWN0cyBvcHRpb25zLnZhbHVlIGFuZCBvcHRpb25zLmNvbmZpZy5cblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0dmFyIGNvbmZpZztcblxuXHRcdF8uYmluZEFsbCggdGhpcywgJ2dldFZhbHVlJywgJ3NldFZhbHVlJyApO1xuXG5cdFx0Ly8gSWYgYSBjaGFuZ2UgY2FsbGJhY2sgaXMgcHJvdmlkZWQsIGNhbGwgdGhpcyBvbiBjaGFuZ2UuXG5cdFx0aWYgKCAnb25DaGFuZ2UnIGluIG9wdGlvbnMgKSB7XG5cdFx0XHR0aGlzLm9uKCAnY2hhbmdlJywgb3B0aW9ucy5vbkNoYW5nZSApO1xuXHRcdH1cblxuXHRcdGNvbmZpZyA9ICggJ2NvbmZpZycgaW4gb3B0aW9ucyApID8gb3B0aW9ucy5jb25maWcgOiB7fTtcblx0XHR0aGlzLmNvbmZpZyA9IF8uZXh0ZW5kKCB7fSwgdGhpcy5kZWZhdWx0Q29uZmlnLCBjb25maWcgKTtcblxuXHRcdGlmICggJ3ZhbHVlJyBpbiBvcHRpb25zICkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggb3B0aW9ucy52YWx1ZSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdGdldFZhbHVlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy52YWx1ZTtcblx0fSxcblxuXHRzZXRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcblx0XHR0aGlzLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLnZhbHVlICk7XG5cdH0sXG5cblx0cHJlcGFyZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGlkOiAgICAgdGhpcy5jaWQsXG5cdFx0XHR2YWx1ZTogIHRoaXMudmFsdWUsXG5cdFx0XHRjb25maWc6IHRoaXMuY29uZmlnXG5cdFx0fTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHdwLkJhY2tib25lLlZpZXcucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0dGhpcy50cmlnZ2VyKCAnbXBiOnJlbmRlcmVkJyApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZWZyZXNoIHZpZXcgYWZ0ZXIgc29ydC9jb2xsYXBzZSBldGMuXG5cdCAqL1xuXHRyZWZyZXNoOiBmdW5jdGlvbigpIHt9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGQ7XG4iLCJ2YXIgTW9kdWxlRWRpdCA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcbnZhciBNb2R1bGVFZGl0Rm9ybVJvdyA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQtZm9ybS1yb3cuanMnKTtcbnZhciBmaWVsZFZpZXdzID0gcmVxdWlyZSgnLi8uLi91dGlscy9maWVsZC12aWV3cy5qcycpO1xuXG4vKipcbiAqIEdlbmVyaWMgRWRpdCBGb3JtLlxuICpcbiAqIEhhbmRsZXMgYSB3aWRlIHJhbmdlIG9mIGdlbmVyaWMgZmllbGQgdHlwZXMuXG4gKiBGb3IgZWFjaCBhdHRyaWJ1dGUsIGl0IGNyZWF0ZXMgYSBmaWVsZCBiYXNlZCBvbiB0aGUgYXR0cmlidXRlICd0eXBlJ1xuICogQWxzbyB1c2VzIG9wdGlvbmFsIGF0dHJpYnV0ZSAnY29uZmlnJyBwcm9wZXJ0eSB3aGVuIGluaXRpYWxpemluZyBmaWVsZC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIGF0dHJpYnV0ZXMsIG9wdGlvbnMgXSApO1xuXG5cdFx0Ly8gdGhpcy5maWVsZHMgaXMgYW4gZWFzeSByZWZlcmVuY2UgZm9yIHRoZSBmaWVsZCB2aWV3cy5cblx0XHR2YXIgZmllbGRzVmlld3MgPSB0aGlzLmZpZWxkcyA9IFtdO1xuXHRcdHZhciBtb2RlbCAgICAgICA9IHRoaXMubW9kZWw7XG5cblx0XHQvLyBGb3IgZWFjaCBhdHRyaWJ1dGUgLVxuXHRcdC8vIGluaXRpYWxpemUgYSBmaWVsZCBmb3IgdGhhdCBhdHRyaWJ1dGUgJ3R5cGUnXG5cdFx0Ly8gU3RvcmUgaW4gdGhpcy5maWVsZHNcblx0XHQvLyBVc2UgY29uZmlnIGZyb20gdGhlIGF0dHJpYnV0ZVxuXHRcdHRoaXMubW9kZWwuZ2V0KCdhdHRyJykuZWFjaCggZnVuY3Rpb24oIGF0dHIgKSB7XG5cblx0XHRcdHZhciBmaWVsZFZpZXcsIHR5cGUsIG5hbWUsIGNvbmZpZywgdmlldztcblxuXHRcdFx0dHlwZSA9IGF0dHIuZ2V0KCd0eXBlJyk7XG5cblx0XHRcdGlmICggISB0eXBlIHx8ICEgKCB0eXBlIGluIGZpZWxkVmlld3MgKSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRmaWVsZFZpZXcgPSBmaWVsZFZpZXdzWyB0eXBlIF07XG5cdFx0XHRuYW1lICAgICAgPSBhdHRyLmdldCgnbmFtZScpO1xuXHRcdFx0Y29uZmlnICAgID0gYXR0ci5nZXQoJ2NvbmZpZycpIHx8IHt9O1xuXG5cdFx0XHR2aWV3ID0gbmV3IGZpZWxkVmlldygge1xuXHRcdFx0XHR2YWx1ZTogbW9kZWwuZ2V0QXR0clZhbHVlKCBuYW1lICksXG5cdFx0XHRcdGNvbmZpZzogY29uZmlnLFxuXHRcdFx0XHRvbkNoYW5nZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdFx0XHRcdG1vZGVsLnNldEF0dHJWYWx1ZSggbmFtZSwgdmFsdWUgKTtcblx0XHRcdFx0fSxcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLnZpZXdzLmFkZCggJy5tb2R1bGUtZWRpdC12aWV3JywgbmV3IE1vZHVsZUVkaXRGb3JtUm93KCB7XG5cdFx0XHRcdGxhYmVsOiBhdHRyLmdldCgnbGFiZWwnKSxcblx0XHRcdFx0ZGVzYzogIGF0dHIuZ2V0KCdkZXNjcmlwdGlvbicgKSxcblx0XHRcdFx0ZmllbGRWaWV3OiB2aWV3XG5cdFx0XHR9ICkgKTtcblxuXHRcdFx0ZmllbGRzVmlld3MucHVzaCggdmlldyApO1xuXG5cdFx0fS5iaW5kKCB0aGlzICkgKTtcblxuXHRcdC8vIENsZWFudXAuXG5cdFx0Ly8gUmVtb3ZlIGVhY2ggZmllbGQgdmlldyB3aGVuIHRoaXMgbW9kZWwgaXMgZGVzdHJveWVkLlxuXHRcdHRoaXMubW9kZWwub24oICdkZXN0cm95JywgZnVuY3Rpb24oKSB7XG5cdFx0XHRfLmVhY2goIHRoaXMuZmllbGRzLCBmdW5jdGlvbiggZmllbGQgKSB7XG5cdFx0XHRcdGZpZWxkLnJlbW92ZSgpO1xuXHRcdFx0fSApO1xuXHRcdH0gKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZWZyZXNoIHZpZXcuXG5cdCAqIFJlcXVpcmVkIGFmdGVyIHNvcnQvY29sbGFwc2UgZXRjLlxuXHQgKi9cblx0cmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0Xy5lYWNoKCB0aGlzLmZpZWxkcywgZnVuY3Rpb24oIGZpZWxkICkge1xuXHRcdFx0ZmllbGQucmVmcmVzaCgpO1xuXHRcdH0gKTtcblx0fSxcblxufSk7XG4iLCJ2YXIgd3AgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ10gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSB3cC5CYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLWZvcm0tcm93JyApLFxuXHRjbGFzc05hbWU6ICdmb3JtLXJvdycsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0aWYgKCAnZmllbGRWaWV3JyBpbiBvcHRpb25zICkge1xuXHRcdFx0dGhpcy52aWV3cy5zZXQoICcuZmllbGQnLCBvcHRpb25zLmZpZWxkVmlldyApO1xuXHRcdH1cblx0fSxcblxufSk7XG4iLCJ2YXIgd3AgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ10gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSB3cC5CYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLW1vZHVsZS1lZGl0LXRvb2xzJyApLFxuXHRjbGFzc05hbWU6ICdtb2R1bGUtZWRpdC10b29scycsXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIC5idXR0b24tc2VsZWN0aW9uLWl0ZW0tcmVtb3ZlJzogZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0dGhpcy50cmlnZ2VyKCAnbXBiOm1vZHVsZS1yZW1vdmUnICk7XG5cdFx0fSxcblx0XHQnY2xpY2sgLmJ1dHRvbi1zZWxlY3Rpb24taXRlbS10b2dnbGUnOiBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR0aGlzLnRyaWdnZXIoICdtcGI6bW9kdWxlLXRvZ2dsZS1jb2xsYXBzZWQnICk7XG5cdFx0XHRlLnRhcmdldC5ibHVyKCk7XG5cdFx0fSxcblx0fSxcblxufSk7XG4iLCJ2YXIgd3AgICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdFRvb2xzID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC10b29scy5qcycpO1xuXG4vKipcbiAqIFZlcnkgZ2VuZXJpYyBmb3JtIHZpZXcgaGFuZGxlci5cbiAqIFRoaXMgZG9lcyBzb21lIGJhc2ljIG1hZ2ljIGJhc2VkIG9uIGRhdGEgYXR0cmlidXRlcyB0byB1cGRhdGUgc2ltcGxlIHRleHQgZmllbGRzLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHdwLkJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogIHdwLnRlbXBsYXRlKCAnbXBiLW1vZHVsZS1lZGl0JyApLFxuXHRjbGFzc05hbWU6ICdtb2R1bGUtZWRpdCcsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cblx0XHRfLmJpbmRBbGwoIHRoaXMsICdyZW1vdmVNb2RlbCcsICdyZWZyZXNoJywgJ3RvZ2dsZUNvbGxhcHNlZCcgKTtcblxuXHRcdHZhciB0b29scyA9IG5ldyBNb2R1bGVFZGl0VG9vbHMoIHtcblx0XHRcdGxhYmVsOiB0aGlzLm1vZGVsLmdldCggJ2xhYmVsJyApXG5cdFx0fSApO1xuXG5cdFx0dGhpcy52aWV3cy5zZXQoICcubW9kdWxlLWVkaXQtdG9vbHMtY29udGFpbmVyJywgdG9vbHMgKTtcblxuXHRcdHRvb2xzLm9uKCAnbXBiOm1vZHVsZS1yZW1vdmUnLCB0aGlzLnJlbW92ZU1vZGVsICk7XG5cdFx0dG9vbHMub24oICdtcGI6bW9kdWxlLXRvZ2dsZS1jb2xsYXBzZWQnLCB0aGlzLnRvZ2dsZUNvbGxhcHNlZCApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR3cC5CYWNrYm9uZS5WaWV3LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHRoaXMuJGVsLmF0dHIoICdkYXRhLWNpZCcsIHRoaXMubW9kZWwuY2lkICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlbW92ZSBtb2RlbCBoYW5kbGVyLlxuXHQgKi9cblx0cmVtb3ZlTW9kZWw6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMucmVtb3ZlKCk7XG5cdFx0dGhpcy5tb2RlbC5kZXN0cm95KCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlZnJlc2ggdmlldy5cblx0ICogUmVxdWlyZWQgYWZ0ZXIgc29ydC9jb2xsYXBzZSBldGMuXG5cdCAqL1xuXHRyZWZyZXNoOiBmdW5jdGlvbigpIHt9LFxuXG5cdHRvZ2dsZUNvbGxhcHNlZDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZWwudG9nZ2xlQ2xhc3MoICdtb2R1bGUtY29sbGFwc2VkJyApO1xuXHR9XG5cbn0pO1xuIl19
