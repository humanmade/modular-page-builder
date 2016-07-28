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

},{"./models/builder.js":4,"./utils/edit-views.js":8,"./utils/field-views.js":9,"./utils/module-factory.js":10,"./views/builder.js":11,"./views/fields/field-attachment.js":12,"./views/fields/field-link.js":14,"./views/fields/field-post-select.js":16,"./views/fields/field-text.js":18,"./views/fields/field-textarea.js":19,"./views/fields/field-wysiwyg.js":20,"./views/fields/field.js":21,"./views/module-edit-default.js":22,"./views/module-edit.js":23}],4:[function(require,module,exports){
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
var Backbone      = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var Builder       = require('./../models/builder.js');
var ModuleFactory = require('./../utils/module-factory.js');
var $             = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var Builder = Backbone.View.extend({

	template: _.template( $('#tmpl-mpb-builder' ).html() ),
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

		this.$el.html( this.template( data ) );

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

		var $select        = this.$el.find( '> .add-new select.add-new-module-select' ),
			optionTemplate = _.template( '<option value="<%= name %>"><%= label %></option>' );

		$select.append(
			$( '<option/>', { text: modularPageBuilderData.l10n.selectDefault } )
		);

		_.each( this.model.getAvailableModules(), function( module ) {
			$select.append( optionTemplate( module ) );
		} );

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
				ui.item.trigger('mpb-sort-stop');
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

		$( '> .selection', this.$el ).append( view.render().$el );

		var $selection = $( '> .selection', this.$el );
		if ( $selection.hasClass('ui-sortable') ) {
			$selection.sortable('refresh');
		}

	},

});

module.exports = Builder;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../models/builder.js":4,"./../utils/module-factory.js":10}],12:[function(require,module,exports){
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

	template:  _.template( $( '#tmpl-mpb-field-attachment' ).html() ),
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

	render: function() {

		var template;

		template = _.memoize( function( value, config ) {
			return this.template( {
				value: value,
				config: config,
			} );
		}.bind(this) );

		this.$el.html( template( this.selection.toJSON(), this.config ) );

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
var Field = require('./field.js');

var FieldText = Field.extend({

	template:  _.template( '<label><input type="checkbox" <% if ( id ) { %>id="<%= id %>"<% } %> <% if ( value ) { %>checked="checked"<% } %>><%= config.label %></label>' ),

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
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Field = require('./field.js');

var FieldLink = Field.extend({

	template: _.template( $( '#tmpl-mpb-field-link' ).html() ),

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
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var FieldText = require('./field-text.js');

var FieldNumber = FieldText.extend({

	template: _.template( $( '#tmpl-mpb-field-number' ).html() ),

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

var $           = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Field       = require('./field.js');

/**
 * Text Field View
 *
 * You can use this anywhere.
 * Just listen for 'change' event on the view.
 */
var FieldPostSelect = Field.extend({

	template: _.template( $( '#tmpl-mpb-field-text' ).html() ),

	defaultConfig: {
		multiple: true,
		postType: 'post'
	},

	events: {
		'change input': 'inputChanged'
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

		var value, data;

		value = this.getValue();
		value = Array.isArray( value ) ? value.join( ',' ) : value;

		data = {
			id: this.cid,
			value: value,
			config: {}
		};

		this.$el.html( this.template( data ) );

		this.initSelect2();

		return this;

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
var Field = require('./field.js');

/**
 * Text Field View
 *
 * You can use this anywhere.
 * Just listen for 'change' event on the view.
 */
var FieldSelect = Field.extend({

	template: _.template( $( '#tmpl-mpb-field-select' ).html() ),
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
var $     = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Field = require('./field.js');

var FieldText = Field.extend({

	template: _.template( $( '#tmpl-mpb-field-text' ).html() ),

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
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var FieldText = require('./field-text.js');

var FieldTextarea = FieldText.extend({

	template: _.template( $( '#tmpl-mpb-field-textarea' ).html() ),

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
var Field = require('./field.js');

/**
 * Text Field View
 *
 * You can use this anywhere.
 * Just listen for 'change' event on the view.
 */
var FieldWYSIWYG = Field.extend({

	template: $( '#tmpl-mpb-field-wysiwyg' ).html(),
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
		this.template  = _.template( this.template );

		this.on( 'mpb-sort-stop', this.render );

	},

	render: function () {

		// Create element from template.
		this.$el.html( this.template( { value: this.getValue() } ) );

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

		// If found. Remove so we can re-init.
		if ( ed ) {
			tinyMCE.execCommand( 'mceRemoveEditor', false, this.editor.id );
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
		$('#' + this.editor.id ).on( 'keydown change', function() {
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
		tinyMCE.execCommand( 'mceRemoveEditor', false, this.editor.id );
	},

} );

module.exports = FieldWYSIWYG;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field.js":21}],21:[function(require,module,exports){
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

	render: function() {

		var data = {
			id:     this.cid,
			value:  this.value,
			config: this.config
		};

		if ( typeof this.template === 'string' ) {
			this.template = _.template( this.template );
		}

		this.$el.html( this.template( data ) );
		return this;
	}

} );

module.exports = Field;

},{}],22:[function(require,module,exports){
(function (global){
var $               = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit      = require('./module-edit.js');
var fieldViews      = require('./../utils/field-views.js');

/**
 * Generic Edit Form.
 *
 * Handles a wide range of generic field types.
 * For each attribute, it creates a field based on the attribute 'type'
 * Also uses optional attribute 'config' property when initializing field.
 */
var ModuleEditDefault = ModuleEdit.extend({

	rowTemplate: _.template( $('#tmpl-mpb-form-row' ).html() ),

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		_.bindAll( this, 'render' );

		var fields = this.fields = {};
		var model  = this.model;

		// For each attribute -
		// initialize a field for that attribute 'type'
		// Store in this.fields
		// Use config from the attribute
		this.model.get('attr').each( function( singleAttr ) {

			var fieldView, type, name, config;

			type = singleAttr.get('type');

			if ( type && ( type in fieldViews ) ) {

				fieldView = fieldViews[ type ];
				name      = singleAttr.get('name');
				config    = singleAttr.get('config') || {};

				fields[ name ] = new fieldView({
					value: model.getAttrValue( name ),
					config: config,
					onChange: function( value ) {
						model.setAttrValue( name, value );
					},
				});

			}

		} );

		// Cleanup.
		// Remove each field view when this model is destroyed.
		this.model.on( 'destroy', function() {
			_.each( fields, function(field) {
				field.remove();
			} );
		} );

	},

	render: function() {

		// Call default ModuleEdeit render.
		ModuleEdit.prototype.render.apply( this );

		var $el = this.$el;

		// For each field, render sub-view and append to this.$el
		// Uses this.rowTemplate.
		_.each( this.fields, function( field, name ) {

			var attr = this.model.getAttr( name );

			// Create row element from template.
			var $row = $( this.rowTemplate( {
				label: attr.get('label'),
				desc:  attr.get('description' ),
			} ) );

			$( '.field', $row ).append( field.render().$el );
			$el.append( $row );

		}.bind(this) );

		// Trigger the mbp-sort-stop event for each field.
		this.$el.on( 'mpb-sort-stop', function() {
			_.each( this.fields, function( field ) {
				field.trigger( 'mpb-sort-stop' );
			} );
		}.bind(this) );

		return this;

	},

});

module.exports = ModuleEditDefault;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../utils/field-views.js":9,"./module-edit.js":23}],23:[function(require,module,exports){
(function (global){
var Backbone   = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

/**
 * Very generic form view handler.
 * This does some basic magic based on data attributes to update simple text fields.
 */
var ModuleEdit = Backbone.View.extend({

	className:     'module-edit',
	toolsTemplate: _.template( $('#tmpl-mpb-module-edit-tools' ).html() ),

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

		// ID attribute, so we can connect the view and model again later.
		this.$el.attr( 'data-cid', this.model.cid );

		// Append the module tools.
		this.$el.prepend( this.toolsTemplate( data ) );

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvc3JjL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9nbG9iYWxzLmpzIiwiYXNzZXRzL2pzL3NyYy9tb2RlbHMvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMiLCJhc3NldHMvanMvc3JjL21vZGVscy9tb2R1bGUuanMiLCJhc3NldHMvanMvc3JjL21vZHVsYXItcGFnZS1idWlsZGVyLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9lZGl0LXZpZXdzLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9maWVsZC12aWV3cy5qcyIsImFzc2V0cy9qcy9zcmMvdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2J1aWxkZXIuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1hdHRhY2htZW50LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtY2hlY2tib3guanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1saW5rLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtbnVtYmVyLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtcG9zdC1zZWxlY3QuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1zZWxlY3QuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC10ZXh0LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtdGV4dGFyZWEuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC13eXNpd3lnLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWRlZmF1bHQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGVBdHRyaWJ1dGUgPSByZXF1aXJlKCcuLy4uL21vZGVscy9tb2R1bGUtYXR0cmlidXRlLmpzJyk7XG5cbi8qKlxuICogU2hvcnRjb2RlIEF0dHJpYnV0ZXMgY29sbGVjdGlvbi5cbiAqL1xudmFyIFNob3J0Y29kZUF0dHJpYnV0ZXMgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cblx0bW9kZWwgOiBNb2R1bGVBdHRyaWJ1dGUsXG5cblx0Ly8gRGVlcCBDbG9uZS5cblx0Y2xvbmU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvciggXy5tYXAoIHRoaXMubW9kZWxzLCBmdW5jdGlvbihtKSB7XG5cdFx0XHRyZXR1cm4gbS5jbG9uZSgpO1xuXHRcdH0pKTtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIG9ubHkgdGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBzYXZlZC5cblx0ICpcblx0ICogQHJldHVybiBvYmplY3Rcblx0ICovXG5cdHRvTWljcm9KU09OOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBqc29uID0ge307XG5cblx0XHR0aGlzLmVhY2goIGZ1bmN0aW9uKCBtb2RlbCApIHtcblx0XHRcdGpzb25bIG1vZGVsLmdldCggJ25hbWUnICkgXSA9IG1vZGVsLnRvTWljcm9KU09OKCk7XG5cdFx0fSApO1xuXG5cdFx0cmV0dXJuIGpzb247XG5cdH0sXG5cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2hvcnRjb2RlQXR0cmlidXRlcztcbiIsInZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZSAgID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvbW9kdWxlLmpzJyk7XG5cbi8vIFNob3J0Y29kZSBDb2xsZWN0aW9uXG52YXIgTW9kdWxlcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblxuXHRtb2RlbCA6IE1vZHVsZSxcblxuXHQvLyAgRGVlcCBDbG9uZS5cblx0Y2xvbmUgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoIF8ubWFwKCB0aGlzLm1vZGVscywgZnVuY3Rpb24obSkge1xuXHRcdFx0cmV0dXJuIG0uY2xvbmUoKTtcblx0XHR9KSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybiBvbmx5IHRoZSBkYXRhIHRoYXQgbmVlZHMgdG8gYmUgc2F2ZWQuXG5cdCAqXG5cdCAqIEByZXR1cm4gb2JqZWN0XG5cdCAqL1xuXHR0b01pY3JvSlNPTjogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0cmV0dXJuIHRoaXMubWFwKCBmdW5jdGlvbihtb2RlbCkgeyByZXR1cm4gbW9kZWwudG9NaWNyb0pTT04oIG9wdGlvbnMgKTsgfSApO1xuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGVzO1xuIiwiLy8gRXhwb3NlIHNvbWUgZnVuY3Rpb25hbGl0eSBnbG9iYWxseS5cbnZhciBnbG9iYWxzID0ge1xuXHRCdWlsZGVyOiAgICAgICByZXF1aXJlKCcuL21vZGVscy9idWlsZGVyLmpzJyksXG5cdE1vZHVsZUZhY3Rvcnk6IHJlcXVpcmUoJy4vdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMnKSxcblx0ZWRpdFZpZXdzOiAgICAgcmVxdWlyZSgnLi91dGlscy9lZGl0LXZpZXdzLmpzJyksXG5cdGZpZWxkVmlld3M6ICAgIHJlcXVpcmUoJy4vdXRpbHMvZmllbGQtdmlld3MuanMnKSxcblx0dmlld3M6IHtcblx0XHRCdWlsZGVyVmlldzogICAgIHJlcXVpcmUoJy4vdmlld3MvYnVpbGRlci5qcycpLFxuXHRcdE1vZHVsZUVkaXQ6ICAgICAgcmVxdWlyZSgnLi92aWV3cy9tb2R1bGUtZWRpdC5qcycpLFxuXHRcdE1vZHVsZUVkaXREZWZhdWx0OiByZXF1aXJlKCcuL3ZpZXdzL21vZHVsZS1lZGl0LWRlZmF1bHQuanMnKSxcblx0XHRGaWVsZDogICAgICAgICAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLmpzJyksXG5cdFx0RmllbGRMaW5rOiAgICAgICByZXF1aXJlKCcuL3ZpZXdzL2ZpZWxkcy9maWVsZC1saW5rLmpzJyksXG5cdFx0RmllbGRBdHRhY2htZW50OiByZXF1aXJlKCcuL3ZpZXdzL2ZpZWxkcy9maWVsZC1hdHRhY2htZW50LmpzJyksXG5cdFx0RmllbGRUZXh0OiAgICAgICByZXF1aXJlKCcuL3ZpZXdzL2ZpZWxkcy9maWVsZC10ZXh0LmpzJyksXG5cdFx0RmllbGRUZXh0YXJlYTogICByZXF1aXJlKCcuL3ZpZXdzL2ZpZWxkcy9maWVsZC10ZXh0YXJlYS5qcycpLFxuXHRcdEZpZWxkV3lzaXd5ZzogICAgcmVxdWlyZSgnLi92aWV3cy9maWVsZHMvZmllbGQtd3lzaXd5Zy5qcycpLFxuXHRcdEZpZWxkUG9zdFNlbGVjdDogcmVxdWlyZSgnLi92aWV3cy9maWVsZHMvZmllbGQtcG9zdC1zZWxlY3QuanMnKSxcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnbG9iYWxzO1xuIiwidmFyIEJhY2tib25lICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGVzICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzJyk7XG52YXIgTW9kdWxlRmFjdG9yeSAgICA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMnKTtcblxudmFyIEJ1aWxkZXIgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXG5cdGRlZmF1bHRzOiB7XG5cdFx0c2VsZWN0RGVmYXVsdDogIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEubDEwbi5zZWxlY3REZWZhdWx0LFxuXHRcdGFkZE5ld0J1dHRvbjogICBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhLmwxMG4uYWRkTmV3QnV0dG9uLFxuXHRcdHNlbGVjdGlvbjogICAgICBbXSwgLy8gSW5zdGFuY2Ugb2YgTW9kdWxlcy4gQ2FuJ3QgdXNlIGEgZGVmYXVsdCwgb3RoZXJ3aXNlIHRoZXkgd29uJ3QgYmUgdW5pcXVlLlxuXHRcdGFsbG93ZWRNb2R1bGVzOiBbXSwgLy8gTW9kdWxlIG5hbWVzIGFsbG93ZWQgZm9yIHRoaXMgYnVpbGRlci5cblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblxuXHRcdC8vIFNldCBkZWZhdWx0IHNlbGVjdGlvbiB0byBlbnN1cmUgaXQgaXNuJ3QgYSByZWZlcmVuY2UuXG5cdFx0aWYgKCAhICggdGhpcy5nZXQoJ3NlbGVjdGlvbicpIGluc3RhbmNlb2YgTW9kdWxlcyApICkge1xuXHRcdFx0dGhpcy5zZXQoICdzZWxlY3Rpb24nLCBuZXcgTW9kdWxlcygpICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0c2V0RGF0YTogZnVuY3Rpb24oIGRhdGEgKSB7XG5cblx0XHR2YXIgc2VsZWN0aW9uO1xuXG5cdFx0aWYgKCAnJyA9PT0gZGF0YSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBIYW5kbGUgZWl0aGVyIEpTT04gc3RyaW5nIG9yIHByb3BlciBvYmhlY3QuXG5cdFx0ZGF0YSA9ICggJ3N0cmluZycgPT09IHR5cGVvZiBkYXRhICkgPyBKU09OLnBhcnNlKCBkYXRhICkgOiBkYXRhO1xuXG5cdFx0Ly8gQ29udmVydCBzYXZlZCBkYXRhIHRvIE1vZHVsZSBtb2RlbHMuXG5cdFx0aWYgKCBkYXRhICYmIEFycmF5LmlzQXJyYXkoIGRhdGEgKSApIHtcblx0XHRcdHNlbGVjdGlvbiA9IGRhdGEubWFwKCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0XHRyZXR1cm4gTW9kdWxlRmFjdG9yeS5jcmVhdGUoIG1vZHVsZS5uYW1lLCBtb2R1bGUuYXR0ciApO1xuXHRcdFx0fSApO1xuXHRcdH1cblxuXHRcdC8vIFJlc2V0IHNlbGVjdGlvbiB1c2luZyBkYXRhIGZyb20gaGlkZGVuIGlucHV0LlxuXHRcdGlmICggc2VsZWN0aW9uICYmIHNlbGVjdGlvbi5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLmdldCgnc2VsZWN0aW9uJykuYWRkKCBzZWxlY3Rpb24gKTtcblx0XHR9XG5cblx0fSxcblxuXHRzYXZlRGF0YTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZGF0YSA9IFtdO1xuXG5cdFx0dGhpcy5nZXQoJ3NlbGVjdGlvbicpLmVhY2goIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cblx0XHRcdC8vIFNraXAgZW1wdHkvYnJva2VuIG1vZHVsZXMuXG5cdFx0XHRpZiAoICEgbW9kdWxlLmdldCgnbmFtZScgKSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRkYXRhLnB1c2goIG1vZHVsZS50b01pY3JvSlNPTigpICk7XG5cblx0XHR9ICk7XG5cblx0XHR0aGlzLnRyaWdnZXIoICdzYXZlJywgZGF0YSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIExpc3QgYWxsIGF2YWlsYWJsZSBtb2R1bGVzIGZvciB0aGlzIGJ1aWxkZXIuXG5cdCAqIEFsbCBtb2R1bGVzLCBmaWx0ZXJlZCBieSB0aGlzLmFsbG93ZWRNb2R1bGVzLlxuXHQgKi9cblx0Z2V0QXZhaWxhYmxlTW9kdWxlczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIF8uZmlsdGVyKCBNb2R1bGVGYWN0b3J5LmF2YWlsYWJsZU1vZHVsZXMsIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5pc01vZHVsZUFsbG93ZWQoIG1vZHVsZS5uYW1lICk7XG5cdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0fSxcblxuXHRpc01vZHVsZUFsbG93ZWQ6IGZ1bmN0aW9uKCBtb2R1bGVOYW1lICkge1xuXHRcdHJldHVybiB0aGlzLmdldCgnYWxsb3dlZE1vZHVsZXMnKS5pbmRleE9mKCBtb2R1bGVOYW1lICkgPj0gMDtcblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCdWlsZGVyO1xuIiwidmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5cbnZhciBNb2R1bGVBdHRyaWJ1dGUgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXG5cdGRlZmF1bHRzOiB7XG5cdFx0bmFtZTogICAgICAgICAnJyxcblx0XHRsYWJlbDogICAgICAgICcnLFxuXHRcdHZhbHVlOiAgICAgICAgJycsXG5cdFx0dHlwZTogICAgICAgICAndGV4dCcsXG5cdFx0ZGVzY3JpcHRpb246ICAnJyxcblx0XHRkZWZhdWx0VmFsdWU6ICcnLFxuXHRcdGNvbmZpZzogICAgICAge31cblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIG9ubHkgdGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBzYXZlZC5cblx0ICpcblx0ICogQHJldHVybiBvYmplY3Rcblx0ICovXG5cdHRvTWljcm9KU09OOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciByID0ge307XG5cdFx0dmFyIGFsbG93ZWRBdHRyUHJvcGVydGllcyA9IFsgJ25hbWUnLCAndmFsdWUnLCAndHlwZScgXTtcblxuXHRcdF8uZWFjaCggYWxsb3dlZEF0dHJQcm9wZXJ0aWVzLCBmdW5jdGlvbiggcHJvcCApIHtcblx0XHRcdHJbIHByb3AgXSA9IHRoaXMuZ2V0KCBwcm9wICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHRyZXR1cm4gcjtcblxuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZUF0dHJpYnV0ZTtcbiIsInZhciBCYWNrYm9uZSAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgTW9kdWxlQXR0cyA9IHJlcXVpcmUoJy4vLi4vY29sbGVjdGlvbnMvbW9kdWxlLWF0dHJpYnV0ZXMuanMnKTtcblxudmFyIE1vZHVsZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRuYW1lOiAgJycsXG5cdFx0bGFiZWw6ICcnLFxuXHRcdGF0dHI6ICBbXSxcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblxuXHRcdC8vIFNldCBkZWZhdWx0IHNlbGVjdGlvbiB0byBlbnN1cmUgaXQgaXNuJ3QgYSByZWZlcmVuY2UuXG5cdFx0aWYgKCAhICggdGhpcy5nZXQoJ2F0dHInKSBpbnN0YW5jZW9mIE1vZHVsZUF0dHMgKSApIHtcblx0XHRcdHRoaXMuc2V0KCAnYXR0cicsIG5ldyBNb2R1bGVBdHRzKCkgKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogSGVscGVyIGZvciBnZXR0aW5nIGFuIGF0dHJpYnV0ZSBtb2RlbCBieSBuYW1lLlxuXHQgKi9cblx0Z2V0QXR0cjogZnVuY3Rpb24oIGF0dHJOYW1lICkge1xuXHRcdHJldHVybiB0aGlzLmdldCgnYXR0cicpLmZpbmRXaGVyZSggeyBuYW1lOiBhdHRyTmFtZSB9KTtcblx0fSxcblxuXHQvKipcblx0ICogSGVscGVyIGZvciBzZXR0aW5nIGFuIGF0dHJpYnV0ZSB2YWx1ZVxuXHQgKlxuXHQgKiBOb3RlIG1hbnVhbCBjaGFuZ2UgZXZlbnQgdHJpZ2dlciB0byBlbnN1cmUgZXZlcnl0aGluZyBpcyB1cGRhdGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gc3RyaW5nIGF0dHJpYnV0ZVxuXHQgKiBAcGFyYW0gbWl4ZWQgIHZhbHVlXG5cdCAqL1xuXHRzZXRBdHRyVmFsdWU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGUsIHZhbHVlICkge1xuXG5cdFx0dmFyIGF0dHIgPSB0aGlzLmdldEF0dHIoIGF0dHJpYnV0ZSApO1xuXG5cdFx0aWYgKCBhdHRyICkge1xuXHRcdFx0YXR0ci5zZXQoICd2YWx1ZScsIHZhbHVlICk7XG5cdFx0XHR0aGlzLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEhlbHBlciBmb3IgZ2V0dGluZyBhbiBhdHRyaWJ1dGUgdmFsdWUuXG5cdCAqXG5cdCAqIERlZmF1bHRzIHRvIG51bGwuXG5cdCAqXG5cdCAqIEBwYXJhbSBzdHJpbmcgYXR0cmlidXRlXG5cdCAqL1xuXHRnZXRBdHRyVmFsdWU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGUgKSB7XG5cblx0XHR2YXIgYXR0ciA9IHRoaXMuZ2V0QXR0ciggYXR0cmlidXRlICk7XG5cblx0XHRpZiAoIGF0dHIgKSB7XG5cdFx0XHRyZXR1cm4gYXR0ci5nZXQoICd2YWx1ZScgKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogQ3VzdG9tIFBhcnNlLlxuXHQgKiBFbnN1cmVzIGF0dHJpYnV0ZXMgaXMgYW4gaW5zdGFuY2Ugb2YgTW9kdWxlQXR0c1xuXHQgKi9cblx0cGFyc2U6IGZ1bmN0aW9uKCByZXNwb25zZSApIHtcblxuXHRcdGlmICggJ2F0dHInIGluIHJlc3BvbnNlICYmICEgKCByZXNwb25zZS5hdHRyIGluc3RhbmNlb2YgTW9kdWxlQXR0cyApICkge1xuXHRcdFx0cmVzcG9uc2UuYXR0ciA9IG5ldyBNb2R1bGVBdHRzKCByZXNwb25zZS5hdHRyICk7XG5cdFx0fVxuXG5cdCAgICByZXR1cm4gcmVzcG9uc2U7XG5cblx0fSxcblxuXHR0b0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGpzb24gPSBfLmNsb25lKCB0aGlzLmF0dHJpYnV0ZXMgKTtcblxuXHRcdGlmICggJ2F0dHInIGluIGpzb24gJiYgKCBqc29uLmF0dHIgaW5zdGFuY2VvZiBNb2R1bGVBdHRzICkgKSB7XG5cdFx0XHRqc29uLmF0dHIgPSBqc29uLmF0dHIudG9KU09OKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGpzb247XG5cblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIG9ubHkgdGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBzYXZlZC5cblx0ICpcblx0ICogQHJldHVybiBvYmplY3Rcblx0ICovXG5cdHRvTWljcm9KU09OOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bmFtZTogdGhpcy5nZXQoJ25hbWUnKSxcblx0XHRcdGF0dHI6IHRoaXMuZ2V0KCdhdHRyJykudG9NaWNyb0pTT04oKVxuXHRcdH07XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZTtcbiIsInZhciAkICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBCdWlsZGVyICAgICAgID0gcmVxdWlyZSgnLi9tb2RlbHMvYnVpbGRlci5qcycpO1xudmFyIEJ1aWxkZXJWaWV3ICAgPSByZXF1aXJlKCcuL3ZpZXdzL2J1aWxkZXIuanMnKTtcbnZhciBNb2R1bGVGYWN0b3J5ID0gcmVxdWlyZSgnLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpO1xuXG4vLyBFeHBvc2Ugc29tZSBmdW5jdGlvbmFsaXR5IHRvIGdsb2JhbCBuYW1lc3BhY2UuXG53aW5kb3cubW9kdWxhclBhZ2VCdWlsZGVyID0gcmVxdWlyZSgnLi9nbG9iYWxzJyk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cblx0TW9kdWxlRmFjdG9yeS5pbml0KCk7XG5cblx0Ly8gQSBmaWVsZCBmb3Igc3RvcmluZyB0aGUgYnVpbGRlciBkYXRhLlxuXHR2YXIgJGZpZWxkID0gJCggJ1tuYW1lPW1vZHVsYXItcGFnZS1idWlsZGVyLWRhdGFdJyApO1xuXG5cdGlmICggISAkZmllbGQubGVuZ3RoICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIEEgY29udGFpbmVyIGVsZW1lbnQgZm9yIGRpc3BsYXlpbmcgdGhlIGJ1aWxkZXIuXG5cdHZhciAkY29udGFpbmVyID0gJCggJyNtb2R1bGFyLXBhZ2UtYnVpbGRlcicgKTtcblxuXHQvLyBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQnVpbGRlciBtb2RlbC5cblx0Ly8gUGFzcyBhbiBhcnJheSBvZiBtb2R1bGUgbmFtZXMgdGhhdCBhcmUgYWxsb3dlZCBmb3IgdGhpcyBidWlsZGVyLlxuXHR2YXIgYnVpbGRlciA9IG5ldyBCdWlsZGVyKHtcblx0XHRhbGxvd2VkTW9kdWxlczogJCggJ1tuYW1lPW1vZHVsYXItcGFnZS1idWlsZGVyLWFsbG93ZWQtbW9kdWxlc10nICkudmFsKCkuc3BsaXQoJywnKVxuXHR9KTtcblxuXHQvLyBTZXQgdGhlIGRhdGEgdXNpbmcgdGhlIGN1cnJlbnQgZmllbGQgdmFsdWVcblx0YnVpbGRlci5zZXREYXRhKCBKU09OLnBhcnNlKCAkZmllbGQudmFsKCkgKSApO1xuXG5cdC8vIE9uIHNhdmUsIHVwZGF0ZSB0aGUgZmllbGQgdmFsdWUuXG5cdGJ1aWxkZXIub24oICdzYXZlJywgZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0JGZpZWxkLnZhbCggSlNPTi5zdHJpbmdpZnkoIGRhdGEgKSApO1xuXHR9ICk7XG5cblx0Ly8gQ3JlYXRlIGJ1aWxkZXIgdmlldy5cblx0dmFyIGJ1aWxkZXJWaWV3ID0gbmV3IEJ1aWxkZXJWaWV3KCB7IG1vZGVsOiBidWlsZGVyIH0gKTtcblxuXHQvLyBSZW5kZXIgYnVpbGRlci5cblx0YnVpbGRlclZpZXcucmVuZGVyKCkuJGVsLmFwcGVuZFRvKCAkY29udGFpbmVyICk7XG5cbn0pO1xuIiwidmFyIE1vZHVsZUVkaXREZWZhdWx0ID0gcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC1kZWZhdWx0LmpzJyk7XG5cbi8qKlxuICogTWFwIG1vZHVsZSB0eXBlIHRvIHZpZXdzLlxuICovXG52YXIgZWRpdFZpZXdzID0ge1xuXHQnZGVmYXVsdCc6IE1vZHVsZUVkaXREZWZhdWx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVkaXRWaWV3cztcbiIsInZhciBGaWVsZFRleHQgICAgICAgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL2ZpZWxkcy9maWVsZC10ZXh0LmpzJyk7XG52YXIgRmllbGRUZXh0YXJlYSAgID0gcmVxdWlyZSgnLi8uLi92aWV3cy9maWVsZHMvZmllbGQtdGV4dGFyZWEuanMnKTtcbnZhciBGaWVsZFdZU0lXWUcgICAgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL2ZpZWxkcy9maWVsZC13eXNpd3lnLmpzJyk7XG52YXIgRmllbGRBdHRhY2htZW50ID0gcmVxdWlyZSgnLi8uLi92aWV3cy9maWVsZHMvZmllbGQtYXR0YWNobWVudC5qcycpO1xudmFyIEZpZWxkTGluayAgICAgICA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLWxpbmsuanMnKTtcbnZhciBGaWVsZE51bWJlciAgICAgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL2ZpZWxkcy9maWVsZC1udW1iZXIuanMnKTtcbnZhciBGaWVsZENoZWNrYm94ICAgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL2ZpZWxkcy9maWVsZC1jaGVja2JveC5qcycpO1xudmFyIEZpZWxkU2VsZWN0ICAgICA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLXNlbGVjdC5qcycpO1xudmFyIEZpZWxkUG9zdFNlbGVjdCA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLXBvc3Qtc2VsZWN0LmpzJyk7XG5cbnZhciBmaWVsZFZpZXdzID0ge1xuXHR0ZXh0OiAgICAgICAgRmllbGRUZXh0LFxuXHR0ZXh0YXJlYTogICAgRmllbGRUZXh0YXJlYSxcblx0aHRtbDogICAgICAgIEZpZWxkV1lTSVdZRyxcblx0bnVtYmVyOiAgICAgIEZpZWxkTnVtYmVyLFxuXHRhdHRhY2htZW50OiAgRmllbGRBdHRhY2htZW50LFxuXHRsaW5rOiAgICAgICAgRmllbGRMaW5rLFxuXHRjaGVja2JveDogICAgRmllbGRDaGVja2JveCxcblx0c2VsZWN0OiAgICAgIEZpZWxkU2VsZWN0LFxuXHRwb3N0X3NlbGVjdDogRmllbGRQb3N0U2VsZWN0LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmaWVsZFZpZXdzO1xuIiwidmFyIE1vZHVsZSAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL21vZGVscy9tb2R1bGUuanMnKTtcbnZhciBNb2R1bGVBdHRzICAgICAgID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGUtYXR0cmlidXRlcy5qcycpO1xudmFyIGVkaXRWaWV3cyAgICAgICAgPSByZXF1aXJlKCcuL2VkaXQtdmlld3MuanMnKTtcbnZhciAkICAgICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxudmFyIE1vZHVsZUZhY3RvcnkgPSB7XG5cblx0YXZhaWxhYmxlTW9kdWxlczogW10sXG5cblx0aW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhICYmICdhdmFpbGFibGVfbW9kdWxlcycgaW4gbW9kdWxhclBhZ2VCdWlsZGVyRGF0YSApIHtcblx0XHRcdF8uZWFjaCggbW9kdWxhclBhZ2VCdWlsZGVyRGF0YS5hdmFpbGFibGVfbW9kdWxlcywgZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdFx0dGhpcy5yZWdpc3Rlck1vZHVsZSggbW9kdWxlICk7XG5cdFx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHRcdH1cblx0fSxcblxuXHRyZWdpc3Rlck1vZHVsZTogZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHR0aGlzLmF2YWlsYWJsZU1vZHVsZXMucHVzaCggbW9kdWxlICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENyZWF0ZSBNb2R1bGUgTW9kZWwuXG5cdCAqIFVzZSBkYXRhIGZyb20gY29uZmlnLCBwbHVzIHNhdmVkIGRhdGEuXG5cdCAqXG5cdCAqIEBwYXJhbSAgc3RyaW5nIG1vZHVsZU5hbWVcblx0ICogQHBhcmFtICBvYmplY3QgYXR0cmlidXRlIEpTT04uIFNhdmVkIGF0dHJpYnV0ZSB2YWx1ZXMuXG5cdCAqIEByZXR1cm4gTW9kdWxlXG5cdCAqL1xuXHRjcmVhdGU6IGZ1bmN0aW9uKCBtb2R1bGVOYW1lLCBhdHRyRGF0YSApIHtcblxuXHRcdHZhciBkYXRhID0gJC5leHRlbmQoIHRydWUsIHt9LCBfLmZpbmRXaGVyZSggdGhpcy5hdmFpbGFibGVNb2R1bGVzLCB7IG5hbWU6IG1vZHVsZU5hbWUgfSApICk7XG5cblx0XHRpZiAoICEgZGF0YSApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXG5cdFx0dmFyIGF0dHJpYnV0ZXMgPSBuZXcgTW9kdWxlQXR0cygpO1xuXG5cdFx0LyoqXG5cdFx0ICogQWRkIGFsbCB0aGUgbW9kdWxlIGF0dHJpYnV0ZXMuXG5cdFx0ICogV2hpdGVsaXN0ZWQgdG8gYXR0cmlidXRlcyBkb2N1bWVudGVkIGluIHNjaGVtYVxuXHRcdCAqIFNldHMgb25seSB2YWx1ZSBmcm9tIGF0dHJEYXRhLlxuXHRcdCAqL1xuXHRcdF8uZWFjaCggZGF0YS5hdHRyLCBmdW5jdGlvbiggYXR0ciApIHtcblxuXHRcdFx0dmFyIGNsb25lQXR0ciA9ICQuZXh0ZW5kKCB0cnVlLCB7fSwgYXR0ciAgKTtcblx0XHRcdHZhciBzYXZlZEF0dHIgPSBfLmZpbmRXaGVyZSggYXR0ckRhdGEsIHsgbmFtZTogYXR0ci5uYW1lIH0gKTtcblxuXHRcdFx0Ly8gQWRkIHNhdmVkIGF0dHJpYnV0ZSB2YWx1ZXMuXG5cdFx0XHRpZiAoIHNhdmVkQXR0ciAmJiAndmFsdWUnIGluIHNhdmVkQXR0ciApIHtcblx0XHRcdFx0Y2xvbmVBdHRyLnZhbHVlID0gc2F2ZWRBdHRyLnZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHRhdHRyaWJ1dGVzLmFkZCggY2xvbmVBdHRyICk7XG5cblx0XHR9ICk7XG5cblx0XHRkYXRhLmF0dHIgPSBhdHRyaWJ1dGVzO1xuXG5cdCAgICByZXR1cm4gbmV3IE1vZHVsZSggZGF0YSApO1xuXG5cdH0sXG5cblx0Y3JlYXRlRWRpdFZpZXc6IGZ1bmN0aW9uKCBtb2RlbCApIHtcblxuXHRcdHZhciBlZGl0VmlldywgbW9kdWxlTmFtZTtcblxuXHRcdG1vZHVsZU5hbWUgPSBtb2RlbC5nZXQoJ25hbWUnKTtcblx0XHRlZGl0VmlldyAgID0gKCBuYW1lIGluIGVkaXRWaWV3cyApID8gZWRpdFZpZXdzWyBtb2R1bGVOYW1lIF0gOiBlZGl0Vmlld3NbJ2RlZmF1bHQnXTtcblxuXHRcdHJldHVybiBuZXcgZWRpdFZpZXcoIHsgbW9kZWw6IG1vZGVsIH0gKTtcblxuXHR9LFxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZUZhY3Rvcnk7XG4iLCJ2YXIgQmFja2JvbmUgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIEJ1aWxkZXIgICAgICAgPSByZXF1aXJlKCcuLy4uL21vZGVscy9idWlsZGVyLmpzJyk7XG52YXIgTW9kdWxlRmFjdG9yeSA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMnKTtcbnZhciAkICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxudmFyIEJ1aWxkZXIgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IF8udGVtcGxhdGUoICQoJyN0bXBsLW1wYi1idWlsZGVyJyApLmh0bWwoKSApLFxuXHRjbGFzc05hbWU6ICdtb2R1bGFyLXBhZ2UtYnVpbGRlcicsXG5cdG1vZGVsOiBudWxsLFxuXHRuZXdNb2R1bGVOYW1lOiBudWxsLFxuXG5cdGV2ZW50czoge1xuXHRcdCdjaGFuZ2UgPiAuYWRkLW5ldyAuYWRkLW5ldy1tb2R1bGUtc2VsZWN0JzogJ3RvZ2dsZUJ1dHRvblN0YXR1cycsXG5cdFx0J2NsaWNrID4gLmFkZC1uZXcgLmFkZC1uZXctbW9kdWxlLWJ1dHRvbic6ICdhZGRNb2R1bGUnLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMubW9kZWwuZ2V0KCdzZWxlY3Rpb24nKTtcblxuXHRcdHNlbGVjdGlvbi5vbiggJ2FkZCcsIHRoaXMuYWRkTmV3U2VsZWN0aW9uSXRlbVZpZXcsIHRoaXMgKTtcblx0XHRzZWxlY3Rpb24ub24oICdhbGwnLCB0aGlzLm1vZGVsLnNhdmVEYXRhLCB0aGlzLm1vZGVsICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGRhdGEgPSB0aGlzLm1vZGVsLnRvSlNPTigpO1xuXG5cdFx0dGhpcy4kZWwuaHRtbCggdGhpcy50ZW1wbGF0ZSggZGF0YSApICk7XG5cblx0XHR0aGlzLm1vZGVsLmdldCgnc2VsZWN0aW9uJykuZWFjaCggZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdHRoaXMuYWRkTmV3U2VsZWN0aW9uSXRlbVZpZXcoIG1vZHVsZSApO1xuXHRcdH0uYmluZCggdGhpcyApICk7XG5cblx0XHR0aGlzLnJlbmRlckFkZE5ldygpO1xuXHRcdHRoaXMuaW5pdFNvcnRhYmxlKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW5kZXIgdGhlIEFkZCBOZXcgbW9kdWxlIGNvbnRyb2xzLlxuXHQgKi9cblx0cmVuZGVyQWRkTmV3OiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciAkc2VsZWN0ICAgICAgICA9IHRoaXMuJGVsLmZpbmQoICc+IC5hZGQtbmV3IHNlbGVjdC5hZGQtbmV3LW1vZHVsZS1zZWxlY3QnICksXG5cdFx0XHRvcHRpb25UZW1wbGF0ZSA9IF8udGVtcGxhdGUoICc8b3B0aW9uIHZhbHVlPVwiPCU9IG5hbWUgJT5cIj48JT0gbGFiZWwgJT48L29wdGlvbj4nICk7XG5cblx0XHQkc2VsZWN0LmFwcGVuZChcblx0XHRcdCQoICc8b3B0aW9uLz4nLCB7IHRleHQ6IG1vZHVsYXJQYWdlQnVpbGRlckRhdGEubDEwbi5zZWxlY3REZWZhdWx0IH0gKVxuXHRcdCk7XG5cblx0XHRfLmVhY2goIHRoaXMubW9kZWwuZ2V0QXZhaWxhYmxlTW9kdWxlcygpLCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0JHNlbGVjdC5hcHBlbmQoIG9wdGlvblRlbXBsYXRlKCBtb2R1bGUgKSApO1xuXHRcdH0gKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIFNvcnRhYmxlLlxuXHQgKi9cblx0aW5pdFNvcnRhYmxlOiBmdW5jdGlvbigpIHtcblx0XHQkKCAnPiAuc2VsZWN0aW9uJywgdGhpcy4kZWwgKS5zb3J0YWJsZSh7XG5cdFx0XHRoYW5kbGU6ICcubW9kdWxlLWVkaXQtdG9vbHMnLFxuXHRcdFx0aXRlbXM6ICAnPiAubW9kdWxlLWVkaXQnLFxuXHRcdFx0c3RvcDogICBmdW5jdGlvbiggZSwgdWkgKSB7XG5cdFx0XHRcdHRoaXMudXBkYXRlU2VsZWN0aW9uT3JkZXIoIHVpICk7XG5cdFx0XHRcdHVpLml0ZW0udHJpZ2dlcignbXBiLXNvcnQtc3RvcCcpO1xuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogU29ydGFibGUgZW5kIGNhbGxiYWNrLlxuXHQgKiBBZnRlciByZW9yZGVyaW5nLCB1cGRhdGUgdGhlIHNlbGVjdGlvbiBvcmRlci5cblx0ICogTm90ZSAtIHVzZXMgZGlyZWN0IG1hbmlwdWxhdGlvbiBvZiBjb2xsZWN0aW9uIG1vZGVscyBwcm9wZXJ0eS5cblx0ICogVGhpcyBpcyB0byBhdm9pZCBoYXZpbmcgdG8gbWVzcyBhYm91dCB3aXRoIHRoZSB2aWV3cyB0aGVtc2VsdmVzLlxuXHQgKi9cblx0dXBkYXRlU2VsZWN0aW9uT3JkZXI6IGZ1bmN0aW9uKCB1aSApIHtcblxuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLm1vZGVsLmdldCgnc2VsZWN0aW9uJyk7XG5cdFx0dmFyIGl0ZW0gICAgICA9IHNlbGVjdGlvbi5nZXQoeyBjaWQ6IHVpLml0ZW0uYXR0ciggJ2RhdGEtY2lkJykgfSk7XG5cdFx0dmFyIG5ld0luZGV4ICA9IHVpLml0ZW0uaW5kZXgoKTtcblx0XHR2YXIgb2xkSW5kZXggID0gc2VsZWN0aW9uLmluZGV4T2YoIGl0ZW0gKTtcblxuXHRcdGlmICggbmV3SW5kZXggIT09IG9sZEluZGV4ICkge1xuXHRcdFx0dmFyIGRyb3BwZWQgPSBzZWxlY3Rpb24ubW9kZWxzLnNwbGljZSggb2xkSW5kZXgsIDEgKTtcblx0XHRcdHNlbGVjdGlvbi5tb2RlbHMuc3BsaWNlKCBuZXdJbmRleCwgMCwgZHJvcHBlZFswXSApO1xuXHRcdFx0dGhpcy5tb2RlbC5zYXZlRGF0YSgpO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBUb2dnbGUgYnV0dG9uIHN0YXR1cy5cblx0ICogRW5hYmxlL0Rpc2FibGUgYnV0dG9uIGRlcGVuZGluZyBvbiB3aGV0aGVyXG5cdCAqIHBsYWNlaG9sZGVyIG9yIHZhbGlkIG1vZHVsZSBpcyBzZWxlY3RlZC5cblx0ICovXG5cdHRvZ2dsZUJ1dHRvblN0YXR1czogZnVuY3Rpb24oZSkge1xuXHRcdHZhciB2YWx1ZSAgICAgICAgID0gJChlLnRhcmdldCkudmFsKCk7XG5cdFx0dmFyIGRlZmF1bHRPcHRpb24gPSAkKGUudGFyZ2V0KS5jaGlsZHJlbigpLmZpcnN0KCkuYXR0cigndmFsdWUnKTtcblx0XHQkKCcuYWRkLW5ldy1tb2R1bGUtYnV0dG9uJywgdGhpcy4kZWwgKS5hdHRyKCAnZGlzYWJsZWQnLCB2YWx1ZSA9PT0gZGVmYXVsdE9wdGlvbiApO1xuXHRcdHRoaXMubmV3TW9kdWxlTmFtZSA9ICggdmFsdWUgIT09IGRlZmF1bHRPcHRpb24gKSA/IHZhbHVlIDogbnVsbDtcblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlIGFkZGluZyBtb2R1bGUuXG5cdCAqXG5cdCAqIEZpbmQgbW9kdWxlIG1vZGVsLiBDbG9uZSBpdC4gQWRkIHRvIHNlbGVjdGlvbi5cblx0ICovXG5cdGFkZE1vZHVsZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0aWYgKCB0aGlzLm5ld01vZHVsZU5hbWUgJiYgdGhpcy5tb2RlbC5pc01vZHVsZUFsbG93ZWQoIHRoaXMubmV3TW9kdWxlTmFtZSApICkge1xuXHRcdFx0dmFyIG1vZGVsID0gTW9kdWxlRmFjdG9yeS5jcmVhdGUoIHRoaXMubmV3TW9kdWxlTmFtZSApO1xuXHRcdFx0dGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpLmFkZCggbW9kZWwgKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogQXBwZW5kIG5ldyBzZWxlY3Rpb24gaXRlbSB2aWV3LlxuXHQgKi9cblx0YWRkTmV3U2VsZWN0aW9uSXRlbVZpZXc6IGZ1bmN0aW9uKCBpdGVtICkge1xuXG5cdFx0aWYgKCAhIHRoaXMubW9kZWwuaXNNb2R1bGVBbGxvd2VkKCBpdGVtLmdldCgnbmFtZScpICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIHZpZXcgPSBNb2R1bGVGYWN0b3J5LmNyZWF0ZUVkaXRWaWV3KCBpdGVtICk7XG5cblx0XHQkKCAnPiAuc2VsZWN0aW9uJywgdGhpcy4kZWwgKS5hcHBlbmQoIHZpZXcucmVuZGVyKCkuJGVsICk7XG5cblx0XHR2YXIgJHNlbGVjdGlvbiA9ICQoICc+IC5zZWxlY3Rpb24nLCB0aGlzLiRlbCApO1xuXHRcdGlmICggJHNlbGVjdGlvbi5oYXNDbGFzcygndWktc29ydGFibGUnKSApIHtcblx0XHRcdCRzZWxlY3Rpb24uc29ydGFibGUoJ3JlZnJlc2gnKTtcblx0XHR9XG5cblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQnVpbGRlcjtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxuLyoqXG4gKiBJbWFnZSBGaWVsZFxuICpcbiAqIEluaXRpYWxpemUgYW5kIGxpc3RlbiBmb3IgdGhlICdjaGFuZ2UnIGV2ZW50IHRvIGdldCB1cGRhdGVkIGRhdGEuXG4gKlxuICovXG52YXIgRmllbGRBdHRhY2htZW50ID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogIF8udGVtcGxhdGUoICQoICcjdG1wbC1tcGItZmllbGQtYXR0YWNobWVudCcgKS5odG1sKCkgKSxcblx0ZnJhbWU6ICAgICBudWxsLFxuXHR2YWx1ZTogICAgIFtdLCAvLyBBdHRhY2htZW50IElEcy5cblx0c2VsZWN0aW9uOiB7fSwgLy8gQXR0YWNobWVudHMgY29sbGVjdGlvbiBmb3IgdGhpcy52YWx1ZS5cblxuXHRjb25maWc6ICAgIHt9LFxuXG5cdGRlZmF1bHRDb25maWc6IHtcblx0XHRtdWx0aXBsZTogZmFsc2UsXG5cdFx0bGlicmFyeTogeyB0eXBlOiAnaW1hZ2UnIH0sXG5cdFx0YnV0dG9uX3RleHQ6ICdTZWxlY3QgSW1hZ2UnLFxuXHR9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayAuYnV0dG9uLmFkZCc6ICdlZGl0SW1hZ2UnLFxuXHRcdCdjbGljayAuaW1hZ2UtcGxhY2Vob2xkZXIgLmJ1dHRvbi5yZW1vdmUnOiAncmVtb3ZlSW1hZ2UnLFxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplLlxuXHQgKlxuXHQgKiBQYXNzIHZhbHVlIGFuZCBjb25maWcgYXMgcHJvcGVydGllcyBvbiB0aGUgb3B0aW9ucyBvYmplY3QuXG5cdCAqIEF2YWlsYWJsZSBvcHRpb25zXG5cdCAqIC0gbXVsdGlwbGU6IGJvb2xcblx0ICogLSBzaXplUmVxOiBlZyB7IHdpZHRoOiAxMDAsIGhlaWdodDogMTAwIH1cblx0ICpcblx0ICogQHBhcmFtICBvYmplY3Qgb3B0aW9uc1xuXHQgKiBAcmV0dXJuIG51bGxcblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0Ly8gQ2FsbCBkZWZhdWx0IGluaXRpYWxpemUuXG5cdFx0RmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgb3B0aW9ucyBdICk7XG5cblx0XHRfLmJpbmRBbGwoIHRoaXMsICdyZW5kZXInLCAnZWRpdEltYWdlJywgJ29uU2VsZWN0SW1hZ2UnLCAncmVtb3ZlSW1hZ2UnLCAnaXNBdHRhY2htZW50U2l6ZU9rJyApO1xuXG5cdFx0dGhpcy5vbiggJ2NoYW5nZScsIHRoaXMucmVuZGVyICk7XG5cblx0XHR0aGlzLmluaXRTZWxlY3Rpb24oKTtcblxuXHR9LFxuXG5cdHNldFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cblx0XHQvLyBFbnN1cmUgdmFsdWUgaXMgYXJyYXkuXG5cdFx0aWYgKCAhIHZhbHVlIHx8ICEgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gW107XG5cdFx0fVxuXG5cdFx0RmllbGQucHJvdG90eXBlLnNldFZhbHVlLmFwcGx5KCB0aGlzLCBbIHZhbHVlIF0gKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIFNlbGVjdGlvbi5cblx0ICpcblx0ICogU2VsZWN0aW9uIGlzIGFuIEF0dGFjaG1lbnQgY29sbGVjdGlvbiBjb250YWluaW5nIGZ1bGwgbW9kZWxzIGZvciB0aGUgY3VycmVudCB2YWx1ZS5cblx0ICpcblx0ICogQHJldHVybiBudWxsXG5cdCAqL1xuXHRpbml0U2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMuc2VsZWN0aW9uID0gbmV3IHdwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzKCk7XG5cblx0XHR0aGlzLnNlbGVjdGlvbi5jb21wYXJhdG9yID0gJ21lbnUtb3JkZXInO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSBzZWxlY3Rpb24uXG5cdFx0Xy5lYWNoKCB0aGlzLmdldFZhbHVlKCksIGZ1bmN0aW9uKCBpdGVtLCBpICkge1xuXG5cdFx0XHR2YXIgbW9kZWw7XG5cblx0XHRcdC8vIExlZ2FjeS4gSGFuZGxlIHN0b3JpbmcgZnVsbCBvYmplY3RzLlxuXHRcdFx0aXRlbSAgPSAoICdvYmplY3QnID09PSB0eXBlb2YoIGl0ZW0gKSApID8gaXRlbS5pZCA6IGl0ZW07XG5cdFx0XHRtb2RlbCA9IG5ldyB3cC5tZWRpYS5hdHRhY2htZW50KCBpdGVtICk7XG5cblx0XHRcdG1vZGVsLnNldCggJ21lbnUtb3JkZXInLCBpICk7XG5cblx0XHRcdHRoaXMuc2VsZWN0aW9uLmFkZCggbW9kZWwgKTtcblxuXHRcdFx0Ly8gUmUtcmVuZGVyIGFmdGVyIGF0dGFjaG1lbnRzIGhhdmUgc3luY2VkLlxuXHRcdFx0bW9kZWwuZmV0Y2goKTtcblx0XHRcdG1vZGVsLm9uKCAnc3luYycsIHRoaXMucmVuZGVyICk7XG5cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgdGVtcGxhdGU7XG5cblx0XHR0ZW1wbGF0ZSA9IF8ubWVtb2l6ZSggZnVuY3Rpb24oIHZhbHVlLCBjb25maWcgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50ZW1wbGF0ZSgge1xuXHRcdFx0XHR2YWx1ZTogdmFsdWUsXG5cdFx0XHRcdGNvbmZpZzogY29uZmlnLFxuXHRcdFx0fSApO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0dGhpcy4kZWwuaHRtbCggdGVtcGxhdGUoIHRoaXMuc2VsZWN0aW9uLnRvSlNPTigpLCB0aGlzLmNvbmZpZyApICk7XG5cblx0XHR0aGlzLiRlbC5zb3J0YWJsZSh7XG5cdFx0XHRkZWxheTogMTUwLFxuXHRcdFx0aXRlbXM6ICc+IC5pbWFnZS1wbGFjZWhvbGRlcicsXG5cdFx0XHRzdG9wOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5zZWxlY3Rpb247XG5cblx0XHRcdFx0dGhpcy4kZWwuY2hpbGRyZW4oICcuaW1hZ2UtcGxhY2Vob2xkZXInICkuZWFjaCggZnVuY3Rpb24oIGkgKSB7XG5cblx0XHRcdFx0XHR2YXIgaWQgICAgPSBwYXJzZUludCggdGhpcy5nZXRBdHRyaWJ1dGUoICdkYXRhLWlkJyApICk7XG5cdFx0XHRcdFx0dmFyIG1vZGVsID0gc2VsZWN0aW9uLmZpbmRXaGVyZSggeyBpZDogaWQgfSApO1xuXG5cdFx0XHRcdFx0aWYgKCBtb2RlbCApIHtcblx0XHRcdFx0XHRcdG1vZGVsLnNldCggJ21lbnUtb3JkZXInLCBpICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRzZWxlY3Rpb24uc29ydCgpO1xuXHRcdFx0XHR0aGlzLnNldFZhbHVlKCBzZWxlY3Rpb24ucGx1Y2soJ2lkJykgKTtcblxuXHRcdFx0fS5iaW5kKHRoaXMpXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgdGhlIHNlbGVjdCBldmVudC5cblx0ICpcblx0ICogSW5zZXJ0IGFuIGltYWdlIG9yIG11bHRpcGxlIGltYWdlcy5cblx0ICovXG5cdG9uU2VsZWN0SW1hZ2U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGZyYW1lID0gdGhpcy5mcmFtZSB8fCBudWxsO1xuXG5cdFx0aWYgKCAhIGZyYW1lICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuc2VsZWN0aW9uLnJlc2V0KFtdKTtcblxuXHRcdGZyYW1lLnN0YXRlKCkuZ2V0KCdzZWxlY3Rpb24nKS5lYWNoKCBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblxuXHRcdFx0aWYgKCB0aGlzLmlzQXR0YWNobWVudFNpemVPayggYXR0YWNobWVudCApICkge1xuXHRcdFx0XHR0aGlzLnNlbGVjdGlvbi5hZGQoIGF0dGFjaG1lbnQgKTtcblx0XHRcdH1cblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0dGhpcy5zZXRWYWx1ZSggdGhpcy5zZWxlY3Rpb24ucGx1Y2soJ2lkJykgKTtcblxuXHRcdGZyYW1lLmNsb3NlKCk7XG5cblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlIHRoZSBlZGl0IGFjdGlvbi5cblx0ICovXG5cdGVkaXRJbWFnZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0dmFyIGZyYW1lID0gdGhpcy5mcmFtZTtcblxuXHRcdGlmICggISBmcmFtZSApIHtcblxuXHRcdFx0dmFyIGZyYW1lQXJncyA9IHtcblx0XHRcdFx0bGlicmFyeTogdGhpcy5jb25maWcubGlicmFyeSxcblx0XHRcdFx0bXVsdGlwbGU6IHRoaXMuY29uZmlnLm11bHRpcGxlLFxuXHRcdFx0XHR0aXRsZTogJ1NlbGVjdCBJbWFnZScsXG5cdFx0XHRcdGZyYW1lOiAnc2VsZWN0Jyxcblx0XHRcdH07XG5cblx0XHRcdGZyYW1lID0gdGhpcy5mcmFtZSA9IHdwLm1lZGlhKCBmcmFtZUFyZ3MgKTtcblxuXHRcdFx0ZnJhbWUub24oICdjb250ZW50OmNyZWF0ZTpicm93c2UnLCB0aGlzLnNldHVwRmlsdGVycywgdGhpcyApO1xuXHRcdFx0ZnJhbWUub24oICdjb250ZW50OnJlbmRlcjpicm93c2UnLCB0aGlzLnNpemVGaWx0ZXJOb3RpY2UsIHRoaXMgKTtcblx0XHRcdGZyYW1lLm9uKCAnc2VsZWN0JywgdGhpcy5vblNlbGVjdEltYWdlLCB0aGlzICk7XG5cblx0XHR9XG5cblx0XHQvLyBXaGVuIHRoZSBmcmFtZSBvcGVucywgc2V0IHRoZSBzZWxlY3Rpb24uXG5cdFx0ZnJhbWUub24oICdvcGVuJywgZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBzZWxlY3Rpb24gPSBmcmFtZS5zdGF0ZSgpLmdldCgnc2VsZWN0aW9uJyk7XG5cblx0XHRcdC8vIFNldCB0aGUgc2VsZWN0aW9uLlxuXHRcdFx0Ly8gTm90ZSAtIGV4cGVjdHMgYXJyYXkgb2Ygb2JqZWN0cywgbm90IGEgY29sbGVjdGlvbi5cblx0XHRcdHNlbGVjdGlvbi5zZXQoIHRoaXMuc2VsZWN0aW9uLm1vZGVscyApO1xuXG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHRmcmFtZS5vcGVuKCk7XG5cblx0fSxcblxuXHQvKipcblx0ICogQWRkIGZpbHRlcnMgdG8gdGhlIGZyYW1lIGxpYnJhcnkgY29sbGVjdGlvbi5cblx0ICpcblx0ICogIC0gZmlsdGVyIHRvIGxpbWl0IHRvIHJlcXVpcmVkIHNpemUuXG5cdCAqL1xuXHRzZXR1cEZpbHRlcnM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGxpYiAgICA9IHRoaXMuZnJhbWUuc3RhdGUoKS5nZXQoJ2xpYnJhcnknKTtcblxuXHRcdGlmICggJ3NpemVSZXEnIGluIHRoaXMuY29uZmlnICkge1xuXHRcdFx0bGliLmZpbHRlcnMuc2l6ZSA9IHRoaXMuaXNBdHRhY2htZW50U2l6ZU9rO1xuXHRcdH1cblxuXHR9LFxuXG5cblx0LyoqXG5cdCAqIEhhbmRsZSBkaXNwbGF5IG9mIHNpemUgZmlsdGVyIG5vdGljZS5cblx0ICovXG5cdHNpemVGaWx0ZXJOb3RpY2U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGxpYiA9IHRoaXMuZnJhbWUuc3RhdGUoKS5nZXQoJ2xpYnJhcnknKTtcblxuXHRcdGlmICggISBsaWIuZmlsdGVycy5zaXplICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFdhaXQgdG8gYmUgc3VyZSB0aGUgZnJhbWUgaXMgcmVuZGVyZWQuXG5cdFx0d2luZG93LnNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgcmVxLCAkbm90aWNlLCB0ZW1wbGF0ZSwgJHRvb2xiYXI7XG5cblx0XHRcdHJlcSA9IF8uZXh0ZW5kKCB7XG5cdFx0XHRcdHdpZHRoOiAwLFxuXHRcdFx0XHRoZWlnaHQ6IDAsXG5cdFx0XHR9LCB0aGlzLmNvbmZpZy5zaXplUmVxICk7XG5cblx0XHRcdC8vIERpc3BsYXkgbm90aWNlIG9uIG1haW4gZ3JpZCB2aWV3LlxuXHRcdFx0dGVtcGxhdGUgPSAnPHAgY2xhc3M9XCJmaWx0ZXItbm90aWNlXCI+T25seSBzaG93aW5nIGltYWdlcyB0aGF0IG1lZXQgc2l6ZSByZXF1aXJlbWVudHM6IDwlPSB3aWR0aCAlPnB4ICZ0aW1lczsgPCU9IGhlaWdodCAlPnB4PC9wPic7XG5cdFx0XHQkbm90aWNlICA9ICQoIF8udGVtcGxhdGUoIHRlbXBsYXRlICkoIHJlcSApICk7XG5cdFx0XHQkdG9vbGJhciA9ICQoICcuYXR0YWNobWVudHMtYnJvd3NlciAubWVkaWEtdG9vbGJhcicsIHRoaXMuZnJhbWUuJGVsICkuZmlyc3QoKTtcblx0XHRcdCR0b29sYmFyLnByZXBlbmQoICRub3RpY2UgKTtcblxuXHRcdFx0dmFyIGNvbnRlbnRWaWV3ID0gdGhpcy5mcmFtZS52aWV3cy5nZXQoICcubWVkaWEtZnJhbWUtY29udGVudCcgKTtcblx0XHRcdGNvbnRlbnRWaWV3ID0gY29udGVudFZpZXdbMF07XG5cblx0XHRcdCRub3RpY2UgPSAkKCAnPHAgY2xhc3M9XCJmaWx0ZXItbm90aWNlXCI+SW1hZ2UgZG9lcyBub3QgbWVldCBzaXplIHJlcXVpcmVtZW50cy48L3A+JyApO1xuXG5cdFx0XHQvLyBEaXNwbGF5IGFkZGl0aW9uYWwgbm90aWNlIHdoZW4gc2VsZWN0aW5nIGFuIGltYWdlLlxuXHRcdFx0Ly8gUmVxdWlyZWQgdG8gaW5kaWNhdGUgYSBiYWQgaW1hZ2UgaGFzIGp1c3QgYmVlbiB1cGxvYWRlZC5cblx0XHRcdGNvbnRlbnRWaWV3Lm9wdGlvbnMuc2VsZWN0aW9uLm9uKCAnc2VsZWN0aW9uOnNpbmdsZScsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdHZhciBhdHRhY2htZW50ID0gY29udGVudFZpZXcub3B0aW9ucy5zZWxlY3Rpb24uc2luZ2xlKCk7XG5cblx0XHRcdFx0dmFyIGRpc3BsYXlOb3RpY2UgPSBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRcdC8vIElmIHN0aWxsIHVwbG9hZGluZywgd2FpdCBhbmQgdHJ5IGRpc3BsYXlpbmcgbm90aWNlIGFnYWluLlxuXHRcdFx0XHRcdGlmICggYXR0YWNobWVudC5nZXQoICd1cGxvYWRpbmcnICkgKSB7XG5cdFx0XHRcdFx0XHR3aW5kb3cuc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGRpc3BsYXlOb3RpY2UoKTtcblx0XHRcdFx0XHRcdH0sIDUwMCApO1xuXG5cdFx0XHRcdFx0Ly8gT0suIERpc3BsYXkgbm90aWNlIGFzIHJlcXVpcmVkLlxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRcdGlmICggISB0aGlzLmlzQXR0YWNobWVudFNpemVPayggYXR0YWNobWVudCApICkge1xuXHRcdFx0XHRcdFx0XHQkKCAnLmF0dGFjaG1lbnRzLWJyb3dzZXIgLmF0dGFjaG1lbnQtaW5mbycgKS5wcmVwZW5kKCAkbm90aWNlICk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQkbm90aWNlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0uYmluZCh0aGlzKTtcblxuXHRcdFx0XHRkaXNwbGF5Tm90aWNlKCk7XG5cblx0XHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0fS5iaW5kKHRoaXMpLCAxMDAgICk7XG5cblx0fSxcblxuXHRyZW1vdmVJbWFnZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0dmFyICR0YXJnZXQsIGlkO1xuXG5cdFx0JHRhcmdldCA9ICQoZS50YXJnZXQpO1xuXHRcdCR0YXJnZXQgPSAoICR0YXJnZXQucHJvcCgndGFnTmFtZScpID09PSAnQlVUVE9OJyApID8gJHRhcmdldCA6ICR0YXJnZXQuY2xvc2VzdCgnYnV0dG9uLnJlbW92ZScpO1xuXHRcdGlkICAgICAgPSAkdGFyZ2V0LmRhdGEoICdpbWFnZS1pZCcgKTtcblxuXHRcdGlmICggISBpZCAgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5zZWxlY3Rpb24ucmVtb3ZlKCB0aGlzLnNlbGVjdGlvbi53aGVyZSggeyBpZDogaWQgfSApICk7XG5cdFx0dGhpcy5zZXRWYWx1ZSggdGhpcy5zZWxlY3Rpb24ucGx1Y2soJ2lkJykgKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBEb2VzIGF0dGFjaG1lbnQgbWVldCBzaXplIHJlcXVpcmVtZW50cz9cblx0ICpcblx0ICogQHBhcmFtICBBdHRhY2htZW50XG5cdCAqIEByZXR1cm4gYm9vbGVhblxuXHQgKi9cblx0aXNBdHRhY2htZW50U2l6ZU9rOiBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblxuXHRcdGlmICggISAoICdzaXplUmVxJyBpbiB0aGlzLmNvbmZpZyApICkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0dGhpcy5jb25maWcuc2l6ZVJlcSA9IF8uZXh0ZW5kKCB7XG5cdFx0XHR3aWR0aDogMCxcblx0XHRcdGhlaWdodDogMCxcblx0XHR9LCB0aGlzLmNvbmZpZy5zaXplUmVxICk7XG5cblx0XHR2YXIgd2lkdGhSZXEgID0gYXR0YWNobWVudC5nZXQoJ3dpZHRoJykgID49IHRoaXMuY29uZmlnLnNpemVSZXEud2lkdGg7XG5cdFx0dmFyIGhlaWdodFJlcSA9IGF0dGFjaG1lbnQuZ2V0KCdoZWlnaHQnKSA+PSB0aGlzLmNvbmZpZy5zaXplUmVxLmhlaWdodDtcblxuXHRcdHJldHVybiB3aWR0aFJlcSAmJiBoZWlnaHRSZXE7XG5cblx0fVxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRBdHRhY2htZW50O1xuIiwidmFyICQgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxudmFyIEZpZWxkVGV4dCA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICBfLnRlbXBsYXRlKCAnPGxhYmVsPjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiA8JSBpZiAoIGlkICkgeyAlPmlkPVwiPCU9IGlkICU+XCI8JSB9ICU+IDwlIGlmICggdmFsdWUgKSB7ICU+Y2hlY2tlZD1cImNoZWNrZWRcIjwlIH0gJT4+PCU9IGNvbmZpZy5sYWJlbCAlPjwvbGFiZWw+JyApLFxuXG5cdGRlZmF1bHRDb25maWc6IHtcblx0XHRsYWJlbDogJ1Rlc3QgTGFiZWwnLFxuXHR9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdjaGFuZ2UgIGlucHV0JzogJ2lucHV0Q2hhbmdlZCcsXG5cdH0sXG5cblx0aW5wdXRDaGFuZ2VkOiBfLmRlYm91bmNlKCBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFZhbHVlKCAkKCAnaW5wdXQnLCB0aGlzLiRlbCApLnByb3AoICdjaGVja2VkJyApICk7XG5cdH0gKSxcblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkVGV4dDtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxudmFyIEZpZWxkTGluayA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IF8udGVtcGxhdGUoICQoICcjdG1wbC1tcGItZmllbGQtbGluaycgKS5odG1sKCkgKSxcblxuXHRldmVudHM6IHtcblx0XHQna2V5dXAgICBpbnB1dC5maWVsZC10ZXh0JzogJ3RleHRJbnB1dENoYW5nZWQnLFxuXHRcdCdjaGFuZ2UgIGlucHV0LmZpZWxkLXRleHQnOiAndGV4dElucHV0Q2hhbmdlZCcsXG5cdFx0J2tleXVwICAgaW5wdXQuZmllbGQtbGluayc6ICdsaW5rSW5wdXRDaGFuZ2VkJyxcblx0XHQnY2hhbmdlICBpbnB1dC5maWVsZC1saW5rJzogJ2xpbmtJbnB1dENoYW5nZWQnLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0RmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgb3B0aW9ucyBdICk7XG5cblx0XHR0aGlzLnZhbHVlID0gdGhpcy52YWx1ZSB8fCB7fTtcblx0XHR0aGlzLnZhbHVlID0gXy5kZWZhdWx0cyggdGhpcy52YWx1ZSwgeyBsaW5rOiAnJywgdGV4dDogJycgfSApO1xuXG5cdH0sXG5cblx0dGV4dElucHV0Q2hhbmdlZDogXy5kZWJvdW5jZSggZnVuY3Rpb24oZSkge1xuXHRcdGlmICggZSAmJiBlLnRhcmdldCApIHtcblx0XHRcdHZhciB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblx0XHRcdHZhbHVlLnRleHQgPSBlLnRhcmdldC52YWx1ZTtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIHZhbHVlICk7XG5cdFx0fVxuXHR9ICksXG5cblx0bGlua0lucHV0Q2hhbmdlZDogXy5kZWJvdW5jZSggZnVuY3Rpb24oZSkge1xuXHRcdGlmICggZSAmJiBlLnRhcmdldCApIHtcblx0XHRcdHZhciB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblx0XHRcdHZhbHVlLmxpbmsgPSBlLnRhcmdldC52YWx1ZTtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIHZhbHVlICk7XG5cdFx0fVxuXHR9ICksXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkTGluaztcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBGaWVsZFRleHQgPSByZXF1aXJlKCcuL2ZpZWxkLXRleHQuanMnKTtcblxudmFyIEZpZWxkTnVtYmVyID0gRmllbGRUZXh0LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IF8udGVtcGxhdGUoICQoICcjdG1wbC1tcGItZmllbGQtbnVtYmVyJyApLmh0bWwoKSApLFxuXG5cdGdldFZhbHVlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCggdGhpcy52YWx1ZSApO1xuXHR9LFxuXG5cdHNldFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cdFx0dGhpcy52YWx1ZSA9IHBhcnNlRmxvYXQoIHZhbHVlICk7XG5cdFx0dGhpcy50cmlnZ2VyKCAnY2hhbmdlJywgdGhpcy5nZXRWYWx1ZSgpICk7XG5cdH0sXG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZE51bWJlcjtcbiIsIi8qIGdsb2JhbCBhamF4dXJsICovXG5cbnZhciAkICAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgRmllbGQgICAgICAgPSByZXF1aXJlKCcuL2ZpZWxkLmpzJyk7XG5cbi8qKlxuICogVGV4dCBGaWVsZCBWaWV3XG4gKlxuICogWW91IGNhbiB1c2UgdGhpcyBhbnl3aGVyZS5cbiAqIEp1c3QgbGlzdGVuIGZvciAnY2hhbmdlJyBldmVudCBvbiB0aGUgdmlldy5cbiAqL1xudmFyIEZpZWxkUG9zdFNlbGVjdCA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6IF8udGVtcGxhdGUoICQoICcjdG1wbC1tcGItZmllbGQtdGV4dCcgKS5odG1sKCkgKSxcblxuXHRkZWZhdWx0Q29uZmlnOiB7XG5cdFx0bXVsdGlwbGU6IHRydWUsXG5cdFx0cG9zdFR5cGU6ICdwb3N0J1xuXHR9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdjaGFuZ2UgaW5wdXQnOiAnaW5wdXRDaGFuZ2VkJ1xuXHR9LFxuXG5cdHNldFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cblx0XHRpZiAoIHRoaXMuY29uZmlnLm11bHRpcGxlICYmICEgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gWyB2YWx1ZSBdO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5jb25maWcubXVsdGlwbGUgJiYgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gdmFsdWVbMF07XG5cdFx0fVxuXG5cdFx0RmllbGQucHJvdG90eXBlLnNldFZhbHVlLmFwcGx5KCB0aGlzLCBbIHZhbHVlIF0gKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgVmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSAgUmV0dXJuIHZhbHVlIGFzIGFuIGFycmF5IGV2ZW4gaWYgbXVsdGlwbGUgaXMgZmFsc2UuXG5cdCAqL1xuXHRnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgdmFsdWUgPSB0aGlzLnZhbHVlO1xuXG5cdFx0aWYgKCB0aGlzLmNvbmZpZy5tdWx0aXBsZSAmJiAhIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IFsgdmFsdWUgXTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMuY29uZmlnLm11bHRpcGxlICYmIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IHZhbHVlWzBdO1xuXHRcdH1cblxuXHRcdHJldHVybiB2YWx1ZTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIHZhbHVlLCBkYXRhO1xuXG5cdFx0dmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cdFx0dmFsdWUgPSBBcnJheS5pc0FycmF5KCB2YWx1ZSApID8gdmFsdWUuam9pbiggJywnICkgOiB2YWx1ZTtcblxuXHRcdGRhdGEgPSB7XG5cdFx0XHRpZDogdGhpcy5jaWQsXG5cdFx0XHR2YWx1ZTogdmFsdWUsXG5cdFx0XHRjb25maWc6IHt9XG5cdFx0fTtcblxuXHRcdHRoaXMuJGVsLmh0bWwoIHRoaXMudGVtcGxhdGUoIGRhdGEgKSApO1xuXG5cdFx0dGhpcy5pbml0U2VsZWN0MigpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHRpbml0U2VsZWN0MjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgJGZpZWxkID0gJCggJyMnICsgdGhpcy5jaWQsIHRoaXMuJGVsICk7XG5cdFx0dmFyIHBvc3RUeXBlID0gdGhpcy5jb25maWcucG9zdFR5cGU7XG5cblx0XHR2YXIgZm9ybWF0UmVxdWVzdCA9ZnVuY3Rpb24gKCB0ZXJtLCBwYWdlICkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0YWN0aW9uOiAnbWNlX2dldF9wb3N0cycsXG5cdFx0XHRcdHM6IHRlcm0sXG5cdFx0XHRcdHBhZ2U6IHBhZ2UsXG5cdFx0XHRcdHBvc3RfdHlwZTogcG9zdFR5cGVcblx0XHRcdH07XG5cdFx0fTtcblxuXHRcdHZhciBwYXJzZVJlc3VsdHMgPSBmdW5jdGlvbiAoIHJlc3BvbnNlICkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0cmVzdWx0czogcmVzcG9uc2UucmVzdWx0cyxcblx0XHRcdFx0bW9yZTogcmVzcG9uc2UubW9yZVxuXHRcdFx0fTtcblx0XHR9O1xuXG5cdFx0dmFyIGluaXRTZWxlY3Rpb24gPSBmdW5jdGlvbiggZWwsIGNhbGxiYWNrICkge1xuXG5cdFx0XHR2YXIgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCkuam9pbignLCcpO1xuXG5cdFx0XHRpZiAoIHZhbHVlLmxlbmd0aCApIHtcblx0XHRcdFx0JC5nZXQoIGFqYXh1cmwsIHtcblx0XHRcdFx0XHRhY3Rpb246ICdtY2VfZ2V0X3Bvc3RzJyxcblx0XHRcdFx0XHRwb3N0X19pbjogdmFsdWUsXG5cdFx0XHRcdFx0cG9zdF90eXBlOiBwb3N0VHlwZVxuXHRcdFx0XHR9ICkuZG9uZSggZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soIHBhcnNlUmVzdWx0cyggZGF0YSApLnJlc3VsdHMgKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXG5cdFx0fS5iaW5kKHRoaXMpO1xuXG5cdFx0JGZpZWxkLnNlbGVjdDIoe1xuXHRcdFx0bWluaW11bUlucHV0TGVuZ3RoOiAxLFxuXHRcdFx0bXVsdGlwbGU6IHRoaXMuY29uZmlnLm11bHRpcGxlLFxuXHRcdFx0aW5pdFNlbGVjdGlvbjogaW5pdFNlbGVjdGlvbixcblx0XHRcdGFqYXg6IHtcblx0XHRcdFx0dXJsOiBhamF4dXJsLFxuXHRcdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0ICAgIGRlbGF5OiAyNTAsXG5cdFx0XHQgICAgY2FjaGU6IGZhbHNlLFxuXHRcdFx0XHRkYXRhOiBmb3JtYXRSZXF1ZXN0LFxuXHRcdFx0XHRyZXN1bHRzOiBwYXJzZVJlc3VsdHMsXG5cdFx0XHR9LFxuXHRcdH0pO1xuXG5cdH0sXG5cblx0aW5wdXRDaGFuZ2VkOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdmFsdWUgPSAkKCAnaW5wdXQjJyArIHRoaXMuY2lkLCB0aGlzLiRlbCApLnZhbCgpO1xuXHRcdHZhbHVlID0gdmFsdWUuc3BsaXQoICcsJyApLm1hcCggTnVtYmVyICk7XG5cdFx0dGhpcy5zZXRWYWx1ZSggdmFsdWUgKTtcblx0fSxcblxuXHRyZW1vdmU6IGZ1bmN0aW9uKCkge1xuXHR9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRQb3N0U2VsZWN0O1xuIiwidmFyICQgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxuLyoqXG4gKiBUZXh0IEZpZWxkIFZpZXdcbiAqXG4gKiBZb3UgY2FuIHVzZSB0aGlzIGFueXdoZXJlLlxuICogSnVzdCBsaXN0ZW4gZm9yICdjaGFuZ2UnIGV2ZW50IG9uIHRoZSB2aWV3LlxuICovXG52YXIgRmllbGRTZWxlY3QgPSBGaWVsZC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiBfLnRlbXBsYXRlKCAkKCAnI3RtcGwtbXBiLWZpZWxkLXNlbGVjdCcgKS5odG1sKCkgKSxcblx0dmFsdWU6IFtdLFxuXG5cdGRlZmF1bHRDb25maWc6IHtcblx0XHRtdWx0aXBsZTogZmFsc2UsXG5cdFx0b3B0aW9uczogW10sXG5cdH0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NoYW5nZSBzZWxlY3QnOiAnaW5wdXRDaGFuZ2VkJ1xuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdF8uYmluZEFsbCggdGhpcywgJ3BhcnNlT3B0aW9uJyApO1xuXHRcdEZpZWxkLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIG9wdGlvbnMgXSApO1xuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnMuY29uZmlnLm9wdGlvbnMgfHwgW107XG5cdH0sXG5cblx0aW5wdXRDaGFuZ2VkOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFZhbHVlKCAkKCAnc2VsZWN0JywgdGhpcy4kZWwgKS52YWwoKSApO1xuXHR9LFxuXG5cdGdldE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMubWFwKCB0aGlzLnBhcnNlT3B0aW9uICk7XG5cdH0sXG5cblx0cGFyc2VPcHRpb246IGZ1bmN0aW9uKCBvcHRpb24gKSB7XG5cdFx0b3B0aW9uID0gXy5kZWZhdWx0cyggb3B0aW9uLCB7IHZhbHVlOiAnJywgdGV4dDogJycsIHNlbGVjdGVkOiBmYWxzZSB9ICk7XG5cdFx0b3B0aW9uLnNlbGVjdGVkID0gdGhpcy5pc1NlbGVjdGVkKCBvcHRpb24udmFsdWUgKTtcblx0XHRyZXR1cm4gb3B0aW9uO1xuXHR9LFxuXG5cdGlzU2VsZWN0ZWQ6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRpZiAoIHRoaXMuY29uZmlnLm11bHRpcGxlICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0VmFsdWUoKS5pbmRleE9mKCB2YWx1ZSApID49IDA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB2YWx1ZSA9PT0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdH1cblx0fSxcblxuXHRzZXRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXG5cdFx0aWYgKCB0aGlzLmNvbmZpZy5tdWx0aXBsZSAmJiAhIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IFsgdmFsdWUgXTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMuY29uZmlnLm11bHRpcGxlICYmIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IHZhbHVlWzBdO1xuXHRcdH1cblxuXHRcdEZpZWxkLnByb3RvdHlwZS5zZXRWYWx1ZS5hcHBseSggdGhpcywgWyB2YWx1ZSBdICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogR2V0IFZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gIFJldHVybiB2YWx1ZSBhcyBhbiBhcnJheSBldmVuIGlmIG11bHRpcGxlIGlzIGZhbHNlLlxuXHQgKi9cblx0Z2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHZhbHVlID0gdGhpcy52YWx1ZTtcblxuXHRcdGlmICggdGhpcy5jb25maWcubXVsdGlwbGUgJiYgISBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXHRcdFx0dmFsdWUgPSBbIHZhbHVlIF07XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLmNvbmZpZy5tdWx0aXBsZSAmJiBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXHRcdFx0dmFsdWUgPSB2YWx1ZVswXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdmFsdWU7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0aWQ6IHRoaXMuY2lkLFxuXHRcdFx0b3B0aW9uczogdGhpcy5nZXRPcHRpb25zKCksXG5cdFx0fTtcblxuXHRcdC8vIENyZWF0ZSBlbGVtZW50IGZyb20gdGVtcGxhdGUuXG5cdFx0dGhpcy4kZWwuaHRtbCggdGhpcy50ZW1wbGF0ZSggZGF0YSApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTZWxlY3Q7XG4iLCJ2YXIgJCAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG52YXIgRmllbGRUZXh0ID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogXy50ZW1wbGF0ZSggJCggJyN0bXBsLW1wYi1maWVsZC10ZXh0JyApLmh0bWwoKSApLFxuXG5cdGRlZmF1bHRDb25maWc6IHtcblx0XHRjbGFzc2VzOiAncmVndWxhci10ZXh0Jyxcblx0XHRwbGFjZWhvbGRlcjogbnVsbCxcblx0fSxcblxuXHRldmVudHM6IHtcblx0XHQna2V5dXAgICBpbnB1dCc6ICdpbnB1dENoYW5nZWQnLFxuXHRcdCdjaGFuZ2UgIGlucHV0JzogJ2lucHV0Q2hhbmdlZCcsXG5cdH0sXG5cblx0aW5wdXRDaGFuZ2VkOiBfLmRlYm91bmNlKCBmdW5jdGlvbihlKSB7XG5cdFx0aWYgKCBlICYmIGUudGFyZ2V0ICkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggZS50YXJnZXQudmFsdWUgKTtcblx0XHR9XG5cdH0gKSxcblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkVGV4dDtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBGaWVsZFRleHQgPSByZXF1aXJlKCcuL2ZpZWxkLXRleHQuanMnKTtcblxudmFyIEZpZWxkVGV4dGFyZWEgPSBGaWVsZFRleHQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogXy50ZW1wbGF0ZSggJCggJyN0bXBsLW1wYi1maWVsZC10ZXh0YXJlYScgKS5odG1sKCkgKSxcblxuXHRldmVudHM6IHtcblx0XHQna2V5dXAgIHRleHRhcmVhJzogJ2lucHV0Q2hhbmdlZCcsXG5cdFx0J2NoYW5nZSB0ZXh0YXJlYSc6ICdpbnB1dENoYW5nZWQnLFxuXHR9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRUZXh0YXJlYTtcbiIsInZhciAkICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgRmllbGQgPSByZXF1aXJlKCcuL2ZpZWxkLmpzJyk7XG5cbi8qKlxuICogVGV4dCBGaWVsZCBWaWV3XG4gKlxuICogWW91IGNhbiB1c2UgdGhpcyBhbnl3aGVyZS5cbiAqIEp1c3QgbGlzdGVuIGZvciAnY2hhbmdlJyBldmVudCBvbiB0aGUgdmlldy5cbiAqL1xudmFyIEZpZWxkV1lTSVdZRyA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICQoICcjdG1wbC1tcGItZmllbGQtd3lzaXd5ZycgKS5odG1sKCksXG5cdGVkaXRvcjogbnVsbCxcblx0dmFsdWU6IG51bGwsXG5cblx0LyoqXG5cdCAqIEluaXQuXG5cdCAqXG5cdCAqIG9wdGlvbnMudmFsdWUgaXMgdXNlZCB0byBwYXNzIGluaXRpYWwgdmFsdWUuXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblxuXHRcdEZpZWxkLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIG9wdGlvbnMgXSApO1xuXG5cdFx0Ly8gQSBmZXcgaGVscGVycy5cblx0XHR0aGlzLmVkaXRvciA9IHtcblx0XHRcdGlkICAgICAgICAgICA6ICdtcGItdGV4dC1ib2R5LScgKyB0aGlzLmNpZCxcblx0XHRcdG5hbWVSZWdleCAgICA6IG5ldyBSZWdFeHAoICdtcGItcGxhY2Vob2xkZXItbmFtZScsICdnJyApLFxuXHRcdFx0aWRSZWdleCAgICAgIDogbmV3IFJlZ0V4cCggJ21wYi1wbGFjZWhvbGRlci1pZCcsICdnJyApLFxuXHRcdFx0Y29udGVudFJlZ2V4IDogbmV3IFJlZ0V4cCggJ21wYi1wbGFjZWhvbGRlci1jb250ZW50JywgJ2cnICksXG5cdFx0fTtcblxuXHRcdC8vIFRoZSB0ZW1wbGF0ZSBwcm92aWRlZCBpcyBnZW5lcmljIG1hcmt1cCB1c2VkIGJ5IFRpbnlNQ0UuXG5cdFx0Ly8gV2UgbmVlZCBhIHRlbXBsYXRlIHVuaXF1ZSB0byB0aGlzIHZpZXcuXG5cdFx0dGhpcy50ZW1wbGF0ZSAgPSB0aGlzLnRlbXBsYXRlLnJlcGxhY2UoIHRoaXMuZWRpdG9yLm5hbWVSZWdleCwgdGhpcy5lZGl0b3IuaWQgKTtcblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IuaWRSZWdleCwgdGhpcy5lZGl0b3IuaWQgKTtcblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IuY29udGVudFJlZ2V4LCAnPCU9IHZhbHVlICU+JyApO1xuXHRcdHRoaXMudGVtcGxhdGUgID0gXy50ZW1wbGF0ZSggdGhpcy50ZW1wbGF0ZSApO1xuXG5cdFx0dGhpcy5vbiggJ21wYi1zb3J0LXN0b3AnLCB0aGlzLnJlbmRlciApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cblx0XHQvLyBDcmVhdGUgZWxlbWVudCBmcm9tIHRlbXBsYXRlLlxuXHRcdHRoaXMuJGVsLmh0bWwoIHRoaXMudGVtcGxhdGUoIHsgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKSB9ICkgKTtcblxuXHRcdC8vIEhpZGUgZWRpdG9yIHRvIHByZXZlbnQgRk9VQy4gU2hvdyBhZ2FpbiBvbiBpbml0LiBTZWUgc2V0dXAuXG5cdFx0JCggJy53cC1lZGl0b3Itd3JhcCcsIHRoaXMuJGVsICkuY3NzKCAnZGlzcGxheScsICdub25lJyApO1xuXG5cdFx0Ly8gSW5pdC4gRGVmZmVycmVkIHRvIG1ha2Ugc3VyZSBjb250YWluZXIgZWxlbWVudCBoYXMgYmVlbiByZW5kZXJlZC5cblx0XHRfLmRlZmVyKCB0aGlzLmluaXRUaW55TUNFLmJpbmQoIHRoaXMgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZSB0aGUgVGlueU1DRSBlZGl0b3IuXG5cdCAqXG5cdCAqIEJpdCBoYWNreSB0aGlzLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG51bGwuXG5cdCAqL1xuXHRpbml0VGlueU1DRTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgc2VsZiA9IHRoaXMsIGlkLCBlZCwgJGVsLCBwcm9wO1xuXG5cdFx0aWQgID0gdGhpcy5lZGl0b3IuaWQ7XG5cdFx0ZWQgID0gdGlueU1DRS5nZXQoIGlkICk7XG5cdFx0JGVsID0gJCggJyN3cC0nICsgaWQgKyAnLXdyYXAnLCB0aGlzLiRlbCApO1xuXG5cdFx0Ly8gSWYgZm91bmQuIFJlbW92ZSBzbyB3ZSBjYW4gcmUtaW5pdC5cblx0XHRpZiAoIGVkICkge1xuXHRcdFx0dGlueU1DRS5leGVjQ29tbWFuZCggJ21jZVJlbW92ZUVkaXRvcicsIGZhbHNlLCB0aGlzLmVkaXRvci5pZCApO1xuXHRcdH1cblxuXHRcdC8vIEdldCBzZXR0aW5ncyBmb3IgdGhpcyBmaWVsZC5cblx0XHQvLyBJZiBubyBzZXR0aW5ncyBmb3IgdGhpcyBmaWVsZC4gQ2xvbmUgZnJvbSBwbGFjZWhvbGRlci5cblx0XHRpZiAoIHR5cGVvZiggdGlueU1DRVByZUluaXQubWNlSW5pdFsgaWQgXSApID09PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdHZhciBuZXdTZXR0aW5ncyA9IGpRdWVyeS5leHRlbmQoIHt9LCB0aW55TUNFUHJlSW5pdC5tY2VJbml0WyAnbXBiLXBsYWNlaG9sZGVyLWlkJyBdICk7XG5cdFx0XHRmb3IgKCBwcm9wIGluIG5ld1NldHRpbmdzICkge1xuXHRcdFx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YoIG5ld1NldHRpbmdzW3Byb3BdICkgKSB7XG5cdFx0XHRcdFx0bmV3U2V0dGluZ3NbcHJvcF0gPSBuZXdTZXR0aW5nc1twcm9wXS5yZXBsYWNlKCB0aGlzLmVkaXRvci5pZFJlZ2V4LCBpZCApLnJlcGxhY2UoIHRoaXMuZWRpdG9yLm5hbWVSZWdleCwgbmFtZSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdID0gbmV3U2V0dGluZ3M7XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGZ1bGxzY3JlZW4gcGx1Z2luLlxuXHRcdHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0ucGx1Z2lucyA9IHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0ucGx1Z2lucy5yZXBsYWNlKCAnZnVsbHNjcmVlbiwnLCAnJyApO1xuXG5cdFx0Ly8gR2V0IHF1aWNrdGFnIHNldHRpbmdzIGZvciB0aGlzIGZpZWxkLlxuXHRcdC8vIElmIG5vbmUgZXhpc3RzIGZvciB0aGlzIGZpZWxkLiBDbG9uZSBmcm9tIHBsYWNlaG9sZGVyLlxuXHRcdGlmICggdHlwZW9mKCB0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHR2YXIgbmV3UVRTID0galF1ZXJ5LmV4dGVuZCgge30sIHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgJ21wYi1wbGFjZWhvbGRlci1pZCcgXSApO1xuXHRcdFx0Zm9yICggcHJvcCBpbiBuZXdRVFMgKSB7XG5cdFx0XHRcdGlmICggJ3N0cmluZycgPT09IHR5cGVvZiggbmV3UVRTW3Byb3BdICkgKSB7XG5cdFx0XHRcdFx0bmV3UVRTW3Byb3BdID0gbmV3UVRTW3Byb3BdLnJlcGxhY2UoIHRoaXMuZWRpdG9yLmlkUmVnZXgsIGlkICkucmVwbGFjZSggdGhpcy5lZGl0b3IubmFtZVJlZ2V4LCBuYW1lICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgaWQgXSA9IG5ld1FUUztcblx0XHR9XG5cblx0XHQvLyBXaGVuIGVkaXRvciBpbml0cywgYXR0YWNoIHNhdmUgY2FsbGJhY2sgdG8gY2hhbmdlIGV2ZW50LlxuXHRcdHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbaWRdLnNldHVwID0gZnVuY3Rpb24oKSB7XG5cblx0XHRcdC8vIExpc3RlbiBmb3IgY2hhbmdlcyBpbiB0aGUgTUNFIGVkaXRvci5cblx0XHRcdHRoaXMub24oICdjaGFuZ2UnLCBmdW5jdGlvbiggZSApIHtcblx0XHRcdFx0c2VsZi5zZXRWYWx1ZSggZS50YXJnZXQuZ2V0Q29udGVudCgpICk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdC8vIFByZXZlbnQgRk9VQy4gU2hvdyBlbGVtZW50IGFmdGVyIGluaXQuXG5cdFx0XHR0aGlzLm9uKCAnaW5pdCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkZWwuY3NzKCAnZGlzcGxheScsICdibG9jaycgKTtcblx0XHRcdH0pO1xuXG5cdFx0fTtcblxuXHRcdC8vIExpc3RlbiBmb3IgY2hhbmdlcyBpbiB0aGUgSFRNTCBlZGl0b3IuXG5cdFx0JCgnIycgKyB0aGlzLmVkaXRvci5pZCApLm9uKCAna2V5ZG93biBjaGFuZ2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYuc2V0VmFsdWUoIHRoaXMudmFsdWUgKTtcblx0XHR9ICk7XG5cblx0XHQvLyBDdXJyZW50IG1vZGUgZGV0ZXJtaW5lZCBieSBjbGFzcyBvbiBlbGVtZW50LlxuXHRcdC8vIElmIG1vZGUgaXMgdmlzdWFsLCBjcmVhdGUgdGhlIHRpbnlNQ0UuXG5cdFx0aWYgKCAkZWwuaGFzQ2xhc3MoJ3RtY2UtYWN0aXZlJykgKSB7XG5cdFx0XHR0aW55TUNFLmluaXQoIHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbaWRdICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRlbC5jc3MoICdkaXNwbGF5JywgJ2Jsb2NrJyApO1xuXHRcdH1cblxuXHRcdC8vIEluaXQgcXVpY2t0YWdzLlxuXHRcdHF1aWNrdGFncyggdGlueU1DRVByZUluaXQucXRJbml0WyBpZCBdICk7XG5cdFx0UVRhZ3MuX2J1dHRvbnNJbml0KCk7XG5cblx0XHR2YXIgJGJ1aWxkZXIgPSB0aGlzLiRlbC5jbG9zZXN0KCAnLnVpLXNvcnRhYmxlJyApO1xuXG5cdFx0Ly8gSGFuZGxlIHRlbXBvcmFyeSByZW1vdmFsIG9mIHRpbnlNQ0Ugd2hlbiBzb3J0aW5nLlxuXHRcdCRidWlsZGVyLm9uKCAnc29ydHN0YXJ0JywgZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblxuXHRcdFx0aWYgKCBldmVudC5jdXJyZW50VGFyZ2V0ICE9PSAkYnVpbGRlciApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIHVpLml0ZW1bMF0uZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpID09PSB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSApIHtcblx0XHRcdFx0dGlueU1DRS5leGVjQ29tbWFuZCggJ21jZVJlbW92ZUVkaXRvcicsIGZhbHNlLCBpZCApO1xuXHRcdFx0fVxuXG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHQvLyBIYW5kbGUgcmUtaW5pdCBhZnRlciBzb3J0aW5nLlxuXHRcdCRidWlsZGVyLm9uKCAnc29ydHN0b3AnLCBmdW5jdGlvbiggZXZlbnQsIHVpICkge1xuXG5cdFx0XHRpZiAoIGV2ZW50LmN1cnJlbnRUYXJnZXQgIT09ICRidWlsZGVyICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmICggdWkuaXRlbVswXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2lkJykgPT09IHRoaXMuZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpICkge1xuXHRcdFx0XHR0aW55TUNFLmV4ZWNDb21tYW5kKCdtY2VBZGRFZGl0b3InLCBmYWxzZSwgaWQpO1xuXHRcdFx0fVxuXG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0fSxcblxuXHRyZW1vdmU6IGZ1bmN0aW9uKCkge1xuXHRcdHRpbnlNQ0UuZXhlY0NvbW1hbmQoICdtY2VSZW1vdmVFZGl0b3InLCBmYWxzZSwgdGhpcy5lZGl0b3IuaWQgKTtcblx0fSxcblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkV1lTSVdZRztcbiIsIi8qKlxuICogQWJzdHJhY3QgRmllbGQgQ2xhc3MuXG4gKlxuICogSGFuZGxlcyBzZXR1cCBhcyB3ZWxsIGFzIGdldHRpbmcgYW5kIHNldHRpbmcgdmFsdWVzLlxuICogUHJvdmlkZXMgYSB2ZXJ5IGdlbmVyaWMgcmVuZGVyIG1ldGhvZCAtIGJ1dCBwcm9iYWJseSBiZSBPSyBmb3IgbW9zdCBzaW1wbGUgZmllbGRzLlxuICovXG52YXIgRmllbGQgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICAgICAgbnVsbCxcblx0dmFsdWU6ICAgICAgICAgbnVsbCxcblx0Y29uZmlnOiAgICAgICAge30sXG5cdGRlZmF1bHRDb25maWc6IHt9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplLlxuXHQgKiBJZiB5b3UgZXh0ZW5kIHRoaXMgdmlldyAtIGl0IGlzIHJlY2NvbW1lZGVkIHRvIGNhbGwgdGhpcy5cblx0ICpcblx0ICogRXhwZWN0cyBvcHRpb25zLnZhbHVlIGFuZCBvcHRpb25zLmNvbmZpZy5cblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0dmFyIGNvbmZpZztcblxuXHRcdF8uYmluZEFsbCggdGhpcywgJ2dldFZhbHVlJywgJ3NldFZhbHVlJyApO1xuXG5cdFx0Ly8gSWYgYSBjaGFuZ2UgY2FsbGJhY2sgaXMgcHJvdmlkZWQsIGNhbGwgdGhpcyBvbiBjaGFuZ2UuXG5cdFx0aWYgKCAnb25DaGFuZ2UnIGluIG9wdGlvbnMgKSB7XG5cdFx0XHR0aGlzLm9uKCAnY2hhbmdlJywgb3B0aW9ucy5vbkNoYW5nZSApO1xuXHRcdH1cblxuXHRcdGNvbmZpZyA9ICggJ2NvbmZpZycgaW4gb3B0aW9ucyApID8gb3B0aW9ucy5jb25maWcgOiB7fTtcblx0XHR0aGlzLmNvbmZpZyA9IF8uZXh0ZW5kKCB7fSwgdGhpcy5kZWZhdWx0Q29uZmlnLCBjb25maWcgKTtcblxuXHRcdGlmICggJ3ZhbHVlJyBpbiBvcHRpb25zICkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggb3B0aW9ucy52YWx1ZSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdGdldFZhbHVlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy52YWx1ZTtcblx0fSxcblxuXHRzZXRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcblx0XHR0aGlzLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLnZhbHVlICk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0aWQ6ICAgICB0aGlzLmNpZCxcblx0XHRcdHZhbHVlOiAgdGhpcy52YWx1ZSxcblx0XHRcdGNvbmZpZzogdGhpcy5jb25maWdcblx0XHR9O1xuXG5cdFx0aWYgKCB0eXBlb2YgdGhpcy50ZW1wbGF0ZSA9PT0gJ3N0cmluZycgKSB7XG5cdFx0XHR0aGlzLnRlbXBsYXRlID0gXy50ZW1wbGF0ZSggdGhpcy50ZW1wbGF0ZSApO1xuXHRcdH1cblxuXHRcdHRoaXMuJGVsLmh0bWwoIHRoaXMudGVtcGxhdGUoIGRhdGEgKSApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZDtcbiIsInZhciAkICAgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgICAgICA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcbnZhciBmaWVsZFZpZXdzICAgICAgPSByZXF1aXJlKCcuLy4uL3V0aWxzL2ZpZWxkLXZpZXdzLmpzJyk7XG5cbi8qKlxuICogR2VuZXJpYyBFZGl0IEZvcm0uXG4gKlxuICogSGFuZGxlcyBhIHdpZGUgcmFuZ2Ugb2YgZ2VuZXJpYyBmaWVsZCB0eXBlcy5cbiAqIEZvciBlYWNoIGF0dHJpYnV0ZSwgaXQgY3JlYXRlcyBhIGZpZWxkIGJhc2VkIG9uIHRoZSBhdHRyaWJ1dGUgJ3R5cGUnXG4gKiBBbHNvIHVzZXMgb3B0aW9uYWwgYXR0cmlidXRlICdjb25maWcnIHByb3BlcnR5IHdoZW4gaW5pdGlhbGl6aW5nIGZpZWxkLlxuICovXG52YXIgTW9kdWxlRWRpdERlZmF1bHQgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cblx0cm93VGVtcGxhdGU6IF8udGVtcGxhdGUoICQoJyN0bXBsLW1wYi1mb3JtLXJvdycgKS5odG1sKCkgKSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggYXR0cmlidXRlcywgb3B0aW9ucyApIHtcblxuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgYXR0cmlidXRlcywgb3B0aW9ucyBdICk7XG5cblx0XHRfLmJpbmRBbGwoIHRoaXMsICdyZW5kZXInICk7XG5cblx0XHR2YXIgZmllbGRzID0gdGhpcy5maWVsZHMgPSB7fTtcblx0XHR2YXIgbW9kZWwgID0gdGhpcy5tb2RlbDtcblxuXHRcdC8vIEZvciBlYWNoIGF0dHJpYnV0ZSAtXG5cdFx0Ly8gaW5pdGlhbGl6ZSBhIGZpZWxkIGZvciB0aGF0IGF0dHJpYnV0ZSAndHlwZSdcblx0XHQvLyBTdG9yZSBpbiB0aGlzLmZpZWxkc1xuXHRcdC8vIFVzZSBjb25maWcgZnJvbSB0aGUgYXR0cmlidXRlXG5cdFx0dGhpcy5tb2RlbC5nZXQoJ2F0dHInKS5lYWNoKCBmdW5jdGlvbiggc2luZ2xlQXR0ciApIHtcblxuXHRcdFx0dmFyIGZpZWxkVmlldywgdHlwZSwgbmFtZSwgY29uZmlnO1xuXG5cdFx0XHR0eXBlID0gc2luZ2xlQXR0ci5nZXQoJ3R5cGUnKTtcblxuXHRcdFx0aWYgKCB0eXBlICYmICggdHlwZSBpbiBmaWVsZFZpZXdzICkgKSB7XG5cblx0XHRcdFx0ZmllbGRWaWV3ID0gZmllbGRWaWV3c1sgdHlwZSBdO1xuXHRcdFx0XHRuYW1lICAgICAgPSBzaW5nbGVBdHRyLmdldCgnbmFtZScpO1xuXHRcdFx0XHRjb25maWcgICAgPSBzaW5nbGVBdHRyLmdldCgnY29uZmlnJykgfHwge307XG5cblx0XHRcdFx0ZmllbGRzWyBuYW1lIF0gPSBuZXcgZmllbGRWaWV3KHtcblx0XHRcdFx0XHR2YWx1ZTogbW9kZWwuZ2V0QXR0clZhbHVlKCBuYW1lICksXG5cdFx0XHRcdFx0Y29uZmlnOiBjb25maWcsXG5cdFx0XHRcdFx0b25DaGFuZ2U6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRcdFx0XHRcdG1vZGVsLnNldEF0dHJWYWx1ZSggbmFtZSwgdmFsdWUgKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXG5cdFx0fSApO1xuXG5cdFx0Ly8gQ2xlYW51cC5cblx0XHQvLyBSZW1vdmUgZWFjaCBmaWVsZCB2aWV3IHdoZW4gdGhpcyBtb2RlbCBpcyBkZXN0cm95ZWQuXG5cdFx0dGhpcy5tb2RlbC5vbiggJ2Rlc3Ryb3knLCBmdW5jdGlvbigpIHtcblx0XHRcdF8uZWFjaCggZmllbGRzLCBmdW5jdGlvbihmaWVsZCkge1xuXHRcdFx0XHRmaWVsZC5yZW1vdmUoKTtcblx0XHRcdH0gKTtcblx0XHR9ICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gQ2FsbCBkZWZhdWx0IE1vZHVsZUVkZWl0IHJlbmRlci5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMgKTtcblxuXHRcdHZhciAkZWwgPSB0aGlzLiRlbDtcblxuXHRcdC8vIEZvciBlYWNoIGZpZWxkLCByZW5kZXIgc3ViLXZpZXcgYW5kIGFwcGVuZCB0byB0aGlzLiRlbFxuXHRcdC8vIFVzZXMgdGhpcy5yb3dUZW1wbGF0ZS5cblx0XHRfLmVhY2goIHRoaXMuZmllbGRzLCBmdW5jdGlvbiggZmllbGQsIG5hbWUgKSB7XG5cblx0XHRcdHZhciBhdHRyID0gdGhpcy5tb2RlbC5nZXRBdHRyKCBuYW1lICk7XG5cblx0XHRcdC8vIENyZWF0ZSByb3cgZWxlbWVudCBmcm9tIHRlbXBsYXRlLlxuXHRcdFx0dmFyICRyb3cgPSAkKCB0aGlzLnJvd1RlbXBsYXRlKCB7XG5cdFx0XHRcdGxhYmVsOiBhdHRyLmdldCgnbGFiZWwnKSxcblx0XHRcdFx0ZGVzYzogIGF0dHIuZ2V0KCdkZXNjcmlwdGlvbicgKSxcblx0XHRcdH0gKSApO1xuXG5cdFx0XHQkKCAnLmZpZWxkJywgJHJvdyApLmFwcGVuZCggZmllbGQucmVuZGVyKCkuJGVsICk7XG5cdFx0XHQkZWwuYXBwZW5kKCAkcm93ICk7XG5cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdC8vIFRyaWdnZXIgdGhlIG1icC1zb3J0LXN0b3AgZXZlbnQgZm9yIGVhY2ggZmllbGQuXG5cdFx0dGhpcy4kZWwub24oICdtcGItc29ydC1zdG9wJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRfLmVhY2goIHRoaXMuZmllbGRzLCBmdW5jdGlvbiggZmllbGQgKSB7XG5cdFx0XHRcdGZpZWxkLnRyaWdnZXIoICdtcGItc29ydC1zdG9wJyApO1xuXHRcdFx0fSApO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlRWRpdERlZmF1bHQ7XG4iLCJ2YXIgQmFja2JvbmUgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG4vKipcbiAqIFZlcnkgZ2VuZXJpYyBmb3JtIHZpZXcgaGFuZGxlci5cbiAqIFRoaXMgZG9lcyBzb21lIGJhc2ljIG1hZ2ljIGJhc2VkIG9uIGRhdGEgYXR0cmlidXRlcyB0byB1cGRhdGUgc2ltcGxlIHRleHQgZmllbGRzLlxuICovXG52YXIgTW9kdWxlRWRpdCA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHRjbGFzc05hbWU6ICAgICAnbW9kdWxlLWVkaXQnLFxuXHR0b29sc1RlbXBsYXRlOiBfLnRlbXBsYXRlKCAkKCcjdG1wbC1tcGItbW9kdWxlLWVkaXQtdG9vbHMnICkuaHRtbCgpICksXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0Xy5iaW5kQWxsKCB0aGlzLCAncmVtb3ZlTW9kZWwnICk7XG5cdH0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIC5idXR0b24tc2VsZWN0aW9uLWl0ZW0tcmVtb3ZlJzogJ3JlbW92ZU1vZGVsJyxcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGRhdGEgID0gdGhpcy5tb2RlbC50b0pTT04oKTtcblx0XHRkYXRhLmF0dHIgPSB7fTtcblxuXHRcdC8vIEZvcm1hdCBhdHRyaWJ1dGUgYXJyYXkgZm9yIGVhc3kgdGVtcGxhdGluZy5cblx0XHQvLyBCZWNhdXNlIGF0dHJpYnV0ZXMgaW4gYW4gYXJyYXkgaXMgZGlmZmljdWx0IHRvIGFjY2Vzcy5cblx0XHR0aGlzLm1vZGVsLmdldCgnYXR0cicpLmVhY2goIGZ1bmN0aW9uKCBhdHRyICkge1xuXHRcdFx0ZGF0YS5hdHRyWyBhdHRyLmdldCgnbmFtZScpIF0gPSBhdHRyLnRvSlNPTigpO1xuXHRcdH0gKTtcblxuXHRcdC8vIElEIGF0dHJpYnV0ZSwgc28gd2UgY2FuIGNvbm5lY3QgdGhlIHZpZXcgYW5kIG1vZGVsIGFnYWluIGxhdGVyLlxuXHRcdHRoaXMuJGVsLmF0dHIoICdkYXRhLWNpZCcsIHRoaXMubW9kZWwuY2lkICk7XG5cblx0XHQvLyBBcHBlbmQgdGhlIG1vZHVsZSB0b29scy5cblx0XHR0aGlzLiRlbC5wcmVwZW5kKCB0aGlzLnRvb2xzVGVtcGxhdGUoIGRhdGEgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHQvKipcblx0ICogUmVtb3ZlIG1vZGVsIGhhbmRsZXIuXG5cdCAqL1xuXHRyZW1vdmVNb2RlbDogZnVuY3Rpb24oZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR0aGlzLnJlbW92ZSgpO1xuXHRcdHRoaXMubW9kZWwuZGVzdHJveSgpO1xuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGVFZGl0O1xuIl19
