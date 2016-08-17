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
		//options.defaultLabel     = modularPageBuilderData.l10n.selectDefault;
		options.l10n             = modularPageBuilderData.l10n;
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

		_.bindAll( this, 'render' );

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

			this.views.add( '', new ModuleEditFormRow( {
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

	className: 'module-edit',

	initialize: function() {

		_.bindAll( this, 'removeModel' );

		var tools = new ModuleEditTools( {
			label: this.model.get( 'label' )
		} );

		this.views.add( '', tools );

		tools.on( 'mpb:module-remove', this.removeModel );

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

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit-tools.js":24}]},{},[7])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvc3JjL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9nbG9iYWxzLmpzIiwiYXNzZXRzL2pzL3NyYy9tb2RlbHMvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMiLCJhc3NldHMvanMvc3JjL21vZGVscy9tb2R1bGUuanMiLCJhc3NldHMvanMvc3JjL21vZHVsYXItcGFnZS1idWlsZGVyLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9lZGl0LXZpZXdzLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9maWVsZC12aWV3cy5qcyIsImFzc2V0cy9qcy9zcmMvdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2J1aWxkZXIuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1hdHRhY2htZW50LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtY2hlY2tib3guanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1saW5rLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtbnVtYmVyLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtcG9zdC1zZWxlY3QuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1zZWxlY3QuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC10ZXh0LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtdGV4dGFyZWEuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC13eXNpd3lnLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWRlZmF1bHQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWZvcm0tcm93LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC10b29scy5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMvVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZUF0dHJpYnV0ZSA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMnKTtcblxuLyoqXG4gKiBTaG9ydGNvZGUgQXR0cmlidXRlcyBjb2xsZWN0aW9uLlxuICovXG52YXIgU2hvcnRjb2RlQXR0cmlidXRlcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblxuXHRtb2RlbCA6IE1vZHVsZUF0dHJpYnV0ZSxcblxuXHQvLyBEZWVwIENsb25lLlxuXHRjbG9uZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCBfLm1hcCggdGhpcy5tb2RlbHMsIGZ1bmN0aW9uKG0pIHtcblx0XHRcdHJldHVybiBtLmNsb25lKCk7XG5cdFx0fSkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGpzb24gPSB7fTtcblxuXHRcdHRoaXMuZWFjaCggZnVuY3Rpb24oIG1vZGVsICkge1xuXHRcdFx0anNvblsgbW9kZWwuZ2V0KCAnbmFtZScgKSBdID0gbW9kZWwudG9NaWNyb0pTT04oKTtcblx0XHR9ICk7XG5cblx0XHRyZXR1cm4ganNvbjtcblx0fSxcblxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaG9ydGNvZGVBdHRyaWJ1dGVzO1xuIiwidmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgTW9kdWxlICAgPSByZXF1aXJlKCcuLy4uL21vZGVscy9tb2R1bGUuanMnKTtcblxuLy8gU2hvcnRjb2RlIENvbGxlY3Rpb25cbnZhciBNb2R1bGVzID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXG5cdG1vZGVsIDogTW9kdWxlLFxuXG5cdC8vICBEZWVwIENsb25lLlxuXHRjbG9uZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvciggXy5tYXAoIHRoaXMubW9kZWxzLCBmdW5jdGlvbihtKSB7XG5cdFx0XHRyZXR1cm4gbS5jbG9uZSgpO1xuXHRcdH0pKTtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIG9ubHkgdGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBzYXZlZC5cblx0ICpcblx0ICogQHJldHVybiBvYmplY3Rcblx0ICovXG5cdHRvTWljcm9KU09OOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoIGZ1bmN0aW9uKG1vZGVsKSB7IHJldHVybiBtb2RlbC50b01pY3JvSlNPTiggb3B0aW9ucyApOyB9ICk7XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZXM7XG4iLCIvLyBFeHBvc2Ugc29tZSBmdW5jdGlvbmFsaXR5IGdsb2JhbGx5LlxudmFyIGdsb2JhbHMgPSB7XG5cdEJ1aWxkZXI6ICAgICAgIHJlcXVpcmUoJy4vbW9kZWxzL2J1aWxkZXIuanMnKSxcblx0TW9kdWxlRmFjdG9yeTogcmVxdWlyZSgnLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpLFxuXHRlZGl0Vmlld3M6ICAgICByZXF1aXJlKCcuL3V0aWxzL2VkaXQtdmlld3MuanMnKSxcblx0ZmllbGRWaWV3czogICAgcmVxdWlyZSgnLi91dGlscy9maWVsZC12aWV3cy5qcycpLFxuXHR2aWV3czoge1xuXHRcdEJ1aWxkZXJWaWV3OiAgICAgcmVxdWlyZSgnLi92aWV3cy9idWlsZGVyLmpzJyksXG5cdFx0TW9kdWxlRWRpdDogICAgICByZXF1aXJlKCcuL3ZpZXdzL21vZHVsZS1lZGl0LmpzJyksXG5cdFx0TW9kdWxlRWRpdERlZmF1bHQ6IHJlcXVpcmUoJy4vdmlld3MvbW9kdWxlLWVkaXQtZGVmYXVsdC5qcycpLFxuXHRcdEZpZWxkOiAgICAgICAgICAgcmVxdWlyZSgnLi92aWV3cy9maWVsZHMvZmllbGQuanMnKSxcblx0XHRGaWVsZExpbms6ICAgICAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLWxpbmsuanMnKSxcblx0XHRGaWVsZEF0dGFjaG1lbnQ6IHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLWF0dGFjaG1lbnQuanMnKSxcblx0XHRGaWVsZFRleHQ6ICAgICAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLXRleHQuanMnKSxcblx0XHRGaWVsZFRleHRhcmVhOiAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLXRleHRhcmVhLmpzJyksXG5cdFx0RmllbGRXeXNpd3lnOiAgICByZXF1aXJlKCcuL3ZpZXdzL2ZpZWxkcy9maWVsZC13eXNpd3lnLmpzJyksXG5cdFx0RmllbGRQb3N0U2VsZWN0OiByZXF1aXJlKCcuL3ZpZXdzL2ZpZWxkcy9maWVsZC1wb3N0LXNlbGVjdC5qcycpLFxuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdsb2JhbHM7XG4iLCJ2YXIgQmFja2JvbmUgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZXMgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2NvbGxlY3Rpb25zL21vZHVsZXMuanMnKTtcbnZhciBNb2R1bGVGYWN0b3J5ICAgID0gcmVxdWlyZSgnLi8uLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpO1xuXG52YXIgQnVpbGRlciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRzZWxlY3REZWZhdWx0OiAgbW9kdWxhclBhZ2VCdWlsZGVyRGF0YS5sMTBuLnNlbGVjdERlZmF1bHQsXG5cdFx0YWRkTmV3QnV0dG9uOiAgIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEubDEwbi5hZGROZXdCdXR0b24sXG5cdFx0c2VsZWN0aW9uOiAgICAgIFtdLCAvLyBJbnN0YW5jZSBvZiBNb2R1bGVzLiBDYW4ndCB1c2UgYSBkZWZhdWx0LCBvdGhlcndpc2UgdGhleSB3b24ndCBiZSB1bmlxdWUuXG5cdFx0YWxsb3dlZE1vZHVsZXM6IFtdLCAvLyBNb2R1bGUgbmFtZXMgYWxsb3dlZCBmb3IgdGhpcyBidWlsZGVyLlxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gU2V0IGRlZmF1bHQgc2VsZWN0aW9uIHRvIGVuc3VyZSBpdCBpc24ndCBhIHJlZmVyZW5jZS5cblx0XHRpZiAoICEgKCB0aGlzLmdldCgnc2VsZWN0aW9uJykgaW5zdGFuY2VvZiBNb2R1bGVzICkgKSB7XG5cdFx0XHR0aGlzLnNldCggJ3NlbGVjdGlvbicsIG5ldyBNb2R1bGVzKCkgKTtcblx0XHR9XG5cblx0fSxcblxuXHRzZXREYXRhOiBmdW5jdGlvbiggZGF0YSApIHtcblxuXHRcdHZhciBzZWxlY3Rpb247XG5cblx0XHRpZiAoICcnID09PSBkYXRhICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEhhbmRsZSBlaXRoZXIgSlNPTiBzdHJpbmcgb3IgcHJvcGVyIG9iaGVjdC5cblx0XHRkYXRhID0gKCAnc3RyaW5nJyA9PT0gdHlwZW9mIGRhdGEgKSA/IEpTT04ucGFyc2UoIGRhdGEgKSA6IGRhdGE7XG5cblx0XHQvLyBDb252ZXJ0IHNhdmVkIGRhdGEgdG8gTW9kdWxlIG1vZGVscy5cblx0XHRpZiAoIGRhdGEgJiYgQXJyYXkuaXNBcnJheSggZGF0YSApICkge1xuXHRcdFx0c2VsZWN0aW9uID0gZGF0YS5tYXAoIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHRcdHJldHVybiBNb2R1bGVGYWN0b3J5LmNyZWF0ZSggbW9kdWxlLm5hbWUsIG1vZHVsZS5hdHRyICk7XG5cdFx0XHR9ICk7XG5cdFx0fVxuXG5cdFx0Ly8gUmVzZXQgc2VsZWN0aW9uIHVzaW5nIGRhdGEgZnJvbSBoaWRkZW4gaW5wdXQuXG5cdFx0aWYgKCBzZWxlY3Rpb24gJiYgc2VsZWN0aW9uLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuZ2V0KCdzZWxlY3Rpb24nKS5hZGQoIHNlbGVjdGlvbiApO1xuXHRcdH1cblxuXHR9LFxuXG5cdHNhdmVEYXRhOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBkYXRhID0gW107XG5cblx0XHR0aGlzLmdldCgnc2VsZWN0aW9uJykuZWFjaCggZnVuY3Rpb24oIG1vZHVsZSApIHtcblxuXHRcdFx0Ly8gU2tpcCBlbXB0eS9icm9rZW4gbW9kdWxlcy5cblx0XHRcdGlmICggISBtb2R1bGUuZ2V0KCduYW1lJyApICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGRhdGEucHVzaCggbW9kdWxlLnRvTWljcm9KU09OKCkgKTtcblxuXHRcdH0gKTtcblxuXHRcdHRoaXMudHJpZ2dlciggJ3NhdmUnLCBkYXRhICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogTGlzdCBhbGwgYXZhaWxhYmxlIG1vZHVsZXMgZm9yIHRoaXMgYnVpbGRlci5cblx0ICogQWxsIG1vZHVsZXMsIGZpbHRlcmVkIGJ5IHRoaXMuYWxsb3dlZE1vZHVsZXMuXG5cdCAqL1xuXHRnZXRBdmFpbGFibGVNb2R1bGVzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gXy5maWx0ZXIoIE1vZHVsZUZhY3RvcnkuYXZhaWxhYmxlTW9kdWxlcywgZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdHJldHVybiB0aGlzLmlzTW9kdWxlQWxsb3dlZCggbW9kdWxlLm5hbWUgKTtcblx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHR9LFxuXG5cdGlzTW9kdWxlQWxsb3dlZDogZnVuY3Rpb24oIG1vZHVsZU5hbWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCdhbGxvd2VkTW9kdWxlcycpLmluZGV4T2YoIG1vZHVsZU5hbWUgKSA+PSAwO1xuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1aWxkZXI7XG4iLCJ2YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcblxudmFyIE1vZHVsZUF0dHJpYnV0ZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRuYW1lOiAgICAgICAgICcnLFxuXHRcdGxhYmVsOiAgICAgICAgJycsXG5cdFx0dmFsdWU6ICAgICAgICAnJyxcblx0XHR0eXBlOiAgICAgICAgICd0ZXh0Jyxcblx0XHRkZXNjcmlwdGlvbjogICcnLFxuXHRcdGRlZmF1bHRWYWx1ZTogJycsXG5cdFx0Y29uZmlnOiAgICAgICB7fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHIgPSB7fTtcblx0XHR2YXIgYWxsb3dlZEF0dHJQcm9wZXJ0aWVzID0gWyAnbmFtZScsICd2YWx1ZScsICd0eXBlJyBdO1xuXG5cdFx0Xy5lYWNoKCBhbGxvd2VkQXR0clByb3BlcnRpZXMsIGZ1bmN0aW9uKCBwcm9wICkge1xuXHRcdFx0clsgcHJvcCBdID0gdGhpcy5nZXQoIHByb3AgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHJldHVybiByO1xuXG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlQXR0cmlidXRlO1xuIiwidmFyIEJhY2tib25lICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGVBdHRzID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGUtYXR0cmlidXRlcy5qcycpO1xuXG52YXIgTW9kdWxlID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuXHRkZWZhdWx0czoge1xuXHRcdG5hbWU6ICAnJyxcblx0XHRsYWJlbDogJycsXG5cdFx0YXR0cjogIFtdLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gU2V0IGRlZmF1bHQgc2VsZWN0aW9uIHRvIGVuc3VyZSBpdCBpc24ndCBhIHJlZmVyZW5jZS5cblx0XHRpZiAoICEgKCB0aGlzLmdldCgnYXR0cicpIGluc3RhbmNlb2YgTW9kdWxlQXR0cyApICkge1xuXHRcdFx0dGhpcy5zZXQoICdhdHRyJywgbmV3IE1vZHVsZUF0dHMoKSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgZm9yIGdldHRpbmcgYW4gYXR0cmlidXRlIG1vZGVsIGJ5IG5hbWUuXG5cdCAqL1xuXHRnZXRBdHRyOiBmdW5jdGlvbiggYXR0ck5hbWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCdhdHRyJykuZmluZFdoZXJlKCB7IG5hbWU6IGF0dHJOYW1lIH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgZm9yIHNldHRpbmcgYW4gYXR0cmlidXRlIHZhbHVlXG5cdCAqXG5cdCAqIE5vdGUgbWFudWFsIGNoYW5nZSBldmVudCB0cmlnZ2VyIHRvIGVuc3VyZSBldmVyeXRoaW5nIGlzIHVwZGF0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzdHJpbmcgYXR0cmlidXRlXG5cdCAqIEBwYXJhbSBtaXhlZCAgdmFsdWVcblx0ICovXG5cdHNldEF0dHJWYWx1ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZSwgdmFsdWUgKSB7XG5cblx0XHR2YXIgYXR0ciA9IHRoaXMuZ2V0QXR0ciggYXR0cmlidXRlICk7XG5cblx0XHRpZiAoIGF0dHIgKSB7XG5cdFx0XHRhdHRyLnNldCggJ3ZhbHVlJywgdmFsdWUgKTtcblx0XHRcdHRoaXMudHJpZ2dlciggJ2NoYW5nZScsIHRoaXMgKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogSGVscGVyIGZvciBnZXR0aW5nIGFuIGF0dHJpYnV0ZSB2YWx1ZS5cblx0ICpcblx0ICogRGVmYXVsdHMgdG8gbnVsbC5cblx0ICpcblx0ICogQHBhcmFtIHN0cmluZyBhdHRyaWJ1dGVcblx0ICovXG5cdGdldEF0dHJWYWx1ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZSApIHtcblxuXHRcdHZhciBhdHRyID0gdGhpcy5nZXRBdHRyKCBhdHRyaWJ1dGUgKTtcblxuXHRcdGlmICggYXR0ciApIHtcblx0XHRcdHJldHVybiBhdHRyLmdldCggJ3ZhbHVlJyApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBDdXN0b20gUGFyc2UuXG5cdCAqIEVuc3VyZXMgYXR0cmlidXRlcyBpcyBhbiBpbnN0YW5jZSBvZiBNb2R1bGVBdHRzXG5cdCAqL1xuXHRwYXJzZTogZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXG5cdFx0aWYgKCAnYXR0cicgaW4gcmVzcG9uc2UgJiYgISAoIHJlc3BvbnNlLmF0dHIgaW5zdGFuY2VvZiBNb2R1bGVBdHRzICkgKSB7XG5cdFx0XHRyZXNwb25zZS5hdHRyID0gbmV3IE1vZHVsZUF0dHMoIHJlc3BvbnNlLmF0dHIgKTtcblx0XHR9XG5cblx0ICAgIHJldHVybiByZXNwb25zZTtcblxuXHR9LFxuXG5cdHRvSlNPTjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIganNvbiA9IF8uY2xvbmUoIHRoaXMuYXR0cmlidXRlcyApO1xuXG5cdFx0aWYgKCAnYXR0cicgaW4ganNvbiAmJiAoIGpzb24uYXR0ciBpbnN0YW5jZW9mIE1vZHVsZUF0dHMgKSApIHtcblx0XHRcdGpzb24uYXR0ciA9IGpzb24uYXR0ci50b0pTT04oKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ganNvbjtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRuYW1lOiB0aGlzLmdldCgnbmFtZScpLFxuXHRcdFx0YXR0cjogdGhpcy5nZXQoJ2F0dHInKS50b01pY3JvSlNPTigpXG5cdFx0fTtcblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlO1xuIiwidmFyICQgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEJ1aWxkZXIgICAgICAgPSByZXF1aXJlKCcuL21vZGVscy9idWlsZGVyLmpzJyk7XG52YXIgQnVpbGRlclZpZXcgICA9IHJlcXVpcmUoJy4vdmlld3MvYnVpbGRlci5qcycpO1xudmFyIE1vZHVsZUZhY3RvcnkgPSByZXF1aXJlKCcuL3V0aWxzL21vZHVsZS1mYWN0b3J5LmpzJyk7XG5cbi8vIEV4cG9zZSBzb21lIGZ1bmN0aW9uYWxpdHkgdG8gZ2xvYmFsIG5hbWVzcGFjZS5cbndpbmRvdy5tb2R1bGFyUGFnZUJ1aWxkZXIgPSByZXF1aXJlKCcuL2dsb2JhbHMnKTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuXHRNb2R1bGVGYWN0b3J5LmluaXQoKTtcblxuXHQvLyBBIGZpZWxkIGZvciBzdG9yaW5nIHRoZSBidWlsZGVyIGRhdGEuXG5cdHZhciAkZmllbGQgPSAkKCAnW25hbWU9bW9kdWxhci1wYWdlLWJ1aWxkZXItZGF0YV0nICk7XG5cblx0aWYgKCAhICRmaWVsZC5sZW5ndGggKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gQSBjb250YWluZXIgZWxlbWVudCBmb3IgZGlzcGxheWluZyB0aGUgYnVpbGRlci5cblx0dmFyICRjb250YWluZXIgPSAkKCAnI21vZHVsYXItcGFnZS1idWlsZGVyJyApO1xuXG5cdC8vIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBCdWlsZGVyIG1vZGVsLlxuXHQvLyBQYXNzIGFuIGFycmF5IG9mIG1vZHVsZSBuYW1lcyB0aGF0IGFyZSBhbGxvd2VkIGZvciB0aGlzIGJ1aWxkZXIuXG5cdHZhciBidWlsZGVyID0gbmV3IEJ1aWxkZXIoe1xuXHRcdGFsbG93ZWRNb2R1bGVzOiAkKCAnW25hbWU9bW9kdWxhci1wYWdlLWJ1aWxkZXItYWxsb3dlZC1tb2R1bGVzXScgKS52YWwoKS5zcGxpdCgnLCcpXG5cdH0pO1xuXG5cdC8vIFNldCB0aGUgZGF0YSB1c2luZyB0aGUgY3VycmVudCBmaWVsZCB2YWx1ZVxuXHRidWlsZGVyLnNldERhdGEoIEpTT04ucGFyc2UoICRmaWVsZC52YWwoKSApICk7XG5cblx0Ly8gT24gc2F2ZSwgdXBkYXRlIHRoZSBmaWVsZCB2YWx1ZS5cblx0YnVpbGRlci5vbiggJ3NhdmUnLCBmdW5jdGlvbiggZGF0YSApIHtcblx0XHQkZmllbGQudmFsKCBKU09OLnN0cmluZ2lmeSggZGF0YSApICk7XG5cdH0gKTtcblxuXHQvLyBDcmVhdGUgYnVpbGRlciB2aWV3LlxuXHR2YXIgYnVpbGRlclZpZXcgPSBuZXcgQnVpbGRlclZpZXcoIHsgbW9kZWw6IGJ1aWxkZXIgfSApO1xuXG5cdC8vIFJlbmRlciBidWlsZGVyLlxuXHRidWlsZGVyVmlldy5yZW5kZXIoKS4kZWwuYXBwZW5kVG8oICRjb250YWluZXIgKTtcblxufSk7XG4iLCJ2YXIgTW9kdWxlRWRpdERlZmF1bHQgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LWRlZmF1bHQuanMnKTtcblxuLyoqXG4gKiBNYXAgbW9kdWxlIHR5cGUgdG8gdmlld3MuXG4gKi9cbnZhciBlZGl0Vmlld3MgPSB7XG5cdCdkZWZhdWx0JzogTW9kdWxlRWRpdERlZmF1bHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZWRpdFZpZXdzO1xuIiwidmFyIEZpZWxkVGV4dCAgICAgICA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLXRleHQuanMnKTtcbnZhciBGaWVsZFRleHRhcmVhICAgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL2ZpZWxkcy9maWVsZC10ZXh0YXJlYS5qcycpO1xudmFyIEZpZWxkV1lTSVdZRyAgICA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLXd5c2l3eWcuanMnKTtcbnZhciBGaWVsZEF0dGFjaG1lbnQgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL2ZpZWxkcy9maWVsZC1hdHRhY2htZW50LmpzJyk7XG52YXIgRmllbGRMaW5rICAgICAgID0gcmVxdWlyZSgnLi8uLi92aWV3cy9maWVsZHMvZmllbGQtbGluay5qcycpO1xudmFyIEZpZWxkTnVtYmVyICAgICA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLW51bWJlci5qcycpO1xudmFyIEZpZWxkQ2hlY2tib3ggICA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLWNoZWNrYm94LmpzJyk7XG52YXIgRmllbGRTZWxlY3QgICAgID0gcmVxdWlyZSgnLi8uLi92aWV3cy9maWVsZHMvZmllbGQtc2VsZWN0LmpzJyk7XG52YXIgRmllbGRQb3N0U2VsZWN0ID0gcmVxdWlyZSgnLi8uLi92aWV3cy9maWVsZHMvZmllbGQtcG9zdC1zZWxlY3QuanMnKTtcblxudmFyIGZpZWxkVmlld3MgPSB7XG5cdHRleHQ6ICAgICAgICBGaWVsZFRleHQsXG5cdHRleHRhcmVhOiAgICBGaWVsZFRleHRhcmVhLFxuXHRodG1sOiAgICAgICAgRmllbGRXWVNJV1lHLFxuXHRudW1iZXI6ICAgICAgRmllbGROdW1iZXIsXG5cdGF0dGFjaG1lbnQ6ICBGaWVsZEF0dGFjaG1lbnQsXG5cdGxpbms6ICAgICAgICBGaWVsZExpbmssXG5cdGNoZWNrYm94OiAgICBGaWVsZENoZWNrYm94LFxuXHRzZWxlY3Q6ICAgICAgRmllbGRTZWxlY3QsXG5cdHBvc3Rfc2VsZWN0OiBGaWVsZFBvc3RTZWxlY3QsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZpZWxkVmlld3M7XG4iLCJ2YXIgTW9kdWxlICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL21vZHVsZS5qcycpO1xudmFyIE1vZHVsZUF0dHMgICAgICAgPSByZXF1aXJlKCcuLy4uL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzJyk7XG52YXIgZWRpdFZpZXdzICAgICAgICA9IHJlcXVpcmUoJy4vZWRpdC12aWV3cy5qcycpO1xudmFyICQgICAgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG52YXIgTW9kdWxlRmFjdG9yeSA9IHtcblxuXHRhdmFpbGFibGVNb2R1bGVzOiBbXSxcblxuXHRpbml0OiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEgJiYgJ2F2YWlsYWJsZV9tb2R1bGVzJyBpbiBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhICkge1xuXHRcdFx0Xy5lYWNoKCBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhLmF2YWlsYWJsZV9tb2R1bGVzLCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0XHR0aGlzLnJlZ2lzdGVyTW9kdWxlKCBtb2R1bGUgKTtcblx0XHRcdH0uYmluZCggdGhpcyApICk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlZ2lzdGVyTW9kdWxlOiBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdHRoaXMuYXZhaWxhYmxlTW9kdWxlcy5wdXNoKCBtb2R1bGUgKTtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIE1vZHVsZSBNb2RlbC5cblx0ICogVXNlIGRhdGEgZnJvbSBjb25maWcsIHBsdXMgc2F2ZWQgZGF0YS5cblx0ICpcblx0ICogQHBhcmFtICBzdHJpbmcgbW9kdWxlTmFtZVxuXHQgKiBAcGFyYW0gIG9iamVjdCBhdHRyaWJ1dGUgSlNPTi4gU2F2ZWQgYXR0cmlidXRlIHZhbHVlcy5cblx0ICogQHJldHVybiBNb2R1bGVcblx0ICovXG5cdGNyZWF0ZTogZnVuY3Rpb24oIG1vZHVsZU5hbWUsIGF0dHJEYXRhICkge1xuXG5cdFx0dmFyIGRhdGEgPSAkLmV4dGVuZCggdHJ1ZSwge30sIF8uZmluZFdoZXJlKCB0aGlzLmF2YWlsYWJsZU1vZHVsZXMsIHsgbmFtZTogbW9kdWxlTmFtZSB9ICkgKTtcblxuXHRcdGlmICggISBkYXRhICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cblx0XHR2YXIgYXR0cmlidXRlcyA9IG5ldyBNb2R1bGVBdHRzKCk7XG5cblx0XHQvKipcblx0XHQgKiBBZGQgYWxsIHRoZSBtb2R1bGUgYXR0cmlidXRlcy5cblx0XHQgKiBXaGl0ZWxpc3RlZCB0byBhdHRyaWJ1dGVzIGRvY3VtZW50ZWQgaW4gc2NoZW1hXG5cdFx0ICogU2V0cyBvbmx5IHZhbHVlIGZyb20gYXR0ckRhdGEuXG5cdFx0ICovXG5cdFx0Xy5lYWNoKCBkYXRhLmF0dHIsIGZ1bmN0aW9uKCBhdHRyICkge1xuXG5cdFx0XHR2YXIgY2xvbmVBdHRyID0gJC5leHRlbmQoIHRydWUsIHt9LCBhdHRyICApO1xuXHRcdFx0dmFyIHNhdmVkQXR0ciA9IF8uZmluZFdoZXJlKCBhdHRyRGF0YSwgeyBuYW1lOiBhdHRyLm5hbWUgfSApO1xuXG5cdFx0XHQvLyBBZGQgc2F2ZWQgYXR0cmlidXRlIHZhbHVlcy5cblx0XHRcdGlmICggc2F2ZWRBdHRyICYmICd2YWx1ZScgaW4gc2F2ZWRBdHRyICkge1xuXHRcdFx0XHRjbG9uZUF0dHIudmFsdWUgPSBzYXZlZEF0dHIudmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdGF0dHJpYnV0ZXMuYWRkKCBjbG9uZUF0dHIgKTtcblxuXHRcdH0gKTtcblxuXHRcdGRhdGEuYXR0ciA9IGF0dHJpYnV0ZXM7XG5cblx0ICAgIHJldHVybiBuZXcgTW9kdWxlKCBkYXRhICk7XG5cblx0fSxcblxuXHRjcmVhdGVFZGl0VmlldzogZnVuY3Rpb24oIG1vZGVsICkge1xuXG5cdFx0dmFyIGVkaXRWaWV3LCBtb2R1bGVOYW1lO1xuXG5cdFx0bW9kdWxlTmFtZSA9IG1vZGVsLmdldCgnbmFtZScpO1xuXHRcdGVkaXRWaWV3ICAgPSAoIG5hbWUgaW4gZWRpdFZpZXdzICkgPyBlZGl0Vmlld3NbIG1vZHVsZU5hbWUgXSA6IGVkaXRWaWV3c1snZGVmYXVsdCddO1xuXG5cdFx0cmV0dXJuIG5ldyBlZGl0VmlldyggeyBtb2RlbDogbW9kZWwgfSApO1xuXG5cdH0sXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlRmFjdG9yeTtcbiIsInZhciB3cCAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddIDogbnVsbCk7XG52YXIgTW9kdWxlRmFjdG9yeSA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMnKTtcbnZhciAkICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSB3cC5CYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLWJ1aWxkZXInICksXG5cdGNsYXNzTmFtZTogJ21vZHVsYXItcGFnZS1idWlsZGVyJyxcblx0bW9kZWw6IG51bGwsXG5cdG5ld01vZHVsZU5hbWU6IG51bGwsXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NoYW5nZSA+IC5hZGQtbmV3IC5hZGQtbmV3LW1vZHVsZS1zZWxlY3QnOiAndG9nZ2xlQnV0dG9uU3RhdHVzJyxcblx0XHQnY2xpY2sgPiAuYWRkLW5ldyAuYWRkLW5ldy1tb2R1bGUtYnV0dG9uJzogJ2FkZE1vZHVsZScsXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpO1xuXG5cdFx0c2VsZWN0aW9uLm9uKCAnYWRkJywgdGhpcy5hZGROZXdTZWxlY3Rpb25JdGVtVmlldywgdGhpcyApO1xuXHRcdHNlbGVjdGlvbi5vbiggJ2FsbCcsIHRoaXMubW9kZWwuc2F2ZURhdGEsIHRoaXMubW9kZWwgKTtcblxuXHRcdHRoaXMubW9kZWwuZ2V0KCdzZWxlY3Rpb24nKS5lYWNoKCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0dGhpcy5hZGROZXdTZWxlY3Rpb25JdGVtVmlldyggbW9kdWxlICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHR0aGlzLm9uKCAnbXBiOnJlbmRlcmVkJywgdGhpcy5yZW5kZXJlZCApO1xuXG5cdH0sXG5cblx0cHJlcGFyZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm1vZGVsLnRvSlNPTigpO1xuXHRcdC8vb3B0aW9ucy5kZWZhdWx0TGFiZWwgICAgID0gbW9kdWxhclBhZ2VCdWlsZGVyRGF0YS5sMTBuLnNlbGVjdERlZmF1bHQ7XG5cdFx0b3B0aW9ucy5sMTBuICAgICAgICAgICAgID0gbW9kdWxhclBhZ2VCdWlsZGVyRGF0YS5sMTBuO1xuXHRcdG9wdGlvbnMuYXZhaWxhYmxlTW9kdWxlcyA9IHRoaXMubW9kZWwuZ2V0QXZhaWxhYmxlTW9kdWxlcygpO1xuXHRcdHJldHVybiBvcHRpb25zO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0d3AuQmFja2JvbmUuVmlldy5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHR0aGlzLnRyaWdnZXIoICdtcGI6cmVuZGVyZWQnICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0cmVuZGVyZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuaW5pdFNvcnRhYmxlKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgU29ydGFibGUuXG5cdCAqL1xuXHRpbml0U29ydGFibGU6IGZ1bmN0aW9uKCkge1xuXHRcdCQoICc+IC5zZWxlY3Rpb24nLCB0aGlzLiRlbCApLnNvcnRhYmxlKHtcblx0XHRcdGhhbmRsZTogJy5tb2R1bGUtZWRpdC10b29scycsXG5cdFx0XHRpdGVtczogICc+IC5tb2R1bGUtZWRpdCcsXG5cdFx0XHRzdG9wOiAgIGZ1bmN0aW9uKCBlLCB1aSApIHtcblx0XHRcdFx0dGhpcy51cGRhdGVTZWxlY3Rpb25PcmRlciggdWkgKTtcblx0XHRcdFx0dGhpcy50cmlnZ2VyU29ydFN0b3AoIHVpLml0ZW0uYXR0ciggJ2RhdGEtY2lkJykgKTtcblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNvcnRhYmxlIGVuZCBjYWxsYmFjay5cblx0ICogQWZ0ZXIgcmVvcmRlcmluZywgdXBkYXRlIHRoZSBzZWxlY3Rpb24gb3JkZXIuXG5cdCAqIE5vdGUgLSB1c2VzIGRpcmVjdCBtYW5pcHVsYXRpb24gb2YgY29sbGVjdGlvbiBtb2RlbHMgcHJvcGVydHkuXG5cdCAqIFRoaXMgaXMgdG8gYXZvaWQgaGF2aW5nIHRvIG1lc3MgYWJvdXQgd2l0aCB0aGUgdmlld3MgdGhlbXNlbHZlcy5cblx0ICovXG5cdHVwZGF0ZVNlbGVjdGlvbk9yZGVyOiBmdW5jdGlvbiggdWkgKSB7XG5cblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpO1xuXHRcdHZhciBpdGVtICAgICAgPSBzZWxlY3Rpb24uZ2V0KHsgY2lkOiB1aS5pdGVtLmF0dHIoICdkYXRhLWNpZCcpIH0pO1xuXHRcdHZhciBuZXdJbmRleCAgPSB1aS5pdGVtLmluZGV4KCk7XG5cdFx0dmFyIG9sZEluZGV4ICA9IHNlbGVjdGlvbi5pbmRleE9mKCBpdGVtICk7XG5cblx0XHRpZiAoIG5ld0luZGV4ICE9PSBvbGRJbmRleCApIHtcblx0XHRcdHZhciBkcm9wcGVkID0gc2VsZWN0aW9uLm1vZGVscy5zcGxpY2UoIG9sZEluZGV4LCAxICk7XG5cdFx0XHRzZWxlY3Rpb24ubW9kZWxzLnNwbGljZSggbmV3SW5kZXgsIDAsIGRyb3BwZWRbMF0gKTtcblx0XHRcdHRoaXMubW9kZWwuc2F2ZURhdGEoKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogVHJpZ2dlciBzb3J0IHN0b3Agb24gc3ViVmlldyAoYnkgbW9kZWwgQ0lEKS5cblx0ICovXG5cdHRyaWdnZXJTb3J0U3RvcDogZnVuY3Rpb24oIGNpZCApIHtcblxuXHRcdHZhciB2aWV3cyA9IHRoaXMudmlld3MuZ2V0KCAnPiAuc2VsZWN0aW9uJyApO1xuXG5cdFx0aWYgKCB2aWV3cyAmJiB2aWV3cy5sZW5ndGggKSB7XG5cblx0XHRcdHZhciB2aWV3ID0gXy5maW5kKCB2aWV3cywgZnVuY3Rpb24oIHZpZXcgKSB7XG5cdFx0XHRcdHJldHVybiBjaWQgPT09IHZpZXcubW9kZWwuY2lkO1xuXHRcdFx0fSApO1xuXG5cdFx0XHRpZiAoIHZpZXcgJiYgKCAncmVmcmVzaCcgaW4gdmlldyApICkge1xuXHRcdFx0XHR2aWV3LnJlZnJlc2goKTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBUb2dnbGUgYnV0dG9uIHN0YXR1cy5cblx0ICogRW5hYmxlL0Rpc2FibGUgYnV0dG9uIGRlcGVuZGluZyBvbiB3aGV0aGVyXG5cdCAqIHBsYWNlaG9sZGVyIG9yIHZhbGlkIG1vZHVsZSBpcyBzZWxlY3RlZC5cblx0ICovXG5cdHRvZ2dsZUJ1dHRvblN0YXR1czogZnVuY3Rpb24oZSkge1xuXHRcdHZhciB2YWx1ZSAgICAgICAgID0gJChlLnRhcmdldCkudmFsKCk7XG5cdFx0dmFyIGRlZmF1bHRPcHRpb24gPSAkKGUudGFyZ2V0KS5jaGlsZHJlbigpLmZpcnN0KCkuYXR0cigndmFsdWUnKTtcblx0XHQkKCcuYWRkLW5ldy1tb2R1bGUtYnV0dG9uJywgdGhpcy4kZWwgKS5hdHRyKCAnZGlzYWJsZWQnLCB2YWx1ZSA9PT0gZGVmYXVsdE9wdGlvbiApO1xuXHRcdHRoaXMubmV3TW9kdWxlTmFtZSA9ICggdmFsdWUgIT09IGRlZmF1bHRPcHRpb24gKSA/IHZhbHVlIDogbnVsbDtcblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlIGFkZGluZyBtb2R1bGUuXG5cdCAqXG5cdCAqIEZpbmQgbW9kdWxlIG1vZGVsLiBDbG9uZSBpdC4gQWRkIHRvIHNlbGVjdGlvbi5cblx0ICovXG5cdGFkZE1vZHVsZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0aWYgKCB0aGlzLm5ld01vZHVsZU5hbWUgJiYgdGhpcy5tb2RlbC5pc01vZHVsZUFsbG93ZWQoIHRoaXMubmV3TW9kdWxlTmFtZSApICkge1xuXHRcdFx0dmFyIG1vZGVsID0gTW9kdWxlRmFjdG9yeS5jcmVhdGUoIHRoaXMubmV3TW9kdWxlTmFtZSApO1xuXHRcdFx0dGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpLmFkZCggbW9kZWwgKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogQXBwZW5kIG5ldyBzZWxlY3Rpb24gaXRlbSB2aWV3LlxuXHQgKi9cblx0YWRkTmV3U2VsZWN0aW9uSXRlbVZpZXc6IGZ1bmN0aW9uKCBpdGVtICkge1xuXG5cdFx0aWYgKCAhIHRoaXMubW9kZWwuaXNNb2R1bGVBbGxvd2VkKCBpdGVtLmdldCgnbmFtZScpICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIHZpZXcgPSBNb2R1bGVGYWN0b3J5LmNyZWF0ZUVkaXRWaWV3KCBpdGVtICk7XG5cdFx0dGhpcy52aWV3cy5hZGQoICc+IC5zZWxlY3Rpb24nLCB2aWV3ICk7XG5cblx0XHR2YXIgJHNlbGVjdGlvbiA9ICQoICc+IC5zZWxlY3Rpb24nLCB0aGlzLiRlbCApO1xuXHRcdGlmICggJHNlbGVjdGlvbi5oYXNDbGFzcygndWktc29ydGFibGUnKSApIHtcblx0XHRcdCRzZWxlY3Rpb24uc29ydGFibGUoJ3JlZnJlc2gnKTtcblx0XHR9XG5cblx0fSxcblxufSk7XG4iLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgd3AgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxuLyoqXG4gKiBJbWFnZSBGaWVsZFxuICpcbiAqIEluaXRpYWxpemUgYW5kIGxpc3RlbiBmb3IgdGhlICdjaGFuZ2UnIGV2ZW50IHRvIGdldCB1cGRhdGVkIGRhdGEuXG4gKlxuICovXG52YXIgRmllbGRBdHRhY2htZW50ID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogIHdwLnRlbXBsYXRlKCAnbXBiLWZpZWxkLWF0dGFjaG1lbnQnICksXG5cdGZyYW1lOiAgICAgbnVsbCxcblx0dmFsdWU6ICAgICBbXSwgLy8gQXR0YWNobWVudCBJRHMuXG5cdHNlbGVjdGlvbjoge30sIC8vIEF0dGFjaG1lbnRzIGNvbGxlY3Rpb24gZm9yIHRoaXMudmFsdWUuXG5cblx0Y29uZmlnOiAgICB7fSxcblxuXHRkZWZhdWx0Q29uZmlnOiB7XG5cdFx0bXVsdGlwbGU6IGZhbHNlLFxuXHRcdGxpYnJhcnk6IHsgdHlwZTogJ2ltYWdlJyB9LFxuXHRcdGJ1dHRvbl90ZXh0OiAnU2VsZWN0IEltYWdlJyxcblx0fSxcblxuXHRldmVudHM6IHtcblx0XHQnY2xpY2sgLmJ1dHRvbi5hZGQnOiAnZWRpdEltYWdlJyxcblx0XHQnY2xpY2sgLmltYWdlLXBsYWNlaG9sZGVyIC5idXR0b24ucmVtb3ZlJzogJ3JlbW92ZUltYWdlJyxcblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZS5cblx0ICpcblx0ICogUGFzcyB2YWx1ZSBhbmQgY29uZmlnIGFzIHByb3BlcnRpZXMgb24gdGhlIG9wdGlvbnMgb2JqZWN0LlxuXHQgKiBBdmFpbGFibGUgb3B0aW9uc1xuXHQgKiAtIG11bHRpcGxlOiBib29sXG5cdCAqIC0gc2l6ZVJlcTogZWcgeyB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCB9XG5cdCAqXG5cdCAqIEBwYXJhbSAgb2JqZWN0IG9wdGlvbnNcblx0ICogQHJldHVybiBudWxsXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblxuXHRcdC8vIENhbGwgZGVmYXVsdCBpbml0aWFsaXplLlxuXHRcdEZpZWxkLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIG9wdGlvbnMgXSApO1xuXG5cdFx0Xy5iaW5kQWxsKCB0aGlzLCAncmVuZGVyJywgJ2VkaXRJbWFnZScsICdvblNlbGVjdEltYWdlJywgJ3JlbW92ZUltYWdlJywgJ2lzQXR0YWNobWVudFNpemVPaycgKTtcblxuXHRcdHRoaXMub24oICdjaGFuZ2UnLCB0aGlzLnJlbmRlciApO1xuXHRcdHRoaXMub24oICdtcGI6cmVuZGVyZWQnLCB0aGlzLnJlbmRlcmVkICk7XG5cblx0XHR0aGlzLmluaXRTZWxlY3Rpb24oKTtcblxuXHR9LFxuXG5cdHNldFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cblx0XHQvLyBFbnN1cmUgdmFsdWUgaXMgYXJyYXkuXG5cdFx0aWYgKCAhIHZhbHVlIHx8ICEgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gW107XG5cdFx0fVxuXG5cdFx0RmllbGQucHJvdG90eXBlLnNldFZhbHVlLmFwcGx5KCB0aGlzLCBbIHZhbHVlIF0gKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIFNlbGVjdGlvbi5cblx0ICpcblx0ICogU2VsZWN0aW9uIGlzIGFuIEF0dGFjaG1lbnQgY29sbGVjdGlvbiBjb250YWluaW5nIGZ1bGwgbW9kZWxzIGZvciB0aGUgY3VycmVudCB2YWx1ZS5cblx0ICpcblx0ICogQHJldHVybiBudWxsXG5cdCAqL1xuXHRpbml0U2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMuc2VsZWN0aW9uID0gbmV3IHdwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzKCk7XG5cblx0XHR0aGlzLnNlbGVjdGlvbi5jb21wYXJhdG9yID0gJ21lbnUtb3JkZXInO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSBzZWxlY3Rpb24uXG5cdFx0Xy5lYWNoKCB0aGlzLmdldFZhbHVlKCksIGZ1bmN0aW9uKCBpdGVtLCBpICkge1xuXG5cdFx0XHR2YXIgbW9kZWw7XG5cblx0XHRcdC8vIExlZ2FjeS4gSGFuZGxlIHN0b3JpbmcgZnVsbCBvYmplY3RzLlxuXHRcdFx0aXRlbSAgPSAoICdvYmplY3QnID09PSB0eXBlb2YoIGl0ZW0gKSApID8gaXRlbS5pZCA6IGl0ZW07XG5cdFx0XHRtb2RlbCA9IG5ldyB3cC5tZWRpYS5hdHRhY2htZW50KCBpdGVtICk7XG5cblx0XHRcdG1vZGVsLnNldCggJ21lbnUtb3JkZXInLCBpICk7XG5cblx0XHRcdHRoaXMuc2VsZWN0aW9uLmFkZCggbW9kZWwgKTtcblxuXHRcdFx0Ly8gUmUtcmVuZGVyIGFmdGVyIGF0dGFjaG1lbnRzIGhhdmUgc3luY2VkLlxuXHRcdFx0bW9kZWwuZmV0Y2goKTtcblx0XHRcdG1vZGVsLm9uKCAnc3luYycsIHRoaXMucmVuZGVyICk7XG5cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHR9LFxuXG5cdHByZXBhcmU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRpZDogICAgIHRoaXMuY2lkLFxuXHRcdFx0dmFsdWU6ICB0aGlzLnNlbGVjdGlvbi50b0pTT04oKSxcblx0XHQgXHRjb25maWc6IHRoaXMuY29uZmlnLFxuXHRcdH07XG5cdH0sXG5cblx0cmVuZGVyZWQ6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy4kZWwuc29ydGFibGUoe1xuXHRcdFx0ZGVsYXk6IDE1MCxcblx0XHRcdGl0ZW1zOiAnPiAuaW1hZ2UtcGxhY2Vob2xkZXInLFxuXHRcdFx0c3RvcDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMuc2VsZWN0aW9uO1xuXG5cdFx0XHRcdHRoaXMuJGVsLmNoaWxkcmVuKCAnLmltYWdlLXBsYWNlaG9sZGVyJyApLmVhY2goIGZ1bmN0aW9uKCBpICkge1xuXG5cdFx0XHRcdFx0dmFyIGlkICAgID0gcGFyc2VJbnQoIHRoaXMuZ2V0QXR0cmlidXRlKCAnZGF0YS1pZCcgKSApO1xuXHRcdFx0XHRcdHZhciBtb2RlbCA9IHNlbGVjdGlvbi5maW5kV2hlcmUoIHsgaWQ6IGlkIH0gKTtcblxuXHRcdFx0XHRcdGlmICggbW9kZWwgKSB7XG5cdFx0XHRcdFx0XHRtb2RlbC5zZXQoICdtZW51LW9yZGVyJywgaSApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0c2VsZWN0aW9uLnNvcnQoKTtcblx0XHRcdFx0dGhpcy5zZXRWYWx1ZSggc2VsZWN0aW9uLnBsdWNrKCdpZCcpICk7XG5cblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdH0pO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZSB0aGUgc2VsZWN0IGV2ZW50LlxuXHQgKlxuXHQgKiBJbnNlcnQgYW4gaW1hZ2Ugb3IgbXVsdGlwbGUgaW1hZ2VzLlxuXHQgKi9cblx0b25TZWxlY3RJbWFnZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZnJhbWUgPSB0aGlzLmZyYW1lIHx8IG51bGw7XG5cblx0XHRpZiAoICEgZnJhbWUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5zZWxlY3Rpb24ucmVzZXQoW10pO1xuXG5cdFx0ZnJhbWUuc3RhdGUoKS5nZXQoJ3NlbGVjdGlvbicpLmVhY2goIGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXG5cdFx0XHRpZiAoIHRoaXMuaXNBdHRhY2htZW50U2l6ZU9rKCBhdHRhY2htZW50ICkgKSB7XG5cdFx0XHRcdHRoaXMuc2VsZWN0aW9uLmFkZCggYXR0YWNobWVudCApO1xuXHRcdFx0fVxuXG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHR0aGlzLnNldFZhbHVlKCB0aGlzLnNlbGVjdGlvbi5wbHVjaygnaWQnKSApO1xuXG5cdFx0ZnJhbWUuY2xvc2UoKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgdGhlIGVkaXQgYWN0aW9uLlxuXHQgKi9cblx0ZWRpdEltYWdlOiBmdW5jdGlvbihlKSB7XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR2YXIgZnJhbWUgPSB0aGlzLmZyYW1lO1xuXG5cdFx0aWYgKCAhIGZyYW1lICkge1xuXG5cdFx0XHR2YXIgZnJhbWVBcmdzID0ge1xuXHRcdFx0XHRsaWJyYXJ5OiB0aGlzLmNvbmZpZy5saWJyYXJ5LFxuXHRcdFx0XHRtdWx0aXBsZTogdGhpcy5jb25maWcubXVsdGlwbGUsXG5cdFx0XHRcdHRpdGxlOiAnU2VsZWN0IEltYWdlJyxcblx0XHRcdFx0ZnJhbWU6ICdzZWxlY3QnLFxuXHRcdFx0fTtcblxuXHRcdFx0ZnJhbWUgPSB0aGlzLmZyYW1lID0gd3AubWVkaWEoIGZyYW1lQXJncyApO1xuXG5cdFx0XHRmcmFtZS5vbiggJ2NvbnRlbnQ6Y3JlYXRlOmJyb3dzZScsIHRoaXMuc2V0dXBGaWx0ZXJzLCB0aGlzICk7XG5cdFx0XHRmcmFtZS5vbiggJ2NvbnRlbnQ6cmVuZGVyOmJyb3dzZScsIHRoaXMuc2l6ZUZpbHRlck5vdGljZSwgdGhpcyApO1xuXHRcdFx0ZnJhbWUub24oICdzZWxlY3QnLCB0aGlzLm9uU2VsZWN0SW1hZ2UsIHRoaXMgKTtcblxuXHRcdH1cblxuXHRcdC8vIFdoZW4gdGhlIGZyYW1lIG9wZW5zLCBzZXQgdGhlIHNlbGVjdGlvbi5cblx0XHRmcmFtZS5vbiggJ29wZW4nLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHNlbGVjdGlvbiA9IGZyYW1lLnN0YXRlKCkuZ2V0KCdzZWxlY3Rpb24nKTtcblxuXHRcdFx0Ly8gU2V0IHRoZSBzZWxlY3Rpb24uXG5cdFx0XHQvLyBOb3RlIC0gZXhwZWN0cyBhcnJheSBvZiBvYmplY3RzLCBub3QgYSBjb2xsZWN0aW9uLlxuXHRcdFx0c2VsZWN0aW9uLnNldCggdGhpcy5zZWxlY3Rpb24ubW9kZWxzICk7XG5cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdGZyYW1lLm9wZW4oKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGQgZmlsdGVycyB0byB0aGUgZnJhbWUgbGlicmFyeSBjb2xsZWN0aW9uLlxuXHQgKlxuXHQgKiAgLSBmaWx0ZXIgdG8gbGltaXQgdG8gcmVxdWlyZWQgc2l6ZS5cblx0ICovXG5cdHNldHVwRmlsdGVyczogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgbGliICAgID0gdGhpcy5mcmFtZS5zdGF0ZSgpLmdldCgnbGlicmFyeScpO1xuXG5cdFx0aWYgKCAnc2l6ZVJlcScgaW4gdGhpcy5jb25maWcgKSB7XG5cdFx0XHRsaWIuZmlsdGVycy5zaXplID0gdGhpcy5pc0F0dGFjaG1lbnRTaXplT2s7XG5cdFx0fVxuXG5cdH0sXG5cblxuXHQvKipcblx0ICogSGFuZGxlIGRpc3BsYXkgb2Ygc2l6ZSBmaWx0ZXIgbm90aWNlLlxuXHQgKi9cblx0c2l6ZUZpbHRlck5vdGljZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgbGliID0gdGhpcy5mcmFtZS5zdGF0ZSgpLmdldCgnbGlicmFyeScpO1xuXG5cdFx0aWYgKCAhIGxpYi5maWx0ZXJzLnNpemUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gV2FpdCB0byBiZSBzdXJlIHRoZSBmcmFtZSBpcyByZW5kZXJlZC5cblx0XHR3aW5kb3cuc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciByZXEsICRub3RpY2UsIHRlbXBsYXRlLCAkdG9vbGJhcjtcblxuXHRcdFx0cmVxID0gXy5leHRlbmQoIHtcblx0XHRcdFx0d2lkdGg6IDAsXG5cdFx0XHRcdGhlaWdodDogMCxcblx0XHRcdH0sIHRoaXMuY29uZmlnLnNpemVSZXEgKTtcblxuXHRcdFx0Ly8gRGlzcGxheSBub3RpY2Ugb24gbWFpbiBncmlkIHZpZXcuXG5cdFx0XHR0ZW1wbGF0ZSA9ICc8cCBjbGFzcz1cImZpbHRlci1ub3RpY2VcIj5Pbmx5IHNob3dpbmcgaW1hZ2VzIHRoYXQgbWVldCBzaXplIHJlcXVpcmVtZW50czogPCU9IHdpZHRoICU+cHggJnRpbWVzOyA8JT0gaGVpZ2h0ICU+cHg8L3A+Jztcblx0XHRcdCRub3RpY2UgID0gJCggXy50ZW1wbGF0ZSggdGVtcGxhdGUgKSggcmVxICkgKTtcblx0XHRcdCR0b29sYmFyID0gJCggJy5hdHRhY2htZW50cy1icm93c2VyIC5tZWRpYS10b29sYmFyJywgdGhpcy5mcmFtZS4kZWwgKS5maXJzdCgpO1xuXHRcdFx0JHRvb2xiYXIucHJlcGVuZCggJG5vdGljZSApO1xuXG5cdFx0XHR2YXIgY29udGVudFZpZXcgPSB0aGlzLmZyYW1lLnZpZXdzLmdldCggJy5tZWRpYS1mcmFtZS1jb250ZW50JyApO1xuXHRcdFx0Y29udGVudFZpZXcgPSBjb250ZW50Vmlld1swXTtcblxuXHRcdFx0JG5vdGljZSA9ICQoICc8cCBjbGFzcz1cImZpbHRlci1ub3RpY2VcIj5JbWFnZSBkb2VzIG5vdCBtZWV0IHNpemUgcmVxdWlyZW1lbnRzLjwvcD4nICk7XG5cblx0XHRcdC8vIERpc3BsYXkgYWRkaXRpb25hbCBub3RpY2Ugd2hlbiBzZWxlY3RpbmcgYW4gaW1hZ2UuXG5cdFx0XHQvLyBSZXF1aXJlZCB0byBpbmRpY2F0ZSBhIGJhZCBpbWFnZSBoYXMganVzdCBiZWVuIHVwbG9hZGVkLlxuXHRcdFx0Y29udGVudFZpZXcub3B0aW9ucy5zZWxlY3Rpb24ub24oICdzZWxlY3Rpb246c2luZ2xlJywgZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dmFyIGF0dGFjaG1lbnQgPSBjb250ZW50Vmlldy5vcHRpb25zLnNlbGVjdGlvbi5zaW5nbGUoKTtcblxuXHRcdFx0XHR2YXIgZGlzcGxheU5vdGljZSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdFx0Ly8gSWYgc3RpbGwgdXBsb2FkaW5nLCB3YWl0IGFuZCB0cnkgZGlzcGxheWluZyBub3RpY2UgYWdhaW4uXG5cdFx0XHRcdFx0aWYgKCBhdHRhY2htZW50LmdldCggJ3VwbG9hZGluZycgKSApIHtcblx0XHRcdFx0XHRcdHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0ZGlzcGxheU5vdGljZSgpO1xuXHRcdFx0XHRcdFx0fSwgNTAwICk7XG5cblx0XHRcdFx0XHQvLyBPSy4gRGlzcGxheSBub3RpY2UgYXMgcmVxdWlyZWQuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0aWYgKCAhIHRoaXMuaXNBdHRhY2htZW50U2l6ZU9rKCBhdHRhY2htZW50ICkgKSB7XG5cdFx0XHRcdFx0XHRcdCQoICcuYXR0YWNobWVudHMtYnJvd3NlciAuYXR0YWNobWVudC1pbmZvJyApLnByZXBlbmQoICRub3RpY2UgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdCRub3RpY2UucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fS5iaW5kKHRoaXMpO1xuXG5cdFx0XHRcdGRpc3BsYXlOb3RpY2UoKTtcblxuXHRcdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHR9LmJpbmQodGhpcyksIDEwMCAgKTtcblxuXHR9LFxuXG5cdHJlbW92ZUltYWdlOiBmdW5jdGlvbihlKSB7XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR2YXIgJHRhcmdldCwgaWQ7XG5cblx0XHQkdGFyZ2V0ID0gJChlLnRhcmdldCk7XG5cdFx0JHRhcmdldCA9ICggJHRhcmdldC5wcm9wKCd0YWdOYW1lJykgPT09ICdCVVRUT04nICkgPyAkdGFyZ2V0IDogJHRhcmdldC5jbG9zZXN0KCdidXR0b24ucmVtb3ZlJyk7XG5cdFx0aWQgICAgICA9ICR0YXJnZXQuZGF0YSggJ2ltYWdlLWlkJyApO1xuXG5cdFx0aWYgKCAhIGlkICApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnNlbGVjdGlvbi5yZW1vdmUoIHRoaXMuc2VsZWN0aW9uLndoZXJlKCB7IGlkOiBpZCB9ICkgKTtcblx0XHR0aGlzLnNldFZhbHVlKCB0aGlzLnNlbGVjdGlvbi5wbHVjaygnaWQnKSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIERvZXMgYXR0YWNobWVudCBtZWV0IHNpemUgcmVxdWlyZW1lbnRzP1xuXHQgKlxuXHQgKiBAcGFyYW0gIEF0dGFjaG1lbnRcblx0ICogQHJldHVybiBib29sZWFuXG5cdCAqL1xuXHRpc0F0dGFjaG1lbnRTaXplT2s6IGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXG5cdFx0aWYgKCAhICggJ3NpemVSZXEnIGluIHRoaXMuY29uZmlnICkgKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHR0aGlzLmNvbmZpZy5zaXplUmVxID0gXy5leHRlbmQoIHtcblx0XHRcdHdpZHRoOiAwLFxuXHRcdFx0aGVpZ2h0OiAwLFxuXHRcdH0sIHRoaXMuY29uZmlnLnNpemVSZXEgKTtcblxuXHRcdHZhciB3aWR0aFJlcSAgPSBhdHRhY2htZW50LmdldCgnd2lkdGgnKSAgPj0gdGhpcy5jb25maWcuc2l6ZVJlcS53aWR0aDtcblx0XHR2YXIgaGVpZ2h0UmVxID0gYXR0YWNobWVudC5nZXQoJ2hlaWdodCcpID49IHRoaXMuY29uZmlnLnNpemVSZXEuaGVpZ2h0O1xuXG5cdFx0cmV0dXJuIHdpZHRoUmVxICYmIGhlaWdodFJlcTtcblxuXHR9XG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZEF0dGFjaG1lbnQ7XG4iLCJ2YXIgJCAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIHdwICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddIDogbnVsbCk7XG52YXIgRmllbGQgPSByZXF1aXJlKCcuL2ZpZWxkLmpzJyk7XG5cbnZhciBGaWVsZFRleHQgPSBGaWVsZC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiB3cC50ZW1wbGF0ZSggJ21wYi1maWVsZC1jaGVja2JveCcgKSxcblxuXHRkZWZhdWx0Q29uZmlnOiB7XG5cdFx0bGFiZWw6ICdUZXN0IExhYmVsJyxcblx0fSxcblxuXHRldmVudHM6IHtcblx0XHQnY2hhbmdlICBpbnB1dCc6ICdpbnB1dENoYW5nZWQnLFxuXHR9LFxuXG5cdGlucHV0Q2hhbmdlZDogXy5kZWJvdW5jZSggZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSggJCggJ2lucHV0JywgdGhpcy4kZWwgKS5wcm9wKCAnY2hlY2tlZCcgKSApO1xuXHR9ICksXG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFRleHQ7XG4iLCJ2YXIgd3AgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxudmFyIEZpZWxkTGluayA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLWZpZWxkLWxpbmsnICksXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2tleXVwICAgaW5wdXQuZmllbGQtdGV4dCc6ICd0ZXh0SW5wdXRDaGFuZ2VkJyxcblx0XHQnY2hhbmdlICBpbnB1dC5maWVsZC10ZXh0JzogJ3RleHRJbnB1dENoYW5nZWQnLFxuXHRcdCdrZXl1cCAgIGlucHV0LmZpZWxkLWxpbmsnOiAnbGlua0lucHV0Q2hhbmdlZCcsXG5cdFx0J2NoYW5nZSAgaW5wdXQuZmllbGQtbGluayc6ICdsaW5rSW5wdXRDaGFuZ2VkJyxcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblxuXHRcdEZpZWxkLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIG9wdGlvbnMgXSApO1xuXG5cdFx0dGhpcy52YWx1ZSA9IHRoaXMudmFsdWUgfHwge307XG5cdFx0dGhpcy52YWx1ZSA9IF8uZGVmYXVsdHMoIHRoaXMudmFsdWUsIHsgbGluazogJycsIHRleHQ6ICcnIH0gKTtcblxuXHR9LFxuXG5cdHRleHRJbnB1dENoYW5nZWQ6IF8uZGVib3VuY2UoIGZ1bmN0aW9uKGUpIHtcblx0XHRpZiAoIGUgJiYgZS50YXJnZXQgKSB7XG5cdFx0XHR2YXIgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cdFx0XHR2YWx1ZS50ZXh0ID0gZS50YXJnZXQudmFsdWU7XG5cdFx0XHR0aGlzLnNldFZhbHVlKCB2YWx1ZSApO1xuXHRcdH1cblx0fSApLFxuXG5cdGxpbmtJbnB1dENoYW5nZWQ6IF8uZGVib3VuY2UoIGZ1bmN0aW9uKGUpIHtcblx0XHRpZiAoIGUgJiYgZS50YXJnZXQgKSB7XG5cdFx0XHR2YXIgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cdFx0XHR2YWx1ZS5saW5rID0gZS50YXJnZXQudmFsdWU7XG5cdFx0XHR0aGlzLnNldFZhbHVlKCB2YWx1ZSApO1xuXHRcdH1cblx0fSApLFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZExpbms7XG4iLCJ2YXIgd3AgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddIDogbnVsbCk7XG52YXIgRmllbGRUZXh0ID0gcmVxdWlyZSgnLi9maWVsZC10ZXh0LmpzJyk7XG5cbnZhciBGaWVsZE51bWJlciA9IEZpZWxkVGV4dC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiB3cC50ZW1wbGF0ZSggJ21wYi1maWVsZC1udW1iZXInICksXG5cblx0Z2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBwYXJzZUZsb2F0KCB0aGlzLnZhbHVlICk7XG5cdH0sXG5cblx0c2V0VmFsdWU6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHR0aGlzLnZhbHVlID0gcGFyc2VGbG9hdCggdmFsdWUgKTtcblx0XHR0aGlzLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLmdldFZhbHVlKCkgKTtcblx0fSxcblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkTnVtYmVyO1xuIiwiLyogZ2xvYmFsIGFqYXh1cmwgKi9cblxudmFyICQgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciB3cCAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG4vKipcbiAqIFRleHQgRmllbGQgVmlld1xuICpcbiAqIFlvdSBjYW4gdXNlIHRoaXMgYW55d2hlcmUuXG4gKiBKdXN0IGxpc3RlbiBmb3IgJ2NoYW5nZScgZXZlbnQgb24gdGhlIHZpZXcuXG4gKi9cbnZhciBGaWVsZFBvc3RTZWxlY3QgPSBGaWVsZC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiB3cC50ZW1wbGF0ZSggJ21wYi1maWVsZC10ZXh0JyApLFxuXG5cdGRlZmF1bHRDb25maWc6IHtcblx0XHRtdWx0aXBsZTogdHJ1ZSxcblx0XHRwb3N0VHlwZTogJ3Bvc3QnXG5cdH0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NoYW5nZSBpbnB1dCc6ICdpbnB1dENoYW5nZWQnXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0RmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgb3B0aW9ucyBdICk7XG5cdFx0dGhpcy5vbiggJ21wYjpyZW5kZXJlZCcsIHRoaXMucmVuZGVyZWQgKTtcblx0fSxcblxuXHRzZXRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXG5cdFx0aWYgKCB0aGlzLmNvbmZpZy5tdWx0aXBsZSAmJiAhIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IFsgdmFsdWUgXTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMuY29uZmlnLm11bHRpcGxlICYmIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IHZhbHVlWzBdO1xuXHRcdH1cblxuXHRcdEZpZWxkLnByb3RvdHlwZS5zZXRWYWx1ZS5hcHBseSggdGhpcywgWyB2YWx1ZSBdICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogR2V0IFZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gIFJldHVybiB2YWx1ZSBhcyBhbiBhcnJheSBldmVuIGlmIG11bHRpcGxlIGlzIGZhbHNlLlxuXHQgKi9cblx0Z2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHZhbHVlID0gdGhpcy52YWx1ZTtcblxuXHRcdGlmICggdGhpcy5jb25maWcubXVsdGlwbGUgJiYgISBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXHRcdFx0dmFsdWUgPSBbIHZhbHVlIF07XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLmNvbmZpZy5tdWx0aXBsZSAmJiBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXHRcdFx0dmFsdWUgPSB2YWx1ZVswXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdmFsdWU7XG5cblx0fSxcblxuXHRwcmVwYXJlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblx0XHR2YWx1ZSA9IEFycmF5LmlzQXJyYXkoIHZhbHVlICkgPyB2YWx1ZS5qb2luKCAnLCcgKSA6IHZhbHVlO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGlkOiAgICAgdGhpcy5jaWQsXG5cdFx0XHR2YWx1ZTogIHZhbHVlLFxuXHRcdFx0Y29uZmlnOiB7fVxuXHRcdH07XG5cblx0fSxcblxuXHRyZW5kZXJlZDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuaW5pdFNlbGVjdDIoKTtcblx0fSxcblxuXHRpbml0U2VsZWN0MjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgJGZpZWxkID0gJCggJyMnICsgdGhpcy5jaWQsIHRoaXMuJGVsICk7XG5cdFx0dmFyIHBvc3RUeXBlID0gdGhpcy5jb25maWcucG9zdFR5cGU7XG5cblx0XHR2YXIgZm9ybWF0UmVxdWVzdCA9ZnVuY3Rpb24gKCB0ZXJtLCBwYWdlICkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0YWN0aW9uOiAnbWNlX2dldF9wb3N0cycsXG5cdFx0XHRcdHM6IHRlcm0sXG5cdFx0XHRcdHBhZ2U6IHBhZ2UsXG5cdFx0XHRcdHBvc3RfdHlwZTogcG9zdFR5cGVcblx0XHRcdH07XG5cdFx0fTtcblxuXHRcdHZhciBwYXJzZVJlc3VsdHMgPSBmdW5jdGlvbiAoIHJlc3BvbnNlICkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0cmVzdWx0czogcmVzcG9uc2UucmVzdWx0cyxcblx0XHRcdFx0bW9yZTogcmVzcG9uc2UubW9yZVxuXHRcdFx0fTtcblx0XHR9O1xuXG5cdFx0dmFyIGluaXRTZWxlY3Rpb24gPSBmdW5jdGlvbiggZWwsIGNhbGxiYWNrICkge1xuXG5cdFx0XHR2YXIgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCkuam9pbignLCcpO1xuXG5cdFx0XHRpZiAoIHZhbHVlLmxlbmd0aCApIHtcblx0XHRcdFx0JC5nZXQoIGFqYXh1cmwsIHtcblx0XHRcdFx0XHRhY3Rpb246ICdtY2VfZ2V0X3Bvc3RzJyxcblx0XHRcdFx0XHRwb3N0X19pbjogdmFsdWUsXG5cdFx0XHRcdFx0cG9zdF90eXBlOiBwb3N0VHlwZVxuXHRcdFx0XHR9ICkuZG9uZSggZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soIHBhcnNlUmVzdWx0cyggZGF0YSApLnJlc3VsdHMgKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXG5cdFx0fS5iaW5kKHRoaXMpO1xuXG5cdFx0JGZpZWxkLnNlbGVjdDIoe1xuXHRcdFx0bWluaW11bUlucHV0TGVuZ3RoOiAxLFxuXHRcdFx0bXVsdGlwbGU6IHRoaXMuY29uZmlnLm11bHRpcGxlLFxuXHRcdFx0aW5pdFNlbGVjdGlvbjogaW5pdFNlbGVjdGlvbixcblx0XHRcdGFqYXg6IHtcblx0XHRcdFx0dXJsOiBhamF4dXJsLFxuXHRcdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0ICAgIGRlbGF5OiAyNTAsXG5cdFx0XHQgICAgY2FjaGU6IGZhbHNlLFxuXHRcdFx0XHRkYXRhOiBmb3JtYXRSZXF1ZXN0LFxuXHRcdFx0XHRyZXN1bHRzOiBwYXJzZVJlc3VsdHMsXG5cdFx0XHR9LFxuXHRcdH0pO1xuXG5cdH0sXG5cblx0aW5wdXRDaGFuZ2VkOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdmFsdWUgPSAkKCAnaW5wdXQjJyArIHRoaXMuY2lkLCB0aGlzLiRlbCApLnZhbCgpO1xuXHRcdHZhbHVlID0gdmFsdWUuc3BsaXQoICcsJyApLm1hcCggTnVtYmVyICk7XG5cdFx0dGhpcy5zZXRWYWx1ZSggdmFsdWUgKTtcblx0fSxcblxuXHRyZW1vdmU6IGZ1bmN0aW9uKCkge1xuXHR9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRQb3N0U2VsZWN0O1xuIiwidmFyICQgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciB3cCAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG4vKipcbiAqIFRleHQgRmllbGQgVmlld1xuICpcbiAqIFlvdSBjYW4gdXNlIHRoaXMgYW55d2hlcmUuXG4gKiBKdXN0IGxpc3RlbiBmb3IgJ2NoYW5nZScgZXZlbnQgb24gdGhlIHZpZXcuXG4gKi9cbnZhciBGaWVsZFNlbGVjdCA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLWZpZWxkLXNlbGVjdCcgKSxcblx0dmFsdWU6IFtdLFxuXG5cdGRlZmF1bHRDb25maWc6IHtcblx0XHRtdWx0aXBsZTogZmFsc2UsXG5cdFx0b3B0aW9uczogW10sXG5cdH0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NoYW5nZSBzZWxlY3QnOiAnaW5wdXRDaGFuZ2VkJ1xuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdF8uYmluZEFsbCggdGhpcywgJ3BhcnNlT3B0aW9uJyApO1xuXHRcdEZpZWxkLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIG9wdGlvbnMgXSApO1xuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnMuY29uZmlnLm9wdGlvbnMgfHwgW107XG5cdH0sXG5cblx0aW5wdXRDaGFuZ2VkOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFZhbHVlKCAkKCAnc2VsZWN0JywgdGhpcy4kZWwgKS52YWwoKSApO1xuXHR9LFxuXG5cdGdldE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMubWFwKCB0aGlzLnBhcnNlT3B0aW9uICk7XG5cdH0sXG5cblx0cGFyc2VPcHRpb246IGZ1bmN0aW9uKCBvcHRpb24gKSB7XG5cdFx0b3B0aW9uID0gXy5kZWZhdWx0cyggb3B0aW9uLCB7IHZhbHVlOiAnJywgdGV4dDogJycsIHNlbGVjdGVkOiBmYWxzZSB9ICk7XG5cdFx0b3B0aW9uLnNlbGVjdGVkID0gdGhpcy5pc1NlbGVjdGVkKCBvcHRpb24udmFsdWUgKTtcblx0XHRyZXR1cm4gb3B0aW9uO1xuXHR9LFxuXG5cdGlzU2VsZWN0ZWQ6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRpZiAoIHRoaXMuY29uZmlnLm11bHRpcGxlICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0VmFsdWUoKS5pbmRleE9mKCB2YWx1ZSApID49IDA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB2YWx1ZSA9PT0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdH1cblx0fSxcblxuXHRzZXRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXG5cdFx0aWYgKCB0aGlzLmNvbmZpZy5tdWx0aXBsZSAmJiAhIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IFsgdmFsdWUgXTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMuY29uZmlnLm11bHRpcGxlICYmIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IHZhbHVlWzBdO1xuXHRcdH1cblxuXHRcdEZpZWxkLnByb3RvdHlwZS5zZXRWYWx1ZS5hcHBseSggdGhpcywgWyB2YWx1ZSBdICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogR2V0IFZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gIFJldHVybiB2YWx1ZSBhcyBhbiBhcnJheSBldmVuIGlmIG11bHRpcGxlIGlzIGZhbHNlLlxuXHQgKi9cblx0Z2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHZhbHVlID0gdGhpcy52YWx1ZTtcblxuXHRcdGlmICggdGhpcy5jb25maWcubXVsdGlwbGUgJiYgISBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXHRcdFx0dmFsdWUgPSBbIHZhbHVlIF07XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLmNvbmZpZy5tdWx0aXBsZSAmJiBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXHRcdFx0dmFsdWUgPSB2YWx1ZVswXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdmFsdWU7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0aWQ6IHRoaXMuY2lkLFxuXHRcdFx0b3B0aW9uczogdGhpcy5nZXRPcHRpb25zKCksXG5cdFx0fTtcblxuXHRcdC8vIENyZWF0ZSBlbGVtZW50IGZyb20gdGVtcGxhdGUuXG5cdFx0dGhpcy4kZWwuaHRtbCggdGhpcy50ZW1wbGF0ZSggZGF0YSApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTZWxlY3Q7XG4iLCJ2YXIgd3AgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxudmFyIEZpZWxkVGV4dCA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLWZpZWxkLXRleHQnICksXG5cblx0ZGVmYXVsdENvbmZpZzoge1xuXHRcdGNsYXNzZXM6ICdyZWd1bGFyLXRleHQnLFxuXHRcdHBsYWNlaG9sZGVyOiBudWxsLFxuXHR9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdrZXl1cCAgIGlucHV0JzogJ2lucHV0Q2hhbmdlZCcsXG5cdFx0J2NoYW5nZSAgaW5wdXQnOiAnaW5wdXRDaGFuZ2VkJyxcblx0fSxcblxuXHRpbnB1dENoYW5nZWQ6IF8uZGVib3VuY2UoIGZ1bmN0aW9uKGUpIHtcblx0XHRpZiAoIGUgJiYgZS50YXJnZXQgKSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlKCBlLnRhcmdldC52YWx1ZSApO1xuXHRcdH1cblx0fSApLFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRUZXh0O1xuIiwidmFyIHdwICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXSA6IG51bGwpO1xudmFyIEZpZWxkVGV4dCA9IHJlcXVpcmUoJy4vZmllbGQtdGV4dC5qcycpO1xuXG52YXIgRmllbGRUZXh0YXJlYSA9IEZpZWxkVGV4dC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiB3cC50ZW1wbGF0ZSggJ21wYi1maWVsZC10ZXh0YXJlYScgKSxcblxuXHRldmVudHM6IHtcblx0XHQna2V5dXAgIHRleHRhcmVhJzogJ2lucHV0Q2hhbmdlZCcsXG5cdFx0J2NoYW5nZSB0ZXh0YXJlYSc6ICdpbnB1dENoYW5nZWQnLFxuXHR9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRUZXh0YXJlYTtcbiIsInZhciAkICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgd3AgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxuLyoqXG4gKiBUZXh0IEZpZWxkIFZpZXdcbiAqXG4gKiBZb3UgY2FuIHVzZSB0aGlzIGFueXdoZXJlLlxuICogSnVzdCBsaXN0ZW4gZm9yICdjaGFuZ2UnIGV2ZW50IG9uIHRoZSB2aWV3LlxuICovXG52YXIgRmllbGRXWVNJV1lHID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogd3AudGVtcGxhdGUoICdtcGItZmllbGQtd3lzaXd5ZycgKSxcblx0ZWRpdG9yOiBudWxsLFxuXHR2YWx1ZTogbnVsbCxcblxuXHQvKipcblx0ICogSW5pdC5cblx0ICpcblx0ICogb3B0aW9ucy52YWx1ZSBpcyB1c2VkIHRvIHBhc3MgaW5pdGlhbCB2YWx1ZS5cblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0RmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgb3B0aW9ucyBdICk7XG5cblx0XHR0aGlzLm9uKCAnbXBiOnJlbmRlcmVkJywgdGhpcy5yZW5kZXJlZCApO1xuXG5cdH0sXG5cblx0cmVuZGVyZWQ6IGZ1bmN0aW9uICgpIHtcblxuXHRcdC8vIEhpZGUgZWRpdG9yIHRvIHByZXZlbnQgRk9VQy4gU2hvdyBhZ2FpbiBvbiBpbml0LiBTZWUgc2V0dXAuXG5cdFx0JCggJy53cC1lZGl0b3Itd3JhcCcsIHRoaXMuJGVsICkuY3NzKCAnZGlzcGxheScsICdub25lJyApO1xuXG5cdFx0Ly8gSW5pdC4gRGVmZmVycmVkIHRvIG1ha2Ugc3VyZSBjb250YWluZXIgZWxlbWVudCBoYXMgYmVlbiByZW5kZXJlZC5cblx0XHRfLmRlZmVyKCB0aGlzLmluaXRUaW55TUNFLmJpbmQoIHRoaXMgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZSB0aGUgVGlueU1DRSBlZGl0b3IuXG5cdCAqXG5cdCAqIEJpdCBoYWNreSB0aGlzLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG51bGwuXG5cdCAqL1xuXHRpbml0VGlueU1DRTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgc2VsZiA9IHRoaXMsIHByb3A7XG5cblx0XHR2YXIgaWQgICAgPSAnbXBiLXRleHQtYm9keS0nICsgdGhpcy5jaWQ7XG5cdFx0dmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cCggJ21wYi1wbGFjZWhvbGRlci0oaWR8bmFtZSknLCAnZycgKTtcblx0XHR2YXIgZWQgICAgPSB0aW55TUNFLmdldCggaWQgKTtcblx0XHR2YXIgJGVsICAgPSAkKCAnI3dwLW1wYi10ZXh0LWJvZHktJyArIHRoaXMuY2lkICsgJy13cmFwJywgdGhpcy4kZWwgKTtcblxuXHRcdC8vIElmIGZvdW5kLiBSZW1vdmUgc28gd2UgY2FuIHJlLWluaXQuXG5cdFx0aWYgKCBlZCApIHtcblx0XHRcdHRpbnlNQ0UuZXhlY0NvbW1hbmQoICdtY2VSZW1vdmVFZGl0b3InLCBmYWxzZSwgaWQgKTtcblx0XHR9XG5cblx0XHQvLyBHZXQgc2V0dGluZ3MgZm9yIHRoaXMgZmllbGQuXG5cdFx0Ly8gSWYgbm8gc2V0dGluZ3MgZm9yIHRoaXMgZmllbGQuIENsb25lIGZyb20gcGxhY2Vob2xkZXIuXG5cdFx0aWYgKCB0eXBlb2YoIHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0gKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHR2YXIgbmV3U2V0dGluZ3MgPSBqUXVlcnkuZXh0ZW5kKCB7fSwgdGlueU1DRVByZUluaXQubWNlSW5pdFsgJ21wYi1wbGFjZWhvbGRlci1pZCcgXSApO1xuXHRcdFx0Zm9yICggcHJvcCBpbiBuZXdTZXR0aW5ncyApIHtcblx0XHRcdFx0aWYgKCAnc3RyaW5nJyA9PT0gdHlwZW9mKCBuZXdTZXR0aW5nc1twcm9wXSApICkge1xuXHRcdFx0XHRcdG5ld1NldHRpbmdzW3Byb3BdID0gbmV3U2V0dGluZ3NbcHJvcF0ucmVwbGFjZSggcmVnZXgsIGlkICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dGlueU1DRVByZUluaXQubWNlSW5pdFsgaWQgXSA9IG5ld1NldHRpbmdzO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBmdWxsc2NyZWVuIHBsdWdpbi5cblx0XHR0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdLnBsdWdpbnMgPSB0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdLnBsdWdpbnMucmVwbGFjZSggJ2Z1bGxzY3JlZW4sJywgJycgKTtcblxuXHRcdC8vIEdldCBxdWlja3RhZyBzZXR0aW5ncyBmb3IgdGhpcyBmaWVsZC5cblx0XHQvLyBJZiBub25lIGV4aXN0cyBmb3IgdGhpcyBmaWVsZC4gQ2xvbmUgZnJvbSBwbGFjZWhvbGRlci5cblx0XHRpZiAoIHR5cGVvZiggdGlueU1DRVByZUluaXQucXRJbml0WyBpZCBdICkgPT09ICd1bmRlZmluZWQnICkge1xuXHRcdFx0dmFyIG5ld1FUUyA9IGpRdWVyeS5leHRlbmQoIHt9LCB0aW55TUNFUHJlSW5pdC5xdEluaXRbICdtcGItcGxhY2Vob2xkZXItaWQnIF0gKTtcblx0XHRcdGZvciAoIHByb3AgaW4gbmV3UVRTICkge1xuXHRcdFx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YoIG5ld1FUU1twcm9wXSApICkge1xuXHRcdFx0XHRcdG5ld1FUU1twcm9wXSA9IG5ld1FUU1twcm9wXS5yZXBsYWNlKCByZWdleCwgaWQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGlueU1DRVByZUluaXQucXRJbml0WyBpZCBdID0gbmV3UVRTO1xuXHRcdH1cblxuXHRcdC8vIFdoZW4gZWRpdG9yIGluaXRzLCBhdHRhY2ggc2F2ZSBjYWxsYmFjayB0byBjaGFuZ2UgZXZlbnQuXG5cdFx0dGlueU1DRVByZUluaXQubWNlSW5pdFtpZF0uc2V0dXAgPSBmdW5jdGlvbigpIHtcblxuXHRcdFx0Ly8gTGlzdGVuIGZvciBjaGFuZ2VzIGluIHRoZSBNQ0UgZWRpdG9yLlxuXHRcdFx0dGhpcy5vbiggJ2NoYW5nZScsIGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0XHRzZWxmLnNldFZhbHVlKCBlLnRhcmdldC5nZXRDb250ZW50KCkgKTtcblx0XHRcdH0gKTtcblxuXHRcdFx0Ly8gUHJldmVudCBGT1VDLiBTaG93IGVsZW1lbnQgYWZ0ZXIgaW5pdC5cblx0XHRcdHRoaXMub24oICdpbml0JywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCRlbC5jc3MoICdkaXNwbGF5JywgJ2Jsb2NrJyApO1xuXHRcdFx0fSk7XG5cblx0XHR9O1xuXG5cdFx0Ly8gTGlzdGVuIGZvciBjaGFuZ2VzIGluIHRoZSBIVE1MIGVkaXRvci5cblx0XHQkKCcjJyArIGlkICkub24oICdrZXlkb3duIGNoYW5nZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VsZi5zZXRWYWx1ZSggdGhpcy52YWx1ZSApO1xuXHRcdH0gKTtcblxuXHRcdC8vIEN1cnJlbnQgbW9kZSBkZXRlcm1pbmVkIGJ5IGNsYXNzIG9uIGVsZW1lbnQuXG5cdFx0Ly8gSWYgbW9kZSBpcyB2aXN1YWwsIGNyZWF0ZSB0aGUgdGlueU1DRS5cblx0XHRpZiAoICRlbC5oYXNDbGFzcygndG1jZS1hY3RpdmUnKSApIHtcblx0XHRcdHRpbnlNQ0UuaW5pdCggdGlueU1DRVByZUluaXQubWNlSW5pdFtpZF0gKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JGVsLmNzcyggJ2Rpc3BsYXknLCAnYmxvY2snICk7XG5cdFx0fVxuXG5cdFx0Ly8gSW5pdCBxdWlja3RhZ3MuXG5cdFx0cXVpY2t0YWdzKCB0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gKTtcblx0XHRRVGFncy5fYnV0dG9uc0luaXQoKTtcblxuXHRcdHZhciAkYnVpbGRlciA9IHRoaXMuJGVsLmNsb3Nlc3QoICcudWktc29ydGFibGUnICk7XG5cblx0XHQvLyBIYW5kbGUgdGVtcG9yYXJ5IHJlbW92YWwgb2YgdGlueU1DRSB3aGVuIHNvcnRpbmcuXG5cdFx0JGJ1aWxkZXIub24oICdzb3J0c3RhcnQnLCBmdW5jdGlvbiggZXZlbnQsIHVpICkge1xuXG5cdFx0XHRpZiAoIGV2ZW50LmN1cnJlbnRUYXJnZXQgIT09ICRidWlsZGVyICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmICggdWkuaXRlbVswXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2lkJykgPT09IHRoaXMuZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpICkge1xuXHRcdFx0XHR0aW55TUNFLmV4ZWNDb21tYW5kKCAnbWNlUmVtb3ZlRWRpdG9yJywgZmFsc2UsIGlkICk7XG5cdFx0XHR9XG5cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdC8vIEhhbmRsZSByZS1pbml0IGFmdGVyIHNvcnRpbmcuXG5cdFx0JGJ1aWxkZXIub24oICdzb3J0c3RvcCcsIGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG5cblx0XHRcdGlmICggZXZlbnQuY3VycmVudFRhcmdldCAhPT0gJGJ1aWxkZXIgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCB1aS5pdGVtWzBdLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSA9PT0gdGhpcy5lbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2lkJykgKSB7XG5cdFx0XHRcdHRpbnlNQ0UuZXhlY0NvbW1hbmQoJ21jZUFkZEVkaXRvcicsIGZhbHNlLCBpZCk7XG5cdFx0XHR9XG5cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHR9LFxuXG5cdHJlbW92ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGlueU1DRS5leGVjQ29tbWFuZCggJ21jZVJlbW92ZUVkaXRvcicsIGZhbHNlLCAnbXBiLXRleHQtYm9keS0nICsgdGhpcy5jaWQgKTtcblx0fSxcblxuXHQvKipcblx0ICogUmVmcmVzaCB2aWV3IGFmdGVyIHNvcnQvY29sbGFwc2UgZXRjLlxuXHQgKi9cblx0cmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5yZW5kZXIoKTtcblx0fSxcblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkV1lTSVdZRztcbiIsInZhciB3cCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXSA6IG51bGwpO1xuXG4vKipcbiAqIEFic3RyYWN0IEZpZWxkIENsYXNzLlxuICpcbiAqIEhhbmRsZXMgc2V0dXAgYXMgd2VsbCBhcyBnZXR0aW5nIGFuZCBzZXR0aW5nIHZhbHVlcy5cbiAqIFByb3ZpZGVzIGEgdmVyeSBnZW5lcmljIHJlbmRlciBtZXRob2QgLSBidXQgcHJvYmFibHkgYmUgT0sgZm9yIG1vc3Qgc2ltcGxlIGZpZWxkcy5cbiAqL1xudmFyIEZpZWxkID0gd3AuQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAgICAgIG51bGwsXG5cdHZhbHVlOiAgICAgICAgIG51bGwsXG5cdGNvbmZpZzogICAgICAgIHt9LFxuXHRkZWZhdWx0Q29uZmlnOiB7fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZS5cblx0ICogSWYgeW91IGV4dGVuZCB0aGlzIHZpZXcgLSBpdCBpcyByZWNjb21tZWRlZCB0byBjYWxsIHRoaXMuXG5cdCAqXG5cdCAqIEV4cGVjdHMgb3B0aW9ucy52YWx1ZSBhbmQgb3B0aW9ucy5jb25maWcuXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblxuXHRcdHZhciBjb25maWc7XG5cblx0XHRfLmJpbmRBbGwoIHRoaXMsICdnZXRWYWx1ZScsICdzZXRWYWx1ZScgKTtcblxuXHRcdC8vIElmIGEgY2hhbmdlIGNhbGxiYWNrIGlzIHByb3ZpZGVkLCBjYWxsIHRoaXMgb24gY2hhbmdlLlxuXHRcdGlmICggJ29uQ2hhbmdlJyBpbiBvcHRpb25zICkge1xuXHRcdFx0dGhpcy5vbiggJ2NoYW5nZScsIG9wdGlvbnMub25DaGFuZ2UgKTtcblx0XHR9XG5cblx0XHRjb25maWcgPSAoICdjb25maWcnIGluIG9wdGlvbnMgKSA/IG9wdGlvbnMuY29uZmlnIDoge307XG5cdFx0dGhpcy5jb25maWcgPSBfLmV4dGVuZCgge30sIHRoaXMuZGVmYXVsdENvbmZpZywgY29uZmlnICk7XG5cblx0XHRpZiAoICd2YWx1ZScgaW4gb3B0aW9ucyApIHtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIG9wdGlvbnMudmFsdWUgKTtcblx0XHR9XG5cblx0fSxcblxuXHRnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMudmFsdWU7XG5cdH0sXG5cblx0c2V0VmFsdWU6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cdFx0dGhpcy50cmlnZ2VyKCAnY2hhbmdlJywgdGhpcy52YWx1ZSApO1xuXHR9LFxuXG5cdHByZXBhcmU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRpZDogICAgIHRoaXMuY2lkLFxuXHRcdFx0dmFsdWU6ICB0aGlzLnZhbHVlLFxuXHRcdFx0Y29uZmlnOiB0aGlzLmNvbmZpZ1xuXHRcdH07XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR3cC5CYWNrYm9uZS5WaWV3LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHRoaXMudHJpZ2dlciggJ21wYjpyZW5kZXJlZCcgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvKipcblx0ICogUmVmcmVzaCB2aWV3IGFmdGVyIHNvcnQvY29sbGFwc2UgZXRjLlxuXHQgKi9cblx0cmVmcmVzaDogZnVuY3Rpb24oKSB7fSxcblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkO1xuIiwidmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG52YXIgTW9kdWxlRWRpdEZvcm1Sb3cgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LWZvcm0tcm93LmpzJyk7XG52YXIgZmllbGRWaWV3cyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvZmllbGQtdmlld3MuanMnKTtcblxuLyoqXG4gKiBHZW5lcmljIEVkaXQgRm9ybS5cbiAqXG4gKiBIYW5kbGVzIGEgd2lkZSByYW5nZSBvZiBnZW5lcmljIGZpZWxkIHR5cGVzLlxuICogRm9yIGVhY2ggYXR0cmlidXRlLCBpdCBjcmVhdGVzIGEgZmllbGQgYmFzZWQgb24gdGhlIGF0dHJpYnV0ZSAndHlwZSdcbiAqIEFsc28gdXNlcyBvcHRpb25hbCBhdHRyaWJ1dGUgJ2NvbmZpZycgcHJvcGVydHkgd2hlbiBpbml0aWFsaXppbmcgZmllbGQuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlRWRpdC5leHRlbmQoe1xuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBhdHRyaWJ1dGVzLCBvcHRpb25zIF0gKTtcblxuXHRcdF8uYmluZEFsbCggdGhpcywgJ3JlbmRlcicgKTtcblxuXHRcdC8vIHRoaXMuZmllbGRzIGlzIGFuIGVhc3kgcmVmZXJlbmNlIGZvciB0aGUgZmllbGQgdmlld3MuXG5cdFx0dmFyIGZpZWxkc1ZpZXdzID0gdGhpcy5maWVsZHMgPSBbXTtcblx0XHR2YXIgbW9kZWwgICAgICAgPSB0aGlzLm1vZGVsO1xuXG5cdFx0Ly8gRm9yIGVhY2ggYXR0cmlidXRlIC1cblx0XHQvLyBpbml0aWFsaXplIGEgZmllbGQgZm9yIHRoYXQgYXR0cmlidXRlICd0eXBlJ1xuXHRcdC8vIFN0b3JlIGluIHRoaXMuZmllbGRzXG5cdFx0Ly8gVXNlIGNvbmZpZyBmcm9tIHRoZSBhdHRyaWJ1dGVcblx0XHR0aGlzLm1vZGVsLmdldCgnYXR0cicpLmVhY2goIGZ1bmN0aW9uKCBhdHRyICkge1xuXG5cdFx0XHR2YXIgZmllbGRWaWV3LCB0eXBlLCBuYW1lLCBjb25maWcsIHZpZXc7XG5cblx0XHRcdHR5cGUgPSBhdHRyLmdldCgndHlwZScpO1xuXG5cdFx0XHRpZiAoICEgdHlwZSB8fCAhICggdHlwZSBpbiBmaWVsZFZpZXdzICkgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0ZmllbGRWaWV3ID0gZmllbGRWaWV3c1sgdHlwZSBdO1xuXHRcdFx0bmFtZSAgICAgID0gYXR0ci5nZXQoJ25hbWUnKTtcblx0XHRcdGNvbmZpZyAgICA9IGF0dHIuZ2V0KCdjb25maWcnKSB8fCB7fTtcblxuXHRcdFx0dmlldyA9IG5ldyBmaWVsZFZpZXcoIHtcblx0XHRcdFx0dmFsdWU6IG1vZGVsLmdldEF0dHJWYWx1ZSggbmFtZSApLFxuXHRcdFx0XHRjb25maWc6IGNvbmZpZyxcblx0XHRcdFx0b25DaGFuZ2U6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRcdFx0XHRtb2RlbC5zZXRBdHRyVmFsdWUoIG5hbWUsIHZhbHVlICk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy52aWV3cy5hZGQoICcnLCBuZXcgTW9kdWxlRWRpdEZvcm1Sb3coIHtcblx0XHRcdFx0bGFiZWw6IGF0dHIuZ2V0KCdsYWJlbCcpLFxuXHRcdFx0XHRkZXNjOiAgYXR0ci5nZXQoJ2Rlc2NyaXB0aW9uJyApLFxuXHRcdFx0XHRmaWVsZFZpZXc6IHZpZXdcblx0XHRcdH0gKSApO1xuXG5cdFx0XHRmaWVsZHNWaWV3cy5wdXNoKCB2aWV3ICk7XG5cblx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXG5cdFx0Ly8gQ2xlYW51cC5cblx0XHQvLyBSZW1vdmUgZWFjaCBmaWVsZCB2aWV3IHdoZW4gdGhpcyBtb2RlbCBpcyBkZXN0cm95ZWQuXG5cdFx0dGhpcy5tb2RlbC5vbiggJ2Rlc3Ryb3knLCBmdW5jdGlvbigpIHtcblx0XHRcdF8uZWFjaCggdGhpcy5maWVsZHMsIGZ1bmN0aW9uKCBmaWVsZCApIHtcblx0XHRcdFx0ZmllbGQucmVtb3ZlKCk7XG5cdFx0XHR9ICk7XG5cdFx0fSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlZnJlc2ggdmlldy5cblx0ICogUmVxdWlyZWQgYWZ0ZXIgc29ydC9jb2xsYXBzZSBldGMuXG5cdCAqL1xuXHRyZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHRfLmVhY2goIHRoaXMuZmllbGRzLCBmdW5jdGlvbiggZmllbGQgKSB7XG5cdFx0XHRmaWVsZC5yZWZyZXNoKCk7XG5cdFx0fSApO1xuXHR9LFxuXG59KTtcbiIsInZhciB3cCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXSA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdwLkJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogd3AudGVtcGxhdGUoICdtcGItZm9ybS1yb3cnICksXG5cdGNsYXNzTmFtZTogJ2Zvcm0tcm93JyxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHRpZiAoICdmaWVsZFZpZXcnIGluIG9wdGlvbnMgKSB7XG5cdFx0XHR0aGlzLnZpZXdzLnNldCggJy5maWVsZCcsIG9wdGlvbnMuZmllbGRWaWV3ICk7XG5cdFx0fVxuXHR9LFxuXG59KTtcbiIsInZhciB3cCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXSA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdwLkJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogd3AudGVtcGxhdGUoICdtcGItbW9kdWxlLWVkaXQtdG9vbHMnICksXG5cdGNsYXNzTmFtZTogJ21vZHVsZS1lZGl0LXRvb2xzJyxcblxuXHRldmVudHM6IHtcblx0XHQnY2xpY2sgLmJ1dHRvbi1zZWxlY3Rpb24taXRlbS1yZW1vdmUnOiBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR0aGlzLnRyaWdnZXIoICdtcGI6bW9kdWxlLXJlbW92ZScgKTtcblx0XHR9LFxuXHR9LFxuXG59KTtcbiIsInZhciB3cCAgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0VG9vbHMgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LXRvb2xzLmpzJyk7XG5cbi8qKlxuICogVmVyeSBnZW5lcmljIGZvcm0gdmlldyBoYW5kbGVyLlxuICogVGhpcyBkb2VzIHNvbWUgYmFzaWMgbWFnaWMgYmFzZWQgb24gZGF0YSBhdHRyaWJ1dGVzIHRvIHVwZGF0ZSBzaW1wbGUgdGV4dCBmaWVsZHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gd3AuQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdGNsYXNzTmFtZTogJ21vZHVsZS1lZGl0JyxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblxuXHRcdF8uYmluZEFsbCggdGhpcywgJ3JlbW92ZU1vZGVsJyApO1xuXG5cdFx0dmFyIHRvb2xzID0gbmV3IE1vZHVsZUVkaXRUb29scygge1xuXHRcdFx0bGFiZWw6IHRoaXMubW9kZWwuZ2V0KCAnbGFiZWwnIClcblx0XHR9ICk7XG5cblx0XHR0aGlzLnZpZXdzLmFkZCggJycsIHRvb2xzICk7XG5cblx0XHR0b29scy5vbiggJ21wYjptb2R1bGUtcmVtb3ZlJywgdGhpcy5yZW1vdmVNb2RlbCApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR3cC5CYWNrYm9uZS5WaWV3LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHRoaXMuJGVsLmF0dHIoICdkYXRhLWNpZCcsIHRoaXMubW9kZWwuY2lkICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlbW92ZSBtb2RlbCBoYW5kbGVyLlxuXHQgKi9cblx0cmVtb3ZlTW9kZWw6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMucmVtb3ZlKCk7XG5cdFx0dGhpcy5tb2RlbC5kZXN0cm95KCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlZnJlc2ggdmlldy5cblx0ICogUmVxdWlyZWQgYWZ0ZXIgc29ydC9jb2xsYXBzZSBldGMuXG5cdCAqL1xuXHRyZWZyZXNoOiBmdW5jdGlvbigpIHt9LFxuXG59KTtcbiJdfQ==
