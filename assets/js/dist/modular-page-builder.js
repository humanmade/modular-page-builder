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

},{"./field.js":21}],13:[function(require,module,exports){
(function (global){
var $     = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Field = require('./field.js');

var FieldText = Field.extend({

	template:  '<label><input type="checkbox" <% if ( id ) { %>id="<%= id %>"<% } %> <% if ( value ) { %>checked="checked"<% } %>><%= config.label %></label>',

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

	template:  $( '#tmpl-mpb-field-link' ).html(),

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

	template:  $( '#tmpl-mpb-field-number' ).html(),

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

	template:  $( '#tmpl-mpb-field-text' ).html(),

	defaultConfig: {
		multiple: true,
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

		this.$el.html( _.template( this.template, data ) );

		this.initSelect2();

		return this;

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

	template:  $( '#tmpl-mpb-field-select' ).html(),
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
		this.$el.html( _.template( this.template, data ) );

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

},{"./field.js":21}],19:[function(require,module,exports){
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

		this.$el.html( _.template( this.template, data ) );
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

	rowTemplate: $('#tmpl-mpb-form-row' ).html(),

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
			var $row = $( _.template( this.rowTemplate, {
				label: attr.get('label'),
				desc:  attr.get('description' ),
			} ) );

			$( '.field', $row ).append( field.render().$el );
			$el.append( $row );

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvc3JjL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9nbG9iYWxzLmpzIiwiYXNzZXRzL2pzL3NyYy9tb2RlbHMvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMiLCJhc3NldHMvanMvc3JjL21vZGVscy9tb2R1bGUuanMiLCJhc3NldHMvanMvc3JjL21vZHVsYXItcGFnZS1idWlsZGVyLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9lZGl0LXZpZXdzLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9maWVsZC12aWV3cy5qcyIsImFzc2V0cy9qcy9zcmMvdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2J1aWxkZXIuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1hdHRhY2htZW50LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtY2hlY2tib3guanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1saW5rLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtbnVtYmVyLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtcG9zdC1zZWxlY3QuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1zZWxlY3QuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC10ZXh0LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtdGV4dGFyZWEuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC13eXNpd3lnLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWRlZmF1bHQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZUF0dHJpYnV0ZSA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMnKTtcblxuLyoqXG4gKiBTaG9ydGNvZGUgQXR0cmlidXRlcyBjb2xsZWN0aW9uLlxuICovXG52YXIgU2hvcnRjb2RlQXR0cmlidXRlcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblxuXHRtb2RlbCA6IE1vZHVsZUF0dHJpYnV0ZSxcblxuXHQvLyBEZWVwIENsb25lLlxuXHRjbG9uZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCBfLm1hcCggdGhpcy5tb2RlbHMsIGZ1bmN0aW9uKG0pIHtcblx0XHRcdHJldHVybiBtLmNsb25lKCk7XG5cdFx0fSkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGpzb24gPSB7fTtcblxuXHRcdHRoaXMuZWFjaCggZnVuY3Rpb24oIG1vZGVsICkge1xuXHRcdFx0anNvblsgbW9kZWwuZ2V0KCAnbmFtZScgKSBdID0gbW9kZWwudG9NaWNyb0pTT04oKTtcblx0XHR9ICk7XG5cblx0XHRyZXR1cm4ganNvbjtcblx0fSxcblxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaG9ydGNvZGVBdHRyaWJ1dGVzO1xuIiwidmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgTW9kdWxlICAgPSByZXF1aXJlKCcuLy4uL21vZGVscy9tb2R1bGUuanMnKTtcblxuLy8gU2hvcnRjb2RlIENvbGxlY3Rpb25cbnZhciBNb2R1bGVzID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXG5cdG1vZGVsIDogTW9kdWxlLFxuXG5cdC8vICBEZWVwIENsb25lLlxuXHRjbG9uZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvciggXy5tYXAoIHRoaXMubW9kZWxzLCBmdW5jdGlvbihtKSB7XG5cdFx0XHRyZXR1cm4gbS5jbG9uZSgpO1xuXHRcdH0pKTtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIG9ubHkgdGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBzYXZlZC5cblx0ICpcblx0ICogQHJldHVybiBvYmplY3Rcblx0ICovXG5cdHRvTWljcm9KU09OOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoIGZ1bmN0aW9uKG1vZGVsKSB7IHJldHVybiBtb2RlbC50b01pY3JvSlNPTiggb3B0aW9ucyApOyB9ICk7XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZXM7XG4iLCIvLyBFeHBvc2Ugc29tZSBmdW5jdGlvbmFsaXR5IGdsb2JhbGx5LlxudmFyIGdsb2JhbHMgPSB7XG5cdEJ1aWxkZXI6ICAgICAgIHJlcXVpcmUoJy4vbW9kZWxzL2J1aWxkZXIuanMnKSxcblx0TW9kdWxlRmFjdG9yeTogcmVxdWlyZSgnLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpLFxuXHRlZGl0Vmlld3M6ICAgICByZXF1aXJlKCcuL3V0aWxzL2VkaXQtdmlld3MuanMnKSxcblx0ZmllbGRWaWV3czogICAgcmVxdWlyZSgnLi91dGlscy9maWVsZC12aWV3cy5qcycpLFxuXHR2aWV3czoge1xuXHRcdEJ1aWxkZXJWaWV3OiAgICAgcmVxdWlyZSgnLi92aWV3cy9idWlsZGVyLmpzJyksXG5cdFx0TW9kdWxlRWRpdDogICAgICByZXF1aXJlKCcuL3ZpZXdzL21vZHVsZS1lZGl0LmpzJyksXG5cdFx0TW9kdWxlRWRpdERlZmF1bHQ6IHJlcXVpcmUoJy4vdmlld3MvbW9kdWxlLWVkaXQtZGVmYXVsdC5qcycpLFxuXHRcdEZpZWxkOiAgICAgICAgICAgcmVxdWlyZSgnLi92aWV3cy9maWVsZHMvZmllbGQuanMnKSxcblx0XHRGaWVsZExpbms6ICAgICAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLWxpbmsuanMnKSxcblx0XHRGaWVsZEF0dGFjaG1lbnQ6IHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLWF0dGFjaG1lbnQuanMnKSxcblx0XHRGaWVsZFRleHQ6ICAgICAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLXRleHQuanMnKSxcblx0XHRGaWVsZFRleHRhcmVhOiAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLXRleHRhcmVhLmpzJyksXG5cdFx0RmllbGRXeXNpd3lnOiAgICByZXF1aXJlKCcuL3ZpZXdzL2ZpZWxkcy9maWVsZC13eXNpd3lnLmpzJyksXG5cdFx0RmllbGRQb3N0U2VsZWN0OiByZXF1aXJlKCcuL3ZpZXdzL2ZpZWxkcy9maWVsZC1wb3N0LXNlbGVjdC5qcycpLFxuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdsb2JhbHM7XG4iLCJ2YXIgQmFja2JvbmUgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIE1vZHVsZXMgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2NvbGxlY3Rpb25zL21vZHVsZXMuanMnKTtcbnZhciBNb2R1bGVGYWN0b3J5ICAgID0gcmVxdWlyZSgnLi8uLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpO1xuXG52YXIgQnVpbGRlciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRzZWxlY3REZWZhdWx0OiAgbW9kdWxhclBhZ2VCdWlsZGVyRGF0YS5sMTBuLnNlbGVjdERlZmF1bHQsXG5cdFx0YWRkTmV3QnV0dG9uOiAgIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEubDEwbi5hZGROZXdCdXR0b24sXG5cdFx0c2VsZWN0aW9uOiAgICAgIFtdLCAvLyBJbnN0YW5jZSBvZiBNb2R1bGVzLiBDYW4ndCB1c2UgYSBkZWZhdWx0LCBvdGhlcndpc2UgdGhleSB3b24ndCBiZSB1bmlxdWUuXG5cdFx0YWxsb3dlZE1vZHVsZXM6IFtdLCAvLyBNb2R1bGUgbmFtZXMgYWxsb3dlZCBmb3IgdGhpcyBidWlsZGVyLlxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gU2V0IGRlZmF1bHQgc2VsZWN0aW9uIHRvIGVuc3VyZSBpdCBpc24ndCBhIHJlZmVyZW5jZS5cblx0XHRpZiAoICEgKCB0aGlzLmdldCgnc2VsZWN0aW9uJykgaW5zdGFuY2VvZiBNb2R1bGVzICkgKSB7XG5cdFx0XHR0aGlzLnNldCggJ3NlbGVjdGlvbicsIG5ldyBNb2R1bGVzKCkgKTtcblx0XHR9XG5cblx0fSxcblxuXHRzZXREYXRhOiBmdW5jdGlvbiggZGF0YSApIHtcblxuXHRcdHZhciBzZWxlY3Rpb247XG5cblx0XHRpZiAoICcnID09PSBkYXRhICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEhhbmRsZSBlaXRoZXIgSlNPTiBzdHJpbmcgb3IgcHJvcGVyIG9iaGVjdC5cblx0XHRkYXRhID0gKCAnc3RyaW5nJyA9PT0gdHlwZW9mIGRhdGEgKSA/IEpTT04ucGFyc2UoIGRhdGEgKSA6IGRhdGE7XG5cblx0XHQvLyBDb252ZXJ0IHNhdmVkIGRhdGEgdG8gTW9kdWxlIG1vZGVscy5cblx0XHRpZiAoIGRhdGEgJiYgQXJyYXkuaXNBcnJheSggZGF0YSApICkge1xuXHRcdFx0c2VsZWN0aW9uID0gZGF0YS5tYXAoIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHRcdHJldHVybiBNb2R1bGVGYWN0b3J5LmNyZWF0ZSggbW9kdWxlLm5hbWUsIG1vZHVsZS5hdHRyICk7XG5cdFx0XHR9ICk7XG5cdFx0fVxuXG5cdFx0Ly8gUmVzZXQgc2VsZWN0aW9uIHVzaW5nIGRhdGEgZnJvbSBoaWRkZW4gaW5wdXQuXG5cdFx0aWYgKCBzZWxlY3Rpb24gJiYgc2VsZWN0aW9uLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuZ2V0KCdzZWxlY3Rpb24nKS5hZGQoIHNlbGVjdGlvbiApO1xuXHRcdH1cblxuXHR9LFxuXG5cdHNhdmVEYXRhOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBkYXRhID0gW107XG5cblx0XHR0aGlzLmdldCgnc2VsZWN0aW9uJykuZWFjaCggZnVuY3Rpb24oIG1vZHVsZSApIHtcblxuXHRcdFx0Ly8gU2tpcCBlbXB0eS9icm9rZW4gbW9kdWxlcy5cblx0XHRcdGlmICggISBtb2R1bGUuZ2V0KCduYW1lJyApICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGRhdGEucHVzaCggbW9kdWxlLnRvTWljcm9KU09OKCkgKTtcblxuXHRcdH0gKTtcblxuXHRcdHRoaXMudHJpZ2dlciggJ3NhdmUnLCBkYXRhICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogTGlzdCBhbGwgYXZhaWxhYmxlIG1vZHVsZXMgZm9yIHRoaXMgYnVpbGRlci5cblx0ICogQWxsIG1vZHVsZXMsIGZpbHRlcmVkIGJ5IHRoaXMuYWxsb3dlZE1vZHVsZXMuXG5cdCAqL1xuXHRnZXRBdmFpbGFibGVNb2R1bGVzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gXy5maWx0ZXIoIE1vZHVsZUZhY3RvcnkuYXZhaWxhYmxlTW9kdWxlcywgZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdHJldHVybiB0aGlzLmlzTW9kdWxlQWxsb3dlZCggbW9kdWxlLm5hbWUgKTtcblx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHR9LFxuXG5cdGlzTW9kdWxlQWxsb3dlZDogZnVuY3Rpb24oIG1vZHVsZU5hbWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCdhbGxvd2VkTW9kdWxlcycpLmluZGV4T2YoIG1vZHVsZU5hbWUgKSA+PSAwO1xuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1aWxkZXI7XG4iLCJ2YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcblxudmFyIE1vZHVsZUF0dHJpYnV0ZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRuYW1lOiAgICAgICAgICcnLFxuXHRcdGxhYmVsOiAgICAgICAgJycsXG5cdFx0dmFsdWU6ICAgICAgICAnJyxcblx0XHR0eXBlOiAgICAgICAgICd0ZXh0Jyxcblx0XHRkZXNjcmlwdGlvbjogICcnLFxuXHRcdGRlZmF1bHRWYWx1ZTogJycsXG5cdFx0Y29uZmlnOiAgICAgICB7fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHIgPSB7fTtcblx0XHR2YXIgYWxsb3dlZEF0dHJQcm9wZXJ0aWVzID0gWyAnbmFtZScsICd2YWx1ZScsICd0eXBlJyBdO1xuXG5cdFx0Xy5lYWNoKCBhbGxvd2VkQXR0clByb3BlcnRpZXMsIGZ1bmN0aW9uKCBwcm9wICkge1xuXHRcdFx0clsgcHJvcCBdID0gdGhpcy5nZXQoIHByb3AgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHJldHVybiByO1xuXG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlQXR0cmlidXRlO1xuIiwidmFyIEJhY2tib25lICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGVBdHRzID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGUtYXR0cmlidXRlcy5qcycpO1xuXG52YXIgTW9kdWxlID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuXHRkZWZhdWx0czoge1xuXHRcdG5hbWU6ICAnJyxcblx0XHRsYWJlbDogJycsXG5cdFx0YXR0cjogIFtdLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gU2V0IGRlZmF1bHQgc2VsZWN0aW9uIHRvIGVuc3VyZSBpdCBpc24ndCBhIHJlZmVyZW5jZS5cblx0XHRpZiAoICEgKCB0aGlzLmdldCgnYXR0cicpIGluc3RhbmNlb2YgTW9kdWxlQXR0cyApICkge1xuXHRcdFx0dGhpcy5zZXQoICdhdHRyJywgbmV3IE1vZHVsZUF0dHMoKSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgZm9yIGdldHRpbmcgYW4gYXR0cmlidXRlIG1vZGVsIGJ5IG5hbWUuXG5cdCAqL1xuXHRnZXRBdHRyOiBmdW5jdGlvbiggYXR0ck5hbWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCdhdHRyJykuZmluZFdoZXJlKCB7IG5hbWU6IGF0dHJOYW1lIH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgZm9yIHNldHRpbmcgYW4gYXR0cmlidXRlIHZhbHVlXG5cdCAqXG5cdCAqIE5vdGUgbWFudWFsIGNoYW5nZSBldmVudCB0cmlnZ2VyIHRvIGVuc3VyZSBldmVyeXRoaW5nIGlzIHVwZGF0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzdHJpbmcgYXR0cmlidXRlXG5cdCAqIEBwYXJhbSBtaXhlZCAgdmFsdWVcblx0ICovXG5cdHNldEF0dHJWYWx1ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZSwgdmFsdWUgKSB7XG5cblx0XHR2YXIgYXR0ciA9IHRoaXMuZ2V0QXR0ciggYXR0cmlidXRlICk7XG5cblx0XHRpZiAoIGF0dHIgKSB7XG5cdFx0XHRhdHRyLnNldCggJ3ZhbHVlJywgdmFsdWUgKTtcblx0XHRcdHRoaXMudHJpZ2dlciggJ2NoYW5nZScsIHRoaXMubW9kZWwgKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogSGVscGVyIGZvciBnZXR0aW5nIGFuIGF0dHJpYnV0ZSB2YWx1ZS5cblx0ICpcblx0ICogRGVmYXVsdHMgdG8gbnVsbC5cblx0ICpcblx0ICogQHBhcmFtIHN0cmluZyBhdHRyaWJ1dGVcblx0ICovXG5cdGdldEF0dHJWYWx1ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZSApIHtcblxuXHRcdHZhciBhdHRyID0gdGhpcy5nZXRBdHRyKCBhdHRyaWJ1dGUgKTtcblxuXHRcdGlmICggYXR0ciApIHtcblx0XHRcdHJldHVybiBhdHRyLmdldCggJ3ZhbHVlJyApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBDdXN0b20gUGFyc2UuXG5cdCAqIEVuc3VyZXMgYXR0cmlidXRlcyBpcyBhbiBpbnN0YW5jZSBvZiBNb2R1bGVBdHRzXG5cdCAqL1xuXHRwYXJzZTogZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXG5cdFx0aWYgKCAnYXR0cicgaW4gcmVzcG9uc2UgJiYgISAoIHJlc3BvbnNlLmF0dHIgaW5zdGFuY2VvZiBNb2R1bGVBdHRzICkgKSB7XG5cdFx0XHRyZXNwb25zZS5hdHRyID0gbmV3IE1vZHVsZUF0dHMoIHJlc3BvbnNlLmF0dHIgKTtcblx0XHR9XG5cblx0ICAgIHJldHVybiByZXNwb25zZTtcblxuXHR9LFxuXG5cdHRvSlNPTjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIganNvbiA9IF8uY2xvbmUoIHRoaXMuYXR0cmlidXRlcyApO1xuXG5cdFx0aWYgKCAnYXR0cicgaW4ganNvbiAmJiAoIGpzb24uYXR0ciBpbnN0YW5jZW9mIE1vZHVsZUF0dHMgKSApIHtcblx0XHRcdGpzb24uYXR0ciA9IGpzb24uYXR0ci50b0pTT04oKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ganNvbjtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRuYW1lOiB0aGlzLmdldCgnbmFtZScpLFxuXHRcdFx0YXR0cjogdGhpcy5nZXQoJ2F0dHInKS50b01pY3JvSlNPTigpXG5cdFx0fTtcblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlO1xuIiwidmFyICQgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEJ1aWxkZXIgICAgICAgPSByZXF1aXJlKCcuL21vZGVscy9idWlsZGVyLmpzJyk7XG52YXIgQnVpbGRlclZpZXcgICA9IHJlcXVpcmUoJy4vdmlld3MvYnVpbGRlci5qcycpO1xudmFyIE1vZHVsZUZhY3RvcnkgPSByZXF1aXJlKCcuL3V0aWxzL21vZHVsZS1mYWN0b3J5LmpzJyk7XG5cbi8vIEV4cG9zZSBzb21lIGZ1bmN0aW9uYWxpdHkgdG8gZ2xvYmFsIG5hbWVzcGFjZS5cbndpbmRvdy5tb2R1bGFyUGFnZUJ1aWxkZXIgPSByZXF1aXJlKCcuL2dsb2JhbHMnKTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuXHRNb2R1bGVGYWN0b3J5LmluaXQoKTtcblxuXHQvLyBBIGZpZWxkIGZvciBzdG9yaW5nIHRoZSBidWlsZGVyIGRhdGEuXG5cdHZhciAkZmllbGQgPSAkKCAnW25hbWU9bW9kdWxhci1wYWdlLWJ1aWxkZXItZGF0YV0nICk7XG5cblx0aWYgKCAhICRmaWVsZC5sZW5ndGggKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gQSBjb250YWluZXIgZWxlbWVudCBmb3IgZGlzcGxheWluZyB0aGUgYnVpbGRlci5cblx0dmFyICRjb250YWluZXIgPSAkKCAnI21vZHVsYXItcGFnZS1idWlsZGVyJyApO1xuXG5cdC8vIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBCdWlsZGVyIG1vZGVsLlxuXHQvLyBQYXNzIGFuIGFycmF5IG9mIG1vZHVsZSBuYW1lcyB0aGF0IGFyZSBhbGxvd2VkIGZvciB0aGlzIGJ1aWxkZXIuXG5cdHZhciBidWlsZGVyID0gbmV3IEJ1aWxkZXIoe1xuXHRcdGFsbG93ZWRNb2R1bGVzOiAkKCAnW25hbWU9bW9kdWxhci1wYWdlLWJ1aWxkZXItYWxsb3dlZC1tb2R1bGVzXScgKS52YWwoKS5zcGxpdCgnLCcpXG5cdH0pO1xuXG5cdC8vIFNldCB0aGUgZGF0YSB1c2luZyB0aGUgY3VycmVudCBmaWVsZCB2YWx1ZVxuXHRidWlsZGVyLnNldERhdGEoIEpTT04ucGFyc2UoICRmaWVsZC52YWwoKSApICk7XG5cblx0Ly8gT24gc2F2ZSwgdXBkYXRlIHRoZSBmaWVsZCB2YWx1ZS5cblx0YnVpbGRlci5vbiggJ3NhdmUnLCBmdW5jdGlvbiggZGF0YSApIHtcblx0XHQkZmllbGQudmFsKCBKU09OLnN0cmluZ2lmeSggZGF0YSApICk7XG5cdH0gKTtcblxuXHQvLyBDcmVhdGUgYnVpbGRlciB2aWV3LlxuXHR2YXIgYnVpbGRlclZpZXcgPSBuZXcgQnVpbGRlclZpZXcoIHsgbW9kZWw6IGJ1aWxkZXIgfSApO1xuXG5cdC8vIFJlbmRlciBidWlsZGVyLlxuXHRidWlsZGVyVmlldy5yZW5kZXIoKS4kZWwuYXBwZW5kVG8oICRjb250YWluZXIgKTtcblxufSk7XG4iLCJ2YXIgTW9kdWxlRWRpdERlZmF1bHQgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LWRlZmF1bHQuanMnKTtcblxuLyoqXG4gKiBNYXAgbW9kdWxlIHR5cGUgdG8gdmlld3MuXG4gKi9cbnZhciBlZGl0Vmlld3MgPSB7XG5cdCdkZWZhdWx0JzogTW9kdWxlRWRpdERlZmF1bHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZWRpdFZpZXdzO1xuIiwidmFyIEZpZWxkVGV4dCAgICAgICA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLXRleHQuanMnKTtcbnZhciBGaWVsZFRleHRhcmVhICAgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL2ZpZWxkcy9maWVsZC10ZXh0YXJlYS5qcycpO1xudmFyIEZpZWxkV1lTSVdZRyAgICA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLXd5c2l3eWcuanMnKTtcbnZhciBGaWVsZEF0dGFjaG1lbnQgPSByZXF1aXJlKCcuLy4uL3ZpZXdzL2ZpZWxkcy9maWVsZC1hdHRhY2htZW50LmpzJyk7XG52YXIgRmllbGRMaW5rICAgICAgID0gcmVxdWlyZSgnLi8uLi92aWV3cy9maWVsZHMvZmllbGQtbGluay5qcycpO1xudmFyIEZpZWxkTnVtYmVyICAgICA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLW51bWJlci5qcycpO1xudmFyIEZpZWxkQ2hlY2tib3ggICA9IHJlcXVpcmUoJy4vLi4vdmlld3MvZmllbGRzL2ZpZWxkLWNoZWNrYm94LmpzJyk7XG52YXIgRmllbGRTZWxlY3QgICAgID0gcmVxdWlyZSgnLi8uLi92aWV3cy9maWVsZHMvZmllbGQtc2VsZWN0LmpzJyk7XG52YXIgRmllbGRQb3N0U2VsZWN0ID0gcmVxdWlyZSgnLi8uLi92aWV3cy9maWVsZHMvZmllbGQtcG9zdC1zZWxlY3QuanMnKTtcblxudmFyIGZpZWxkVmlld3MgPSB7XG5cdHRleHQ6ICAgICAgICBGaWVsZFRleHQsXG5cdHRleHRhcmVhOiAgICBGaWVsZFRleHRhcmVhLFxuXHRodG1sOiAgICAgICAgRmllbGRXWVNJV1lHLFxuXHRudW1iZXI6ICAgICAgRmllbGROdW1iZXIsXG5cdGF0dGFjaG1lbnQ6ICBGaWVsZEF0dGFjaG1lbnQsXG5cdGxpbms6ICAgICAgICBGaWVsZExpbmssXG5cdGNoZWNrYm94OiAgICBGaWVsZENoZWNrYm94LFxuXHRzZWxlY3Q6ICAgICAgRmllbGRTZWxlY3QsXG5cdHBvc3Rfc2VsZWN0OiBGaWVsZFBvc3RTZWxlY3QsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZpZWxkVmlld3M7XG4iLCJ2YXIgTW9kdWxlICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL21vZHVsZS5qcycpO1xudmFyIE1vZHVsZUF0dHMgICAgICAgPSByZXF1aXJlKCcuLy4uL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzJyk7XG52YXIgZWRpdFZpZXdzICAgICAgICA9IHJlcXVpcmUoJy4vZWRpdC12aWV3cy5qcycpO1xudmFyICQgICAgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG52YXIgTW9kdWxlRmFjdG9yeSA9IHtcblxuXHRhdmFpbGFibGVNb2R1bGVzOiBbXSxcblxuXHRpbml0OiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEgJiYgJ2F2YWlsYWJsZV9tb2R1bGVzJyBpbiBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhICkge1xuXHRcdFx0Xy5lYWNoKCBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhLmF2YWlsYWJsZV9tb2R1bGVzLCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0XHR0aGlzLnJlZ2lzdGVyTW9kdWxlKCBtb2R1bGUgKTtcblx0XHRcdH0uYmluZCggdGhpcyApICk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlZ2lzdGVyTW9kdWxlOiBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdHRoaXMuYXZhaWxhYmxlTW9kdWxlcy5wdXNoKCBtb2R1bGUgKTtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIE1vZHVsZSBNb2RlbC5cblx0ICogVXNlIGRhdGEgZnJvbSBjb25maWcsIHBsdXMgc2F2ZWQgZGF0YS5cblx0ICpcblx0ICogQHBhcmFtICBzdHJpbmcgbW9kdWxlTmFtZVxuXHQgKiBAcGFyYW0gIG9iamVjdCBhdHRyaWJ1dGUgSlNPTi4gU2F2ZWQgYXR0cmlidXRlIHZhbHVlcy5cblx0ICogQHJldHVybiBNb2R1bGVcblx0ICovXG5cdGNyZWF0ZTogZnVuY3Rpb24oIG1vZHVsZU5hbWUsIGF0dHJEYXRhICkge1xuXG5cdFx0dmFyIGRhdGEgPSAkLmV4dGVuZCggdHJ1ZSwge30sIF8uZmluZFdoZXJlKCB0aGlzLmF2YWlsYWJsZU1vZHVsZXMsIHsgbmFtZTogbW9kdWxlTmFtZSB9ICkgKTtcblxuXHRcdGlmICggISBkYXRhICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cblx0XHR2YXIgYXR0cmlidXRlcyA9IG5ldyBNb2R1bGVBdHRzKCk7XG5cblx0XHQvKipcblx0XHQgKiBBZGQgYWxsIHRoZSBtb2R1bGUgYXR0cmlidXRlcy5cblx0XHQgKiBXaGl0ZWxpc3RlZCB0byBhdHRyaWJ1dGVzIGRvY3VtZW50ZWQgaW4gc2NoZW1hXG5cdFx0ICogU2V0cyBvbmx5IHZhbHVlIGZyb20gYXR0ckRhdGEuXG5cdFx0ICovXG5cdFx0Xy5lYWNoKCBkYXRhLmF0dHIsIGZ1bmN0aW9uKCBhdHRyICkge1xuXG5cdFx0XHR2YXIgY2xvbmVBdHRyID0gJC5leHRlbmQoIHRydWUsIHt9LCBhdHRyICApO1xuXHRcdFx0dmFyIHNhdmVkQXR0ciA9IF8uZmluZFdoZXJlKCBhdHRyRGF0YSwgeyBuYW1lOiBhdHRyLm5hbWUgfSApO1xuXG5cdFx0XHQvLyBBZGQgc2F2ZWQgYXR0cmlidXRlIHZhbHVlcy5cblx0XHRcdGlmICggc2F2ZWRBdHRyICYmICd2YWx1ZScgaW4gc2F2ZWRBdHRyICkge1xuXHRcdFx0XHRjbG9uZUF0dHIudmFsdWUgPSBzYXZlZEF0dHIudmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdGF0dHJpYnV0ZXMuYWRkKCBjbG9uZUF0dHIgKTtcblxuXHRcdH0gKTtcblxuXHRcdGRhdGEuYXR0ciA9IGF0dHJpYnV0ZXM7XG5cblx0ICAgIHJldHVybiBuZXcgTW9kdWxlKCBkYXRhICk7XG5cblx0fSxcblxuXHRjcmVhdGVFZGl0VmlldzogZnVuY3Rpb24oIG1vZGVsICkge1xuXG5cdFx0dmFyIGVkaXRWaWV3LCBtb2R1bGVOYW1lO1xuXG5cdFx0bW9kdWxlTmFtZSA9IG1vZGVsLmdldCgnbmFtZScpO1xuXHRcdGVkaXRWaWV3ICAgPSAoIG5hbWUgaW4gZWRpdFZpZXdzICkgPyBlZGl0Vmlld3NbIG1vZHVsZU5hbWUgXSA6IGVkaXRWaWV3c1snZGVmYXVsdCddO1xuXG5cdFx0cmV0dXJuIG5ldyBlZGl0VmlldyggeyBtb2RlbDogbW9kZWwgfSApO1xuXG5cdH0sXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlRmFjdG9yeTtcbiIsInZhciBCYWNrYm9uZSAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgQnVpbGRlciAgICAgICA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2J1aWxkZXIuanMnKTtcbnZhciBNb2R1bGVGYWN0b3J5ID0gcmVxdWlyZSgnLi8uLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpO1xudmFyICQgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG52YXIgQnVpbGRlciA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJCgnI3RtcGwtbXBiLWJ1aWxkZXInICkuaHRtbCgpLFxuXHRjbGFzc05hbWU6ICdtb2R1bGFyLXBhZ2UtYnVpbGRlcicsXG5cdG1vZGVsOiBudWxsLFxuXHRuZXdNb2R1bGVOYW1lOiBudWxsLFxuXG5cdGV2ZW50czoge1xuXHRcdCdjaGFuZ2UgPiAuYWRkLW5ldyAuYWRkLW5ldy1tb2R1bGUtc2VsZWN0JzogJ3RvZ2dsZUJ1dHRvblN0YXR1cycsXG5cdFx0J2NsaWNrID4gLmFkZC1uZXcgLmFkZC1uZXctbW9kdWxlLWJ1dHRvbic6ICdhZGRNb2R1bGUnLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMubW9kZWwuZ2V0KCdzZWxlY3Rpb24nKTtcblxuXHRcdHNlbGVjdGlvbi5vbiggJ2FkZCcsIHRoaXMuYWRkTmV3U2VsZWN0aW9uSXRlbVZpZXcsIHRoaXMgKTtcblx0XHRzZWxlY3Rpb24ub24oICdhbGwnLCB0aGlzLm1vZGVsLnNhdmVEYXRhLCB0aGlzLm1vZGVsICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGRhdGEgPSB0aGlzLm1vZGVsLnRvSlNPTigpO1xuXG5cdFx0dGhpcy4kZWwuaHRtbCggXy50ZW1wbGF0ZSggdGhpcy50ZW1wbGF0ZSwgZGF0YSAgKSApO1xuXG5cdFx0dGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpLmVhY2goIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHR0aGlzLmFkZE5ld1NlbGVjdGlvbkl0ZW1WaWV3KCBtb2R1bGUgKTtcblx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXG5cdFx0dGhpcy5yZW5kZXJBZGROZXcoKTtcblx0XHR0aGlzLmluaXRTb3J0YWJsZSgpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHQvKipcblx0ICogUmVuZGVyIHRoZSBBZGQgTmV3IG1vZHVsZSBjb250cm9scy5cblx0ICovXG5cdHJlbmRlckFkZE5ldzogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgJHNlbGVjdCA9IHRoaXMuJGVsLmZpbmQoICc+IC5hZGQtbmV3IHNlbGVjdC5hZGQtbmV3LW1vZHVsZS1zZWxlY3QnICk7XG5cblx0XHQkc2VsZWN0LmFwcGVuZChcblx0XHRcdCQoICc8b3B0aW9uLz4nLCB7IHRleHQ6IG1vZHVsYXJQYWdlQnVpbGRlckRhdGEubDEwbi5zZWxlY3REZWZhdWx0IH0gKVxuXHRcdCk7XG5cblx0XHRfLmVhY2goIHRoaXMubW9kZWwuZ2V0QXZhaWxhYmxlTW9kdWxlcygpLCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0dmFyIHRlbXBsYXRlID0gJzxvcHRpb24gdmFsdWU9XCI8JT0gbmFtZSAlPlwiPjwlPSBsYWJlbCAlPjwvb3B0aW9uPic7XG5cdFx0XHQkc2VsZWN0LmFwcGVuZCggXy50ZW1wbGF0ZSggdGVtcGxhdGUsIG1vZHVsZSApICk7XG5cdFx0fSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgU29ydGFibGUuXG5cdCAqL1xuXHRpbml0U29ydGFibGU6IGZ1bmN0aW9uKCkge1xuXHRcdCQoICc+IC5zZWxlY3Rpb24nLCB0aGlzLiRlbCApLnNvcnRhYmxlKHtcblx0XHRcdGhhbmRsZTogJy5tb2R1bGUtZWRpdC10b29scycsXG5cdFx0XHRpdGVtczogJz4gLm1vZHVsZS1lZGl0Jyxcblx0XHRcdHN0b3A6IHRoaXMudXBkYXRlU2VsZWN0aW9uT3JkZXIuYmluZCggdGhpcyApLFxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTb3J0YWJsZSBlbmQgY2FsbGJhY2suXG5cdCAqIEFmdGVyIHJlb3JkZXJpbmcsIHVwZGF0ZSB0aGUgc2VsZWN0aW9uIG9yZGVyLlxuXHQgKiBOb3RlIC0gdXNlcyBkaXJlY3QgbWFuaXB1bGF0aW9uIG9mIGNvbGxlY3Rpb24gbW9kZWxzIHByb3BlcnR5LlxuXHQgKiBUaGlzIGlzIHRvIGF2b2lkIGhhdmluZyB0byBtZXNzIGFib3V0IHdpdGggdGhlIHZpZXdzIHRoZW1zZWx2ZXMuXG5cdCAqL1xuXHR1cGRhdGVTZWxlY3Rpb25PcmRlcjogZnVuY3Rpb24oIGUsIHVpICkge1xuXG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMubW9kZWwuZ2V0KCdzZWxlY3Rpb24nKTtcblx0XHR2YXIgaXRlbSAgICAgID0gc2VsZWN0aW9uLmdldCh7IGNpZDogdWkuaXRlbS5hdHRyKCAnZGF0YS1jaWQnKSB9KTtcblx0XHR2YXIgbmV3SW5kZXggID0gdWkuaXRlbS5pbmRleCgpO1xuXHRcdHZhciBvbGRJbmRleCAgPSBzZWxlY3Rpb24uaW5kZXhPZiggaXRlbSApO1xuXG5cdFx0aWYgKCBuZXdJbmRleCAhPT0gb2xkSW5kZXggKSB7XG5cdFx0XHR2YXIgZHJvcHBlZCA9IHNlbGVjdGlvbi5tb2RlbHMuc3BsaWNlKCBvbGRJbmRleCwgMSApO1xuXHRcdFx0c2VsZWN0aW9uLm1vZGVscy5zcGxpY2UoIG5ld0luZGV4LCAwLCBkcm9wcGVkWzBdICk7XG5cdFx0XHR0aGlzLm1vZGVsLnNhdmVEYXRhKCk7XG5cdFx0fVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIFRvZ2dsZSBidXR0b24gc3RhdHVzLlxuXHQgKiBFbmFibGUvRGlzYWJsZSBidXR0b24gZGVwZW5kaW5nIG9uIHdoZXRoZXJcblx0ICogcGxhY2Vob2xkZXIgb3IgdmFsaWQgbW9kdWxlIGlzIHNlbGVjdGVkLlxuXHQgKi9cblx0dG9nZ2xlQnV0dG9uU3RhdHVzOiBmdW5jdGlvbihlKSB7XG5cdFx0dmFyIHZhbHVlICAgICAgICAgPSAkKGUudGFyZ2V0KS52YWwoKTtcblx0XHR2YXIgZGVmYXVsdE9wdGlvbiA9ICQoZS50YXJnZXQpLmNoaWxkcmVuKCkuZmlyc3QoKS5hdHRyKCd2YWx1ZScpO1xuXHRcdCQoJy5hZGQtbmV3LW1vZHVsZS1idXR0b24nLCB0aGlzLiRlbCApLmF0dHIoICdkaXNhYmxlZCcsIHZhbHVlID09PSBkZWZhdWx0T3B0aW9uICk7XG5cdFx0dGhpcy5uZXdNb2R1bGVOYW1lID0gKCB2YWx1ZSAhPT0gZGVmYXVsdE9wdGlvbiApID8gdmFsdWUgOiBudWxsO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgYWRkaW5nIG1vZHVsZS5cblx0ICpcblx0ICogRmluZCBtb2R1bGUgbW9kZWwuIENsb25lIGl0LiBBZGQgdG8gc2VsZWN0aW9uLlxuXHQgKi9cblx0YWRkTW9kdWxlOiBmdW5jdGlvbihlKSB7XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRpZiAoIHRoaXMubmV3TW9kdWxlTmFtZSAmJiB0aGlzLm1vZGVsLmlzTW9kdWxlQWxsb3dlZCggdGhpcy5uZXdNb2R1bGVOYW1lICkgKSB7XG5cdFx0XHR2YXIgbW9kZWwgPSBNb2R1bGVGYWN0b3J5LmNyZWF0ZSggdGhpcy5uZXdNb2R1bGVOYW1lICk7XG5cdFx0XHR0aGlzLm1vZGVsLmdldCgnc2VsZWN0aW9uJykuYWRkKCBtb2RlbCApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBBcHBlbmQgbmV3IHNlbGVjdGlvbiBpdGVtIHZpZXcuXG5cdCAqL1xuXHRhZGROZXdTZWxlY3Rpb25JdGVtVmlldzogZnVuY3Rpb24oIGl0ZW0gKSB7XG5cblx0XHRpZiAoICEgdGhpcy5tb2RlbC5pc01vZHVsZUFsbG93ZWQoIGl0ZW0uZ2V0KCduYW1lJykgKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgdmlldyA9IE1vZHVsZUZhY3RvcnkuY3JlYXRlRWRpdFZpZXcoIGl0ZW0gKTtcblxuXHRcdCQoICc+IC5zZWxlY3Rpb24nLCB0aGlzLiRlbCApLmFwcGVuZCggdmlldy5yZW5kZXIoKS4kZWwgKTtcblxuXHRcdHZhciAkc2VsZWN0aW9uID0gJCggJz4gLnNlbGVjdGlvbicsIHRoaXMuJGVsICk7XG5cdFx0aWYgKCAkc2VsZWN0aW9uLmhhc0NsYXNzKCd1aS1zb3J0YWJsZScpICkge1xuXHRcdFx0JHNlbGVjdGlvbi5zb3J0YWJsZSgncmVmcmVzaCcpO1xuXHRcdH1cblxuXG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1aWxkZXI7XG4iLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgRmllbGQgPSByZXF1aXJlKCcuL2ZpZWxkLmpzJyk7XG5cbi8qKlxuICogSW1hZ2UgRmllbGRcbiAqXG4gKiBJbml0aWFsaXplIGFuZCBsaXN0ZW4gZm9yIHRoZSAnY2hhbmdlJyBldmVudCB0byBnZXQgdXBkYXRlZCBkYXRhLlxuICpcbiAqL1xudmFyIEZpZWxkQXR0YWNobWVudCA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICAkKCAnI3RtcGwtbXBiLWZpZWxkLWF0dGFjaG1lbnQnICkuaHRtbCgpLFxuXHRmcmFtZTogICAgIG51bGwsXG5cdHZhbHVlOiAgICAgW10sIC8vIEF0dGFjaG1lbnQgSURzLlxuXHRzZWxlY3Rpb246IHt9LCAvLyBBdHRhY2htZW50cyBjb2xsZWN0aW9uIGZvciB0aGlzLnZhbHVlLlxuXG5cdGNvbmZpZzogICAge30sXG5cblx0ZGVmYXVsdENvbmZpZzoge1xuXHRcdG11bHRpcGxlOiBmYWxzZSxcblx0XHRsaWJyYXJ5OiB7IHR5cGU6ICdpbWFnZScgfSxcblx0XHRidXR0b25fdGV4dDogJ1NlbGVjdCBJbWFnZScsXG5cdH0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIC5pbWFnZS1wbGFjZWhvbGRlciAuYnV0dG9uLmFkZCc6ICdlZGl0SW1hZ2UnLFxuXHRcdCdjbGljayAuaW1hZ2UtcGxhY2Vob2xkZXIgaW1nJzogJ2VkaXRJbWFnZScsXG5cdFx0J2NsaWNrIC5pbWFnZS1wbGFjZWhvbGRlciAuYnV0dG9uLnJlbW92ZSc6ICdyZW1vdmVJbWFnZScsXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUuXG5cdCAqXG5cdCAqIFBhc3MgdmFsdWUgYW5kIGNvbmZpZyBhcyBwcm9wZXJ0aWVzIG9uIHRoZSBvcHRpb25zIG9iamVjdC5cblx0ICogQXZhaWxhYmxlIG9wdGlvbnNcblx0ICogLSBtdWx0aXBsZTogYm9vbFxuXHQgKiAtIHNpemVSZXE6IGVnIHsgd2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDAgfVxuXHQgKlxuXHQgKiBAcGFyYW0gIG9iamVjdCBvcHRpb25zXG5cdCAqIEByZXR1cm4gbnVsbFxuXHQgKi9cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cblx0XHQvLyBDYWxsIGRlZmF1bHQgaW5pdGlhbGl6ZS5cblx0XHRGaWVsZC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBvcHRpb25zIF0gKTtcblxuXHRcdF8uYmluZEFsbCggdGhpcywgJ3JlbmRlcicsICdlZGl0SW1hZ2UnLCAnb25TZWxlY3RJbWFnZScsICdyZW1vdmVJbWFnZScsICdpc0F0dGFjaG1lbnRTaXplT2snICk7XG5cblx0XHR0aGlzLm9uKCAnY2hhbmdlJywgdGhpcy5yZW5kZXIgKTtcblxuXHRcdHRoaXMuaW5pdFNlbGVjdGlvbigpO1xuXG5cdH0sXG5cblx0c2V0VmFsdWU6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblxuXHRcdC8vIEVuc3VyZSB2YWx1ZSBpcyBhcnJheS5cblx0XHRpZiAoICEgdmFsdWUgfHwgISBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXHRcdFx0dmFsdWUgPSBbXTtcblx0XHR9XG5cblx0XHRGaWVsZC5wcm90b3R5cGUuc2V0VmFsdWUuYXBwbHkoIHRoaXMsIFsgdmFsdWUgXSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgU2VsZWN0aW9uLlxuXHQgKlxuXHQgKiBTZWxlY3Rpb24gaXMgYW4gQXR0YWNobWVudCBjb2xsZWN0aW9uIGNvbnRhaW5pbmcgZnVsbCBtb2RlbHMgZm9yIHRoZSBjdXJyZW50IHZhbHVlLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG51bGxcblx0ICovXG5cdGluaXRTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5zZWxlY3Rpb24gPSBuZXcgd3AubWVkaWEubW9kZWwuQXR0YWNobWVudHMoKTtcblxuXHRcdC8vIEluaXRpYWxpemUgc2VsZWN0aW9uLlxuXHRcdF8uZWFjaCggdGhpcy5nZXRWYWx1ZSgpLCBmdW5jdGlvbiggaXRlbSApIHtcblxuXHRcdFx0dmFyIG1vZGVsO1xuXG5cdFx0XHQvLyBMZWdhY3kuIEhhbmRsZSBzdG9yaW5nIGZ1bGwgb2JqZWN0cy5cblx0XHRcdGl0ZW0gID0gKCAnb2JqZWN0JyA9PT0gdHlwZW9mKCBpdGVtICkgKSA/IGl0ZW0uaWQgOiBpdGVtO1xuXHRcdFx0bW9kZWwgPSBuZXcgd3AubWVkaWEuYXR0YWNobWVudCggaXRlbSApO1xuXG5cdFx0XHR0aGlzLnNlbGVjdGlvbi5hZGQoIG1vZGVsICk7XG5cblx0XHRcdC8vIFJlLXJlbmRlciBhZnRlciBhdHRhY2htZW50cyBoYXZlIHN5bmNlZC5cblx0XHRcdG1vZGVsLmZldGNoKCk7XG5cdFx0XHRtb2RlbC5vbiggJ3N5bmMnLCB0aGlzLnJlbmRlciApO1xuXG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHRlbXBsYXRlO1xuXG5cdFx0dGVtcGxhdGUgPSBfLm1lbW9pemUoIGZ1bmN0aW9uKCB2YWx1ZSwgY29uZmlnICkge1xuXHRcdFx0cmV0dXJuIF8udGVtcGxhdGUoIHRoaXMudGVtcGxhdGUsIHtcblx0XHRcdFx0dmFsdWU6IHZhbHVlLFxuXHRcdFx0XHRjb25maWc6IGNvbmZpZyxcblx0XHRcdH0gKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHRoaXMuJGVsLmh0bWwoIHRlbXBsYXRlKCB0aGlzLnNlbGVjdGlvbi50b0pTT04oKSwgdGhpcy5jb25maWcgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlIHRoZSBzZWxlY3QgZXZlbnQuXG5cdCAqXG5cdCAqIEluc2VydCBhbiBpbWFnZSBvciBtdWx0aXBsZSBpbWFnZXMuXG5cdCAqL1xuXHRvblNlbGVjdEltYWdlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBmcmFtZSA9IHRoaXMuZnJhbWUgfHwgbnVsbDtcblxuXHRcdGlmICggISBmcmFtZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnNlbGVjdGlvbi5yZXNldChbXSk7XG5cblx0XHRmcmFtZS5zdGF0ZSgpLmdldCgnc2VsZWN0aW9uJykuZWFjaCggZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cblx0XHRcdGlmICggdGhpcy5pc0F0dGFjaG1lbnRTaXplT2soIGF0dGFjaG1lbnQgKSApIHtcblx0XHRcdFx0dGhpcy5zZWxlY3Rpb24uYWRkKCBhdHRhY2htZW50ICk7XG5cdFx0XHR9XG5cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuc2VsZWN0aW9uLnBsdWNrKCdpZCcpICk7XG5cblx0XHRmcmFtZS5jbG9zZSgpO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZSB0aGUgZWRpdCBhY3Rpb24uXG5cdCAqL1xuXHRlZGl0SW1hZ2U6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciBmcmFtZSA9IHRoaXMuZnJhbWU7XG5cblx0XHRpZiAoICEgZnJhbWUgKSB7XG5cblx0XHRcdHZhciBmcmFtZUFyZ3MgPSB7XG5cdFx0XHRcdGxpYnJhcnk6IHRoaXMuY29uZmlnLmxpYnJhcnksXG5cdFx0XHRcdG11bHRpcGxlOiB0aGlzLmNvbmZpZy5tdWx0aXBsZSxcblx0XHRcdFx0dGl0bGU6ICdTZWxlY3QgSW1hZ2UnLFxuXHRcdFx0XHRmcmFtZTogJ3NlbGVjdCcsXG5cdFx0XHR9O1xuXG5cdFx0XHRmcmFtZSA9IHRoaXMuZnJhbWUgPSB3cC5tZWRpYSggZnJhbWVBcmdzICk7XG5cblx0XHRcdGZyYW1lLm9uKCAnY29udGVudDpjcmVhdGU6YnJvd3NlJywgdGhpcy5zZXR1cEZpbHRlcnMsIHRoaXMgKTtcblx0XHRcdGZyYW1lLm9uKCAnY29udGVudDpyZW5kZXI6YnJvd3NlJywgdGhpcy5zaXplRmlsdGVyTm90aWNlLCB0aGlzICk7XG5cdFx0XHRmcmFtZS5vbiggJ3NlbGVjdCcsIHRoaXMub25TZWxlY3RJbWFnZSwgdGhpcyApO1xuXG5cdFx0fVxuXG5cdFx0Ly8gV2hlbiB0aGUgZnJhbWUgb3BlbnMsIHNldCB0aGUgc2VsZWN0aW9uLlxuXHRcdGZyYW1lLm9uKCAnb3BlbicsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgc2VsZWN0aW9uID0gZnJhbWUuc3RhdGUoKS5nZXQoJ3NlbGVjdGlvbicpO1xuXG5cdFx0XHQvLyBTZXQgdGhlIHNlbGVjdGlvbi5cblx0XHRcdC8vIE5vdGUgLSBleHBlY3RzIGFycmF5IG9mIG9iamVjdHMsIG5vdCBhIGNvbGxlY3Rpb24uXG5cdFx0XHRzZWxlY3Rpb24uc2V0KCB0aGlzLnNlbGVjdGlvbi5tb2RlbHMgKTtcblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0ZnJhbWUub3BlbigpO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEFkZCBmaWx0ZXJzIHRvIHRoZSBmcmFtZSBsaWJyYXJ5IGNvbGxlY3Rpb24uXG5cdCAqXG5cdCAqICAtIGZpbHRlciB0byBsaW1pdCB0byByZXF1aXJlZCBzaXplLlxuXHQgKi9cblx0c2V0dXBGaWx0ZXJzOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBsaWIgICAgPSB0aGlzLmZyYW1lLnN0YXRlKCkuZ2V0KCdsaWJyYXJ5Jyk7XG5cblx0XHRpZiAoICdzaXplUmVxJyBpbiB0aGlzLmNvbmZpZyApIHtcblx0XHRcdGxpYi5maWx0ZXJzLnNpemUgPSB0aGlzLmlzQXR0YWNobWVudFNpemVPaztcblx0XHR9XG5cblx0fSxcblxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgZGlzcGxheSBvZiBzaXplIGZpbHRlciBub3RpY2UuXG5cdCAqL1xuXHRzaXplRmlsdGVyTm90aWNlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBsaWIgPSB0aGlzLmZyYW1lLnN0YXRlKCkuZ2V0KCdsaWJyYXJ5Jyk7XG5cblx0XHRpZiAoICEgbGliLmZpbHRlcnMuc2l6ZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBXYWl0IHRvIGJlIHN1cmUgdGhlIGZyYW1lIGlzIHJlbmRlcmVkLlxuXHRcdHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHJlcSwgJG5vdGljZSwgdGVtcGxhdGUsICR0b29sYmFyO1xuXG5cdFx0XHRyZXEgPSBfLmV4dGVuZCgge1xuXHRcdFx0XHR3aWR0aDogMCxcblx0XHRcdFx0aGVpZ2h0OiAwLFxuXHRcdFx0fSwgdGhpcy5jb25maWcuc2l6ZVJlcSApO1xuXG5cdFx0XHQvLyBEaXNwbGF5IG5vdGljZSBvbiBtYWluIGdyaWQgdmlldy5cblx0XHRcdHRlbXBsYXRlID0gJzxwIGNsYXNzPVwiZmlsdGVyLW5vdGljZVwiPk9ubHkgc2hvd2luZyBpbWFnZXMgdGhhdCBtZWV0IHNpemUgcmVxdWlyZW1lbnRzOiA8JT0gd2lkdGggJT5weCAmdGltZXM7IDwlPSBoZWlnaHQgJT5weDwvcD4nO1xuXHRcdFx0JG5vdGljZSAgPSAkKCBfLnRlbXBsYXRlKCB0ZW1wbGF0ZSwgcmVxICkgKTtcblx0XHRcdCR0b29sYmFyID0gJCggJy5hdHRhY2htZW50cy1icm93c2VyIC5tZWRpYS10b29sYmFyJywgdGhpcy5mcmFtZS4kZWwgKS5maXJzdCgpO1xuXHRcdFx0JHRvb2xiYXIucHJlcGVuZCggJG5vdGljZSApO1xuXG5cdFx0XHR2YXIgY29udGVudFZpZXcgPSB0aGlzLmZyYW1lLnZpZXdzLmdldCggJy5tZWRpYS1mcmFtZS1jb250ZW50JyApO1xuXHRcdFx0Y29udGVudFZpZXcgPSBjb250ZW50Vmlld1swXTtcblxuXHRcdFx0JG5vdGljZSA9ICQoICc8cCBjbGFzcz1cImZpbHRlci1ub3RpY2VcIj5JbWFnZSBkb2VzIG5vdCBtZWV0IHNpemUgcmVxdWlyZW1lbnRzLjwvcD4nICk7XG5cblx0XHRcdC8vIERpc3BsYXkgYWRkaXRpb25hbCBub3RpY2Ugd2hlbiBzZWxlY3RpbmcgYW4gaW1hZ2UuXG5cdFx0XHQvLyBSZXF1aXJlZCB0byBpbmRpY2F0ZSBhIGJhZCBpbWFnZSBoYXMganVzdCBiZWVuIHVwbG9hZGVkLlxuXHRcdFx0Y29udGVudFZpZXcub3B0aW9ucy5zZWxlY3Rpb24ub24oICdzZWxlY3Rpb246c2luZ2xlJywgZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dmFyIGF0dGFjaG1lbnQgPSBjb250ZW50Vmlldy5vcHRpb25zLnNlbGVjdGlvbi5zaW5nbGUoKTtcblxuXHRcdFx0XHR2YXIgZGlzcGxheU5vdGljZSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdFx0Ly8gSWYgc3RpbGwgdXBsb2FkaW5nLCB3YWl0IGFuZCB0cnkgZGlzcGxheWluZyBub3RpY2UgYWdhaW4uXG5cdFx0XHRcdFx0aWYgKCBhdHRhY2htZW50LmdldCggJ3VwbG9hZGluZycgKSApIHtcblx0XHRcdFx0XHRcdHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0ZGlzcGxheU5vdGljZSgpO1xuXHRcdFx0XHRcdFx0fSwgNTAwICk7XG5cblx0XHRcdFx0XHQvLyBPSy4gRGlzcGxheSBub3RpY2UgYXMgcmVxdWlyZWQuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0aWYgKCAhIHRoaXMuaXNBdHRhY2htZW50U2l6ZU9rKCBhdHRhY2htZW50ICkgKSB7XG5cdFx0XHRcdFx0XHRcdCQoICcuYXR0YWNobWVudHMtYnJvd3NlciAuYXR0YWNobWVudC1pbmZvJyApLnByZXBlbmQoICRub3RpY2UgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdCRub3RpY2UucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fS5iaW5kKHRoaXMpO1xuXG5cdFx0XHRcdGRpc3BsYXlOb3RpY2UoKTtcblxuXHRcdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHR9LmJpbmQodGhpcyksIDEwMCAgKTtcblxuXHR9LFxuXG5cdHJlbW92ZUltYWdlOiBmdW5jdGlvbihlKSB7XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR2YXIgJHRhcmdldCwgaWQ7XG5cblx0XHQkdGFyZ2V0ID0gJChlLnRhcmdldCk7XG5cdFx0JHRhcmdldCA9ICggJHRhcmdldC5wcm9wKCd0YWdOYW1lJykgPT09ICdCVVRUT04nICkgPyAkdGFyZ2V0IDogJHRhcmdldC5jbG9zZXN0KCdidXR0b24ucmVtb3ZlJyk7XG5cdFx0aWQgICAgICA9ICR0YXJnZXQuZGF0YSggJ2ltYWdlLWlkJyApO1xuXG5cdFx0aWYgKCAhIGlkICApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnNlbGVjdGlvbi5yZW1vdmUoIHRoaXMuc2VsZWN0aW9uLndoZXJlKCB7IGlkOiBpZCB9ICkgKTtcblx0XHR0aGlzLnNldFZhbHVlKCB0aGlzLnNlbGVjdGlvbi5wbHVjaygnaWQnKSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIERvZXMgYXR0YWNobWVudCBtZWV0IHNpemUgcmVxdWlyZW1lbnRzP1xuXHQgKlxuXHQgKiBAcGFyYW0gIEF0dGFjaG1lbnRcblx0ICogQHJldHVybiBib29sZWFuXG5cdCAqL1xuXHRpc0F0dGFjaG1lbnRTaXplT2s6IGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXG5cdFx0aWYgKCAhICggJ3NpemVSZXEnIGluIHRoaXMuY29uZmlnICkgKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHR0aGlzLmNvbmZpZy5zaXplUmVxID0gXy5leHRlbmQoIHtcblx0XHRcdHdpZHRoOiAwLFxuXHRcdFx0aGVpZ2h0OiAwLFxuXHRcdH0sIHRoaXMuY29uZmlnLnNpemVSZXEgKTtcblxuXHRcdHZhciB3aWR0aFJlcSAgPSBhdHRhY2htZW50LmdldCgnd2lkdGgnKSAgPj0gdGhpcy5jb25maWcuc2l6ZVJlcS53aWR0aDtcblx0XHR2YXIgaGVpZ2h0UmVxID0gYXR0YWNobWVudC5nZXQoJ2hlaWdodCcpID49IHRoaXMuY29uZmlnLnNpemVSZXEuaGVpZ2h0O1xuXG5cdFx0cmV0dXJuIHdpZHRoUmVxICYmIGhlaWdodFJlcTtcblxuXHR9XG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZEF0dGFjaG1lbnQ7XG4iLCJ2YXIgJCAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG52YXIgRmllbGRUZXh0ID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogICc8bGFiZWw+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIDwlIGlmICggaWQgKSB7ICU+aWQ9XCI8JT0gaWQgJT5cIjwlIH0gJT4gPCUgaWYgKCB2YWx1ZSApIHsgJT5jaGVja2VkPVwiY2hlY2tlZFwiPCUgfSAlPj48JT0gY29uZmlnLmxhYmVsICU+PC9sYWJlbD4nLFxuXG5cdGRlZmF1bHRDb25maWc6IHtcblx0XHRsYWJlbDogJ1Rlc3QgTGFiZWwnLFxuXHR9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdjaGFuZ2UgIGlucHV0JzogJ2lucHV0Q2hhbmdlZCcsXG5cdH0sXG5cblx0aW5wdXRDaGFuZ2VkOiBfLmRlYm91bmNlKCBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFZhbHVlKCAkKCAnaW5wdXQnLCB0aGlzLiRlbCApLnByb3AoICdjaGVja2VkJyApICk7XG5cdH0gKSxcblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkVGV4dDtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxudmFyIEZpZWxkTGluayA9IEZpZWxkLmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICAkKCAnI3RtcGwtbXBiLWZpZWxkLWxpbmsnICkuaHRtbCgpLFxuXG5cdGV2ZW50czoge1xuXHRcdCdrZXl1cCAgIGlucHV0LmZpZWxkLXRleHQnOiAndGV4dElucHV0Q2hhbmdlZCcsXG5cdFx0J2NoYW5nZSAgaW5wdXQuZmllbGQtdGV4dCc6ICd0ZXh0SW5wdXRDaGFuZ2VkJyxcblx0XHQna2V5dXAgICBpbnB1dC5maWVsZC1saW5rJzogJ2xpbmtJbnB1dENoYW5nZWQnLFxuXHRcdCdjaGFuZ2UgIGlucHV0LmZpZWxkLWxpbmsnOiAnbGlua0lucHV0Q2hhbmdlZCcsXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cblx0XHRGaWVsZC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBvcHRpb25zIF0gKTtcblxuXHRcdHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlIHx8IHt9O1xuXHRcdHRoaXMudmFsdWUgPSBfLmRlZmF1bHRzKCB0aGlzLnZhbHVlLCB7IGxpbms6ICcnLCB0ZXh0OiAnJyB9ICk7XG5cblx0fSxcblxuXHR0ZXh0SW5wdXRDaGFuZ2VkOiBfLmRlYm91bmNlKCBmdW5jdGlvbihlKSB7XG5cdFx0aWYgKCBlICYmIGUudGFyZ2V0ICkge1xuXHRcdFx0dmFyIHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdFx0dmFsdWUudGV4dCA9IGUudGFyZ2V0LnZhbHVlO1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggdmFsdWUgKTtcblx0XHR9XG5cdH0gKSxcblxuXHRsaW5rSW5wdXRDaGFuZ2VkOiBfLmRlYm91bmNlKCBmdW5jdGlvbihlKSB7XG5cdFx0aWYgKCBlICYmIGUudGFyZ2V0ICkge1xuXHRcdFx0dmFyIHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdFx0dmFsdWUubGluayA9IGUudGFyZ2V0LnZhbHVlO1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggdmFsdWUgKTtcblx0XHR9XG5cdH0gKSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRMaW5rO1xuIiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEZpZWxkVGV4dCA9IHJlcXVpcmUoJy4vZmllbGQtdGV4dC5qcycpO1xuXG52YXIgRmllbGROdW1iZXIgPSBGaWVsZFRleHQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogICQoICcjdG1wbC1tcGItZmllbGQtbnVtYmVyJyApLmh0bWwoKSxcblxuXHRnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQoIHRoaXMudmFsdWUgKTtcblx0fSxcblxuXHRzZXRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdHRoaXMudmFsdWUgPSBwYXJzZUZsb2F0KCB2YWx1ZSApO1xuXHRcdHRoaXMudHJpZ2dlciggJ2NoYW5nZScsIHRoaXMuZ2V0VmFsdWUoKSApO1xuXHR9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGROdW1iZXI7XG4iLCIvKiBnbG9iYWwgYWpheHVybCAqL1xuXG52YXIgJCAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEZpZWxkICAgICAgID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG4vKipcbiAqIFRleHQgRmllbGQgVmlld1xuICpcbiAqIFlvdSBjYW4gdXNlIHRoaXMgYW55d2hlcmUuXG4gKiBKdXN0IGxpc3RlbiBmb3IgJ2NoYW5nZScgZXZlbnQgb24gdGhlIHZpZXcuXG4gKi9cbnZhciBGaWVsZFBvc3RTZWxlY3QgPSBGaWVsZC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAgJCggJyN0bXBsLW1wYi1maWVsZC10ZXh0JyApLmh0bWwoKSxcblxuXHRkZWZhdWx0Q29uZmlnOiB7XG5cdFx0bXVsdGlwbGU6IHRydWUsXG5cdH0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NoYW5nZSBpbnB1dCc6ICdpbnB1dENoYW5nZWQnXG5cdH0sXG5cblx0c2V0VmFsdWU6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblxuXHRcdGlmICggdGhpcy5jb25maWcubXVsdGlwbGUgJiYgISBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXHRcdFx0dmFsdWUgPSBbIHZhbHVlIF07XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLmNvbmZpZy5tdWx0aXBsZSAmJiBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXHRcdFx0dmFsdWUgPSB2YWx1ZVswXTtcblx0XHR9XG5cblx0XHRGaWVsZC5wcm90b3R5cGUuc2V0VmFsdWUuYXBwbHkoIHRoaXMsIFsgdmFsdWUgXSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBWYWx1ZS5cblx0ICpcblx0ICogQHBhcmFtICBSZXR1cm4gdmFsdWUgYXMgYW4gYXJyYXkgZXZlbiBpZiBtdWx0aXBsZSBpcyBmYWxzZS5cblx0ICovXG5cdGdldFZhbHVlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciB2YWx1ZSA9IHRoaXMudmFsdWU7XG5cblx0XHRpZiAoIHRoaXMuY29uZmlnLm11bHRpcGxlICYmICEgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gWyB2YWx1ZSBdO1xuXHRcdH0gZWxzZSBpZiAoICEgdGhpcy5jb25maWcubXVsdGlwbGUgJiYgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRcdHZhbHVlID0gdmFsdWVbMF07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHZhbHVlO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgdmFsdWUsIGRhdGE7XG5cblx0XHR2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblx0XHR2YWx1ZSA9IEFycmF5LmlzQXJyYXkoIHZhbHVlICkgPyB2YWx1ZS5qb2luKCAnLCcgKSA6IHZhbHVlO1xuXG5cdFx0ZGF0YSA9IHtcblx0XHRcdGlkOiB0aGlzLmNpZCxcblx0XHRcdHZhbHVlOiB2YWx1ZSxcblx0XHRcdGNvbmZpZzoge31cblx0XHR9O1xuXG5cdFx0dGhpcy4kZWwuaHRtbCggXy50ZW1wbGF0ZSggdGhpcy50ZW1wbGF0ZSwgZGF0YSApICk7XG5cblx0XHR0aGlzLmluaXRTZWxlY3QyKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdGluaXRTZWxlY3QyOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciAkZmllbGQgPSAkKCAnIycgKyB0aGlzLmNpZCwgdGhpcy4kZWwgKTtcblxuXHRcdHZhciBmb3JtYXRSZXF1ZXN0ID1mdW5jdGlvbiAoIHRlcm0sIHBhZ2UgKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRhY3Rpb246ICdtY2VfZ2V0X3Bvc3RzJyxcblx0XHRcdFx0czogdGVybSxcblx0XHRcdFx0cGFnZTogcGFnZVxuXHRcdFx0fTtcblx0XHR9O1xuXG5cdFx0dmFyIHBhcnNlUmVzdWx0cyA9IGZ1bmN0aW9uICggcmVzcG9uc2UgKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyZXN1bHRzOiByZXNwb25zZS5yZXN1bHRzLFxuXHRcdFx0XHRtb3JlOiByZXNwb25zZS5tb3JlXG5cdFx0XHR9O1xuXHRcdH07XG5cblx0XHR2YXIgaW5pdFNlbGVjdGlvbiA9IGZ1bmN0aW9uKCBlbCwgY2FsbGJhY2sgKSB7XG5cblx0XHRcdHZhciB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKS5qb2luKCcsJyk7XG5cblx0XHRcdGlmICggdmFsdWUubGVuZ3RoICkge1xuXHRcdFx0XHQkLmdldCggYWpheHVybCwge1xuXHRcdFx0XHRcdGFjdGlvbjogJ21jZV9nZXRfcG9zdHMnLFxuXHRcdFx0XHRcdHBvc3RfX2luOiB2YWx1ZSxcblx0XHRcdFx0fSApLmRvbmUoIGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKCBwYXJzZVJlc3VsdHMoIGRhdGEgKS5yZXN1bHRzICk7XG5cdFx0XHRcdH0gKTtcblx0XHRcdH1cblxuXHRcdH0uYmluZCh0aGlzKTtcblxuXHRcdCRmaWVsZC5zZWxlY3QyKHtcblx0XHRcdG1pbmltdW1JbnB1dExlbmd0aDogMSxcblx0XHRcdG11bHRpcGxlOiB0aGlzLmNvbmZpZy5tdWx0aXBsZSxcblx0XHRcdGluaXRTZWxlY3Rpb246IGluaXRTZWxlY3Rpb24sXG5cdFx0XHRhamF4OiB7XG5cdFx0XHRcdHVybDogYWpheHVybCxcblx0XHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRcdCAgICBkZWxheTogMjUwLFxuXHRcdFx0ICAgIGNhY2hlOiBmYWxzZSxcblx0XHRcdFx0ZGF0YTogZm9ybWF0UmVxdWVzdCxcblx0XHRcdFx0cmVzdWx0czogcGFyc2VSZXN1bHRzLFxuXHRcdFx0fSxcblx0XHR9KTtcblxuXHR9LFxuXG5cdGlucHV0Q2hhbmdlZDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHZhbHVlID0gJCggJ2lucHV0IycgKyB0aGlzLmNpZCwgdGhpcy4kZWwgKS52YWwoKTtcblx0XHR2YWx1ZSA9IHZhbHVlLnNwbGl0KCAnLCcgKS5tYXAoIE51bWJlciApO1xuXHRcdHRoaXMuc2V0VmFsdWUoIHZhbHVlICk7XG5cdH0sXG5cblx0cmVtb3ZlOiBmdW5jdGlvbigpIHtcblx0fSxcblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkUG9zdFNlbGVjdDtcbiIsInZhciAkICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgRmllbGQgPSByZXF1aXJlKCcuL2ZpZWxkLmpzJyk7XG5cbi8qKlxuICogVGV4dCBGaWVsZCBWaWV3XG4gKlxuICogWW91IGNhbiB1c2UgdGhpcyBhbnl3aGVyZS5cbiAqIEp1c3QgbGlzdGVuIGZvciAnY2hhbmdlJyBldmVudCBvbiB0aGUgdmlldy5cbiAqL1xudmFyIEZpZWxkU2VsZWN0ID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogICQoICcjdG1wbC1tcGItZmllbGQtc2VsZWN0JyApLmh0bWwoKSxcblx0dmFsdWU6IFtdLFxuXG5cdGRlZmF1bHRDb25maWc6IHtcblx0XHRtdWx0aXBsZTogZmFsc2UsXG5cdFx0b3B0aW9uczogW10sXG5cdH0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NoYW5nZSBzZWxlY3QnOiAnaW5wdXRDaGFuZ2VkJ1xuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdF8uYmluZEFsbCggdGhpcywgJ3BhcnNlT3B0aW9uJyApO1xuXHRcdEZpZWxkLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIG9wdGlvbnMgXSApO1xuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnMuY29uZmlnLm9wdGlvbnMgfHwgW107XG5cdH0sXG5cblx0aW5wdXRDaGFuZ2VkOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFZhbHVlKCAkKCAnc2VsZWN0JywgdGhpcy4kZWwgKS52YWwoKSApO1xuXHR9LFxuXG5cdGdldE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMubWFwKCB0aGlzLnBhcnNlT3B0aW9uICk7XG5cdH0sXG5cblx0cGFyc2VPcHRpb246IGZ1bmN0aW9uKCBvcHRpb24gKSB7XG5cdFx0b3B0aW9uID0gXy5kZWZhdWx0cyggb3B0aW9uLCB7IHZhbHVlOiAnJywgdGV4dDogJycsIHNlbGVjdGVkOiBmYWxzZSB9ICk7XG5cdFx0b3B0aW9uLnNlbGVjdGVkID0gdGhpcy5pc1NlbGVjdGVkKCBvcHRpb24udmFsdWUgKTtcblx0XHRyZXR1cm4gb3B0aW9uO1xuXHR9LFxuXG5cdGlzU2VsZWN0ZWQ6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRpZiAoIHRoaXMuY29uZmlnLm11bHRpcGxlICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0VmFsdWUoKS5pbmRleE9mKCB2YWx1ZSApID49IDA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB2YWx1ZSA9PT0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdH1cblx0fSxcblxuXHRzZXRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXG5cdFx0aWYgKCB0aGlzLmNvbmZpZy5tdWx0aXBsZSAmJiAhIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IFsgdmFsdWUgXTtcblx0XHR9IGVsc2UgaWYgKCAhIHRoaXMuY29uZmlnLm11bHRpcGxlICYmIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IHZhbHVlWzBdO1xuXHRcdH1cblxuXHRcdEZpZWxkLnByb3RvdHlwZS5zZXRWYWx1ZS5hcHBseSggdGhpcywgWyB2YWx1ZSBdICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogR2V0IFZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gIFJldHVybiB2YWx1ZSBhcyBhbiBhcnJheSBldmVuIGlmIG11bHRpcGxlIGlzIGZhbHNlLlxuXHQgKi9cblx0Z2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHZhbHVlID0gdGhpcy52YWx1ZTtcblxuXHRcdGlmICggdGhpcy5jb25maWcubXVsdGlwbGUgJiYgISBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXHRcdFx0dmFsdWUgPSBbIHZhbHVlIF07XG5cdFx0fSBlbHNlIGlmICggISB0aGlzLmNvbmZpZy5tdWx0aXBsZSAmJiBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXHRcdFx0dmFsdWUgPSB2YWx1ZVswXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdmFsdWU7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0aWQ6IHRoaXMuY2lkLFxuXHRcdFx0b3B0aW9uczogdGhpcy5nZXRPcHRpb25zKCksXG5cdFx0fTtcblxuXHRcdC8vIENyZWF0ZSBlbGVtZW50IGZyb20gdGVtcGxhdGUuXG5cdFx0dGhpcy4kZWwuaHRtbCggXy50ZW1wbGF0ZSggdGhpcy50ZW1wbGF0ZSwgZGF0YSApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRTZWxlY3Q7XG4iLCJ2YXIgJCAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG52YXIgRmllbGRUZXh0ID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogICQoICcjdG1wbC1tcGItZmllbGQtdGV4dCcgKS5odG1sKCksXG5cblx0ZGVmYXVsdENvbmZpZzoge1xuXHRcdGNsYXNzZXM6ICdyZWd1bGFyLXRleHQnLFxuXHRcdHBsYWNlaG9sZGVyOiBudWxsLFxuXHR9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdrZXl1cCAgIGlucHV0JzogJ2lucHV0Q2hhbmdlZCcsXG5cdFx0J2NoYW5nZSAgaW5wdXQnOiAnaW5wdXRDaGFuZ2VkJyxcblx0fSxcblxuXHRpbnB1dENoYW5nZWQ6IF8uZGVib3VuY2UoIGZ1bmN0aW9uKGUpIHtcblx0XHRpZiAoIGUgJiYgZS50YXJnZXQgKSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlKCBlLnRhcmdldC52YWx1ZSApO1xuXHRcdH1cblx0fSApLFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRUZXh0O1xuIiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEZpZWxkVGV4dCA9IHJlcXVpcmUoJy4vZmllbGQtdGV4dC5qcycpO1xuXG52YXIgRmllbGRUZXh0YXJlYSA9IEZpZWxkVGV4dC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAgJCggJyN0bXBsLW1wYi1maWVsZC10ZXh0YXJlYScgKS5odG1sKCksXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2tleXVwICB0ZXh0YXJlYSc6ICdpbnB1dENoYW5nZWQnLFxuXHRcdCdjaGFuZ2UgdGV4dGFyZWEnOiAnaW5wdXRDaGFuZ2VkJyxcblx0fSxcblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkVGV4dGFyZWE7XG4iLCJ2YXIgJCAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG4vKipcbiAqIFRleHQgRmllbGQgVmlld1xuICpcbiAqIFlvdSBjYW4gdXNlIHRoaXMgYW55d2hlcmUuXG4gKiBKdXN0IGxpc3RlbiBmb3IgJ2NoYW5nZScgZXZlbnQgb24gdGhlIHZpZXcuXG4gKi9cbnZhciBGaWVsZFdZU0lXWUcgPSBGaWVsZC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAgJCggJyN0bXBsLW1wYi1maWVsZC13eXNpd3lnJyApLmh0bWwoKSxcblx0ZWRpdG9yOiBudWxsLFxuXHR2YWx1ZTogbnVsbCxcblxuXHQvKipcblx0ICogSW5pdC5cblx0ICpcblx0ICogb3B0aW9ucy52YWx1ZSBpcyB1c2VkIHRvIHBhc3MgaW5pdGlhbCB2YWx1ZS5cblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0RmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgb3B0aW9ucyBdICk7XG5cblx0XHQvLyBBIGZldyBoZWxwZXJzLlxuXHRcdHRoaXMuZWRpdG9yID0ge1xuXHRcdFx0aWQgICAgICAgICAgIDogJ21wYi10ZXh0LWJvZHktJyArIHRoaXMuY2lkLFxuXHRcdFx0bmFtZVJlZ2V4ICAgIDogbmV3IFJlZ0V4cCggJ21wYi1wbGFjZWhvbGRlci1uYW1lJywgJ2cnICksXG5cdFx0XHRpZFJlZ2V4ICAgICAgOiBuZXcgUmVnRXhwKCAnbXBiLXBsYWNlaG9sZGVyLWlkJywgJ2cnICksXG5cdFx0XHRjb250ZW50UmVnZXggOiBuZXcgUmVnRXhwKCAnbXBiLXBsYWNlaG9sZGVyLWNvbnRlbnQnLCAnZycgKSxcblx0XHR9O1xuXG5cdFx0Ly8gVGhlIHRlbXBsYXRlIHByb3ZpZGVkIGlzIGdlbmVyaWMgbWFya3VwIHVzZWQgYnkgVGlueU1DRS5cblx0XHQvLyBXZSBuZWVkIGEgdGVtcGxhdGUgdW5pcXVlIHRvIHRoaXMgdmlldy5cblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IubmFtZVJlZ2V4LCB0aGlzLmVkaXRvci5pZCApO1xuXHRcdHRoaXMudGVtcGxhdGUgID0gdGhpcy50ZW1wbGF0ZS5yZXBsYWNlKCB0aGlzLmVkaXRvci5pZFJlZ2V4LCB0aGlzLmVkaXRvci5pZCApO1xuXHRcdHRoaXMudGVtcGxhdGUgID0gdGhpcy50ZW1wbGF0ZS5yZXBsYWNlKCB0aGlzLmVkaXRvci5jb250ZW50UmVnZXgsICc8JT0gdmFsdWUgJT4nICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuXHRcdC8vIENyZWF0ZSBlbGVtZW50IGZyb20gdGVtcGxhdGUuXG5cdFx0dGhpcy4kZWwuaHRtbCggXy50ZW1wbGF0ZSggdGhpcy50ZW1wbGF0ZSwgeyB2YWx1ZTogdGhpcy5nZXRWYWx1ZSgpIH0gKSApO1xuXG5cdFx0Ly8gSGlkZSBlZGl0b3IgdG8gcHJldmVudCBGT1VDLiBTaG93IGFnYWluIG9uIGluaXQuIFNlZSBzZXR1cC5cblx0XHQkKCAnLndwLWVkaXRvci13cmFwJywgdGhpcy4kZWwgKS5jc3MoICdkaXNwbGF5JywgJ25vbmUnICk7XG5cblx0XHQvLyBJbml0LiBEZWZmZXJyZWQgdG8gbWFrZSBzdXJlIGNvbnRhaW5lciBlbGVtZW50IGhhcyBiZWVuIHJlbmRlcmVkLlxuXHRcdF8uZGVmZXIoIHRoaXMuaW5pdFRpbnlNQ0UuYmluZCggdGhpcyApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIHRoZSBUaW55TUNFIGVkaXRvci5cblx0ICpcblx0ICogQml0IGhhY2t5IHRoaXMuXG5cdCAqXG5cdCAqIEByZXR1cm4gbnVsbC5cblx0ICovXG5cdGluaXRUaW55TUNFOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBzZWxmID0gdGhpcywgaWQsIGVkLCAkZWwsIHByb3A7XG5cblx0XHRpZCAgPSB0aGlzLmVkaXRvci5pZDtcblx0XHRlZCAgPSB0aW55TUNFLmdldCggaWQgKTtcblx0XHQkZWwgPSAkKCAnI3dwLScgKyBpZCArICctd3JhcCcsIHRoaXMuJGVsICk7XG5cblx0XHRpZiAoIGVkICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEdldCBzZXR0aW5ncyBmb3IgdGhpcyBmaWVsZC5cblx0XHQvLyBJZiBubyBzZXR0aW5ncyBmb3IgdGhpcyBmaWVsZC4gQ2xvbmUgZnJvbSBwbGFjZWhvbGRlci5cblx0XHRpZiAoIHR5cGVvZiggdGlueU1DRVByZUluaXQubWNlSW5pdFsgaWQgXSApID09PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdHZhciBuZXdTZXR0aW5ncyA9IGpRdWVyeS5leHRlbmQoIHt9LCB0aW55TUNFUHJlSW5pdC5tY2VJbml0WyAnbXBiLXBsYWNlaG9sZGVyLWlkJyBdICk7XG5cdFx0XHRmb3IgKCBwcm9wIGluIG5ld1NldHRpbmdzICkge1xuXHRcdFx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YoIG5ld1NldHRpbmdzW3Byb3BdICkgKSB7XG5cdFx0XHRcdFx0bmV3U2V0dGluZ3NbcHJvcF0gPSBuZXdTZXR0aW5nc1twcm9wXS5yZXBsYWNlKCB0aGlzLmVkaXRvci5pZFJlZ2V4LCBpZCApLnJlcGxhY2UoIHRoaXMuZWRpdG9yLm5hbWVSZWdleCwgbmFtZSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdID0gbmV3U2V0dGluZ3M7XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGZ1bGxzY3JlZW4gcGx1Z2luLlxuXHRcdHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0ucGx1Z2lucyA9IHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0ucGx1Z2lucy5yZXBsYWNlKCAnZnVsbHNjcmVlbiwnLCAnJyApO1xuXG5cdFx0Ly8gR2V0IHF1aWNrdGFnIHNldHRpbmdzIGZvciB0aGlzIGZpZWxkLlxuXHRcdC8vIElmIG5vbmUgZXhpc3RzIGZvciB0aGlzIGZpZWxkLiBDbG9uZSBmcm9tIHBsYWNlaG9sZGVyLlxuXHRcdGlmICggdHlwZW9mKCB0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHR2YXIgbmV3UVRTID0galF1ZXJ5LmV4dGVuZCgge30sIHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgJ21wYi1wbGFjZWhvbGRlci1pZCcgXSApO1xuXHRcdFx0Zm9yICggcHJvcCBpbiBuZXdRVFMgKSB7XG5cdFx0XHRcdGlmICggJ3N0cmluZycgPT09IHR5cGVvZiggbmV3UVRTW3Byb3BdICkgKSB7XG5cdFx0XHRcdFx0bmV3UVRTW3Byb3BdID0gbmV3UVRTW3Byb3BdLnJlcGxhY2UoIHRoaXMuZWRpdG9yLmlkUmVnZXgsIGlkICkucmVwbGFjZSggdGhpcy5lZGl0b3IubmFtZVJlZ2V4LCBuYW1lICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgaWQgXSA9IG5ld1FUUztcblx0XHR9XG5cblx0XHQvLyBXaGVuIGVkaXRvciBpbml0cywgYXR0YWNoIHNhdmUgY2FsbGJhY2sgdG8gY2hhbmdlIGV2ZW50LlxuXHRcdHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbaWRdLnNldHVwID0gZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0c2VsZi5zZXRWYWx1ZSggZS50YXJnZXQuZ2V0Q29udGVudCgpICk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdC8vIFByZXZlbnQgRk9VQy4gU2hvdyBlbGVtZW50IGFmdGVyIGluaXQuXG5cdFx0XHR0aGlzLm9uKCAnaW5pdCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkZWwuY3NzKCAnZGlzcGxheScsICdibG9jaycgKTtcblx0XHRcdH0pO1xuXG5cdFx0fTtcblxuXHRcdC8vIEN1cnJlbnQgbW9kZSBkZXRlcm1pbmVkIGJ5IGNsYXNzIG9uIGVsZW1lbnQuXG5cdFx0Ly8gSWYgbW9kZSBpcyB2aXN1YWwsIGNyZWF0ZSB0aGUgdGlueU1DRS5cblx0XHRpZiAoICRlbC5oYXNDbGFzcygndG1jZS1hY3RpdmUnKSApIHtcblx0XHRcdHRpbnlNQ0UuaW5pdCggdGlueU1DRVByZUluaXQubWNlSW5pdFtpZF0gKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JGVsLmNzcyggJ2Rpc3BsYXknLCAnYmxvY2snICk7XG5cdFx0fVxuXG5cdFx0Ly8gSW5pdCBxdWlja3RhZ3MuXG5cdFx0cXVpY2t0YWdzKCB0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gKTtcblx0XHRRVGFncy5fYnV0dG9uc0luaXQoKTtcblxuXHRcdC8vIEhhbmRsZSB0ZW1wb3JhcnkgcmVtb3ZhbCBvZiB0aW55TUNFIHdoZW4gc29ydGluZy5cblx0XHR0aGlzLiRlbC5jbG9zZXN0KCcudWktc29ydGFibGUnKS5vbiggJ3NvcnRzdGFydCcsIGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG5cdFx0XHRpZiAoIHVpLml0ZW1bMF0uZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpID09PSB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSApIHtcblx0XHRcdFx0dGlueU1DRS5leGVjQ29tbWFuZCggJ21jZVJlbW92ZUVkaXRvcicsIGZhbHNlLCBpZCApO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0Ly8gSGFuZGxlIHJlLWluaXQgYWZ0ZXIgc29ydGluZy5cblx0XHR0aGlzLiRlbC5jbG9zZXN0KCcudWktc29ydGFibGUnKS5vbiggJ3NvcnRzdG9wJywgZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblx0XHRcdGlmICggdWkuaXRlbVswXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2lkJykgPT09IHRoaXMuZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpICkge1xuXHRcdFx0XHR0aW55TUNFLmV4ZWNDb21tYW5kKCdtY2VBZGRFZGl0b3InLCBmYWxzZSwgaWQpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdH0sXG5cblx0cmVtb3ZlOiBmdW5jdGlvbigpIHtcblx0XHR0aW55TUNFLmV4ZWNDb21tYW5kKCAnbWNlUmVtb3ZlRWRpdG9yJywgZmFsc2UsIHRoaXMuZWRpdG9yLmlkICk7XG5cdH0sXG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFdZU0lXWUc7XG4iLCIvKipcbiAqIEFic3RyYWN0IEZpZWxkIENsYXNzLlxuICpcbiAqIEhhbmRsZXMgc2V0dXAgYXMgd2VsbCBhcyBnZXR0aW5nIGFuZCBzZXR0aW5nIHZhbHVlcy5cbiAqIFByb3ZpZGVzIGEgdmVyeSBnZW5lcmljIHJlbmRlciBtZXRob2QgLSBidXQgcHJvYmFibHkgYmUgT0sgZm9yIG1vc3Qgc2ltcGxlIGZpZWxkcy5cbiAqL1xudmFyIEZpZWxkID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAgICAgIG51bGwsXG5cdHZhbHVlOiAgICAgICAgIG51bGwsXG5cdGNvbmZpZzogICAgICAgIHt9LFxuXHRkZWZhdWx0Q29uZmlnOiB7fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZS5cblx0ICogSWYgeW91IGV4dGVuZCB0aGlzIHZpZXcgLSBpdCBpcyByZWNjb21tZWRlZCB0byBjYWxsIHRoaXMuXG5cdCAqXG5cdCAqIEV4cGVjdHMgb3B0aW9ucy52YWx1ZSBhbmQgb3B0aW9ucy5jb25maWcuXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblxuXHRcdHZhciBjb25maWc7XG5cblx0XHRfLmJpbmRBbGwoIHRoaXMsICdnZXRWYWx1ZScsICdzZXRWYWx1ZScgKTtcblxuXHRcdC8vIElmIGEgY2hhbmdlIGNhbGxiYWNrIGlzIHByb3ZpZGVkLCBjYWxsIHRoaXMgb24gY2hhbmdlLlxuXHRcdGlmICggJ29uQ2hhbmdlJyBpbiBvcHRpb25zICkge1xuXHRcdFx0dGhpcy5vbiggJ2NoYW5nZScsIG9wdGlvbnMub25DaGFuZ2UgKTtcblx0XHR9XG5cblx0XHRjb25maWcgPSAoICdjb25maWcnIGluIG9wdGlvbnMgKSA/IG9wdGlvbnMuY29uZmlnIDoge307XG5cdFx0dGhpcy5jb25maWcgPSBfLmV4dGVuZCgge30sIHRoaXMuZGVmYXVsdENvbmZpZywgY29uZmlnICk7XG5cblx0XHRpZiAoICd2YWx1ZScgaW4gb3B0aW9ucyApIHtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIG9wdGlvbnMudmFsdWUgKTtcblx0XHR9XG5cblx0fSxcblxuXHRnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMudmFsdWU7XG5cdH0sXG5cblx0c2V0VmFsdWU6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cdFx0dGhpcy50cmlnZ2VyKCAnY2hhbmdlJywgdGhpcy52YWx1ZSApO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdGlkOiAgICAgdGhpcy5jaWQsXG5cdFx0XHR2YWx1ZTogIHRoaXMudmFsdWUsXG5cdFx0XHRjb25maWc6IHRoaXMuY29uZmlnXG5cdFx0fTtcblxuXHRcdHRoaXMuJGVsLmh0bWwoIF8udGVtcGxhdGUoIHRoaXMudGVtcGxhdGUsIGRhdGEgKSApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZDtcbiIsInZhciAkICAgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgICAgICA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcbnZhciBmaWVsZFZpZXdzICAgICAgPSByZXF1aXJlKCcuLy4uL3V0aWxzL2ZpZWxkLXZpZXdzLmpzJyk7XG5cbi8qKlxuICogR2VuZXJpYyBFZGl0IEZvcm0uXG4gKlxuICogSGFuZGxlcyBhIHdpZGUgcmFuZ2Ugb2YgZ2VuZXJpYyBmaWVsZCB0eXBlcy5cbiAqIEZvciBlYWNoIGF0dHJpYnV0ZSwgaXQgY3JlYXRlcyBhIGZpZWxkIGJhc2VkIG9uIHRoZSBhdHRyaWJ1dGUgJ3R5cGUnXG4gKiBBbHNvIHVzZXMgb3B0aW9uYWwgYXR0cmlidXRlICdjb25maWcnIHByb3BlcnR5IHdoZW4gaW5pdGlhbGl6aW5nIGZpZWxkLlxuICovXG52YXIgTW9kdWxlRWRpdERlZmF1bHQgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cblx0cm93VGVtcGxhdGU6ICQoJyN0bXBsLW1wYi1mb3JtLXJvdycgKS5odG1sKCksXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIGF0dHJpYnV0ZXMsIG9wdGlvbnMgXSApO1xuXG5cdFx0Xy5iaW5kQWxsKCB0aGlzLCAncmVuZGVyJyApO1xuXG5cdFx0dmFyIGZpZWxkcyA9IHRoaXMuZmllbGRzID0ge307XG5cdFx0dmFyIG1vZGVsICA9IHRoaXMubW9kZWw7XG5cblx0XHQvLyBGb3IgZWFjaCBhdHRyaWJ1dGUgLVxuXHRcdC8vIGluaXRpYWxpemUgYSBmaWVsZCBmb3IgdGhhdCBhdHRyaWJ1dGUgJ3R5cGUnXG5cdFx0Ly8gU3RvcmUgaW4gdGhpcy5maWVsZHNcblx0XHQvLyBVc2UgY29uZmlnIGZyb20gdGhlIGF0dHJpYnV0ZVxuXHRcdHRoaXMubW9kZWwuZ2V0KCdhdHRyJykuZWFjaCggZnVuY3Rpb24oIHNpbmdsZUF0dHIgKSB7XG5cblx0XHRcdHZhciBmaWVsZFZpZXcsIHR5cGUsIG5hbWUsIGNvbmZpZztcblxuXHRcdFx0dHlwZSA9IHNpbmdsZUF0dHIuZ2V0KCd0eXBlJyk7XG5cblx0XHRcdGlmICggdHlwZSAmJiAoIHR5cGUgaW4gZmllbGRWaWV3cyApICkge1xuXG5cdFx0XHRcdGZpZWxkVmlldyA9IGZpZWxkVmlld3NbIHR5cGUgXTtcblx0XHRcdFx0bmFtZSAgICAgID0gc2luZ2xlQXR0ci5nZXQoJ25hbWUnKTtcblx0XHRcdFx0Y29uZmlnICAgID0gc2luZ2xlQXR0ci5nZXQoJ2NvbmZpZycpIHx8IHt9O1xuXG5cdFx0XHRcdGZpZWxkc1sgbmFtZSBdID0gbmV3IGZpZWxkVmlldyh7XG5cdFx0XHRcdFx0dmFsdWU6IG1vZGVsLmdldEF0dHJWYWx1ZSggbmFtZSApLFxuXHRcdFx0XHRcdGNvbmZpZzogY29uZmlnLFxuXHRcdFx0XHRcdG9uQ2hhbmdlOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cdFx0XHRcdFx0XHRtb2RlbC5zZXRBdHRyVmFsdWUoIG5hbWUsIHZhbHVlICk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdH1cblxuXHRcdH0gKTtcblxuXHRcdC8vIENsZWFudXAuXG5cdFx0Ly8gUmVtb3ZlIGVhY2ggZmllbGQgdmlldyB3aGVuIHRoaXMgbW9kZWwgaXMgZGVzdHJveWVkLlxuXHRcdHRoaXMubW9kZWwub24oICdkZXN0cm95JywgZnVuY3Rpb24oKSB7XG5cdFx0XHRfLmVhY2goIGZpZWxkcywgZnVuY3Rpb24oZmllbGQpIHtcblx0XHRcdFx0ZmllbGQucmVtb3ZlKCk7XG5cdFx0XHR9ICk7XG5cdFx0fSApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblxuXHRcdC8vIENhbGwgZGVmYXVsdCBNb2R1bGVFZGVpdCByZW5kZXIuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzICk7XG5cblx0XHR2YXIgJGVsID0gdGhpcy4kZWw7XG5cblx0XHQvLyBGb3IgZWFjaCBmaWVsZCwgcmVuZGVyIHN1Yi12aWV3IGFuZCBhcHBlbmQgdG8gdGhpcy4kZWxcblx0XHQvLyBVc2VzIHRoaXMucm93VGVtcGxhdGUuXG5cdFx0Xy5lYWNoKCB0aGlzLmZpZWxkcywgZnVuY3Rpb24oIGZpZWxkLCBuYW1lICkge1xuXG5cdFx0XHR2YXIgYXR0ciA9IHRoaXMubW9kZWwuZ2V0QXR0ciggbmFtZSApO1xuXG5cdFx0XHQvLyBDcmVhdGUgcm93IGVsZW1lbnQgZnJvbSB0ZW1wbGF0ZS5cblx0XHRcdHZhciAkcm93ID0gJCggXy50ZW1wbGF0ZSggdGhpcy5yb3dUZW1wbGF0ZSwge1xuXHRcdFx0XHRsYWJlbDogYXR0ci5nZXQoJ2xhYmVsJyksXG5cdFx0XHRcdGRlc2M6ICBhdHRyLmdldCgnZGVzY3JpcHRpb24nICksXG5cdFx0XHR9ICkgKTtcblxuXHRcdFx0JCggJy5maWVsZCcsICRyb3cgKS5hcHBlbmQoIGZpZWxkLnJlbmRlcigpLiRlbCApO1xuXHRcdFx0JGVsLmFwcGVuZCggJHJvdyApO1xuXG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGVFZGl0RGVmYXVsdDtcbiIsInZhciBCYWNrYm9uZSAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbi8qKlxuICogVmVyeSBnZW5lcmljIGZvcm0gdmlldyBoYW5kbGVyLlxuICogVGhpcyBkb2VzIHNvbWUgYmFzaWMgbWFnaWMgYmFzZWQgb24gZGF0YSBhdHRyaWJ1dGVzIHRvIHVwZGF0ZSBzaW1wbGUgdGV4dCBmaWVsZHMuXG4gKi9cbnZhciBNb2R1bGVFZGl0ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdGNsYXNzTmFtZTogICAgICdtb2R1bGUtZWRpdCcsXG5cdHRvb2xzVGVtcGxhdGU6ICQoJyN0bXBsLW1wYi1tb2R1bGUtZWRpdC10b29scycgKS5odG1sKCksXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0Xy5iaW5kQWxsKCB0aGlzLCAncmVtb3ZlTW9kZWwnICk7XG5cdH0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIC5idXR0b24tc2VsZWN0aW9uLWl0ZW0tcmVtb3ZlJzogJ3JlbW92ZU1vZGVsJyxcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGRhdGEgID0gdGhpcy5tb2RlbC50b0pTT04oKTtcblx0XHRkYXRhLmF0dHIgPSB7fTtcblxuXHRcdC8vIEZvcm1hdCBhdHRyaWJ1dGUgYXJyYXkgZm9yIGVhc3kgdGVtcGxhdGluZy5cblx0XHQvLyBCZWNhdXNlIGF0dHJpYnV0ZXMgaW4gYW4gYXJyYXkgaXMgZGlmZmljdWx0IHRvIGFjY2Vzcy5cblx0XHR0aGlzLm1vZGVsLmdldCgnYXR0cicpLmVhY2goIGZ1bmN0aW9uKCBhdHRyICkge1xuXHRcdFx0ZGF0YS5hdHRyWyBhdHRyLmdldCgnbmFtZScpIF0gPSBhdHRyLnRvSlNPTigpO1xuXHRcdH0gKTtcblxuXHRcdC8vIElEIGF0dHJpYnV0ZSwgc28gd2UgY2FuIGNvbm5lY3QgdGhlIHZpZXcgYW5kIG1vZGVsIGFnYWluIGxhdGVyLlxuXHRcdHRoaXMuJGVsLmF0dHIoICdkYXRhLWNpZCcsIHRoaXMubW9kZWwuY2lkICk7XG5cblx0XHQvLyBBcHBlbmQgdGhlIG1vZHVsZSB0b29scy5cblx0XHR0aGlzLiRlbC5wcmVwZW5kKCBfLnRlbXBsYXRlKCB0aGlzLnRvb2xzVGVtcGxhdGUsIGRhdGEgKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHQvKipcblx0ICogUmVtb3ZlIG1vZGVsIGhhbmRsZXIuXG5cdCAqL1xuXHRyZW1vdmVNb2RlbDogZnVuY3Rpb24oZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR0aGlzLnJlbW92ZSgpO1xuXHRcdHRoaXMubW9kZWwuZGVzdHJveSgpO1xuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGVFZGl0O1xuIl19
