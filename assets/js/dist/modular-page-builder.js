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
		id:             '', // Builder unique ID.
		object_id:      0, // Unique object ID for builder.
		selectDefault:  modularPageBuilderData.l10n.selectDefault,
		addNewButton:   modularPageBuilderData.l10n.addNewButton,
		selection:      [], // Instance of Modules. Can't use a default, otherwise they won't be unique.
		allowedModules: [], // Module names allowed for this builder.
	},

	initialize: function() {

		_.bindAll( this, 'toggleCollapsedState', 'isModuleCollapsed' );

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
	},

	getCollapsedState: function() {

		var state;
		var key      = 'mpb-' + this.get( 'id' ) + '-collapsed-state';
		var objectId = this.get( 'object_id' );

		try {
			state = window.localStorage.getItem( key );
			state = JSON.parse( state );
			state = state ? state : {};
		} catch( e ) {
			state = {};
		}

		// Maybe set the object Id.
		if ( ! ( objectId in state ) ) {
			state[ objectId ] = {};
		}

		return state;

	},

	setCollapsedState: function( state ) {

		var key      = 'mpb-' + this.get( 'id' ) + '-collapsed-state';
		var objectId = this.get( 'object_id' );

		for ( var moduleId in state[ objectId ] ) {
			if ( ! state[ objectId ][ moduleId ] ) {
				delete state[ objectId ][ moduleId ];
			}
		}

		// Clear empty object Ids.
		if ( _.isEmpty( state[ objectId ] ) ) {
			delete state[ objectId ];
		}

		if ( ! _.isEmpty( state ) ) {
			window.localStorage.setItem( key, JSON.stringify( state ) );
		} else {
			window.localStorage.removeItem( key );
		}

	},

	toggleCollapsedState: function( moduleView ) {

		var state = this.getCollapsedState();
		var objectId = this.get( 'object_id' );
		var moduleId  = moduleView.cid;

		// Set the collapsed state.
		if ( ! ( moduleId in state[ objectId ] ) ) {
			state[ objectId ][ moduleId ] = true;
		} else {
			state[ objectId ][ moduleId ] = ! state[ objectId ][ moduleId ];
		}

		this.setCollapsedState( state );

	},

	isModuleCollapsed: function( moduleId ) {

		var state    = this.getCollapsedState();
		var objectId = this.get( 'object_id' );

		return ( moduleId in state[ objectId ] ) && state[ objectId ][ moduleId ];

	},

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
		id:             'modular-page-builder',
		object_id:      parseInt( $( '#post_ID' ).val(), 10 ),
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

		view.collapsed = this.model.isModuleCollapsed( view.cid );
		view.on( 'mpb:module-toggle-collapsed', this.model.toggleCollapsedState );

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
	collapsed: false,

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
		this.$el.toggleClass( 'module-collapsed', this.collapsed );
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
		this.collapsed = ! this.collapsed;
		this.trigger( 'mpb:module-toggle-collapsed', this );
		this.render();
	}

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit-tools.js":24}]},{},[7])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvc3JjL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9nbG9iYWxzLmpzIiwiYXNzZXRzL2pzL3NyYy9tb2RlbHMvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMiLCJhc3NldHMvanMvc3JjL21vZGVscy9tb2R1bGUuanMiLCJhc3NldHMvanMvc3JjL21vZHVsYXItcGFnZS1idWlsZGVyLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9lZGl0LXZpZXdzLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9maWVsZC12aWV3cy5qcyIsImFzc2V0cy9qcy9zcmMvdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2J1aWxkZXIuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1hdHRhY2htZW50LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtY2hlY2tib3guanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1saW5rLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtbnVtYmVyLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtcG9zdC1zZWxlY3QuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1zZWxlY3QuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC10ZXh0LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtdGV4dGFyZWEuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC13eXNpd3lnLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWRlZmF1bHQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWZvcm0tcm93LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC10b29scy5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDM0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMvVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZUF0dHJpYnV0ZSA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMnKTtcblxuLyoqXG4gKiBTaG9ydGNvZGUgQXR0cmlidXRlcyBjb2xsZWN0aW9uLlxuICovXG52YXIgU2hvcnRjb2RlQXR0cmlidXRlcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblxuXHRtb2RlbCA6IE1vZHVsZUF0dHJpYnV0ZSxcblxuXHQvLyBEZWVwIENsb25lLlxuXHRjbG9uZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCBfLm1hcCggdGhpcy5tb2RlbHMsIGZ1bmN0aW9uKG0pIHtcblx0XHRcdHJldHVybiBtLmNsb25lKCk7XG5cdFx0fSkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGpzb24gPSB7fTtcblxuXHRcdHRoaXMuZWFjaCggZnVuY3Rpb24oIG1vZGVsICkge1xuXHRcdFx0anNvblsgbW9kZWwuZ2V0KCAnbmFtZScgKSBdID0gbW9kZWwudG9NaWNyb0pTT04oKTtcblx0XHR9ICk7XG5cblx0XHRyZXR1cm4ganNvbjtcblx0fSxcblxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaG9ydGNvZGVBdHRyaWJ1dGVzO1xuIiwidmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgTW9kdWxlICAgPSByZXF1aXJlKCcuLy4uL21vZGVscy9tb2R1bGUuanMnKTtcblxuLy8gU2hvcnRjb2RlIENvbGxlY3Rpb25cbnZhciBNb2R1bGVzID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXG5cdG1vZGVsIDogTW9kdWxlLFxuXG5cdC8vICBEZWVwIENsb25lLlxuXHRjbG9uZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvciggXy5tYXAoIHRoaXMubW9kZWxzLCBmdW5jdGlvbihtKSB7XG5cdFx0XHRyZXR1cm4gbS5jbG9uZSgpO1xuXHRcdH0pKTtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIG9ubHkgdGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBzYXZlZC5cblx0ICpcblx0ICogQHJldHVybiBvYmplY3Rcblx0ICovXG5cdHRvTWljcm9KU09OOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoIGZ1bmN0aW9uKG1vZGVsKSB7IHJldHVybiBtb2RlbC50b01pY3JvSlNPTiggb3B0aW9ucyApOyB9ICk7XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZXM7XG4iLCIvLyBFeHBvc2Ugc29tZSBmdW5jdGlvbmFsaXR5IGdsb2JhbGx5LlxudmFyIGdsb2JhbHMgPSB7XG5cdEJ1aWxkZXI6ICAgICAgIHJlcXVpcmUoJy4vbW9kZWxzL2J1aWxkZXIuanMnKSxcblx0TW9kdWxlRmFjdG9yeTogcmVxdWlyZSgnLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpLFxuXHRlZGl0Vmlld3M6ICAgICByZXF1aXJlKCcuL3V0aWxzL2VkaXQtdmlld3MuanMnKSxcblx0ZmllbGRWaWV3czogICAgcmVxdWlyZSgnLi91dGlscy9maWVsZC12aWV3cy5qcycpLFxuXHR2aWV3czoge1xuXHRcdEJ1aWxkZXJWaWV3OiAgICAgcmVxdWlyZSgnLi92aWV3cy9idWlsZGVyLmpzJyksXG5cdFx0TW9kdWxlRWRpdDogICAgICByZXF1aXJlKCcuL3ZpZXdzL21vZHVsZS1lZGl0LmpzJyksXG5cdFx0TW9kdWxlRWRpdERlZmF1bHQ6IHJlcXVpcmUoJy4vdmlld3MvbW9kdWxlLWVkaXQtZGVmYXVsdC5qcycpLFxuXHRcdEZpZWxkOiAgICAgICAgICAgcmVxdWlyZSgnLi92aWV3cy9maWVsZHMvZmllbGQuanMnKSxcblx0XHRGaWVsZExpbms6ICAgICAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLWxpbmsuanMnKSxcblx0XHRGaWVsZEF0dGFjaG1lbnQ6IHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLWF0dGFjaG1lbnQuanMnKSxcblx0XHRGaWVsZFRleHQ6ICAgICAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLXRleHQuanMnKSxcblx0XHRGaWVsZFRleHRhcmVhOiAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLXRleHRhcmVhLmpzJyksXG5cdFx0RmllbGRXeXNpd3lnOiAgICByZXF1aXJlKCcuL3ZpZXdzL2ZpZWxkcy9maWVsZC13eXNpd3lnLmpzJyksXG5cdFx0RmllbGRQb3N0U2VsZWN0OiByZXF1aXJlKCcuL3ZpZXdzL2ZpZWxkcy9maWVsZC1wb3N0LXNlbGVjdC5qcycpLFxuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdsb2JhbHM7XG4iLCJ2YXIgQmFja2JvbmUgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZXMgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2NvbGxlY3Rpb25zL21vZHVsZXMuanMnKTtcbnZhciBNb2R1bGVGYWN0b3J5ICAgID0gcmVxdWlyZSgnLi8uLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpO1xuXG52YXIgQnVpbGRlciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRpZDogICAgICAgICAgICAgJycsIC8vIEJ1aWxkZXIgdW5pcXVlIElELlxuXHRcdG9iamVjdF9pZDogICAgICAwLCAvLyBVbmlxdWUgb2JqZWN0IElEIGZvciBidWlsZGVyLlxuXHRcdHNlbGVjdERlZmF1bHQ6ICBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhLmwxMG4uc2VsZWN0RGVmYXVsdCxcblx0XHRhZGROZXdCdXR0b246ICAgbW9kdWxhclBhZ2VCdWlsZGVyRGF0YS5sMTBuLmFkZE5ld0J1dHRvbixcblx0XHRzZWxlY3Rpb246ICAgICAgW10sIC8vIEluc3RhbmNlIG9mIE1vZHVsZXMuIENhbid0IHVzZSBhIGRlZmF1bHQsIG90aGVyd2lzZSB0aGV5IHdvbid0IGJlIHVuaXF1ZS5cblx0XHRhbGxvd2VkTW9kdWxlczogW10sIC8vIE1vZHVsZSBuYW1lcyBhbGxvd2VkIGZvciB0aGlzIGJ1aWxkZXIuXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cblx0XHRfLmJpbmRBbGwoIHRoaXMsICd0b2dnbGVDb2xsYXBzZWRTdGF0ZScsICdpc01vZHVsZUNvbGxhcHNlZCcgKTtcblxuXHRcdC8vIFNldCBkZWZhdWx0IHNlbGVjdGlvbiB0byBlbnN1cmUgaXQgaXNuJ3QgYSByZWZlcmVuY2UuXG5cdFx0aWYgKCAhICggdGhpcy5nZXQoJ3NlbGVjdGlvbicpIGluc3RhbmNlb2YgTW9kdWxlcyApICkge1xuXHRcdFx0dGhpcy5zZXQoICdzZWxlY3Rpb24nLCBuZXcgTW9kdWxlcygpICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0c2V0RGF0YTogZnVuY3Rpb24oIGRhdGEgKSB7XG5cblx0XHR2YXIgc2VsZWN0aW9uO1xuXG5cdFx0aWYgKCAnJyA9PT0gZGF0YSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBIYW5kbGUgZWl0aGVyIEpTT04gc3RyaW5nIG9yIHByb3BlciBvYmhlY3QuXG5cdFx0ZGF0YSA9ICggJ3N0cmluZycgPT09IHR5cGVvZiBkYXRhICkgPyBKU09OLnBhcnNlKCBkYXRhICkgOiBkYXRhO1xuXG5cdFx0Ly8gQ29udmVydCBzYXZlZCBkYXRhIHRvIE1vZHVsZSBtb2RlbHMuXG5cdFx0aWYgKCBkYXRhICYmIEFycmF5LmlzQXJyYXkoIGRhdGEgKSApIHtcblx0XHRcdHNlbGVjdGlvbiA9IGRhdGEubWFwKCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0XHRyZXR1cm4gTW9kdWxlRmFjdG9yeS5jcmVhdGUoIG1vZHVsZS5uYW1lLCBtb2R1bGUuYXR0ciApO1xuXHRcdFx0fSApO1xuXHRcdH1cblxuXHRcdC8vIFJlc2V0IHNlbGVjdGlvbiB1c2luZyBkYXRhIGZyb20gaGlkZGVuIGlucHV0LlxuXHRcdGlmICggc2VsZWN0aW9uICYmIHNlbGVjdGlvbi5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLmdldCgnc2VsZWN0aW9uJykuYWRkKCBzZWxlY3Rpb24gKTtcblx0XHR9XG5cblx0fSxcblxuXHRzYXZlRGF0YTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZGF0YSA9IFtdO1xuXG5cdFx0dGhpcy5nZXQoJ3NlbGVjdGlvbicpLmVhY2goIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cblx0XHRcdC8vIFNraXAgZW1wdHkvYnJva2VuIG1vZHVsZXMuXG5cdFx0XHRpZiAoICEgbW9kdWxlLmdldCgnbmFtZScgKSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRkYXRhLnB1c2goIG1vZHVsZS50b01pY3JvSlNPTigpICk7XG5cblx0XHR9ICk7XG5cblx0XHR0aGlzLnRyaWdnZXIoICdzYXZlJywgZGF0YSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIExpc3QgYWxsIGF2YWlsYWJsZSBtb2R1bGVzIGZvciB0aGlzIGJ1aWxkZXIuXG5cdCAqIEFsbCBtb2R1bGVzLCBmaWx0ZXJlZCBieSB0aGlzLmFsbG93ZWRNb2R1bGVzLlxuXHQgKi9cblx0Z2V0QXZhaWxhYmxlTW9kdWxlczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIF8uZmlsdGVyKCBNb2R1bGVGYWN0b3J5LmF2YWlsYWJsZU1vZHVsZXMsIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5pc01vZHVsZUFsbG93ZWQoIG1vZHVsZS5uYW1lICk7XG5cdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0fSxcblxuXHRpc01vZHVsZUFsbG93ZWQ6IGZ1bmN0aW9uKCBtb2R1bGVOYW1lICkge1xuXHRcdHJldHVybiB0aGlzLmdldCgnYWxsb3dlZE1vZHVsZXMnKS5pbmRleE9mKCBtb2R1bGVOYW1lICkgPj0gMDtcblx0fSxcblxuXHRnZXRDb2xsYXBzZWRTdGF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgc3RhdGU7XG5cdFx0dmFyIGtleSAgICAgID0gJ21wYi0nICsgdGhpcy5nZXQoICdpZCcgKSArICctY29sbGFwc2VkLXN0YXRlJztcblx0XHR2YXIgb2JqZWN0SWQgPSB0aGlzLmdldCggJ29iamVjdF9pZCcgKTtcblxuXHRcdHRyeSB7XG5cdFx0XHRzdGF0ZSA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgga2V5ICk7XG5cdFx0XHRzdGF0ZSA9IEpTT04ucGFyc2UoIHN0YXRlICk7XG5cdFx0XHRzdGF0ZSA9IHN0YXRlID8gc3RhdGUgOiB7fTtcblx0XHR9IGNhdGNoKCBlICkge1xuXHRcdFx0c3RhdGUgPSB7fTtcblx0XHR9XG5cblx0XHQvLyBNYXliZSBzZXQgdGhlIG9iamVjdCBJZC5cblx0XHRpZiAoICEgKCBvYmplY3RJZCBpbiBzdGF0ZSApICkge1xuXHRcdFx0c3RhdGVbIG9iamVjdElkIF0gPSB7fTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc3RhdGU7XG5cblx0fSxcblxuXHRzZXRDb2xsYXBzZWRTdGF0ZTogZnVuY3Rpb24oIHN0YXRlICkge1xuXG5cdFx0dmFyIGtleSAgICAgID0gJ21wYi0nICsgdGhpcy5nZXQoICdpZCcgKSArICctY29sbGFwc2VkLXN0YXRlJztcblx0XHR2YXIgb2JqZWN0SWQgPSB0aGlzLmdldCggJ29iamVjdF9pZCcgKTtcblxuXHRcdGZvciAoIHZhciBtb2R1bGVJZCBpbiBzdGF0ZVsgb2JqZWN0SWQgXSApIHtcblx0XHRcdGlmICggISBzdGF0ZVsgb2JqZWN0SWQgXVsgbW9kdWxlSWQgXSApIHtcblx0XHRcdFx0ZGVsZXRlIHN0YXRlWyBvYmplY3RJZCBdWyBtb2R1bGVJZCBdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIENsZWFyIGVtcHR5IG9iamVjdCBJZHMuXG5cdFx0aWYgKCBfLmlzRW1wdHkoIHN0YXRlWyBvYmplY3RJZCBdICkgKSB7XG5cdFx0XHRkZWxldGUgc3RhdGVbIG9iamVjdElkIF07XG5cdFx0fVxuXG5cdFx0aWYgKCAhIF8uaXNFbXB0eSggc3RhdGUgKSApIHtcblx0XHRcdHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgga2V5LCBKU09OLnN0cmluZ2lmeSggc3RhdGUgKSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oIGtleSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdHRvZ2dsZUNvbGxhcHNlZFN0YXRlOiBmdW5jdGlvbiggbW9kdWxlVmlldyApIHtcblxuXHRcdHZhciBzdGF0ZSA9IHRoaXMuZ2V0Q29sbGFwc2VkU3RhdGUoKTtcblx0XHR2YXIgb2JqZWN0SWQgPSB0aGlzLmdldCggJ29iamVjdF9pZCcgKTtcblx0XHR2YXIgbW9kdWxlSWQgID0gbW9kdWxlVmlldy5jaWQ7XG5cblx0XHQvLyBTZXQgdGhlIGNvbGxhcHNlZCBzdGF0ZS5cblx0XHRpZiAoICEgKCBtb2R1bGVJZCBpbiBzdGF0ZVsgb2JqZWN0SWQgXSApICkge1xuXHRcdFx0c3RhdGVbIG9iamVjdElkIF1bIG1vZHVsZUlkIF0gPSB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdGF0ZVsgb2JqZWN0SWQgXVsgbW9kdWxlSWQgXSA9ICEgc3RhdGVbIG9iamVjdElkIF1bIG1vZHVsZUlkIF07XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRDb2xsYXBzZWRTdGF0ZSggc3RhdGUgKTtcblxuXHR9LFxuXG5cdGlzTW9kdWxlQ29sbGFwc2VkOiBmdW5jdGlvbiggbW9kdWxlSWQgKSB7XG5cblx0XHR2YXIgc3RhdGUgICAgPSB0aGlzLmdldENvbGxhcHNlZFN0YXRlKCk7XG5cdFx0dmFyIG9iamVjdElkID0gdGhpcy5nZXQoICdvYmplY3RfaWQnICk7XG5cblx0XHRyZXR1cm4gKCBtb2R1bGVJZCBpbiBzdGF0ZVsgb2JqZWN0SWQgXSApICYmIHN0YXRlWyBvYmplY3RJZCBdWyBtb2R1bGVJZCBdO1xuXG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1aWxkZXI7XG4iLCJ2YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcblxudmFyIE1vZHVsZUF0dHJpYnV0ZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRuYW1lOiAgICAgICAgICcnLFxuXHRcdGxhYmVsOiAgICAgICAgJycsXG5cdFx0dmFsdWU6ICAgICAgICAnJyxcblx0XHR0eXBlOiAgICAgICAgICd0ZXh0Jyxcblx0XHRkZXNjcmlwdGlvbjogICcnLFxuXHRcdGRlZmF1bHRWYWx1ZTogJycsXG5cdFx0Y29uZmlnOiAgICAgICB7fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHIgPSB7fTtcblx0XHR2YXIgYWxsb3dlZEF0dHJQcm9wZXJ0aWVzID0gWyAnbmFtZScsICd2YWx1ZScsICd0eXBlJyBdO1xuXG5cdFx0Xy5lYWNoKCBhbGxvd2VkQXR0clByb3BlcnRpZXMsIGZ1bmN0aW9uKCBwcm9wICkge1xuXHRcdFx0clsgcHJvcCBdID0gdGhpcy5nZXQoIHByb3AgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHJldHVybiByO1xuXG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlQXR0cmlidXRlO1xuIiwidmFyIEJhY2tib25lICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGVBdHRzID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGUtYXR0cmlidXRlcy5qcycpO1xuXG52YXIgTW9kdWxlID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuXHRkZWZhdWx0czoge1xuXHRcdG5hbWU6ICAnJyxcblx0XHRsYWJlbDogJycsXG5cdFx0YXR0cjogIFtdLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gU2V0IGRlZmF1bHQgc2VsZWN0aW9uIHRvIGVuc3VyZSBpdCBpc24ndCBhIHJlZmVyZW5jZS5cblx0XHRpZiAoICEgKCB0aGlzLmdldCgnYXR0cicpIGluc3RhbmNlb2YgTW9kdWxlQXR0cyApICkge1xuXHRcdFx0dGhpcy5zZXQoICdhdHRyJywgbmV3IE1vZHVsZUF0dHMoKSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgZm9yIGdldHRpbmcgYW4gYXR0cmlidXRlIG1vZGVsIGJ5IG5hbWUuXG5cdCAqL1xuXHRnZXRBdHRyOiBmdW5jdGlvbiggYXR0ck5hbWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCdhdHRyJykuZmluZFdoZXJlKCB7IG5hbWU6IGF0dHJOYW1lIH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgZm9yIHNldHRpbmcgYW4gYXR0cmlidXRlIHZhbHVlXG5cdCAqXG5cdCAqIE5vdGUgbWFudWFsIGNoYW5nZSBldmVudCB0cmlnZ2VyIHRvIGVuc3VyZSBldmVyeXRoaW5nIGlzIHVwZGF0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzdHJpbmcgYXR0cmlidXRlXG5cdCAqIEBwYXJhbSBtaXhlZCAgdmFsdWVcblx0ICovXG5cdHNldEF0dHJWYWx1ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZSwgdmFsdWUgKSB7XG5cblx0XHR2YXIgYXR0ciA9IHRoaXMuZ2V0QXR0ciggYXR0cmlidXRlICk7XG5cblx0XHRpZiAoIGF0dHIgKSB7XG5cdFx0XHRhdHRyLnNldCggJ3ZhbHVlJywgdmFsdWUgKTtcblx0XHRcdHRoaXMudHJpZ2dlciggJ2NoYW5nZScsIHRoaXMgKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogSGVscGVyIGZvciBnZXR0aW5nIGFuIGF0dHJpYnV0ZSB2YWx1ZS5cblx0ICpcblx0ICogRGVmYXVsdHMgdG8gbnVsbC5cblx0ICpcblx0ICogQHBhcmFtIHN0cmluZyBhdHRyaWJ1dGVcblx0ICovXG5cdGdldEF0dHJWYWx1ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZSApIHtcblxuXHRcdHZhciBhdHRyID0gdGhpcy5nZXRBdHRyKCBhdHRyaWJ1dGUgKTtcblxuXHRcdGlmICggYXR0ciApIHtcblx0XHRcdHJldHVybiBhdHRyLmdldCggJ3ZhbHVlJyApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBDdXN0b20gUGFyc2UuXG5cdCAqIEVuc3VyZXMgYXR0cmlidXRlcyBpcyBhbiBpbnN0YW5jZSBvZiBNb2R1bGVBdHRzXG5cdCAqL1xuXHRwYXJzZTogZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXG5cdFx0aWYgKCAnYXR0cicgaW4gcmVzcG9uc2UgJiYgISAoIHJlc3BvbnNlLmF0dHIgaW5zdGFuY2VvZiBNb2R1bGVBdHRzICkgKSB7XG5cdFx0XHRyZXNwb25zZS5hdHRyID0gbmV3IE1vZHVsZUF0dHMoIHJlc3BvbnNlLmF0dHIgKTtcblx0XHR9XG5cblx0ICAgIHJldHVybiByZXNwb25zZTtcblxuXHR9LFxuXG5cdHRvSlNPTjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIganNvbiA9IF8uY2xvbmUoIHRoaXMuYXR0cmlidXRlcyApO1xuXG5cdFx0aWYgKCAnYXR0cicgaW4ganNvbiAmJiAoIGpzb24uYXR0ciBpbnN0YW5jZW9mIE1vZHVsZUF0dHMgKSApIHtcblx0XHRcdGpzb24uYXR0ciA9IGpzb24uYXR0ci50b0pTT04oKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ganNvbjtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRuYW1lOiB0aGlzLmdldCgnbmFtZScpLFxuXHRcdFx0YXR0cjogdGhpcy5nZXQoJ2F0dHInKS50b01pY3JvSlNPTigpXG5cdFx0fTtcblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlO1xuIiwidmFyICQgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEJ1aWxkZXIgICAgICAgPSByZXF1aXJlKCcuL21vZGVscy9idWlsZGVyLmpzJyk7XG52YXIgQnVpbGRlclZpZXcgICA9IHJlcXVpcmUoJy4vdmlld3MvYnVpbGRlci5qcycpO1xudmFyIE1vZHVsZUZhY3RvcnkgPSByZXF1aXJlKCcuL3V0aWxzL21vZHVsZS1mYWN0b3J5LmpzJyk7XG5cbi8vIEV4cG9zZSBzb21lIGZ1bmN0aW9uYWxpdHkgdG8gZ2xvYmFsIG5hbWVzcGFjZS5cbndpbmRvdy5tb2R1bGFyUGFnZUJ1aWxkZXIgPSByZXF1aXJlKCcuL2dsb2JhbHMnKTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuXHRNb2R1bGVGYWN0b3J5LmluaXQoKTtcblxuXHQvLyBBIGZpZWxkIGZvciBzdG9yaW5nIHRoZSBidWlsZGVyIGRhdGEuXG5cdHZhciAkZmllbGQgPSAkKCAnW25hbWU9bW9kdWxhci1wYWdlLWJ1aWxkZXItZGF0YV0nICk7XG5cblx0aWYgKCAhICRmaWVsZC5sZW5ndGggKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gQSBjb250YWluZXIgZWxlbWVudCBmb3IgZGlzcGxheWluZyB0aGUgYnVpbGRlci5cblx0dmFyICRjb250YWluZXIgPSAkKCAnI21vZHVsYXItcGFnZS1idWlsZGVyJyApO1xuXG5cdC8vIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBCdWlsZGVyIG1vZGVsLlxuXHQvLyBQYXNzIGFuIGFycmF5IG9mIG1vZHVsZSBuYW1lcyB0aGF0IGFyZSBhbGxvd2VkIGZvciB0aGlzIGJ1aWxkZXIuXG5cdHZhciBidWlsZGVyID0gbmV3IEJ1aWxkZXIoe1xuXHRcdGlkOiAgICAgICAgICAgICAnbW9kdWxhci1wYWdlLWJ1aWxkZXInLFxuXHRcdG9iamVjdF9pZDogICAgICBwYXJzZUludCggJCggJyNwb3N0X0lEJyApLnZhbCgpLCAxMCApLFxuXHRcdGFsbG93ZWRNb2R1bGVzOiAkKCAnW25hbWU9bW9kdWxhci1wYWdlLWJ1aWxkZXItYWxsb3dlZC1tb2R1bGVzXScgKS52YWwoKS5zcGxpdCgnLCcpXG5cdH0pO1xuXG5cdC8vIFNldCB0aGUgZGF0YSB1c2luZyB0aGUgY3VycmVudCBmaWVsZCB2YWx1ZVxuXHRidWlsZGVyLnNldERhdGEoIEpTT04ucGFyc2UoICRmaWVsZC52YWwoKSApICk7XG5cblx0Ly8gT24gc2F2ZSwgdXBkYXRlIHRoZSBmaWVsZCB2YWx1ZS5cblx0YnVpbGRlci5vbiggJ3NhdmUnLCBmdW5jdGlvbiggZGF0YSApIHtcblx0XHQkZmllbGQudmFsKCBKU09OLnN0cmluZ2lmeSggZGF0YSApICk7XG5cdH0gKTtcblxuXHQvLyBDcmVhdGUgYnVpbGRlciB2aWV3LlxuXHR2YXIgYnVpbGRlclZpZXcgPSBuZXcgQnVpbGRlclZpZXcoIHsgbW9kZWw6IGJ1aWxkZXIgfSApO1xuXG5cdC8vIFJlbmRlciBidWlsZGVyLlxuXHRidWlsZGVyVmlldy5yZW5kZXIoKS4kZWwuYXBwZW5kVG8oICRjb250YWluZXIgKTtcblxufSk7XG4iLCJ2YXIgTW9kdWxlRWRpdERlZmF1bHQgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LWRlZmF1bHQuanMnKTtcblxuLyoqXG4gKiBNYXAgbW9kdWxlIHR5cGUgdG8gdmlld3MuXG4gKi9cbnZhciBlZGl0Vmlld3MgPSB7XG5cdCdkZWZhdWx0JzogTW9kdWxlRWRpdERlZmF1bHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZWRpdFZpZXdzO1xuIiwidmFyIEZpZWxkVGV4dCAgICAgICA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLXRleHQuanMnKTtcbnZhciBGaWVsZFRleHRhcmVhICAgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL2ZpZWxkcy9maWVsZC10ZXh0YXJlYS5qcycpO1xudmFyIEZpZWxkV1lTSVdZRyAgICA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLXd5c2l3eWcuanMnKTtcbnZhciBGaWVsZEF0dGFjaG1lbnQgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL2ZpZWxkcy9maWVsZC1hdHRhY2htZW50LmpzJyk7XG52YXIgRmllbGRMaW5rICAgICAgID0gcmVxdWlyZSgnLi8uLi92aWV3cy9maWVsZHMvZmllbGQtbGluay5qcycpO1xudmFyIEZpZWxkTnVtYmVyICAgICA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLW51bWJlci5qcycpO1xudmFyIEZpZWxkQ2hlY2tib3ggICA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLWNoZWNrYm94LmpzJyk7XG52YXIgRmllbGRTZWxlY3QgICAgID0gcmVxdWlyZSgnLi8uLi92aWV3cy9maWVsZHMvZmllbGQtc2VsZWN0LmpzJyk7XG52YXIgRmllbGRQb3N0U2VsZWN0ID0gcmVxdWlyZSgnLi8uLi92aWV3cy9maWVsZHMvZmllbGQtcG9zdC1zZWxlY3QuanMnKTtcblxudmFyIGZpZWxkVmlld3MgPSB7XG5cdHRleHQ6ICAgICAgICBGaWVsZFRleHQsXG5cdHRleHRhcmVhOiAgICBGaWVsZFRleHRhcmVhLFxuXHRodG1sOiAgICAgICAgRmllbGRXWVNJV1lHLFxuXHRudW1iZXI6ICAgICAgRmllbGROdW1iZXIsXG5cdGF0dGFjaG1lbnQ6ICBGaWVsZEF0dGFjaG1lbnQsXG5cdGxpbms6ICAgICAgICBGaWVsZExpbmssXG5cdGNoZWNrYm94OiAgICBGaWVsZENoZWNrYm94LFxuXHRzZWxlY3Q6ICAgICAgRmllbGRTZWxlY3QsXG5cdHBvc3Rfc2VsZWN0OiBGaWVsZFBvc3RTZWxlY3QsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZpZWxkVmlld3M7XG4iLCJ2YXIgTW9kdWxlICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL21vZHVsZS5qcycpO1xudmFyIE1vZHVsZUF0dHMgICAgICAgPSByZXF1aXJlKCcuLy4uL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzJyk7XG52YXIgZWRpdFZpZXdzICAgICAgICA9IHJlcXVpcmUoJy4vZWRpdC12aWV3cy5qcycpO1xudmFyICQgICAgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG52YXIgTW9kdWxlRmFjdG9yeSA9IHtcblxuXHRhdmFpbGFibGVNb2R1bGVzOiBbXSxcblxuXHRpbml0OiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEgJiYgJ2F2YWlsYWJsZV9tb2R1bGVzJyBpbiBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhICkge1xuXHRcdFx0Xy5lYWNoKCBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhLmF2YWlsYWJsZV9tb2R1bGVzLCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0XHR0aGlzLnJlZ2lzdGVyTW9kdWxlKCBtb2R1bGUgKTtcblx0XHRcdH0uYmluZCggdGhpcyApICk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlZ2lzdGVyTW9kdWxlOiBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdHRoaXMuYXZhaWxhYmxlTW9kdWxlcy5wdXNoKCBtb2R1bGUgKTtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIE1vZHVsZSBNb2RlbC5cblx0ICogVXNlIGRhdGEgZnJvbSBjb25maWcsIHBsdXMgc2F2ZWQgZGF0YS5cblx0ICpcblx0ICogQHBhcmFtICBzdHJpbmcgbW9kdWxlTmFtZVxuXHQgKiBAcGFyYW0gIG9iamVjdCBhdHRyaWJ1dGUgSlNPTi4gU2F2ZWQgYXR0cmlidXRlIHZhbHVlcy5cblx0ICogQHJldHVybiBNb2R1bGVcblx0ICovXG5cdGNyZWF0ZTogZnVuY3Rpb24oIG1vZHVsZU5hbWUsIGF0dHJEYXRhICkge1xuXG5cdFx0dmFyIGRhdGEgPSAkLmV4dGVuZCggdHJ1ZSwge30sIF8uZmluZFdoZXJlKCB0aGlzLmF2YWlsYWJsZU1vZHVsZXMsIHsgbmFtZTogbW9kdWxlTmFtZSB9ICkgKTtcblxuXHRcdGlmICggISBkYXRhICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cblx0XHR2YXIgYXR0cmlidXRlcyA9IG5ldyBNb2R1bGVBdHRzKCk7XG5cblx0XHQvKipcblx0XHQgKiBBZGQgYWxsIHRoZSBtb2R1bGUgYXR0cmlidXRlcy5cblx0XHQgKiBXaGl0ZWxpc3RlZCB0byBhdHRyaWJ1dGVzIGRvY3VtZW50ZWQgaW4gc2NoZW1hXG5cdFx0ICogU2V0cyBvbmx5IHZhbHVlIGZyb20gYXR0ckRhdGEuXG5cdFx0ICovXG5cdFx0Xy5lYWNoKCBkYXRhLmF0dHIsIGZ1bmN0aW9uKCBhdHRyICkge1xuXG5cdFx0XHR2YXIgY2xvbmVBdHRyID0gJC5leHRlbmQoIHRydWUsIHt9LCBhdHRyICApO1xuXHRcdFx0dmFyIHNhdmVkQXR0ciA9IF8uZmluZFdoZXJlKCBhdHRyRGF0YSwgeyBuYW1lOiBhdHRyLm5hbWUgfSApO1xuXG5cdFx0XHQvLyBBZGQgc2F2ZWQgYXR0cmlidXRlIHZhbHVlcy5cblx0XHRcdGlmICggc2F2ZWRBdHRyICYmICd2YWx1ZScgaW4gc2F2ZWRBdHRyICkge1xuXHRcdFx0XHRjbG9uZUF0dHIudmFsdWUgPSBzYXZlZEF0dHIudmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdGF0dHJpYnV0ZXMuYWRkKCBjbG9uZUF0dHIgKTtcblxuXHRcdH0gKTtcblxuXHRcdGRhdGEuYXR0ciA9IGF0dHJpYnV0ZXM7XG5cblx0ICAgIHJldHVybiBuZXcgTW9kdWxlKCBkYXRhICk7XG5cblx0fSxcblxuXHRjcmVhdGVFZGl0VmlldzogZnVuY3Rpb24oIG1vZGVsICkge1xuXG5cdFx0dmFyIGVkaXRWaWV3LCBtb2R1bGVOYW1lO1xuXG5cdFx0bW9kdWxlTmFtZSA9IG1vZGVsLmdldCgnbmFtZScpO1xuXHRcdGVkaXRWaWV3ICAgPSAoIG5hbWUgaW4gZWRpdFZpZXdzICkgPyBlZGl0Vmlld3NbIG1vZHVsZU5hbWUgXSA6IGVkaXRWaWV3c1snZGVmYXVsdCddO1xuXG5cdFx0cmV0dXJuIG5ldyBlZGl0VmlldyggeyBtb2RlbDogbW9kZWwgfSApO1xuXG5cdH0sXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlRmFjdG9yeTtcbiIsInZhciB3cCAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddIDogbnVsbCk7XG52YXIgTW9kdWxlRmFjdG9yeSA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMnKTtcbnZhciAkICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSB3cC5CYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLWJ1aWxkZXInICksXG5cdGNsYXNzTmFtZTogJ21vZHVsYXItcGFnZS1idWlsZGVyJyxcblx0bW9kZWw6IG51bGwsXG5cdG5ld01vZHVsZU5hbWU6IG51bGwsXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NoYW5nZSA+IC5hZGQtbmV3IC5hZGQtbmV3LW1vZHVsZS1zZWxlY3QnOiAndG9nZ2xlQnV0dG9uU3RhdHVzJyxcblx0XHQnY2xpY2sgPiAuYWRkLW5ldyAuYWRkLW5ldy1tb2R1bGUtYnV0dG9uJzogJ2FkZE1vZHVsZScsXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpO1xuXG5cdFx0c2VsZWN0aW9uLm9uKCAnYWRkJywgdGhpcy5hZGROZXdTZWxlY3Rpb25JdGVtVmlldywgdGhpcyApO1xuXHRcdHNlbGVjdGlvbi5vbiggJ2FsbCcsIHRoaXMubW9kZWwuc2F2ZURhdGEsIHRoaXMubW9kZWwgKTtcblxuXHRcdHRoaXMubW9kZWwuZ2V0KCdzZWxlY3Rpb24nKS5lYWNoKCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0dGhpcy5hZGROZXdTZWxlY3Rpb25JdGVtVmlldyggbW9kdWxlICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHR0aGlzLm9uKCAnbXBiOnJlbmRlcmVkJywgdGhpcy5yZW5kZXJlZCApO1xuXG5cdH0sXG5cblx0cHJlcGFyZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm1vZGVsLnRvSlNPTigpO1xuXHRcdG9wdGlvbnMuZGVmYXVsdExhYmVsICAgICA9IG1vZHVsYXJQYWdlQnVpbGRlckRhdGEubDEwbi5zZWxlY3REZWZhdWx0O1xuXHRcdG9wdGlvbnMuYXZhaWxhYmxlTW9kdWxlcyA9IHRoaXMubW9kZWwuZ2V0QXZhaWxhYmxlTW9kdWxlcygpO1xuXHRcdHJldHVybiBvcHRpb25zO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0d3AuQmFja2JvbmUuVmlldy5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHR0aGlzLnRyaWdnZXIoICdtcGI6cmVuZGVyZWQnICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0cmVuZGVyZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuaW5pdFNvcnRhYmxlKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgU29ydGFibGUuXG5cdCAqL1xuXHRpbml0U29ydGFibGU6IGZ1bmN0aW9uKCkge1xuXHRcdCQoICc+IC5zZWxlY3Rpb24nLCB0aGlzLiRlbCApLnNvcnRhYmxlKHtcblx0XHRcdGhhbmRsZTogJy5tb2R1bGUtZWRpdC10b29scycsXG5cdFx0XHRpdGVtczogICc+IC5tb2R1bGUtZWRpdCcsXG5cdFx0XHRzdG9wOiAgIGZ1bmN0aW9uKCBlLCB1aSApIHtcblx0XHRcdFx0dGhpcy51cGRhdGVTZWxlY3Rpb25PcmRlciggdWkgKTtcblx0XHRcdFx0dGhpcy50cmlnZ2VyU29ydFN0b3AoIHVpLml0ZW0uYXR0ciggJ2RhdGEtY2lkJykgKTtcblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNvcnRhYmxlIGVuZCBjYWxsYmFjay5cblx0ICogQWZ0ZXIgcmVvcmRlcmluZywgdXBkYXRlIHRoZSBzZWxlY3Rpb24gb3JkZXIuXG5cdCAqIE5vdGUgLSB1c2VzIGRpcmVjdCBtYW5pcHVsYXRpb24gb2YgY29sbGVjdGlvbiBtb2RlbHMgcHJvcGVydHkuXG5cdCAqIFRoaXMgaXMgdG8gYXZvaWQgaGF2aW5nIHRvIG1lc3MgYWJvdXQgd2l0aCB0aGUgdmlld3MgdGhlbXNlbHZlcy5cblx0ICovXG5cdHVwZGF0ZVNlbGVjdGlvbk9yZGVyOiBmdW5jdGlvbiggdWkgKSB7XG5cblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpO1xuXHRcdHZhciBpdGVtICAgICAgPSBzZWxlY3Rpb24uZ2V0KHsgY2lkOiB1aS5pdGVtLmF0dHIoICdkYXRhLWNpZCcpIH0pO1xuXHRcdHZhciBuZXdJbmRleCAgPSB1aS5pdGVtLmluZGV4KCk7XG5cdFx0dmFyIG9sZEluZGV4ICA9IHNlbGVjdGlvbi5pbmRleE9mKCBpdGVtICk7XG5cblx0XHRpZiAoIG5ld0luZGV4ICE9PSBvbGRJbmRleCApIHtcblx0XHRcdHZhciBkcm9wcGVkID0gc2VsZWN0aW9uLm1vZGVscy5zcGxpY2UoIG9sZEluZGV4LCAxICk7XG5cdFx0XHRzZWxlY3Rpb24ubW9kZWxzLnNwbGljZSggbmV3SW5kZXgsIDAsIGRyb3BwZWRbMF0gKTtcblx0XHRcdHRoaXMubW9kZWwuc2F2ZURhdGEoKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogVHJpZ2dlciBzb3J0IHN0b3Agb24gc3ViVmlldyAoYnkgbW9kZWwgQ0lEKS5cblx0ICovXG5cdHRyaWdnZXJTb3J0U3RvcDogZnVuY3Rpb24oIGNpZCApIHtcblxuXHRcdHZhciB2aWV3cyA9IHRoaXMudmlld3MuZ2V0KCAnPiAuc2VsZWN0aW9uJyApO1xuXG5cdFx0aWYgKCB2aWV3cyAmJiB2aWV3cy5sZW5ndGggKSB7XG5cblx0XHRcdHZhciB2aWV3ID0gXy5maW5kKCB2aWV3cywgZnVuY3Rpb24oIHZpZXcgKSB7XG5cdFx0XHRcdHJldHVybiBjaWQgPT09IHZpZXcubW9kZWwuY2lkO1xuXHRcdFx0fSApO1xuXG5cdFx0XHRpZiAoIHZpZXcgJiYgKCAncmVmcmVzaCcgaW4gdmlldyApICkge1xuXHRcdFx0XHR2aWV3LnJlZnJlc2goKTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBUb2dnbGUgYnV0dG9uIHN0YXR1cy5cblx0ICogRW5hYmxlL0Rpc2FibGUgYnV0dG9uIGRlcGVuZGluZyBvbiB3aGV0aGVyXG5cdCAqIHBsYWNlaG9sZGVyIG9yIHZhbGlkIG1vZHVsZSBpcyBzZWxlY3RlZC5cblx0ICovXG5cdHRvZ2dsZUJ1dHRvblN0YXR1czogZnVuY3Rpb24oZSkge1xuXHRcdHZhciB2YWx1ZSAgICAgICAgID0gJChlLnRhcmdldCkudmFsKCk7XG5cdFx0dmFyIGRlZmF1bHRPcHRpb24gPSAkKGUudGFyZ2V0KS5jaGlsZHJlbigpLmZpcnN0KCkuYXR0cigndmFsdWUnKTtcblx0XHQkKCcuYWRkLW5ldy1tb2R1bGUtYnV0dG9uJywgdGhpcy4kZWwgKS5hdHRyKCAnZGlzYWJsZWQnLCB2YWx1ZSA9PT0gZGVmYXVsdE9wdGlvbiApO1xuXHRcdHRoaXMubmV3TW9kdWxlTmFtZSA9ICggdmFsdWUgIT09IGRlZmF1bHRPcHRpb24gKSA/IHZhbHVlIDogbnVsbDtcblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlIGFkZGluZyBtb2R1bGUuXG5cdCAqXG5cdCAqIEZpbmQgbW9kdWxlIG1vZGVsLiBDbG9uZSBpdC4gQWRkIHRvIHNlbGVjdGlvbi5cblx0ICovXG5cdGFkZE1vZHVsZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0aWYgKCB0aGlzLm5ld01vZHVsZU5hbWUgJiYgdGhpcy5tb2RlbC5pc01vZHVsZUFsbG93ZWQoIHRoaXMubmV3TW9kdWxlTmFtZSApICkge1xuXHRcdFx0dmFyIG1vZGVsID0gTW9kdWxlRmFjdG9yeS5jcmVhdGUoIHRoaXMubmV3TW9kdWxlTmFtZSApO1xuXHRcdFx0dGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpLmFkZCggbW9kZWwgKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogQXBwZW5kIG5ldyBzZWxlY3Rpb24gaXRlbSB2aWV3LlxuXHQgKi9cblx0YWRkTmV3U2VsZWN0aW9uSXRlbVZpZXc6IGZ1bmN0aW9uKCBpdGVtICkge1xuXG5cdFx0aWYgKCAhIHRoaXMubW9kZWwuaXNNb2R1bGVBbGxvd2VkKCBpdGVtLmdldCgnbmFtZScpICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIHZpZXcgPSBNb2R1bGVGYWN0b3J5LmNyZWF0ZUVkaXRWaWV3KCBpdGVtICk7XG5cdFx0dGhpcy52aWV3cy5hZGQoICc+IC5zZWxlY3Rpb24nLCB2aWV3ICk7XG5cblx0XHR2YXIgJHNlbGVjdGlvbiA9ICQoICc+IC5zZWxlY3Rpb24nLCB0aGlzLiRlbCApO1xuXHRcdGlmICggJHNlbGVjdGlvbi5oYXNDbGFzcygndWktc29ydGFibGUnKSApIHtcblx0XHRcdCRzZWxlY3Rpb24uc29ydGFibGUoJ3JlZnJlc2gnKTtcblx0XHR9XG5cblx0XHR2aWV3LmNvbGxhcHNlZCA9IHRoaXMubW9kZWwuaXNNb2R1bGVDb2xsYXBzZWQoIHZpZXcuY2lkICk7XG5cdFx0dmlldy5vbiggJ21wYjptb2R1bGUtdG9nZ2xlLWNvbGxhcHNlZCcsIHRoaXMubW9kZWwudG9nZ2xlQ29sbGFwc2VkU3RhdGUgKTtcblxuXHR9LFxuXG59KTtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciB3cCAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG4vKipcbiAqIEltYWdlIEZpZWxkXG4gKlxuICogSW5pdGlhbGl6ZSBhbmQgbGlzdGVuIGZvciB0aGUgJ2NoYW5nZScgZXZlbnQgdG8gZ2V0IHVwZGF0ZWQgZGF0YS5cbiAqXG4gKi9cbnZhciBGaWVsZEF0dGFjaG1lbnQgPSBGaWVsZC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoICdtcGItZmllbGQtYXR0YWNobWVudCcgKSxcblx0ZnJhbWU6ICAgICBudWxsLFxuXHR2YWx1ZTogICAgIFtdLCAvLyBBdHRhY2htZW50IElEcy5cblx0c2VsZWN0aW9uOiB7fSwgLy8gQXR0YWNobWVudHMgY29sbGVjdGlvbiBmb3IgdGhpcy52YWx1ZS5cblxuXHRjb25maWc6ICAgIHt9LFxuXG5cdGRlZmF1bHRDb25maWc6IHtcblx0XHRtdWx0aXBsZTogZmFsc2UsXG5cdFx0bGlicmFyeTogeyB0eXBlOiAnaW1hZ2UnIH0sXG5cdFx0YnV0dG9uX3RleHQ6ICdTZWxlY3QgSW1hZ2UnLFxuXHR9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayAuYnV0dG9uLmFkZCc6ICdlZGl0SW1hZ2UnLFxuXHRcdCdjbGljayAuaW1hZ2UtcGxhY2Vob2xkZXIgLmJ1dHRvbi5yZW1vdmUnOiAncmVtb3ZlSW1hZ2UnLFxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplLlxuXHQgKlxuXHQgKiBQYXNzIHZhbHVlIGFuZCBjb25maWcgYXMgcHJvcGVydGllcyBvbiB0aGUgb3B0aW9ucyBvYmplY3QuXG5cdCAqIEF2YWlsYWJsZSBvcHRpb25zXG5cdCAqIC0gbXVsdGlwbGU6IGJvb2xcblx0ICogLSBzaXplUmVxOiBlZyB7IHdpZHRoOiAxMDAsIGhlaWdodDogMTAwIH1cblx0ICpcblx0ICogQHBhcmFtICBvYmplY3Qgb3B0aW9uc1xuXHQgKiBAcmV0dXJuIG51bGxcblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0Ly8gQ2FsbCBkZWZhdWx0IGluaXRpYWxpemUuXG5cdFx0RmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgb3B0aW9ucyBdICk7XG5cblx0XHRfLmJpbmRBbGwoIHRoaXMsICdyZW5kZXInLCAnZWRpdEltYWdlJywgJ29uU2VsZWN0SW1hZ2UnLCAncmVtb3ZlSW1hZ2UnLCAnaXNBdHRhY2htZW50U2l6ZU9rJyApO1xuXG5cdFx0dGhpcy5vbiggJ2NoYW5nZScsIHRoaXMucmVuZGVyICk7XG5cdFx0dGhpcy5vbiggJ21wYjpyZW5kZXJlZCcsIHRoaXMucmVuZGVyZWQgKTtcblxuXHRcdHRoaXMuaW5pdFNlbGVjdGlvbigpO1xuXG5cdH0sXG5cblx0c2V0VmFsdWU6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblxuXHRcdC8vIEVuc3VyZSB2YWx1ZSBpcyBhcnJheS5cblx0XHRpZiAoICEgdmFsdWUgfHwgISBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXHRcdFx0dmFsdWUgPSBbXTtcblx0XHR9XG5cblx0XHRGaWVsZC5wcm90b3R5cGUuc2V0VmFsdWUuYXBwbHkoIHRoaXMsIFsgdmFsdWUgXSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgU2VsZWN0aW9uLlxuXHQgKlxuXHQgKiBTZWxlY3Rpb24gaXMgYW4gQXR0YWNobWVudCBjb2xsZWN0aW9uIGNvbnRhaW5pbmcgZnVsbCBtb2RlbHMgZm9yIHRoZSBjdXJyZW50IHZhbHVlLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG51bGxcblx0ICovXG5cdGluaXRTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5zZWxlY3Rpb24gPSBuZXcgd3AubWVkaWEubW9kZWwuQXR0YWNobWVudHMoKTtcblxuXHRcdHRoaXMuc2VsZWN0aW9uLmNvbXBhcmF0b3IgPSAnbWVudS1vcmRlcic7XG5cblx0XHQvLyBJbml0aWFsaXplIHNlbGVjdGlvbi5cblx0XHRfLmVhY2goIHRoaXMuZ2V0VmFsdWUoKSwgZnVuY3Rpb24oIGl0ZW0sIGkgKSB7XG5cblx0XHRcdHZhciBtb2RlbDtcblxuXHRcdFx0Ly8gTGVnYWN5LiBIYW5kbGUgc3RvcmluZyBmdWxsIG9iamVjdHMuXG5cdFx0XHRpdGVtICA9ICggJ29iamVjdCcgPT09IHR5cGVvZiggaXRlbSApICkgPyBpdGVtLmlkIDogaXRlbTtcblx0XHRcdG1vZGVsID0gbmV3IHdwLm1lZGlhLmF0dGFjaG1lbnQoIGl0ZW0gKTtcblxuXHRcdFx0bW9kZWwuc2V0KCAnbWVudS1vcmRlcicsIGkgKTtcblxuXHRcdFx0dGhpcy5zZWxlY3Rpb24uYWRkKCBtb2RlbCApO1xuXG5cdFx0XHQvLyBSZS1yZW5kZXIgYWZ0ZXIgYXR0YWNobWVudHMgaGF2ZSBzeW5jZWQuXG5cdFx0XHRtb2RlbC5mZXRjaCgpO1xuXHRcdFx0bW9kZWwub24oICdzeW5jJywgdGhpcy5yZW5kZXIgKTtcblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdH0sXG5cblx0cHJlcGFyZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGlkOiAgICAgdGhpcy5jaWQsXG5cdFx0XHR2YWx1ZTogIHRoaXMuc2VsZWN0aW9uLnRvSlNPTigpLFxuXHRcdCBcdGNvbmZpZzogdGhpcy5jb25maWcsXG5cdFx0fTtcblx0fSxcblxuXHRyZW5kZXJlZDogZnVuY3Rpb24oKSB7XG5cblx0XHR0aGlzLiRlbC5zb3J0YWJsZSh7XG5cdFx0XHRkZWxheTogMTUwLFxuXHRcdFx0aXRlbXM6ICc+IC5pbWFnZS1wbGFjZWhvbGRlcicsXG5cdFx0XHRzdG9wOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5zZWxlY3Rpb247XG5cblx0XHRcdFx0dGhpcy4kZWwuY2hpbGRyZW4oICcuaW1hZ2UtcGxhY2Vob2xkZXInICkuZWFjaCggZnVuY3Rpb24oIGkgKSB7XG5cblx0XHRcdFx0XHR2YXIgaWQgICAgPSBwYXJzZUludCggdGhpcy5nZXRBdHRyaWJ1dGUoICdkYXRhLWlkJyApICk7XG5cdFx0XHRcdFx0dmFyIG1vZGVsID0gc2VsZWN0aW9uLmZpbmRXaGVyZSggeyBpZDogaWQgfSApO1xuXG5cdFx0XHRcdFx0aWYgKCBtb2RlbCApIHtcblx0XHRcdFx0XHRcdG1vZGVsLnNldCggJ21lbnUtb3JkZXInLCBpICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRzZWxlY3Rpb24uc29ydCgpO1xuXHRcdFx0XHR0aGlzLnNldFZhbHVlKCBzZWxlY3Rpb24ucGx1Y2soJ2lkJykgKTtcblxuXHRcdFx0fS5iaW5kKHRoaXMpXG5cdFx0fSk7XG5cblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlIHRoZSBzZWxlY3QgZXZlbnQuXG5cdCAqXG5cdCAqIEluc2VydCBhbiBpbWFnZSBvciBtdWx0aXBsZSBpbWFnZXMuXG5cdCAqL1xuXHRvblNlbGVjdEltYWdlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBmcmFtZSA9IHRoaXMuZnJhbWUgfHwgbnVsbDtcblxuXHRcdGlmICggISBmcmFtZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnNlbGVjdGlvbi5yZXNldChbXSk7XG5cblx0XHRmcmFtZS5zdGF0ZSgpLmdldCgnc2VsZWN0aW9uJykuZWFjaCggZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cblx0XHRcdGlmICggdGhpcy5pc0F0dGFjaG1lbnRTaXplT2soIGF0dGFjaG1lbnQgKSApIHtcblx0XHRcdFx0dGhpcy5zZWxlY3Rpb24uYWRkKCBhdHRhY2htZW50ICk7XG5cdFx0XHR9XG5cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuc2VsZWN0aW9uLnBsdWNrKCdpZCcpICk7XG5cblx0XHRmcmFtZS5jbG9zZSgpO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZSB0aGUgZWRpdCBhY3Rpb24uXG5cdCAqL1xuXHRlZGl0SW1hZ2U6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciBmcmFtZSA9IHRoaXMuZnJhbWU7XG5cblx0XHRpZiAoICEgZnJhbWUgKSB7XG5cblx0XHRcdHZhciBmcmFtZUFyZ3MgPSB7XG5cdFx0XHRcdGxpYnJhcnk6IHRoaXMuY29uZmlnLmxpYnJhcnksXG5cdFx0XHRcdG11bHRpcGxlOiB0aGlzLmNvbmZpZy5tdWx0aXBsZSxcblx0XHRcdFx0dGl0bGU6ICdTZWxlY3QgSW1hZ2UnLFxuXHRcdFx0XHRmcmFtZTogJ3NlbGVjdCcsXG5cdFx0XHR9O1xuXG5cdFx0XHRmcmFtZSA9IHRoaXMuZnJhbWUgPSB3cC5tZWRpYSggZnJhbWVBcmdzICk7XG5cblx0XHRcdGZyYW1lLm9uKCAnY29udGVudDpjcmVhdGU6YnJvd3NlJywgdGhpcy5zZXR1cEZpbHRlcnMsIHRoaXMgKTtcblx0XHRcdGZyYW1lLm9uKCAnY29udGVudDpyZW5kZXI6YnJvd3NlJywgdGhpcy5zaXplRmlsdGVyTm90aWNlLCB0aGlzICk7XG5cdFx0XHRmcmFtZS5vbiggJ3NlbGVjdCcsIHRoaXMub25TZWxlY3RJbWFnZSwgdGhpcyApO1xuXG5cdFx0fVxuXG5cdFx0Ly8gV2hlbiB0aGUgZnJhbWUgb3BlbnMsIHNldCB0aGUgc2VsZWN0aW9uLlxuXHRcdGZyYW1lLm9uKCAnb3BlbicsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgc2VsZWN0aW9uID0gZnJhbWUuc3RhdGUoKS5nZXQoJ3NlbGVjdGlvbicpO1xuXG5cdFx0XHQvLyBTZXQgdGhlIHNlbGVjdGlvbi5cblx0XHRcdC8vIE5vdGUgLSBleHBlY3RzIGFycmF5IG9mIG9iamVjdHMsIG5vdCBhIGNvbGxlY3Rpb24uXG5cdFx0XHRzZWxlY3Rpb24uc2V0KCB0aGlzLnNlbGVjdGlvbi5tb2RlbHMgKTtcblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0ZnJhbWUub3BlbigpO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEFkZCBmaWx0ZXJzIHRvIHRoZSBmcmFtZSBsaWJyYXJ5IGNvbGxlY3Rpb24uXG5cdCAqXG5cdCAqICAtIGZpbHRlciB0byBsaW1pdCB0byByZXF1aXJlZCBzaXplLlxuXHQgKi9cblx0c2V0dXBGaWx0ZXJzOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBsaWIgICAgPSB0aGlzLmZyYW1lLnN0YXRlKCkuZ2V0KCdsaWJyYXJ5Jyk7XG5cblx0XHRpZiAoICdzaXplUmVxJyBpbiB0aGlzLmNvbmZpZyApIHtcblx0XHRcdGxpYi5maWx0ZXJzLnNpemUgPSB0aGlzLmlzQXR0YWNobWVudFNpemVPaztcblx0XHR9XG5cblx0fSxcblxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgZGlzcGxheSBvZiBzaXplIGZpbHRlciBub3RpY2UuXG5cdCAqL1xuXHRzaXplRmlsdGVyTm90aWNlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBsaWIgPSB0aGlzLmZyYW1lLnN0YXRlKCkuZ2V0KCdsaWJyYXJ5Jyk7XG5cblx0XHRpZiAoICEgbGliLmZpbHRlcnMuc2l6ZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBXYWl0IHRvIGJlIHN1cmUgdGhlIGZyYW1lIGlzIHJlbmRlcmVkLlxuXHRcdHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHJlcSwgJG5vdGljZSwgdGVtcGxhdGUsICR0b29sYmFyO1xuXG5cdFx0XHRyZXEgPSBfLmV4dGVuZCgge1xuXHRcdFx0XHR3aWR0aDogMCxcblx0XHRcdFx0aGVpZ2h0OiAwLFxuXHRcdFx0fSwgdGhpcy5jb25maWcuc2l6ZVJlcSApO1xuXG5cdFx0XHQvLyBEaXNwbGF5IG5vdGljZSBvbiBtYWluIGdyaWQgdmlldy5cblx0XHRcdHRlbXBsYXRlID0gJzxwIGNsYXNzPVwiZmlsdGVyLW5vdGljZVwiPk9ubHkgc2hvd2luZyBpbWFnZXMgdGhhdCBtZWV0IHNpemUgcmVxdWlyZW1lbnRzOiA8JT0gd2lkdGggJT5weCAmdGltZXM7IDwlPSBoZWlnaHQgJT5weDwvcD4nO1xuXHRcdFx0JG5vdGljZSAgPSAkKCBfLnRlbXBsYXRlKCB0ZW1wbGF0ZSApKCByZXEgKSApO1xuXHRcdFx0JHRvb2xiYXIgPSAkKCAnLmF0dGFjaG1lbnRzLWJyb3dzZXIgLm1lZGlhLXRvb2xiYXInLCB0aGlzLmZyYW1lLiRlbCApLmZpcnN0KCk7XG5cdFx0XHQkdG9vbGJhci5wcmVwZW5kKCAkbm90aWNlICk7XG5cblx0XHRcdHZhciBjb250ZW50VmlldyA9IHRoaXMuZnJhbWUudmlld3MuZ2V0KCAnLm1lZGlhLWZyYW1lLWNvbnRlbnQnICk7XG5cdFx0XHRjb250ZW50VmlldyA9IGNvbnRlbnRWaWV3WzBdO1xuXG5cdFx0XHQkbm90aWNlID0gJCggJzxwIGNsYXNzPVwiZmlsdGVyLW5vdGljZVwiPkltYWdlIGRvZXMgbm90IG1lZXQgc2l6ZSByZXF1aXJlbWVudHMuPC9wPicgKTtcblxuXHRcdFx0Ly8gRGlzcGxheSBhZGRpdGlvbmFsIG5vdGljZSB3aGVuIHNlbGVjdGluZyBhbiBpbWFnZS5cblx0XHRcdC8vIFJlcXVpcmVkIHRvIGluZGljYXRlIGEgYmFkIGltYWdlIGhhcyBqdXN0IGJlZW4gdXBsb2FkZWQuXG5cdFx0XHRjb250ZW50Vmlldy5vcHRpb25zLnNlbGVjdGlvbi5vbiggJ3NlbGVjdGlvbjpzaW5nbGUnLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHR2YXIgYXR0YWNobWVudCA9IGNvbnRlbnRWaWV3Lm9wdGlvbnMuc2VsZWN0aW9uLnNpbmdsZSgpO1xuXG5cdFx0XHRcdHZhciBkaXNwbGF5Tm90aWNlID0gZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0XHQvLyBJZiBzdGlsbCB1cGxvYWRpbmcsIHdhaXQgYW5kIHRyeSBkaXNwbGF5aW5nIG5vdGljZSBhZ2Fpbi5cblx0XHRcdFx0XHRpZiAoIGF0dGFjaG1lbnQuZ2V0KCAndXBsb2FkaW5nJyApICkge1xuXHRcdFx0XHRcdFx0d2luZG93LnNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRkaXNwbGF5Tm90aWNlKCk7XG5cdFx0XHRcdFx0XHR9LCA1MDAgKTtcblxuXHRcdFx0XHRcdC8vIE9LLiBEaXNwbGF5IG5vdGljZSBhcyByZXF1aXJlZC5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRpZiAoICEgdGhpcy5pc0F0dGFjaG1lbnRTaXplT2soIGF0dGFjaG1lbnQgKSApIHtcblx0XHRcdFx0XHRcdFx0JCggJy5hdHRhY2htZW50cy1icm93c2VyIC5hdHRhY2htZW50LWluZm8nICkucHJlcGVuZCggJG5vdGljZSApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0JG5vdGljZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9LmJpbmQodGhpcyk7XG5cblx0XHRcdFx0ZGlzcGxheU5vdGljZSgpO1xuXG5cdFx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdH0uYmluZCh0aGlzKSwgMTAwICApO1xuXG5cdH0sXG5cblx0cmVtb3ZlSW1hZ2U6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciAkdGFyZ2V0LCBpZDtcblxuXHRcdCR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcblx0XHQkdGFyZ2V0ID0gKCAkdGFyZ2V0LnByb3AoJ3RhZ05hbWUnKSA9PT0gJ0JVVFRPTicgKSA/ICR0YXJnZXQgOiAkdGFyZ2V0LmNsb3Nlc3QoJ2J1dHRvbi5yZW1vdmUnKTtcblx0XHRpZCAgICAgID0gJHRhcmdldC5kYXRhKCAnaW1hZ2UtaWQnICk7XG5cblx0XHRpZiAoICEgaWQgICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuc2VsZWN0aW9uLnJlbW92ZSggdGhpcy5zZWxlY3Rpb24ud2hlcmUoIHsgaWQ6IGlkIH0gKSApO1xuXHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuc2VsZWN0aW9uLnBsdWNrKCdpZCcpICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogRG9lcyBhdHRhY2htZW50IG1lZXQgc2l6ZSByZXF1aXJlbWVudHM/XG5cdCAqXG5cdCAqIEBwYXJhbSAgQXR0YWNobWVudFxuXHQgKiBAcmV0dXJuIGJvb2xlYW5cblx0ICovXG5cdGlzQXR0YWNobWVudFNpemVPazogZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cblx0XHRpZiAoICEgKCAnc2l6ZVJlcScgaW4gdGhpcy5jb25maWcgKSApIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHRoaXMuY29uZmlnLnNpemVSZXEgPSBfLmV4dGVuZCgge1xuXHRcdFx0d2lkdGg6IDAsXG5cdFx0XHRoZWlnaHQ6IDAsXG5cdFx0fSwgdGhpcy5jb25maWcuc2l6ZVJlcSApO1xuXG5cdFx0dmFyIHdpZHRoUmVxICA9IGF0dGFjaG1lbnQuZ2V0KCd3aWR0aCcpICA+PSB0aGlzLmNvbmZpZy5zaXplUmVxLndpZHRoO1xuXHRcdHZhciBoZWlnaHRSZXEgPSBhdHRhY2htZW50LmdldCgnaGVpZ2h0JykgPj0gdGhpcy5jb25maWcuc2l6ZVJlcS5oZWlnaHQ7XG5cblx0XHRyZXR1cm4gd2lkdGhSZXEgJiYgaGVpZ2h0UmVxO1xuXG5cdH1cblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkQXR0YWNobWVudDtcbiIsInZhciAkICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgd3AgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxudmFyIEZpZWxkVGV4dCA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLWZpZWxkLWNoZWNrYm94JyApLFxuXG5cdGRlZmF1bHRDb25maWc6IHtcblx0XHRsYWJlbDogJ1Rlc3QgTGFiZWwnLFxuXHR9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdjaGFuZ2UgIGlucHV0JzogJ2lucHV0Q2hhbmdlZCcsXG5cdH0sXG5cblx0aW5wdXRDaGFuZ2VkOiBfLmRlYm91bmNlKCBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFZhbHVlKCAkKCAnaW5wdXQnLCB0aGlzLiRlbCApLnByb3AoICdjaGVja2VkJyApICk7XG5cdH0gKSxcblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkVGV4dDtcbiIsInZhciB3cCAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG52YXIgRmllbGRMaW5rID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogd3AudGVtcGxhdGUoICdtcGItZmllbGQtbGluaycgKSxcblxuXHRldmVudHM6IHtcblx0XHQna2V5dXAgICBpbnB1dC5maWVsZC10ZXh0JzogJ3RleHRJbnB1dENoYW5nZWQnLFxuXHRcdCdjaGFuZ2UgIGlucHV0LmZpZWxkLXRleHQnOiAndGV4dElucHV0Q2hhbmdlZCcsXG5cdFx0J2tleXVwICAgaW5wdXQuZmllbGQtbGluayc6ICdsaW5rSW5wdXRDaGFuZ2VkJyxcblx0XHQnY2hhbmdlICBpbnB1dC5maWVsZC1saW5rJzogJ2xpbmtJbnB1dENoYW5nZWQnLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0RmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgb3B0aW9ucyBdICk7XG5cblx0XHR0aGlzLnZhbHVlID0gdGhpcy52YWx1ZSB8fCB7fTtcblx0XHR0aGlzLnZhbHVlID0gXy5kZWZhdWx0cyggdGhpcy52YWx1ZSwgeyBsaW5rOiAnJywgdGV4dDogJycgfSApO1xuXG5cdH0sXG5cblx0dGV4dElucHV0Q2hhbmdlZDogXy5kZWJvdW5jZSggZnVuY3Rpb24oZSkge1xuXHRcdGlmICggZSAmJiBlLnRhcmdldCApIHtcblx0XHRcdHZhciB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblx0XHRcdHZhbHVlLnRleHQgPSBlLnRhcmdldC52YWx1ZTtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIHZhbHVlICk7XG5cdFx0fVxuXHR9ICksXG5cblx0bGlua0lucHV0Q2hhbmdlZDogXy5kZWJvdW5jZSggZnVuY3Rpb24oZSkge1xuXHRcdGlmICggZSAmJiBlLnRhcmdldCApIHtcblx0XHRcdHZhciB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblx0XHRcdHZhbHVlLmxpbmsgPSBlLnRhcmdldC52YWx1ZTtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIHZhbHVlICk7XG5cdFx0fVxuXHR9ICksXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkTGluaztcbiIsInZhciB3cCAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ10gOiBudWxsKTtcbnZhciBGaWVsZFRleHQgPSByZXF1aXJlKCcuL2ZpZWxkLXRleHQuanMnKTtcblxudmFyIEZpZWxkTnVtYmVyID0gRmllbGRUZXh0LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLWZpZWxkLW51bWJlcicgKSxcblxuXHRnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQoIHRoaXMudmFsdWUgKTtcblx0fSxcblxuXHRzZXRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdHRoaXMudmFsdWUgPSBwYXJzZUZsb2F0KCB2YWx1ZSApO1xuXHRcdHRoaXMudHJpZ2dlciggJ2NoYW5nZScsIHRoaXMuZ2V0VmFsdWUoKSApO1xuXHR9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGROdW1iZXI7XG4iLCIvKiBnbG9iYWwgYWpheHVybCAqL1xuXG52YXIgJCAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIHdwICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddIDogbnVsbCk7XG52YXIgRmllbGQgPSByZXF1aXJlKCcuL2ZpZWxkLmpzJyk7XG5cbi8qKlxuICogVGV4dCBGaWVsZCBWaWV3XG4gKlxuICogWW91IGNhbiB1c2UgdGhpcyBhbnl3aGVyZS5cbiAqIEp1c3QgbGlzdGVuIGZvciAnY2hhbmdlJyBldmVudCBvbiB0aGUgdmlldy5cbiAqL1xudmFyIEZpZWxkUG9zdFNlbGVjdCA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLWZpZWxkLXRleHQnICksXG5cblx0ZGVmYXVsdENvbmZpZzoge1xuXHRcdG11bHRpcGxlOiB0cnVlLFxuXHRcdHBvc3RUeXBlOiAncG9zdCdcblx0fSxcblxuXHRldmVudHM6IHtcblx0XHQnY2hhbmdlIGlucHV0JzogJ2lucHV0Q2hhbmdlZCdcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHRGaWVsZC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBvcHRpb25zIF0gKTtcblx0XHR0aGlzLm9uKCAnbXBiOnJlbmRlcmVkJywgdGhpcy5yZW5kZXJlZCApO1xuXHR9LFxuXG5cdHNldFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cblx0XHRpZiAoIHRoaXMuY29uZmlnLm11bHRpcGxlICYmICEgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gWyB2YWx1ZSBdO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5jb25maWcubXVsdGlwbGUgJiYgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gdmFsdWVbMF07XG5cdFx0fVxuXG5cdFx0RmllbGQucHJvdG90eXBlLnNldFZhbHVlLmFwcGx5KCB0aGlzLCBbIHZhbHVlIF0gKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgVmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSAgUmV0dXJuIHZhbHVlIGFzIGFuIGFycmF5IGV2ZW4gaWYgbXVsdGlwbGUgaXMgZmFsc2UuXG5cdCAqL1xuXHRnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgdmFsdWUgPSB0aGlzLnZhbHVlO1xuXG5cdFx0aWYgKCB0aGlzLmNvbmZpZy5tdWx0aXBsZSAmJiAhIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IFsgdmFsdWUgXTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMuY29uZmlnLm11bHRpcGxlICYmIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IHZhbHVlWzBdO1xuXHRcdH1cblxuXHRcdHJldHVybiB2YWx1ZTtcblxuXHR9LFxuXG5cdHByZXBhcmU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdHZhbHVlID0gQXJyYXkuaXNBcnJheSggdmFsdWUgKSA/IHZhbHVlLmpvaW4oICcsJyApIDogdmFsdWU7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0aWQ6ICAgICB0aGlzLmNpZCxcblx0XHRcdHZhbHVlOiAgdmFsdWUsXG5cdFx0XHRjb25maWc6IHt9XG5cdFx0fTtcblxuXHR9LFxuXG5cdHJlbmRlcmVkOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5pbml0U2VsZWN0MigpO1xuXHR9LFxuXG5cdGluaXRTZWxlY3QyOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciAkZmllbGQgPSAkKCAnIycgKyB0aGlzLmNpZCwgdGhpcy4kZWwgKTtcblx0XHR2YXIgcG9zdFR5cGUgPSB0aGlzLmNvbmZpZy5wb3N0VHlwZTtcblxuXHRcdHZhciBmb3JtYXRSZXF1ZXN0ID1mdW5jdGlvbiAoIHRlcm0sIHBhZ2UgKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRhY3Rpb246ICdtY2VfZ2V0X3Bvc3RzJyxcblx0XHRcdFx0czogdGVybSxcblx0XHRcdFx0cGFnZTogcGFnZSxcblx0XHRcdFx0cG9zdF90eXBlOiBwb3N0VHlwZVxuXHRcdFx0fTtcblx0XHR9O1xuXG5cdFx0dmFyIHBhcnNlUmVzdWx0cyA9IGZ1bmN0aW9uICggcmVzcG9uc2UgKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyZXN1bHRzOiByZXNwb25zZS5yZXN1bHRzLFxuXHRcdFx0XHRtb3JlOiByZXNwb25zZS5tb3JlXG5cdFx0XHR9O1xuXHRcdH07XG5cblx0XHR2YXIgaW5pdFNlbGVjdGlvbiA9IGZ1bmN0aW9uKCBlbCwgY2FsbGJhY2sgKSB7XG5cblx0XHRcdHZhciB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKS5qb2luKCcsJyk7XG5cblx0XHRcdGlmICggdmFsdWUubGVuZ3RoICkge1xuXHRcdFx0XHQkLmdldCggYWpheHVybCwge1xuXHRcdFx0XHRcdGFjdGlvbjogJ21jZV9nZXRfcG9zdHMnLFxuXHRcdFx0XHRcdHBvc3RfX2luOiB2YWx1ZSxcblx0XHRcdFx0XHRwb3N0X3R5cGU6IHBvc3RUeXBlXG5cdFx0XHRcdH0gKS5kb25lKCBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdFx0XHRjYWxsYmFjayggcGFyc2VSZXN1bHRzKCBkYXRhICkucmVzdWx0cyApO1xuXHRcdFx0XHR9ICk7XG5cdFx0XHR9XG5cblx0XHR9LmJpbmQodGhpcyk7XG5cblx0XHQkZmllbGQuc2VsZWN0Mih7XG5cdFx0XHRtaW5pbXVtSW5wdXRMZW5ndGg6IDEsXG5cdFx0XHRtdWx0aXBsZTogdGhpcy5jb25maWcubXVsdGlwbGUsXG5cdFx0XHRpbml0U2VsZWN0aW9uOiBpbml0U2VsZWN0aW9uLFxuXHRcdFx0YWpheDoge1xuXHRcdFx0XHR1cmw6IGFqYXh1cmwsXG5cdFx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHQgICAgZGVsYXk6IDI1MCxcblx0XHRcdCAgICBjYWNoZTogZmFsc2UsXG5cdFx0XHRcdGRhdGE6IGZvcm1hdFJlcXVlc3QsXG5cdFx0XHRcdHJlc3VsdHM6IHBhcnNlUmVzdWx0cyxcblx0XHRcdH0sXG5cdFx0fSk7XG5cblx0fSxcblxuXHRpbnB1dENoYW5nZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB2YWx1ZSA9ICQoICdpbnB1dCMnICsgdGhpcy5jaWQsIHRoaXMuJGVsICkudmFsKCk7XG5cdFx0dmFsdWUgPSB2YWx1ZS5zcGxpdCggJywnICkubWFwKCBOdW1iZXIgKTtcblx0XHR0aGlzLnNldFZhbHVlKCB2YWx1ZSApO1xuXHR9LFxuXG5cdHJlbW92ZTogZnVuY3Rpb24oKSB7XG5cdH0sXG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFBvc3RTZWxlY3Q7XG4iLCJ2YXIgJCAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIHdwICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddIDogbnVsbCk7XG52YXIgRmllbGQgPSByZXF1aXJlKCcuL2ZpZWxkLmpzJyk7XG5cbi8qKlxuICogVGV4dCBGaWVsZCBWaWV3XG4gKlxuICogWW91IGNhbiB1c2UgdGhpcyBhbnl3aGVyZS5cbiAqIEp1c3QgbGlzdGVuIGZvciAnY2hhbmdlJyBldmVudCBvbiB0aGUgdmlldy5cbiAqL1xudmFyIEZpZWxkU2VsZWN0ID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogd3AudGVtcGxhdGUoICdtcGItZmllbGQtc2VsZWN0JyApLFxuXHR2YWx1ZTogW10sXG5cblx0ZGVmYXVsdENvbmZpZzoge1xuXHRcdG11bHRpcGxlOiBmYWxzZSxcblx0XHRvcHRpb25zOiBbXSxcblx0fSxcblxuXHRldmVudHM6IHtcblx0XHQnY2hhbmdlIHNlbGVjdCc6ICdpbnB1dENoYW5nZWQnXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0Xy5iaW5kQWxsKCB0aGlzLCAncGFyc2VPcHRpb24nICk7XG5cdFx0RmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgb3B0aW9ucyBdICk7XG5cdFx0dGhpcy5vcHRpb25zID0gb3B0aW9ucy5jb25maWcub3B0aW9ucyB8fCBbXTtcblx0fSxcblxuXHRpbnB1dENoYW5nZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0VmFsdWUoICQoICdzZWxlY3QnLCB0aGlzLiRlbCApLnZhbCgpICk7XG5cdH0sXG5cblx0Z2V0T3B0aW9uczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMub3B0aW9ucy5tYXAoIHRoaXMucGFyc2VPcHRpb24gKTtcblx0fSxcblxuXHRwYXJzZU9wdGlvbjogZnVuY3Rpb24oIG9wdGlvbiApIHtcblx0XHRvcHRpb24gPSBfLmRlZmF1bHRzKCBvcHRpb24sIHsgdmFsdWU6ICcnLCB0ZXh0OiAnJywgc2VsZWN0ZWQ6IGZhbHNlIH0gKTtcblx0XHRvcHRpb24uc2VsZWN0ZWQgPSB0aGlzLmlzU2VsZWN0ZWQoIG9wdGlvbi52YWx1ZSApO1xuXHRcdHJldHVybiBvcHRpb247XG5cdH0sXG5cblx0aXNTZWxlY3RlZDogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdGlmICggdGhpcy5jb25maWcubXVsdGlwbGUgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRWYWx1ZSgpLmluZGV4T2YoIHZhbHVlICkgPj0gMDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHZhbHVlID09PSB0aGlzLmdldFZhbHVlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdHNldFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cblx0XHRpZiAoIHRoaXMuY29uZmlnLm11bHRpcGxlICYmICEgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gWyB2YWx1ZSBdO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5jb25maWcubXVsdGlwbGUgJiYgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gdmFsdWVbMF07XG5cdFx0fVxuXG5cdFx0RmllbGQucHJvdG90eXBlLnNldFZhbHVlLmFwcGx5KCB0aGlzLCBbIHZhbHVlIF0gKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgVmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSAgUmV0dXJuIHZhbHVlIGFzIGFuIGFycmF5IGV2ZW4gaWYgbXVsdGlwbGUgaXMgZmFsc2UuXG5cdCAqL1xuXHRnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgdmFsdWUgPSB0aGlzLnZhbHVlO1xuXG5cdFx0aWYgKCB0aGlzLmNvbmZpZy5tdWx0aXBsZSAmJiAhIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IFsgdmFsdWUgXTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMuY29uZmlnLm11bHRpcGxlICYmIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IHZhbHVlWzBdO1xuXHRcdH1cblxuXHRcdHJldHVybiB2YWx1ZTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRpZDogdGhpcy5jaWQsXG5cdFx0XHRvcHRpb25zOiB0aGlzLmdldE9wdGlvbnMoKSxcblx0XHR9O1xuXG5cdFx0Ly8gQ3JlYXRlIGVsZW1lbnQgZnJvbSB0ZW1wbGF0ZS5cblx0XHR0aGlzLiRlbC5odG1sKCB0aGlzLnRlbXBsYXRlKCBkYXRhICkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFNlbGVjdDtcbiIsInZhciB3cCAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG52YXIgRmllbGRUZXh0ID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogd3AudGVtcGxhdGUoICdtcGItZmllbGQtdGV4dCcgKSxcblxuXHRkZWZhdWx0Q29uZmlnOiB7XG5cdFx0Y2xhc3NlczogJ3JlZ3VsYXItdGV4dCcsXG5cdFx0cGxhY2Vob2xkZXI6IG51bGwsXG5cdH0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2tleXVwICAgaW5wdXQnOiAnaW5wdXRDaGFuZ2VkJyxcblx0XHQnY2hhbmdlICBpbnB1dCc6ICdpbnB1dENoYW5nZWQnLFxuXHR9LFxuXG5cdGlucHV0Q2hhbmdlZDogXy5kZWJvdW5jZSggZnVuY3Rpb24oZSkge1xuXHRcdGlmICggZSAmJiBlLnRhcmdldCApIHtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIGUudGFyZ2V0LnZhbHVlICk7XG5cdFx0fVxuXHR9ICksXG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFRleHQ7XG4iLCJ2YXIgd3AgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddIDogbnVsbCk7XG52YXIgRmllbGRUZXh0ID0gcmVxdWlyZSgnLi9maWVsZC10ZXh0LmpzJyk7XG5cbnZhciBGaWVsZFRleHRhcmVhID0gRmllbGRUZXh0LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLWZpZWxkLXRleHRhcmVhJyApLFxuXG5cdGV2ZW50czoge1xuXHRcdCdrZXl1cCAgdGV4dGFyZWEnOiAnaW5wdXRDaGFuZ2VkJyxcblx0XHQnY2hhbmdlIHRleHRhcmVhJzogJ2lucHV0Q2hhbmdlZCcsXG5cdH0sXG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFRleHRhcmVhO1xuIiwidmFyICQgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciB3cCAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG4vKipcbiAqIFRleHQgRmllbGQgVmlld1xuICpcbiAqIFlvdSBjYW4gdXNlIHRoaXMgYW55d2hlcmUuXG4gKiBKdXN0IGxpc3RlbiBmb3IgJ2NoYW5nZScgZXZlbnQgb24gdGhlIHZpZXcuXG4gKi9cbnZhciBGaWVsZFdZU0lXWUcgPSBGaWVsZC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiB3cC50ZW1wbGF0ZSggJ21wYi1maWVsZC13eXNpd3lnJyApLFxuXHRlZGl0b3I6IG51bGwsXG5cdHZhbHVlOiBudWxsLFxuXG5cdC8qKlxuXHQgKiBJbml0LlxuXHQgKlxuXHQgKiBvcHRpb25zLnZhbHVlIGlzIHVzZWQgdG8gcGFzcyBpbml0aWFsIHZhbHVlLlxuXHQgKi9cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cblx0XHRGaWVsZC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBvcHRpb25zIF0gKTtcblxuXHRcdHRoaXMub24oICdtcGI6cmVuZGVyZWQnLCB0aGlzLnJlbmRlcmVkICk7XG5cblx0fSxcblxuXHRyZW5kZXJlZDogZnVuY3Rpb24gKCkge1xuXG5cdFx0Ly8gSGlkZSBlZGl0b3IgdG8gcHJldmVudCBGT1VDLiBTaG93IGFnYWluIG9uIGluaXQuIFNlZSBzZXR1cC5cblx0XHQkKCAnLndwLWVkaXRvci13cmFwJywgdGhpcy4kZWwgKS5jc3MoICdkaXNwbGF5JywgJ25vbmUnICk7XG5cblx0XHQvLyBJbml0LiBEZWZmZXJyZWQgdG8gbWFrZSBzdXJlIGNvbnRhaW5lciBlbGVtZW50IGhhcyBiZWVuIHJlbmRlcmVkLlxuXHRcdF8uZGVmZXIoIHRoaXMuaW5pdFRpbnlNQ0UuYmluZCggdGhpcyApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIHRoZSBUaW55TUNFIGVkaXRvci5cblx0ICpcblx0ICogQml0IGhhY2t5IHRoaXMuXG5cdCAqXG5cdCAqIEByZXR1cm4gbnVsbC5cblx0ICovXG5cdGluaXRUaW55TUNFOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBzZWxmID0gdGhpcywgcHJvcDtcblxuXHRcdHZhciBpZCAgICA9ICdtcGItdGV4dC1ib2R5LScgKyB0aGlzLmNpZDtcblx0XHR2YXIgcmVnZXggPSBuZXcgUmVnRXhwKCAnbXBiLXBsYWNlaG9sZGVyLShpZHxuYW1lKScsICdnJyApO1xuXHRcdHZhciBlZCAgICA9IHRpbnlNQ0UuZ2V0KCBpZCApO1xuXHRcdHZhciAkZWwgICA9ICQoICcjd3AtbXBiLXRleHQtYm9keS0nICsgdGhpcy5jaWQgKyAnLXdyYXAnLCB0aGlzLiRlbCApO1xuXG5cdFx0Ly8gSWYgZm91bmQuIFJlbW92ZSBzbyB3ZSBjYW4gcmUtaW5pdC5cblx0XHRpZiAoIGVkICkge1xuXHRcdFx0dGlueU1DRS5leGVjQ29tbWFuZCggJ21jZVJlbW92ZUVkaXRvcicsIGZhbHNlLCBpZCApO1xuXHRcdH1cblxuXHRcdC8vIEdldCBzZXR0aW5ncyBmb3IgdGhpcyBmaWVsZC5cblx0XHQvLyBJZiBubyBzZXR0aW5ncyBmb3IgdGhpcyBmaWVsZC4gQ2xvbmUgZnJvbSBwbGFjZWhvbGRlci5cblx0XHRpZiAoIHR5cGVvZiggdGlueU1DRVByZUluaXQubWNlSW5pdFsgaWQgXSApID09PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdHZhciBuZXdTZXR0aW5ncyA9IGpRdWVyeS5leHRlbmQoIHt9LCB0aW55TUNFUHJlSW5pdC5tY2VJbml0WyAnbXBiLXBsYWNlaG9sZGVyLWlkJyBdICk7XG5cdFx0XHRmb3IgKCBwcm9wIGluIG5ld1NldHRpbmdzICkge1xuXHRcdFx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YoIG5ld1NldHRpbmdzW3Byb3BdICkgKSB7XG5cdFx0XHRcdFx0bmV3U2V0dGluZ3NbcHJvcF0gPSBuZXdTZXR0aW5nc1twcm9wXS5yZXBsYWNlKCByZWdleCwgaWQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdID0gbmV3U2V0dGluZ3M7XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGZ1bGxzY3JlZW4gcGx1Z2luLlxuXHRcdHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0ucGx1Z2lucyA9IHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0ucGx1Z2lucy5yZXBsYWNlKCAnZnVsbHNjcmVlbiwnLCAnJyApO1xuXG5cdFx0Ly8gR2V0IHF1aWNrdGFnIHNldHRpbmdzIGZvciB0aGlzIGZpZWxkLlxuXHRcdC8vIElmIG5vbmUgZXhpc3RzIGZvciB0aGlzIGZpZWxkLiBDbG9uZSBmcm9tIHBsYWNlaG9sZGVyLlxuXHRcdGlmICggdHlwZW9mKCB0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHR2YXIgbmV3UVRTID0galF1ZXJ5LmV4dGVuZCgge30sIHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgJ21wYi1wbGFjZWhvbGRlci1pZCcgXSApO1xuXHRcdFx0Zm9yICggcHJvcCBpbiBuZXdRVFMgKSB7XG5cdFx0XHRcdGlmICggJ3N0cmluZycgPT09IHR5cGVvZiggbmV3UVRTW3Byb3BdICkgKSB7XG5cdFx0XHRcdFx0bmV3UVRTW3Byb3BdID0gbmV3UVRTW3Byb3BdLnJlcGxhY2UoIHJlZ2V4LCBpZCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gPSBuZXdRVFM7XG5cdFx0fVxuXG5cdFx0Ly8gV2hlbiBlZGl0b3IgaW5pdHMsIGF0dGFjaCBzYXZlIGNhbGxiYWNrIHRvIGNoYW5nZSBldmVudC5cblx0XHR0aW55TUNFUHJlSW5pdC5tY2VJbml0W2lkXS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHQvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgaW4gdGhlIE1DRSBlZGl0b3IuXG5cdFx0XHR0aGlzLm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHRcdHNlbGYuc2V0VmFsdWUoIGUudGFyZ2V0LmdldENvbnRlbnQoKSApO1xuXHRcdFx0fSApO1xuXG5cdFx0XHQvLyBQcmV2ZW50IEZPVUMuIFNob3cgZWxlbWVudCBhZnRlciBpbml0LlxuXHRcdFx0dGhpcy5vbiggJ2luaXQnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JGVsLmNzcyggJ2Rpc3BsYXknLCAnYmxvY2snICk7XG5cdFx0XHR9KTtcblxuXHRcdH07XG5cblx0XHQvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgaW4gdGhlIEhUTUwgZWRpdG9yLlxuXHRcdCQoJyMnICsgaWQgKS5vbiggJ2tleWRvd24gY2hhbmdlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLnNldFZhbHVlKCB0aGlzLnZhbHVlICk7XG5cdFx0fSApO1xuXG5cdFx0Ly8gQ3VycmVudCBtb2RlIGRldGVybWluZWQgYnkgY2xhc3Mgb24gZWxlbWVudC5cblx0XHQvLyBJZiBtb2RlIGlzIHZpc3VhbCwgY3JlYXRlIHRoZSB0aW55TUNFLlxuXHRcdGlmICggJGVsLmhhc0NsYXNzKCd0bWNlLWFjdGl2ZScpICkge1xuXHRcdFx0dGlueU1DRS5pbml0KCB0aW55TUNFUHJlSW5pdC5tY2VJbml0W2lkXSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkZWwuY3NzKCAnZGlzcGxheScsICdibG9jaycgKTtcblx0XHR9XG5cblx0XHQvLyBJbml0IHF1aWNrdGFncy5cblx0XHRxdWlja3RhZ3MoIHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgaWQgXSApO1xuXHRcdFFUYWdzLl9idXR0b25zSW5pdCgpO1xuXG5cdFx0dmFyICRidWlsZGVyID0gdGhpcy4kZWwuY2xvc2VzdCggJy51aS1zb3J0YWJsZScgKTtcblxuXHRcdC8vIEhhbmRsZSB0ZW1wb3JhcnkgcmVtb3ZhbCBvZiB0aW55TUNFIHdoZW4gc29ydGluZy5cblx0XHQkYnVpbGRlci5vbiggJ3NvcnRzdGFydCcsIGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG5cblx0XHRcdGlmICggZXZlbnQuY3VycmVudFRhcmdldCAhPT0gJGJ1aWxkZXIgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCB1aS5pdGVtWzBdLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSA9PT0gdGhpcy5lbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2lkJykgKSB7XG5cdFx0XHRcdHRpbnlNQ0UuZXhlY0NvbW1hbmQoICdtY2VSZW1vdmVFZGl0b3InLCBmYWxzZSwgaWQgKTtcblx0XHRcdH1cblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0Ly8gSGFuZGxlIHJlLWluaXQgYWZ0ZXIgc29ydGluZy5cblx0XHQkYnVpbGRlci5vbiggJ3NvcnRzdG9wJywgZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblxuXHRcdFx0aWYgKCBldmVudC5jdXJyZW50VGFyZ2V0ICE9PSAkYnVpbGRlciApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIHVpLml0ZW1bMF0uZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpID09PSB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSApIHtcblx0XHRcdFx0dGlueU1DRS5leGVjQ29tbWFuZCgnbWNlQWRkRWRpdG9yJywgZmFsc2UsIGlkKTtcblx0XHRcdH1cblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdH0sXG5cblx0cmVtb3ZlOiBmdW5jdGlvbigpIHtcblx0XHR0aW55TUNFLmV4ZWNDb21tYW5kKCAnbWNlUmVtb3ZlRWRpdG9yJywgZmFsc2UsICdtcGItdGV4dC1ib2R5LScgKyB0aGlzLmNpZCApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZWZyZXNoIHZpZXcgYWZ0ZXIgc29ydC9jb2xsYXBzZSBldGMuXG5cdCAqL1xuXHRyZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnJlbmRlcigpO1xuXHR9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRXWVNJV1lHO1xuIiwidmFyIHdwID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddIDogbnVsbCk7XG5cbi8qKlxuICogQWJzdHJhY3QgRmllbGQgQ2xhc3MuXG4gKlxuICogSGFuZGxlcyBzZXR1cCBhcyB3ZWxsIGFzIGdldHRpbmcgYW5kIHNldHRpbmcgdmFsdWVzLlxuICogUHJvdmlkZXMgYSB2ZXJ5IGdlbmVyaWMgcmVuZGVyIG1ldGhvZCAtIGJ1dCBwcm9iYWJseSBiZSBPSyBmb3IgbW9zdCBzaW1wbGUgZmllbGRzLlxuICovXG52YXIgRmllbGQgPSB3cC5CYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICAgICAgbnVsbCxcblx0dmFsdWU6ICAgICAgICAgbnVsbCxcblx0Y29uZmlnOiAgICAgICAge30sXG5cdGRlZmF1bHRDb25maWc6IHt9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplLlxuXHQgKiBJZiB5b3UgZXh0ZW5kIHRoaXMgdmlldyAtIGl0IGlzIHJlY2NvbW1lZGVkIHRvIGNhbGwgdGhpcy5cblx0ICpcblx0ICogRXhwZWN0cyBvcHRpb25zLnZhbHVlIGFuZCBvcHRpb25zLmNvbmZpZy5cblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0dmFyIGNvbmZpZztcblxuXHRcdF8uYmluZEFsbCggdGhpcywgJ2dldFZhbHVlJywgJ3NldFZhbHVlJyApO1xuXG5cdFx0Ly8gSWYgYSBjaGFuZ2UgY2FsbGJhY2sgaXMgcHJvdmlkZWQsIGNhbGwgdGhpcyBvbiBjaGFuZ2UuXG5cdFx0aWYgKCAnb25DaGFuZ2UnIGluIG9wdGlvbnMgKSB7XG5cdFx0XHR0aGlzLm9uKCAnY2hhbmdlJywgb3B0aW9ucy5vbkNoYW5nZSApO1xuXHRcdH1cblxuXHRcdGNvbmZpZyA9ICggJ2NvbmZpZycgaW4gb3B0aW9ucyApID8gb3B0aW9ucy5jb25maWcgOiB7fTtcblx0XHR0aGlzLmNvbmZpZyA9IF8uZXh0ZW5kKCB7fSwgdGhpcy5kZWZhdWx0Q29uZmlnLCBjb25maWcgKTtcblxuXHRcdGlmICggJ3ZhbHVlJyBpbiBvcHRpb25zICkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggb3B0aW9ucy52YWx1ZSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdGdldFZhbHVlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy52YWx1ZTtcblx0fSxcblxuXHRzZXRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcblx0XHR0aGlzLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLnZhbHVlICk7XG5cdH0sXG5cblx0cHJlcGFyZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGlkOiAgICAgdGhpcy5jaWQsXG5cdFx0XHR2YWx1ZTogIHRoaXMudmFsdWUsXG5cdFx0XHRjb25maWc6IHRoaXMuY29uZmlnXG5cdFx0fTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHdwLkJhY2tib25lLlZpZXcucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0dGhpcy50cmlnZ2VyKCAnbXBiOnJlbmRlcmVkJyApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZWZyZXNoIHZpZXcgYWZ0ZXIgc29ydC9jb2xsYXBzZSBldGMuXG5cdCAqL1xuXHRyZWZyZXNoOiBmdW5jdGlvbigpIHt9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGQ7XG4iLCJ2YXIgTW9kdWxlRWRpdCA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcbnZhciBNb2R1bGVFZGl0Rm9ybVJvdyA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQtZm9ybS1yb3cuanMnKTtcbnZhciBmaWVsZFZpZXdzID0gcmVxdWlyZSgnLi8uLi91dGlscy9maWVsZC12aWV3cy5qcycpO1xuXG4vKipcbiAqIEdlbmVyaWMgRWRpdCBGb3JtLlxuICpcbiAqIEhhbmRsZXMgYSB3aWRlIHJhbmdlIG9mIGdlbmVyaWMgZmllbGQgdHlwZXMuXG4gKiBGb3IgZWFjaCBhdHRyaWJ1dGUsIGl0IGNyZWF0ZXMgYSBmaWVsZCBiYXNlZCBvbiB0aGUgYXR0cmlidXRlICd0eXBlJ1xuICogQWxzbyB1c2VzIG9wdGlvbmFsIGF0dHJpYnV0ZSAnY29uZmlnJyBwcm9wZXJ0eSB3aGVuIGluaXRpYWxpemluZyBmaWVsZC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIGF0dHJpYnV0ZXMsIG9wdGlvbnMgXSApO1xuXG5cdFx0Ly8gdGhpcy5maWVsZHMgaXMgYW4gZWFzeSByZWZlcmVuY2UgZm9yIHRoZSBmaWVsZCB2aWV3cy5cblx0XHR2YXIgZmllbGRzVmlld3MgPSB0aGlzLmZpZWxkcyA9IFtdO1xuXHRcdHZhciBtb2RlbCAgICAgICA9IHRoaXMubW9kZWw7XG5cblx0XHQvLyBGb3IgZWFjaCBhdHRyaWJ1dGUgLVxuXHRcdC8vIGluaXRpYWxpemUgYSBmaWVsZCBmb3IgdGhhdCBhdHRyaWJ1dGUgJ3R5cGUnXG5cdFx0Ly8gU3RvcmUgaW4gdGhpcy5maWVsZHNcblx0XHQvLyBVc2UgY29uZmlnIGZyb20gdGhlIGF0dHJpYnV0ZVxuXHRcdHRoaXMubW9kZWwuZ2V0KCdhdHRyJykuZWFjaCggZnVuY3Rpb24oIGF0dHIgKSB7XG5cblx0XHRcdHZhciBmaWVsZFZpZXcsIHR5cGUsIG5hbWUsIGNvbmZpZywgdmlldztcblxuXHRcdFx0dHlwZSA9IGF0dHIuZ2V0KCd0eXBlJyk7XG5cblx0XHRcdGlmICggISB0eXBlIHx8ICEgKCB0eXBlIGluIGZpZWxkVmlld3MgKSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRmaWVsZFZpZXcgPSBmaWVsZFZpZXdzWyB0eXBlIF07XG5cdFx0XHRuYW1lICAgICAgPSBhdHRyLmdldCgnbmFtZScpO1xuXHRcdFx0Y29uZmlnICAgID0gYXR0ci5nZXQoJ2NvbmZpZycpIHx8IHt9O1xuXG5cdFx0XHR2aWV3ID0gbmV3IGZpZWxkVmlldygge1xuXHRcdFx0XHR2YWx1ZTogbW9kZWwuZ2V0QXR0clZhbHVlKCBuYW1lICksXG5cdFx0XHRcdGNvbmZpZzogY29uZmlnLFxuXHRcdFx0XHRvbkNoYW5nZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdFx0XHRcdG1vZGVsLnNldEF0dHJWYWx1ZSggbmFtZSwgdmFsdWUgKTtcblx0XHRcdFx0fSxcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLnZpZXdzLmFkZCggJy5tb2R1bGUtZWRpdC12aWV3JywgbmV3IE1vZHVsZUVkaXRGb3JtUm93KCB7XG5cdFx0XHRcdGxhYmVsOiBhdHRyLmdldCgnbGFiZWwnKSxcblx0XHRcdFx0ZGVzYzogIGF0dHIuZ2V0KCdkZXNjcmlwdGlvbicgKSxcblx0XHRcdFx0ZmllbGRWaWV3OiB2aWV3XG5cdFx0XHR9ICkgKTtcblxuXHRcdFx0ZmllbGRzVmlld3MucHVzaCggdmlldyApO1xuXG5cdFx0fS5iaW5kKCB0aGlzICkgKTtcblxuXHRcdC8vIENsZWFudXAuXG5cdFx0Ly8gUmVtb3ZlIGVhY2ggZmllbGQgdmlldyB3aGVuIHRoaXMgbW9kZWwgaXMgZGVzdHJveWVkLlxuXHRcdHRoaXMubW9kZWwub24oICdkZXN0cm95JywgZnVuY3Rpb24oKSB7XG5cdFx0XHRfLmVhY2goIHRoaXMuZmllbGRzLCBmdW5jdGlvbiggZmllbGQgKSB7XG5cdFx0XHRcdGZpZWxkLnJlbW92ZSgpO1xuXHRcdFx0fSApO1xuXHRcdH0gKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZWZyZXNoIHZpZXcuXG5cdCAqIFJlcXVpcmVkIGFmdGVyIHNvcnQvY29sbGFwc2UgZXRjLlxuXHQgKi9cblx0cmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0Xy5lYWNoKCB0aGlzLmZpZWxkcywgZnVuY3Rpb24oIGZpZWxkICkge1xuXHRcdFx0ZmllbGQucmVmcmVzaCgpO1xuXHRcdH0gKTtcblx0fSxcblxufSk7XG4iLCJ2YXIgd3AgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ10gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSB3cC5CYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLWZvcm0tcm93JyApLFxuXHRjbGFzc05hbWU6ICdmb3JtLXJvdycsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0aWYgKCAnZmllbGRWaWV3JyBpbiBvcHRpb25zICkge1xuXHRcdFx0dGhpcy52aWV3cy5zZXQoICcuZmllbGQnLCBvcHRpb25zLmZpZWxkVmlldyApO1xuXHRcdH1cblx0fSxcblxufSk7XG4iLCJ2YXIgd3AgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ10gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSB3cC5CYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbXBiLW1vZHVsZS1lZGl0LXRvb2xzJyApLFxuXHRjbGFzc05hbWU6ICdtb2R1bGUtZWRpdC10b29scycsXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIC5idXR0b24tc2VsZWN0aW9uLWl0ZW0tcmVtb3ZlJzogZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0dGhpcy50cmlnZ2VyKCAnbXBiOm1vZHVsZS1yZW1vdmUnICk7XG5cdFx0fSxcblx0XHQnY2xpY2sgLmJ1dHRvbi1zZWxlY3Rpb24taXRlbS10b2dnbGUnOiBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR0aGlzLnRyaWdnZXIoICdtcGI6bW9kdWxlLXRvZ2dsZS1jb2xsYXBzZWQnICk7XG5cdFx0XHRlLnRhcmdldC5ibHVyKCk7XG5cdFx0fSxcblx0fSxcblxufSk7XG4iLCJ2YXIgd3AgICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdFRvb2xzID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC10b29scy5qcycpO1xuXG4vKipcbiAqIFZlcnkgZ2VuZXJpYyBmb3JtIHZpZXcgaGFuZGxlci5cbiAqIFRoaXMgZG9lcyBzb21lIGJhc2ljIG1hZ2ljIGJhc2VkIG9uIGRhdGEgYXR0cmlidXRlcyB0byB1cGRhdGUgc2ltcGxlIHRleHQgZmllbGRzLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHdwLkJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogIHdwLnRlbXBsYXRlKCAnbXBiLW1vZHVsZS1lZGl0JyApLFxuXHRjbGFzc05hbWU6ICdtb2R1bGUtZWRpdCcsXG5cdGNvbGxhcHNlZDogZmFsc2UsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cblx0XHRfLmJpbmRBbGwoIHRoaXMsICdyZW1vdmVNb2RlbCcsICdyZWZyZXNoJywgJ3RvZ2dsZUNvbGxhcHNlZCcgKTtcblxuXHRcdHZhciB0b29scyA9IG5ldyBNb2R1bGVFZGl0VG9vbHMoIHtcblx0XHRcdGxhYmVsOiB0aGlzLm1vZGVsLmdldCggJ2xhYmVsJyApXG5cdFx0fSApO1xuXG5cdFx0dGhpcy52aWV3cy5zZXQoICcubW9kdWxlLWVkaXQtdG9vbHMtY29udGFpbmVyJywgdG9vbHMgKTtcblxuXHRcdHRvb2xzLm9uKCAnbXBiOm1vZHVsZS1yZW1vdmUnLCB0aGlzLnJlbW92ZU1vZGVsICk7XG5cdFx0dG9vbHMub24oICdtcGI6bW9kdWxlLXRvZ2dsZS1jb2xsYXBzZWQnLCB0aGlzLnRvZ2dsZUNvbGxhcHNlZCApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR3cC5CYWNrYm9uZS5WaWV3LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCAnbW9kdWxlLWNvbGxhcHNlZCcsIHRoaXMuY29sbGFwc2VkICk7XG5cdFx0dGhpcy4kZWwuYXR0ciggJ2RhdGEtY2lkJywgdGhpcy5tb2RlbC5jaWQgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvKipcblx0ICogUmVtb3ZlIG1vZGVsIGhhbmRsZXIuXG5cdCAqL1xuXHRyZW1vdmVNb2RlbDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5yZW1vdmUoKTtcblx0XHR0aGlzLm1vZGVsLmRlc3Ryb3koKTtcblx0fSxcblxuXHQvKipcblx0ICogUmVmcmVzaCB2aWV3LlxuXHQgKiBSZXF1aXJlZCBhZnRlciBzb3J0L2NvbGxhcHNlIGV0Yy5cblx0ICovXG5cdHJlZnJlc2g6IGZ1bmN0aW9uKCkge30sXG5cblx0dG9nZ2xlQ29sbGFwc2VkOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNvbGxhcHNlZCA9ICEgdGhpcy5jb2xsYXBzZWQ7XG5cdFx0dGhpcy50cmlnZ2VyKCAnbXBiOm1vZHVsZS10b2dnbGUtY29sbGFwc2VkJywgdGhpcyApO1xuXHRcdHRoaXMucmVuZGVyKCk7XG5cdH1cblxufSk7XG4iXX0=
