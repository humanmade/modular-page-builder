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
	}
};

module.exports = globals;

},{"./models/builder.js":4,"./utils/edit-view-map.js":8,"./utils/module-factory.js":9,"./views/builder.js":10,"./views/fields/field-attachment.js":11,"./views/fields/field-link.js":13,"./views/fields/field-text.js":14,"./views/fields/field-textarea.js":15,"./views/fields/field-wysiwyg.js":16,"./views/fields/field.js":17,"./views/module-edit.js":22}],4:[function(require,module,exports){
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
	'text':                require('./../views/module-edit-text.js'),
	'image':               require('./../views/module-edit-image.js'),
	'blockquote':          require('./../views/module-edit-blockquote.js'),
};

module.exports = editViewMap;

},{"./../views/module-edit-blockquote.js":18,"./../views/module-edit-header.js":19,"./../views/module-edit-image.js":20,"./../views/module-edit-text.js":21}],9:[function(require,module,exports){
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

},{"./field.js":17}],12:[function(require,module,exports){
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

},{"./field.js":17}],13:[function(require,module,exports){
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

},{"./field.js":17}],14:[function(require,module,exports){
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

},{"./field.js":17}],15:[function(require,module,exports){
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

},{"./field-text.js":14}],16:[function(require,module,exports){
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

},{"./field.js":17}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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
			this.setAttr( 'text', value );
		}.bind(this) );

		this.fields.source = new FieldText( {
			value: this.model.getAttr('source').get('value'),
		} );

		this.fields.source.on( 'change', function( value ) {
			this.setAttr( 'source', value );
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

},{"./fields/field-content-editable.js":12,"./fields/field-text.js":14,"./module-edit.js":22}],19:[function(require,module,exports){
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
			this.setAttr( 'heading', value );
		}.bind(this) );

		this.fields.subheading = new FieldTextarea( {
			value: this.model.getAttr('subheading').get('value'),
		} );

		this.fields.subheading.on( 'change', function( value ) {
			this.setAttr( 'subheading', value );
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

},{"./fields/field-text.js":14,"./fields/field-textarea.js":15,"./module-edit.js":22}],20:[function(require,module,exports){
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
			this.setAttr( 'image', data );
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

},{"./fields/field-attachment.js":11,"./module-edit.js":22}],21:[function(require,module,exports){
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
			this.setAttr( 'body', value );
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

},{"./fields/field-wysiwyg.js":16,"./module-edit.js":22}],22:[function(require,module,exports){
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
		_.bindAll( this, 'removeModel', 'setAttr' );
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
	 * Update attribute.
	 *
	 * Note manual change event trigger to ensure everything is updated.
	 *
	 * @param string attribute
	 * @param mixed  value
	 */
	setAttr: function( attribute, value ) {

		var attr = this.model.getAttr( attribute );

		if ( attr ) {
			attr.set( 'value', value );
			this.model.trigger( 'change', this.model );
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvc3JjL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9nbG9iYWxzLmpzIiwiYXNzZXRzL2pzL3NyYy9tb2RlbHMvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMiLCJhc3NldHMvanMvc3JjL21vZGVscy9tb2R1bGUuanMiLCJhc3NldHMvanMvc3JjL21vZHVsYXItcGFnZS1idWlsZGVyLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9lZGl0LXZpZXctbWFwLmpzIiwiYXNzZXRzL2pzL3NyYy91dGlscy9tb2R1bGUtZmFjdG9yeS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvZmllbGRzL2ZpZWxkLWF0dGFjaG1lbnQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC1jb250ZW50LWVkaXRhYmxlLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZHMvZmllbGQtbGluay5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvZmllbGRzL2ZpZWxkLXRleHQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC10ZXh0YXJlYS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvZmllbGRzL2ZpZWxkLXd5c2l3eWcuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL2ZpZWxkcy9maWVsZC5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtYmxvY2txdW90ZS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtaGVhZGVyLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC1pbWFnZS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtdGV4dC5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgTW9kdWxlQXR0cmlidXRlID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvbW9kdWxlLWF0dHJpYnV0ZS5qcycpO1xuXG4vKipcbiAqIFNob3J0Y29kZSBBdHRyaWJ1dGVzIGNvbGxlY3Rpb24uXG4gKi9cbnZhciBTaG9ydGNvZGVBdHRyaWJ1dGVzID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXG5cdG1vZGVsIDogTW9kdWxlQXR0cmlidXRlLFxuXG5cdC8vIERlZXAgQ2xvbmUuXG5cdGNsb25lOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoIF8ubWFwKCB0aGlzLm1vZGVscywgZnVuY3Rpb24obSkge1xuXHRcdFx0cmV0dXJuIG0uY2xvbmUoKTtcblx0XHR9KSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybiBvbmx5IHRoZSBkYXRhIHRoYXQgbmVlZHMgdG8gYmUgc2F2ZWQuXG5cdCAqXG5cdCAqIEByZXR1cm4gb2JqZWN0XG5cdCAqL1xuXHR0b01pY3JvSlNPTjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIganNvbiA9IHt9O1xuXG5cdFx0dGhpcy5lYWNoKCBmdW5jdGlvbiggbW9kZWwgKSB7XG5cdFx0XHRqc29uWyBtb2RlbC5nZXQoICduYW1lJyApIF0gPSBtb2RlbC50b01pY3JvSlNPTigpO1xuXHRcdH0gKTtcblxuXHRcdHJldHVybiBqc29uO1xuXHR9LFxuXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNob3J0Y29kZUF0dHJpYnV0ZXM7XG4iLCJ2YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGUgICA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL21vZHVsZS5qcycpO1xuXG4vLyBTaG9ydGNvZGUgQ29sbGVjdGlvblxudmFyIE1vZHVsZXMgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cblx0bW9kZWwgOiBNb2R1bGUsXG5cblx0Ly8gIERlZXAgQ2xvbmUuXG5cdGNsb25lIDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCBfLm1hcCggdGhpcy5tb2RlbHMsIGZ1bmN0aW9uKG0pIHtcblx0XHRcdHJldHVybiBtLmNsb25lKCk7XG5cdFx0fSkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdHJldHVybiB0aGlzLm1hcCggZnVuY3Rpb24obW9kZWwpIHsgcmV0dXJuIG1vZGVsLnRvTWljcm9KU09OKCBvcHRpb25zICk7IH0gKTtcblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlcztcbiIsIi8vIEV4cG9zZSBzb21lIGZ1bmN0aW9uYWxpdHkgZ2xvYmFsbHkuXG52YXIgZ2xvYmFscyA9IHtcblx0QnVpbGRlcjogICAgICAgcmVxdWlyZSgnLi9tb2RlbHMvYnVpbGRlci5qcycpLFxuXHRNb2R1bGVGYWN0b3J5OiByZXF1aXJlKCcuL3V0aWxzL21vZHVsZS1mYWN0b3J5LmpzJyksXG5cdGVkaXRWaWV3TWFwOiAgIHJlcXVpcmUoJy4vdXRpbHMvZWRpdC12aWV3LW1hcC5qcycpLFxuXHR2aWV3czoge1xuXHRcdEJ1aWxkZXJWaWV3OiAgICAgcmVxdWlyZSgnLi92aWV3cy9idWlsZGVyLmpzJyksXG5cdFx0TW9kdWxlRWRpdDogICAgICByZXF1aXJlKCcuL3ZpZXdzL21vZHVsZS1lZGl0LmpzJyksXG5cdFx0RmllbGQ6ICAgICAgICAgICByZXF1aXJlKCcuL3ZpZXdzL2ZpZWxkcy9maWVsZC5qcycpLFxuXHRcdEZpZWxkTGluazogICAgICAgcmVxdWlyZSgnLi92aWV3cy9maWVsZHMvZmllbGQtbGluay5qcycpLFxuXHRcdEZpZWxkQXR0YWNobWVudDogcmVxdWlyZSgnLi92aWV3cy9maWVsZHMvZmllbGQtYXR0YWNobWVudC5qcycpLFxuXHRcdEZpZWxkVGV4dDogICAgICAgcmVxdWlyZSgnLi92aWV3cy9maWVsZHMvZmllbGQtdGV4dC5qcycpLFxuXHRcdEZpZWxkVGV4dGFyZWE6ICAgcmVxdWlyZSgnLi92aWV3cy9maWVsZHMvZmllbGQtdGV4dGFyZWEuanMnKSxcblx0XHRGaWVsZFd5c2l3eWc6ICAgIHJlcXVpcmUoJy4vdmlld3MvZmllbGRzL2ZpZWxkLXd5c2l3eWcuanMnKSxcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnbG9iYWxzO1xuIiwidmFyIEJhY2tib25lICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGVzICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzJyk7XG52YXIgTW9kdWxlRmFjdG9yeSAgICA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMnKTtcblxudmFyIEJ1aWxkZXIgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXG5cdGRlZmF1bHRzOiB7XG5cdFx0c2VsZWN0RGVmYXVsdDogIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEubDEwbi5zZWxlY3REZWZhdWx0LFxuXHRcdGFkZE5ld0J1dHRvbjogICBtb2R1bGFyUGFnZUJ1aWxkZXJEYXRhLmwxMG4uYWRkTmV3QnV0dG9uLFxuXHRcdHNlbGVjdGlvbjogICAgICBbXSwgLy8gSW5zdGFuY2Ugb2YgTW9kdWxlcy4gQ2FuJ3QgdXNlIGEgZGVmYXVsdCwgb3RoZXJ3aXNlIHRoZXkgd29uJ3QgYmUgdW5pcXVlLlxuXHRcdGFsbG93ZWRNb2R1bGVzOiBbXSwgLy8gTW9kdWxlIG5hbWVzIGFsbG93ZWQgZm9yIHRoaXMgYnVpbGRlci5cblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblxuXHRcdC8vIFNldCBkZWZhdWx0IHNlbGVjdGlvbiB0byBlbnN1cmUgaXQgaXNuJ3QgYSByZWZlcmVuY2UuXG5cdFx0aWYgKCAhICggdGhpcy5nZXQoJ3NlbGVjdGlvbicpIGluc3RhbmNlb2YgTW9kdWxlcyApICkge1xuXHRcdFx0dGhpcy5zZXQoICdzZWxlY3Rpb24nLCBuZXcgTW9kdWxlcygpICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0c2V0RGF0YTogZnVuY3Rpb24oIGRhdGEgKSB7XG5cblx0XHR2YXIgc2VsZWN0aW9uO1xuXG5cdFx0aWYgKCAnJyA9PT0gZGF0YSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBIYW5kbGUgZWl0aGVyIEpTT04gc3RyaW5nIG9yIHByb3BlciBvYmhlY3QuXG5cdFx0ZGF0YSA9ICggJ3N0cmluZycgPT09IHR5cGVvZiBkYXRhICkgPyBKU09OLnBhcnNlKCBkYXRhICkgOiBkYXRhO1xuXG5cdFx0Ly8gQ29udmVydCBzYXZlZCBkYXRhIHRvIE1vZHVsZSBtb2RlbHMuXG5cdFx0aWYgKCBkYXRhICYmIEFycmF5LmlzQXJyYXkoIGRhdGEgKSApIHtcblx0XHRcdHNlbGVjdGlvbiA9IGRhdGEubWFwKCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0XHRyZXR1cm4gTW9kdWxlRmFjdG9yeS5jcmVhdGUoIG1vZHVsZS5uYW1lLCBtb2R1bGUuYXR0ciApO1xuXHRcdFx0fSApO1xuXHRcdH1cblxuXHRcdC8vIFJlc2V0IHNlbGVjdGlvbiB1c2luZyBkYXRhIGZyb20gaGlkZGVuIGlucHV0LlxuXHRcdGlmICggc2VsZWN0aW9uICYmIHNlbGVjdGlvbi5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLmdldCgnc2VsZWN0aW9uJykuYWRkKCBzZWxlY3Rpb24gKTtcblx0XHR9XG5cblx0fSxcblxuXHRzYXZlRGF0YTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZGF0YSA9IFtdO1xuXG5cdFx0dGhpcy5nZXQoJ3NlbGVjdGlvbicpLmVhY2goIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cblx0XHRcdC8vIFNraXAgZW1wdHkvYnJva2VuIG1vZHVsZXMuXG5cdFx0XHRpZiAoICEgbW9kdWxlLmdldCgnbmFtZScgKSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRkYXRhLnB1c2goIG1vZHVsZS50b01pY3JvSlNPTigpICk7XG5cblx0XHR9ICk7XG5cblx0XHR0aGlzLnRyaWdnZXIoICdzYXZlJywgZGF0YSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIExpc3QgYWxsIGF2YWlsYWJsZSBtb2R1bGVzIGZvciB0aGlzIGJ1aWxkZXIuXG5cdCAqIEFsbCBtb2R1bGVzLCBmaWx0ZXJlZCBieSB0aGlzLmFsbG93ZWRNb2R1bGVzLlxuXHQgKi9cblx0Z2V0QXZhaWxhYmxlTW9kdWxlczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIF8uZmlsdGVyKCBNb2R1bGVGYWN0b3J5LmF2YWlsYWJsZU1vZHVsZXMsIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5pc01vZHVsZUFsbG93ZWQoIG1vZHVsZS5uYW1lICk7XG5cdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0fSxcblxuXHRpc01vZHVsZUFsbG93ZWQ6IGZ1bmN0aW9uKCBtb2R1bGVOYW1lICkge1xuXHRcdHJldHVybiB0aGlzLmdldCgnYWxsb3dlZE1vZHVsZXMnKS5pbmRleE9mKCBtb2R1bGVOYW1lICkgPj0gMDtcblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCdWlsZGVyO1xuIiwidmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5cbnZhciBNb2R1bGVBdHRyaWJ1dGUgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXG5cdGRlZmF1bHRzOiB7XG5cdFx0bmFtZTogICAgICAgICAnJyxcblx0XHRsYWJlbDogICAgICAgICcnLFxuXHRcdHZhbHVlOiAgICAgICAgJycsXG5cdFx0dHlwZTogICAgICAgICAndGV4dCcsXG5cdFx0ZGVzY3JpcHRpb246ICAnJyxcblx0XHRkZWZhdWx0VmFsdWU6ICcnLFxuXHRcdGNvbmZpZzogICAgICAge31cblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIG9ubHkgdGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBzYXZlZC5cblx0ICpcblx0ICogQHJldHVybiBvYmplY3Rcblx0ICovXG5cdHRvTWljcm9KU09OOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciByID0ge307XG5cdFx0dmFyIGFsbG93ZWRBdHRyUHJvcGVydGllcyA9IFsgJ25hbWUnLCAndmFsdWUnLCAndHlwZScgXTtcblxuXHRcdF8uZWFjaCggYWxsb3dlZEF0dHJQcm9wZXJ0aWVzLCBmdW5jdGlvbiggcHJvcCApIHtcblx0XHRcdHJbIHByb3AgXSA9IHRoaXMuZ2V0KCBwcm9wICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHRyZXR1cm4gcjtcblxuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZUF0dHJpYnV0ZTtcbiIsInZhciBCYWNrYm9uZSAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgTW9kdWxlQXR0cyA9IHJlcXVpcmUoJy4vLi4vY29sbGVjdGlvbnMvbW9kdWxlLWF0dHJpYnV0ZXMuanMnKTtcblxudmFyIE1vZHVsZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRuYW1lOiAgJycsXG5cdFx0bGFiZWw6ICcnLFxuXHRcdGF0dHI6ICBbXSxcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblxuXHRcdC8vIFNldCBkZWZhdWx0IHNlbGVjdGlvbiB0byBlbnN1cmUgaXQgaXNuJ3QgYSByZWZlcmVuY2UuXG5cdFx0aWYgKCAhICggdGhpcy5nZXQoJ2F0dHInKSBpbnN0YW5jZW9mIE1vZHVsZUF0dHMgKSApIHtcblx0XHRcdHRoaXMuc2V0KCAnYXR0cicsIG5ldyBNb2R1bGVBdHRzKCkgKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogR2V0IGFuIGF0dHJpYnV0ZSBtb2RlbCBieSBuYW1lLlxuXHQgKi9cblx0Z2V0QXR0cjogZnVuY3Rpb24oIGF0dHJOYW1lICkge1xuXHRcdHJldHVybiB0aGlzLmdldCgnYXR0cicpLmZpbmRXaGVyZSggeyBuYW1lOiBhdHRyTmFtZSB9KTtcblx0fSxcblxuXHQvKipcblx0ICogQ3VzdG9tIFBhcnNlLlxuXHQgKiBFbnN1cmVzIGF0dHJpYnV0ZXMgaXMgYW4gaW5zdGFuY2Ugb2YgTW9kdWxlQXR0c1xuXHQgKi9cblx0cGFyc2U6IGZ1bmN0aW9uKCByZXNwb25zZSApIHtcblxuXHRcdGlmICggJ2F0dHInIGluIHJlc3BvbnNlICYmICEgKCByZXNwb25zZS5hdHRyIGluc3RhbmNlb2YgTW9kdWxlQXR0cyApICkge1xuXHRcdFx0cmVzcG9uc2UuYXR0ciA9IG5ldyBNb2R1bGVBdHRzKCByZXNwb25zZS5hdHRyICk7XG5cdFx0fVxuXG5cdCAgICByZXR1cm4gcmVzcG9uc2U7XG5cblx0fSxcblxuXHR0b0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGpzb24gPSBfLmNsb25lKCB0aGlzLmF0dHJpYnV0ZXMgKTtcblxuXHRcdGlmICggJ2F0dHInIGluIGpzb24gJiYgKCBqc29uLmF0dHIgaW5zdGFuY2VvZiBNb2R1bGVBdHRzICkgKSB7XG5cdFx0XHRqc29uLmF0dHIgPSBqc29uLmF0dHIudG9KU09OKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGpzb247XG5cblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIG9ubHkgdGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBzYXZlZC5cblx0ICpcblx0ICogQHJldHVybiBvYmplY3Rcblx0ICovXG5cdHRvTWljcm9KU09OOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bmFtZTogdGhpcy5nZXQoJ25hbWUnKSxcblx0XHRcdGF0dHI6IHRoaXMuZ2V0KCdhdHRyJykudG9NaWNyb0pTT04oKVxuXHRcdH07XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZTtcbiIsInZhciAkICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBCdWlsZGVyICAgICAgID0gcmVxdWlyZSgnLi9tb2RlbHMvYnVpbGRlci5qcycpO1xudmFyIEJ1aWxkZXJWaWV3ICAgPSByZXF1aXJlKCcuL3ZpZXdzL2J1aWxkZXIuanMnKTtcbnZhciBNb2R1bGVGYWN0b3J5ID0gcmVxdWlyZSgnLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpO1xuXG4vLyBFeHBvc2Ugc29tZSBmdW5jdGlvbmFsaXR5IHRvIGdsb2JhbCBuYW1lc3BhY2UuXG53aW5kb3cubW9kdWxhclBhZ2VCdWlsZGVyID0gcmVxdWlyZSgnLi9nbG9iYWxzJyk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cblx0TW9kdWxlRmFjdG9yeS5pbml0KCk7XG5cblx0Ly8gQSBmaWVsZCBmb3Igc3RvcmluZyB0aGUgYnVpbGRlciBkYXRhLlxuXHR2YXIgJGZpZWxkID0gJCggJ1tuYW1lPW1vZHVsYXItcGFnZS1idWlsZGVyLWRhdGFdJyApO1xuXG5cdGlmICggISAkZmllbGQubGVuZ3RoICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIEEgY29udGFpbmVyIGVsZW1lbnQgZm9yIGRpc3BsYXlpbmcgdGhlIGJ1aWxkZXIuXG5cdHZhciAkY29udGFpbmVyID0gJCggJyNtb2R1bGFyLXBhZ2UtYnVpbGRlcicgKTtcblxuXHQvLyBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQnVpbGRlciBtb2RlbC5cblx0Ly8gUGFzcyBhbiBhcnJheSBvZiBtb2R1bGUgbmFtZXMgdGhhdCBhcmUgYWxsb3dlZCBmb3IgdGhpcyBidWlsZGVyLlxuXHR2YXIgYnVpbGRlciA9IG5ldyBCdWlsZGVyKHtcblx0XHRhbGxvd2VkTW9kdWxlczogJCggJ1tuYW1lPW1vZHVsYXItcGFnZS1idWlsZGVyLWFsbG93ZWQtbW9kdWxlc10nICkudmFsKCkuc3BsaXQoJywnKVxuXHR9KTtcblxuXHQvLyBTZXQgdGhlIGRhdGEgdXNpbmcgdGhlIGN1cnJlbnQgZmllbGQgdmFsdWVcblx0YnVpbGRlci5zZXREYXRhKCBKU09OLnBhcnNlKCAkZmllbGQudmFsKCkgKSApO1xuXG5cdC8vIE9uIHNhdmUsIHVwZGF0ZSB0aGUgZmllbGQgdmFsdWUuXG5cdGJ1aWxkZXIub24oICdzYXZlJywgZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0JGZpZWxkLnZhbCggSlNPTi5zdHJpbmdpZnkoIGRhdGEgKSApO1xuXHR9ICk7XG5cblx0Ly8gQ3JlYXRlIGJ1aWxkZXIgdmlldy5cblx0dmFyIGJ1aWxkZXJWaWV3ID0gbmV3IEJ1aWxkZXJWaWV3KCB7IG1vZGVsOiBidWlsZGVyIH0gKTtcblxuXHQvLyBSZW5kZXIgYnVpbGRlci5cblx0YnVpbGRlclZpZXcucmVuZGVyKCkuJGVsLmFwcGVuZFRvKCAkY29udGFpbmVyICk7XG5cbn0pO1xuIiwiLyoqXG4gKiBNYXAgbW9kdWxlIHR5cGUgdG8gdmlld3MuXG4gKi9cbnZhciBlZGl0Vmlld01hcCA9IHtcblx0J2hlYWRlcic6ICAgICAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LWhlYWRlci5qcycpLFxuXHQndGV4dCc6ICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtdGV4dC5qcycpLFxuXHQnaW1hZ2UnOiAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtaW1hZ2UuanMnKSxcblx0J2Jsb2NrcXVvdGUnOiAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LWJsb2NrcXVvdGUuanMnKSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZWRpdFZpZXdNYXA7XG4iLCJ2YXIgTW9kdWxlICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL21vZHVsZS5qcycpO1xudmFyIE1vZHVsZUF0dHMgICAgICAgPSByZXF1aXJlKCcuLy4uL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzJyk7XG52YXIgJCAgICAgICAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbnZhciBNb2R1bGVGYWN0b3J5ID0ge1xuXG5cdGF2YWlsYWJsZU1vZHVsZXM6IFtdLFxuXG5cdGluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggbW9kdWxhclBhZ2VCdWlsZGVyRGF0YSAmJiAnYXZhaWxhYmxlX21vZHVsZXMnIGluIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEgKSB7XG5cdFx0XHRfLmVhY2goIG1vZHVsYXJQYWdlQnVpbGRlckRhdGEuYXZhaWxhYmxlX21vZHVsZXMsIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHRcdHRoaXMucmVnaXN0ZXJNb2R1bGUoIG1vZHVsZSApO1xuXHRcdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0XHR9XG5cdH0sXG5cblx0cmVnaXN0ZXJNb2R1bGU6IGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0dGhpcy5hdmFpbGFibGVNb2R1bGVzLnB1c2goIG1vZHVsZSApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgTW9kdWxlIE1vZGVsLlxuXHQgKiBVc2UgZGF0YSBmcm9tIGNvbmZpZywgcGx1cyBzYXZlZCBkYXRhLlxuXHQgKlxuXHQgKiBAcGFyYW0gIHN0cmluZyBtb2R1bGVOYW1lXG5cdCAqIEBwYXJhbSAgb2JqZWN0IGF0dHJpYnV0ZSBKU09OLiBTYXZlZCBhdHRyaWJ1dGUgdmFsdWVzLlxuXHQgKiBAcmV0dXJuIE1vZHVsZVxuXHQgKi9cblx0Y3JlYXRlOiBmdW5jdGlvbiggbW9kdWxlTmFtZSwgYXR0ckRhdGEgKSB7XG5cblx0XHR2YXIgZGF0YSA9ICQuZXh0ZW5kKCB0cnVlLCB7fSwgXy5maW5kV2hlcmUoIHRoaXMuYXZhaWxhYmxlTW9kdWxlcywgeyBuYW1lOiBtb2R1bGVOYW1lIH0gKSApO1xuXG5cdFx0aWYgKCAhIGRhdGEgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblxuXHRcdHZhciBhdHRyaWJ1dGVzID0gbmV3IE1vZHVsZUF0dHMoKTtcblxuXHRcdC8qKlxuXHRcdCAqIEFkZCBhbGwgdGhlIG1vZHVsZSBhdHRyaWJ1dGVzLlxuXHRcdCAqIFdoaXRlbGlzdGVkIHRvIGF0dHJpYnV0ZXMgZG9jdW1lbnRlZCBpbiBzY2hlbWFcblx0XHQgKiBTZXRzIG9ubHkgdmFsdWUgZnJvbSBhdHRyRGF0YS5cblx0XHQgKi9cblx0XHRfLmVhY2goIGRhdGEuYXR0ciwgZnVuY3Rpb24oIGF0dHIgKSB7XG5cblx0XHRcdHZhciBjbG9uZUF0dHIgPSAkLmV4dGVuZCggdHJ1ZSwge30sIGF0dHIgICk7XG5cdFx0XHR2YXIgc2F2ZWRBdHRyID0gXy5maW5kV2hlcmUoIGF0dHJEYXRhLCB7IG5hbWU6IGF0dHIubmFtZSB9ICk7XG5cblx0XHRcdC8vIEFkZCBzYXZlZCBhdHRyaWJ1dGUgdmFsdWVzLlxuXHRcdFx0aWYgKCBzYXZlZEF0dHIgJiYgJ3ZhbHVlJyBpbiBzYXZlZEF0dHIgKSB7XG5cdFx0XHRcdGNsb25lQXR0ci52YWx1ZSA9IHNhdmVkQXR0ci52YWx1ZTtcblx0XHRcdH1cblxuXHRcdFx0YXR0cmlidXRlcy5hZGQoIGNsb25lQXR0ciApO1xuXG5cdFx0fSApO1xuXG5cdFx0ZGF0YS5hdHRyID0gYXR0cmlidXRlcztcblxuXHQgICAgcmV0dXJuIG5ldyBNb2R1bGUoIGRhdGEgKTtcblxuXHR9LFxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZUZhY3Rvcnk7XG4iLCJ2YXIgQmFja2JvbmUgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIEJ1aWxkZXIgICAgICAgPSByZXF1aXJlKCcuLy4uL21vZGVscy9idWlsZGVyLmpzJyk7XG52YXIgZWRpdFZpZXdNYXAgICA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvZWRpdC12aWV3LW1hcC5qcycpO1xudmFyIE1vZHVsZUZhY3RvcnkgPSByZXF1aXJlKCcuLy4uL3V0aWxzL21vZHVsZS1mYWN0b3J5LmpzJyk7XG52YXIgJCAgICAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbnZhciBCdWlsZGVyID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAkKCcjdG1wbC1tcGItYnVpbGRlcicgKS5odG1sKCksXG5cdGNsYXNzTmFtZTogJ21vZHVsYXItcGFnZS1idWlsZGVyJyxcblx0bW9kZWw6IG51bGwsXG5cdG5ld01vZHVsZU5hbWU6IG51bGwsXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NoYW5nZSA+IC5hZGQtbmV3IC5hZGQtbmV3LW1vZHVsZS1zZWxlY3QnOiAndG9nZ2xlQnV0dG9uU3RhdHVzJyxcblx0XHQnY2xpY2sgPiAuYWRkLW5ldyAuYWRkLW5ldy1tb2R1bGUtYnV0dG9uJzogJ2FkZE1vZHVsZScsXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpO1xuXG5cdFx0c2VsZWN0aW9uLm9uKCAnYWRkJywgdGhpcy5hZGROZXdTZWxlY3Rpb25JdGVtVmlldywgdGhpcyApO1xuXHRcdHNlbGVjdGlvbi5vbiggJ2FsbCcsIHRoaXMubW9kZWwuc2F2ZURhdGEsIHRoaXMubW9kZWwgKTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZGF0YSA9IHRoaXMubW9kZWwudG9KU09OKCk7XG5cblx0XHR0aGlzLiRlbC5odG1sKCBfLnRlbXBsYXRlKCB0aGlzLnRlbXBsYXRlLCBkYXRhICApICk7XG5cblx0XHR0aGlzLm1vZGVsLmdldCgnc2VsZWN0aW9uJykuZWFjaCggZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdHRoaXMuYWRkTmV3U2VsZWN0aW9uSXRlbVZpZXcoIG1vZHVsZSApO1xuXHRcdH0uYmluZCggdGhpcyApICk7XG5cblx0XHR0aGlzLnJlbmRlckFkZE5ldygpO1xuXHRcdHRoaXMuaW5pdFNvcnRhYmxlKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW5kZXIgdGhlIEFkZCBOZXcgbW9kdWxlIGNvbnRyb2xzLlxuXHQgKi9cblx0cmVuZGVyQWRkTmV3OiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciAkc2VsZWN0ID0gdGhpcy4kZWwuZmluZCggJz4gLmFkZC1uZXcgc2VsZWN0LmFkZC1uZXctbW9kdWxlLXNlbGVjdCcgKTtcblxuXHRcdCRzZWxlY3QuYXBwZW5kKFxuXHRcdFx0JCggJzxvcHRpb24vPicsIHsgdGV4dDogbW9kdWxhclBhZ2VCdWlsZGVyRGF0YS5sMTBuLnNlbGVjdERlZmF1bHQgfSApXG5cdFx0KTtcblxuXHRcdF8uZWFjaCggdGhpcy5tb2RlbC5nZXRBdmFpbGFibGVNb2R1bGVzKCksIGZ1bmN0aW9uKCBtb2R1bGUgKSB7XG5cdFx0XHR2YXIgdGVtcGxhdGUgPSAnPG9wdGlvbiB2YWx1ZT1cIjwlPSBuYW1lICU+XCI+PCU9IGxhYmVsICU+PC9vcHRpb24+Jztcblx0XHRcdCRzZWxlY3QuYXBwZW5kKCBfLnRlbXBsYXRlKCB0ZW1wbGF0ZSwgbW9kdWxlICkgKTtcblx0XHR9ICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZSBTb3J0YWJsZS5cblx0ICovXG5cdGluaXRTb3J0YWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0JCggJz4gLnNlbGVjdGlvbicsIHRoaXMuJGVsICkuc29ydGFibGUoe1xuXHRcdFx0aGFuZGxlOiAnLm1vZHVsZS1lZGl0LXRvb2xzJyxcblx0XHRcdGl0ZW1zOiAnPiAubW9kdWxlLWVkaXQnLFxuXHRcdFx0c3RvcDogdGhpcy51cGRhdGVTZWxlY3Rpb25PcmRlci5iaW5kKCB0aGlzICksXG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNvcnRhYmxlIGVuZCBjYWxsYmFjay5cblx0ICogQWZ0ZXIgcmVvcmRlcmluZywgdXBkYXRlIHRoZSBzZWxlY3Rpb24gb3JkZXIuXG5cdCAqIE5vdGUgLSB1c2VzIGRpcmVjdCBtYW5pcHVsYXRpb24gb2YgY29sbGVjdGlvbiBtb2RlbHMgcHJvcGVydHkuXG5cdCAqIFRoaXMgaXMgdG8gYXZvaWQgaGF2aW5nIHRvIG1lc3MgYWJvdXQgd2l0aCB0aGUgdmlld3MgdGhlbXNlbHZlcy5cblx0ICovXG5cdHVwZGF0ZVNlbGVjdGlvbk9yZGVyOiBmdW5jdGlvbiggZSwgdWkgKSB7XG5cblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpO1xuXHRcdHZhciBpdGVtICAgICAgPSBzZWxlY3Rpb24uZ2V0KHsgY2lkOiB1aS5pdGVtLmF0dHIoICdkYXRhLWNpZCcpIH0pO1xuXHRcdHZhciBuZXdJbmRleCAgPSB1aS5pdGVtLmluZGV4KCk7XG5cdFx0dmFyIG9sZEluZGV4ICA9IHNlbGVjdGlvbi5pbmRleE9mKCBpdGVtICk7XG5cblx0XHRpZiAoIG5ld0luZGV4ICE9PSBvbGRJbmRleCApIHtcblx0XHRcdHZhciBkcm9wcGVkID0gc2VsZWN0aW9uLm1vZGVscy5zcGxpY2UoIG9sZEluZGV4LCAxICk7XG5cdFx0XHRzZWxlY3Rpb24ubW9kZWxzLnNwbGljZSggbmV3SW5kZXgsIDAsIGRyb3BwZWRbMF0gKTtcblx0XHRcdHRoaXMubW9kZWwuc2F2ZURhdGEoKTtcblx0XHR9XG5cblx0fSxcblxuXHQvKipcblx0ICogVG9nZ2xlIGJ1dHRvbiBzdGF0dXMuXG5cdCAqIEVuYWJsZS9EaXNhYmxlIGJ1dHRvbiBkZXBlbmRpbmcgb24gd2hldGhlclxuXHQgKiBwbGFjZWhvbGRlciBvciB2YWxpZCBtb2R1bGUgaXMgc2VsZWN0ZWQuXG5cdCAqL1xuXHR0b2dnbGVCdXR0b25TdGF0dXM6IGZ1bmN0aW9uKGUpIHtcblx0XHR2YXIgdmFsdWUgICAgICAgICA9ICQoZS50YXJnZXQpLnZhbCgpO1xuXHRcdHZhciBkZWZhdWx0T3B0aW9uID0gJChlLnRhcmdldCkuY2hpbGRyZW4oKS5maXJzdCgpLmF0dHIoJ3ZhbHVlJyk7XG5cdFx0JCgnLmFkZC1uZXctbW9kdWxlLWJ1dHRvbicsIHRoaXMuJGVsICkuYXR0ciggJ2Rpc2FibGVkJywgdmFsdWUgPT09IGRlZmF1bHRPcHRpb24gKTtcblx0XHR0aGlzLm5ld01vZHVsZU5hbWUgPSAoIHZhbHVlICE9PSBkZWZhdWx0T3B0aW9uICkgPyB2YWx1ZSA6IG51bGw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZSBhZGRpbmcgbW9kdWxlLlxuXHQgKlxuXHQgKiBGaW5kIG1vZHVsZSBtb2RlbC4gQ2xvbmUgaXQuIEFkZCB0byBzZWxlY3Rpb24uXG5cdCAqL1xuXHRhZGRNb2R1bGU6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGlmICggdGhpcy5uZXdNb2R1bGVOYW1lICYmIHRoaXMubW9kZWwuaXNNb2R1bGVBbGxvd2VkKCB0aGlzLm5ld01vZHVsZU5hbWUgKSApIHtcblx0XHRcdHZhciBtb2RlbCA9IE1vZHVsZUZhY3RvcnkuY3JlYXRlKCB0aGlzLm5ld01vZHVsZU5hbWUgKTtcblx0XHRcdHRoaXMubW9kZWwuZ2V0KCdzZWxlY3Rpb24nKS5hZGQoIG1vZGVsICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEFwcGVuZCBuZXcgc2VsZWN0aW9uIGl0ZW0gdmlldy5cblx0ICovXG5cdGFkZE5ld1NlbGVjdGlvbkl0ZW1WaWV3OiBmdW5jdGlvbiggaXRlbSApIHtcblxuXHRcdHZhciBlZGl0VmlldywgdmlldztcblxuXHRcdGVkaXRWaWV3ID0gKCBpdGVtLmdldCgnbmFtZScpIGluIGVkaXRWaWV3TWFwICkgPyBlZGl0Vmlld01hcFsgaXRlbS5nZXQoJ25hbWUnKSBdIDogbnVsbDtcblxuXHRcdGlmICggISBlZGl0VmlldyB8fCAhIHRoaXMubW9kZWwuaXNNb2R1bGVBbGxvd2VkKCBpdGVtLmdldCgnbmFtZScpICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmlldyA9IG5ldyBlZGl0VmlldyggeyBtb2RlbDogaXRlbSB9ICk7XG5cblx0XHQkKCAnPiAuc2VsZWN0aW9uJywgdGhpcy4kZWwgKS5hcHBlbmQoIHZpZXcucmVuZGVyKCkuJGVsICk7XG5cblx0XHR2YXIgJHNlbGVjdGlvbiA9ICQoICc+IC5zZWxlY3Rpb24nLCB0aGlzLiRlbCApO1xuXHRcdGlmICggJHNlbGVjdGlvbi5oYXNDbGFzcygndWktc29ydGFibGUnKSApIHtcblx0XHRcdCRzZWxlY3Rpb24uc29ydGFibGUoJ3JlZnJlc2gnKTtcblx0XHR9XG5cblxuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCdWlsZGVyO1xuIiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG4vKipcbiAqIEltYWdlIEZpZWxkXG4gKlxuICogSW5pdGlhbGl6ZSBhbmQgbGlzdGVuIGZvciB0aGUgJ2NoYW5nZScgZXZlbnQgdG8gZ2V0IHVwZGF0ZWQgZGF0YS5cbiAqXG4gKi9cbnZhciBGaWVsZEF0dGFjaG1lbnQgPSBGaWVsZC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAgJCggJyN0bXBsLW1wYi1maWVsZC1hdHRhY2htZW50JyApLmh0bWwoKSxcblx0ZnJhbWU6ICAgICBudWxsLFxuXHR2YWx1ZTogICAgIFtdLCAvLyBBdHRhY2htZW50IElEcy5cblx0c2VsZWN0aW9uOiB7fSwgLy8gQXR0YWNobWVudHMgY29sbGVjdGlvbiBmb3IgdGhpcy52YWx1ZS5cblxuXHRjb25maWc6ICAgIHt9LFxuXHRkZWZhdWx0Q29uZmlnOiB7XG5cdFx0bXVsdGlwbGU6IGZhbHNlLFxuXHRcdGxpYnJhcnk6IHsgdHlwZTogJ2ltYWdlJyB9LFxuXHRcdGJ1dHRvbl90ZXh0OiAnU2VsZWN0IEltYWdlJyxcblx0fSxcblxuXHRldmVudHM6IHtcblx0XHQnY2xpY2sgLmltYWdlLXBsYWNlaG9sZGVyIC5idXR0b24uYWRkJzogJ2VkaXRJbWFnZScsXG5cdFx0J2NsaWNrIC5pbWFnZS1wbGFjZWhvbGRlciBpbWcnOiAnZWRpdEltYWdlJyxcblx0XHQnY2xpY2sgLmltYWdlLXBsYWNlaG9sZGVyIC5idXR0b24ucmVtb3ZlJzogJ3JlbW92ZUltYWdlJyxcblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZS5cblx0ICpcblx0ICogUGFzcyB2YWx1ZSBhbmQgY29uZmlnIGFzIHByb3BlcnRpZXMgb24gdGhlIG9wdGlvbnMgb2JqZWN0LlxuXHQgKiBBdmFpbGFibGUgb3B0aW9uc1xuXHQgKiAtIG11bHRpcGxlOiBib29sXG5cdCAqIC0gc2l6ZVJlcTogZWcgeyB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCB9XG5cdCAqXG5cdCAqIEBwYXJhbSAgb2JqZWN0IG9wdGlvbnNcblx0ICogQHJldHVybiBudWxsXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblxuXHRcdC8vIENhbGwgZGVmYXVsdCBpbml0aWFsaXplLlxuXHRcdEZpZWxkLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIG9wdGlvbnMgXSApO1xuXG5cdFx0Xy5iaW5kQWxsKCB0aGlzLCAncmVuZGVyJywgJ2VkaXRJbWFnZScsICdvblNlbGVjdEltYWdlJywgJ3JlbW92ZUltYWdlJywgJ2lzQXR0YWNobWVudFNpemVPaycgKTtcblxuXHRcdHRoaXMub24oICdjaGFuZ2UnLCB0aGlzLnJlbmRlciApO1xuXG5cdFx0dGhpcy5pbml0U2VsZWN0aW9uKCk7XG5cblx0fSxcblxuXHRzZXRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXG5cdFx0Ly8gRW5zdXJlIHZhbHVlIGlzIGFycmF5LlxuXHRcdGlmICggISB2YWx1ZSB8fCAhIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHR2YWx1ZSA9IFtdO1xuXHRcdH1cblxuXHRcdEZpZWxkLnByb3RvdHlwZS5zZXRWYWx1ZS5hcHBseSggdGhpcywgWyB2YWx1ZSBdICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZSBTZWxlY3Rpb24uXG5cdCAqXG5cdCAqIFNlbGVjdGlvbiBpcyBhbiBBdHRhY2htZW50IGNvbGxlY3Rpb24gY29udGFpbmluZyBmdWxsIG1vZGVscyBmb3IgdGhlIGN1cnJlbnQgdmFsdWUuXG5cdCAqXG5cdCAqIEByZXR1cm4gbnVsbFxuXHQgKi9cblx0aW5pdFNlbGVjdGlvbjogZnVuY3Rpb24oKSB7XG5cblx0XHR0aGlzLnNlbGVjdGlvbiA9IG5ldyB3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50cygpO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSBzZWxlY3Rpb24uXG5cdFx0Xy5lYWNoKCB0aGlzLmdldFZhbHVlKCksIGZ1bmN0aW9uKCBpdGVtICkge1xuXG5cdFx0XHR2YXIgbW9kZWw7XG5cblx0XHRcdC8vIExlZ2FjeS4gSGFuZGxlIHN0b3JpbmcgZnVsbCBvYmplY3RzLlxuXHRcdFx0aXRlbSAgPSAoICdvYmplY3QnID09PSB0eXBlb2YoIGl0ZW0gKSApID8gaXRlbS5pZCA6IGl0ZW07XG5cdFx0XHRtb2RlbCA9IG5ldyB3cC5tZWRpYS5hdHRhY2htZW50KCBpdGVtICk7XG5cblx0XHRcdHRoaXMuc2VsZWN0aW9uLmFkZCggbW9kZWwgKTtcblxuXHRcdFx0Ly8gUmUtcmVuZGVyIGFmdGVyIGF0dGFjaG1lbnRzIGhhdmUgc3luY2VkLlxuXHRcdFx0bW9kZWwuZmV0Y2goKTtcblx0XHRcdG1vZGVsLm9uKCAnc3luYycsIHRoaXMucmVuZGVyICk7XG5cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgdGVtcGxhdGU7XG5cblx0XHR0ZW1wbGF0ZSA9IF8ubWVtb2l6ZSggZnVuY3Rpb24oIHZhbHVlLCBjb25maWcgKSB7XG5cdFx0XHRyZXR1cm4gXy50ZW1wbGF0ZSggdGhpcy50ZW1wbGF0ZSwge1xuXHRcdFx0XHR2YWx1ZTogdmFsdWUsXG5cdFx0XHRcdGNvbmZpZzogY29uZmlnLFxuXHRcdFx0fSApO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0dGhpcy4kZWwuaHRtbCggdGVtcGxhdGUoIHRoaXMuc2VsZWN0aW9uLnRvSlNPTigpLCB0aGlzLmNvbmZpZyApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgdGhlIHNlbGVjdCBldmVudC5cblx0ICpcblx0ICogSW5zZXJ0IGFuIGltYWdlIG9yIG11bHRpcGxlIGltYWdlcy5cblx0ICovXG5cdG9uU2VsZWN0SW1hZ2U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGZyYW1lID0gdGhpcy5mcmFtZSB8fCBudWxsO1xuXG5cdFx0aWYgKCAhIGZyYW1lICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuc2VsZWN0aW9uLnJlc2V0KFtdKTtcblxuXHRcdGZyYW1lLnN0YXRlKCkuZ2V0KCdzZWxlY3Rpb24nKS5lYWNoKCBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblxuXHRcdFx0aWYgKCB0aGlzLmlzQXR0YWNobWVudFNpemVPayggYXR0YWNobWVudCApICkge1xuXHRcdFx0XHR0aGlzLnNlbGVjdGlvbi5hZGQoIGF0dGFjaG1lbnQgKTtcblx0XHRcdH1cblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0dGhpcy5zZXRWYWx1ZSggdGhpcy5zZWxlY3Rpb24ucGx1Y2soJ2lkJykgKTtcblxuXHRcdGZyYW1lLmNsb3NlKCk7XG5cblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlIHRoZSBlZGl0IGFjdGlvbi5cblx0ICovXG5cdGVkaXRJbWFnZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0dmFyIGZyYW1lID0gdGhpcy5mcmFtZTtcblxuXHRcdGlmICggISBmcmFtZSApIHtcblxuXHRcdFx0dmFyIGZyYW1lQXJncyA9IHtcblx0XHRcdFx0bGlicmFyeTogdGhpcy5jb25maWcubGlicmFyeSxcblx0XHRcdFx0bXVsdGlwbGU6IHRoaXMuY29uZmlnLm11bHRpcGxlLFxuXHRcdFx0XHR0aXRsZTogJ1NlbGVjdCBJbWFnZScsXG5cdFx0XHRcdGZyYW1lOiAnc2VsZWN0Jyxcblx0XHRcdH07XG5cblx0XHRcdGZyYW1lID0gdGhpcy5mcmFtZSA9IHdwLm1lZGlhKCBmcmFtZUFyZ3MgKTtcblxuXHRcdFx0ZnJhbWUub24oICdjb250ZW50OmNyZWF0ZTpicm93c2UnLCB0aGlzLnNldHVwRmlsdGVycywgdGhpcyApO1xuXHRcdFx0ZnJhbWUub24oICdjb250ZW50OnJlbmRlcjpicm93c2UnLCB0aGlzLnNpemVGaWx0ZXJOb3RpY2UsIHRoaXMgKTtcblx0XHRcdGZyYW1lLm9uKCAnc2VsZWN0JywgdGhpcy5vblNlbGVjdEltYWdlLCB0aGlzICk7XG5cblx0XHR9XG5cblx0XHQvLyBXaGVuIHRoZSBmcmFtZSBvcGVucywgc2V0IHRoZSBzZWxlY3Rpb24uXG5cdFx0ZnJhbWUub24oICdvcGVuJywgZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBzZWxlY3Rpb24gPSBmcmFtZS5zdGF0ZSgpLmdldCgnc2VsZWN0aW9uJyk7XG5cblx0XHRcdC8vIFNldCB0aGUgc2VsZWN0aW9uLlxuXHRcdFx0Ly8gTm90ZSAtIGV4cGVjdHMgYXJyYXkgb2Ygb2JqZWN0cywgbm90IGEgY29sbGVjdGlvbi5cblx0XHRcdHNlbGVjdGlvbi5zZXQoIHRoaXMuc2VsZWN0aW9uLm1vZGVscyApO1xuXG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHRmcmFtZS5vcGVuKCk7XG5cblx0fSxcblxuXHQvKipcblx0ICogQWRkIGZpbHRlcnMgdG8gdGhlIGZyYW1lIGxpYnJhcnkgY29sbGVjdGlvbi5cblx0ICpcblx0ICogIC0gZmlsdGVyIHRvIGxpbWl0IHRvIHJlcXVpcmVkIHNpemUuXG5cdCAqL1xuXHRzZXR1cEZpbHRlcnM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGxpYiAgICA9IHRoaXMuZnJhbWUuc3RhdGUoKS5nZXQoJ2xpYnJhcnknKTtcblxuXHRcdGlmICggJ3NpemVSZXEnIGluIHRoaXMuY29uZmlnICkge1xuXHRcdFx0bGliLmZpbHRlcnMuc2l6ZSA9IHRoaXMuaXNBdHRhY2htZW50U2l6ZU9rO1xuXHRcdH1cblxuXHR9LFxuXG5cblx0LyoqXG5cdCAqIEhhbmRsZSBkaXNwbGF5IG9mIHNpemUgZmlsdGVyIG5vdGljZS5cblx0ICovXG5cdHNpemVGaWx0ZXJOb3RpY2U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGxpYiA9IHRoaXMuZnJhbWUuc3RhdGUoKS5nZXQoJ2xpYnJhcnknKTtcblxuXHRcdGlmICggISBsaWIuZmlsdGVycy5zaXplICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFdhaXQgdG8gYmUgc3VyZSB0aGUgZnJhbWUgaXMgcmVuZGVyZWQuXG5cdFx0d2luZG93LnNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgcmVxLCAkbm90aWNlLCB0ZW1wbGF0ZSwgJHRvb2xiYXI7XG5cblx0XHRcdHJlcSA9IF8uZXh0ZW5kKCB7XG5cdFx0XHRcdHdpZHRoOiAwLFxuXHRcdFx0XHRoZWlnaHQ6IDAsXG5cdFx0XHR9LCB0aGlzLmNvbmZpZy5zaXplUmVxICk7XG5cblx0XHRcdC8vIERpc3BsYXkgbm90aWNlIG9uIG1haW4gZ3JpZCB2aWV3LlxuXHRcdFx0dGVtcGxhdGUgPSAnPHAgY2xhc3M9XCJmaWx0ZXItbm90aWNlXCI+T25seSBzaG93aW5nIGltYWdlcyB0aGF0IG1lZXQgc2l6ZSByZXF1aXJlbWVudHM6IDwlPSB3aWR0aCAlPnB4ICZ0aW1lczsgPCU9IGhlaWdodCAlPnB4PC9wPic7XG5cdFx0XHQkbm90aWNlICA9ICQoIF8udGVtcGxhdGUoIHRlbXBsYXRlLCByZXEgKSApO1xuXHRcdFx0JHRvb2xiYXIgPSAkKCAnLmF0dGFjaG1lbnRzLWJyb3dzZXIgLm1lZGlhLXRvb2xiYXInLCB0aGlzLmZyYW1lLiRlbCApLmZpcnN0KCk7XG5cdFx0XHQkdG9vbGJhci5wcmVwZW5kKCAkbm90aWNlICk7XG5cblx0XHRcdHZhciBjb250ZW50VmlldyA9IHRoaXMuZnJhbWUudmlld3MuZ2V0KCAnLm1lZGlhLWZyYW1lLWNvbnRlbnQnICk7XG5cdFx0XHRjb250ZW50VmlldyA9IGNvbnRlbnRWaWV3WzBdO1xuXG5cdFx0XHQkbm90aWNlID0gJCggJzxwIGNsYXNzPVwiZmlsdGVyLW5vdGljZVwiPkltYWdlIGRvZXMgbm90IG1lZXQgc2l6ZSByZXF1aXJlbWVudHMuPC9wPicgKTtcblxuXHRcdFx0Ly8gRGlzcGxheSBhZGRpdGlvbmFsIG5vdGljZSB3aGVuIHNlbGVjdGluZyBhbiBpbWFnZS5cblx0XHRcdC8vIFJlcXVpcmVkIHRvIGluZGljYXRlIGEgYmFkIGltYWdlIGhhcyBqdXN0IGJlZW4gdXBsb2FkZWQuXG5cdFx0XHRjb250ZW50Vmlldy5vcHRpb25zLnNlbGVjdGlvbi5vbiggJ3NlbGVjdGlvbjpzaW5nbGUnLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHR2YXIgYXR0YWNobWVudCA9IGNvbnRlbnRWaWV3Lm9wdGlvbnMuc2VsZWN0aW9uLnNpbmdsZSgpO1xuXG5cdFx0XHRcdHZhciBkaXNwbGF5Tm90aWNlID0gZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0XHQvLyBJZiBzdGlsbCB1cGxvYWRpbmcsIHdhaXQgYW5kIHRyeSBkaXNwbGF5aW5nIG5vdGljZSBhZ2Fpbi5cblx0XHRcdFx0XHRpZiAoIGF0dGFjaG1lbnQuZ2V0KCAndXBsb2FkaW5nJyApICkge1xuXHRcdFx0XHRcdFx0d2luZG93LnNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRkaXNwbGF5Tm90aWNlKCk7XG5cdFx0XHRcdFx0XHR9LCA1MDAgKTtcblxuXHRcdFx0XHRcdC8vIE9LLiBEaXNwbGF5IG5vdGljZSBhcyByZXF1aXJlZC5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRpZiAoICEgdGhpcy5pc0F0dGFjaG1lbnRTaXplT2soIGF0dGFjaG1lbnQgKSApIHtcblx0XHRcdFx0XHRcdFx0JCggJy5hdHRhY2htZW50cy1icm93c2VyIC5hdHRhY2htZW50LWluZm8nICkucHJlcGVuZCggJG5vdGljZSApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0JG5vdGljZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9LmJpbmQodGhpcyk7XG5cblx0XHRcdFx0ZGlzcGxheU5vdGljZSgpO1xuXG5cdFx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdH0uYmluZCh0aGlzKSwgMTAwICApO1xuXG5cdH0sXG5cblx0cmVtb3ZlSW1hZ2U6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciAkdGFyZ2V0LCBpZDtcblxuXHRcdCR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcblx0XHQkdGFyZ2V0ID0gKCAkdGFyZ2V0LnByb3AoJ3RhZ05hbWUnKSA9PT0gJ0JVVFRPTicgKSA/ICR0YXJnZXQgOiAkdGFyZ2V0LmNsb3Nlc3QoJ2J1dHRvbi5yZW1vdmUnKTtcblx0XHRpZCAgICAgID0gJHRhcmdldC5kYXRhKCAnaW1hZ2UtaWQnICk7XG5cblx0XHRpZiAoICEgaWQgICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuc2VsZWN0aW9uLnJlbW92ZSggdGhpcy5zZWxlY3Rpb24ud2hlcmUoIHsgaWQ6IGlkIH0gKSApO1xuXHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuc2VsZWN0aW9uLnBsdWNrKCdpZCcpICk7XG5cblx0fSxcblxuXHQvKipcblx0ICogRG9lcyBhdHRhY2htZW50IG1lZXQgc2l6ZSByZXF1aXJlbWVudHM/XG5cdCAqXG5cdCAqIEBwYXJhbSAgQXR0YWNobWVudFxuXHQgKiBAcmV0dXJuIGJvb2xlYW5cblx0ICovXG5cdGlzQXR0YWNobWVudFNpemVPazogZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cblx0XHRpZiAoICEgKCAnc2l6ZVJlcScgaW4gdGhpcy5jb25maWcgKSApIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHRoaXMuY29uZmlnLnNpemVSZXEgPSBfLmV4dGVuZCgge1xuXHRcdFx0d2lkdGg6IDAsXG5cdFx0XHRoZWlnaHQ6IDAsXG5cdFx0fSwgdGhpcy5jb25maWcuc2l6ZVJlcSApO1xuXG5cdFx0dmFyIHdpZHRoUmVxICA9IGF0dGFjaG1lbnQuZ2V0KCd3aWR0aCcpICA+PSB0aGlzLmNvbmZpZy5zaXplUmVxLndpZHRoO1xuXHRcdHZhciBoZWlnaHRSZXEgPSBhdHRhY2htZW50LmdldCgnaGVpZ2h0JykgPj0gdGhpcy5jb25maWcuc2l6ZVJlcS5oZWlnaHQ7XG5cblx0XHRyZXR1cm4gd2lkdGhSZXEgJiYgaGVpZ2h0UmVxO1xuXG5cdH1cblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkQXR0YWNobWVudDtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQuanMnKTtcblxudmFyIEZpZWxkQ29udGVudEVkaXRhYmxlID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogICQoICcjdG1wbC1tcGItZmllbGQtY29udGVudC1lZGl0YWJsZScgKS5odG1sKCksXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2tleXVwICAuY29udGVudC1lZGl0YWJsZS1maWVsZCc6ICdpbnB1dENoYW5nZWQnLFxuXHRcdCdjaGFuZ2UgLmNvbnRlbnQtZWRpdGFibGUtZmllbGQnOiAnaW5wdXRDaGFuZ2VkJyxcblx0fSxcblxuXHRpbnB1dENoYW5nZWQ6IF8uZGVib3VuY2UoIGZ1bmN0aW9uKGUpIHtcblx0XHRpZiAoIGUgJiYgZS50YXJnZXQgKSB7XG4gICAgICAgIFx0dGhpcy5zZXRWYWx1ZSggJChlLnRhcmdldCkuaHRtbCgpICk7XG4gICAgICAgIH1cblx0fSApLFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRDb250ZW50RWRpdGFibGU7XG4iLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgRmllbGQgPSByZXF1aXJlKCcuL2ZpZWxkLmpzJyk7XG5cbnZhciBGaWVsZExpbmsgPSBGaWVsZC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAgJCggJyN0bXBsLW1wYi1maWVsZC1saW5rJyApLmh0bWwoKSxcblxuXHRldmVudHM6IHtcblx0XHQna2V5dXAgICBpbnB1dC5maWVsZC10ZXh0JzogJ3RleHRJbnB1dENoYW5nZWQnLFxuXHRcdCdjaGFuZ2UgIGlucHV0LmZpZWxkLXRleHQnOiAndGV4dElucHV0Q2hhbmdlZCcsXG5cdFx0J2tleXVwICAgaW5wdXQuZmllbGQtbGluayc6ICdsaW5rSW5wdXRDaGFuZ2VkJyxcblx0XHQnY2hhbmdlICBpbnB1dC5maWVsZC1saW5rJzogJ2xpbmtJbnB1dENoYW5nZWQnLFxuXHR9LFxuXG5cdHRleHRJbnB1dENoYW5nZWQ6IF8uZGVib3VuY2UoIGZ1bmN0aW9uKGUpIHtcblx0XHRpZiAoIGUgJiYgZS50YXJnZXQgKSB7XG5cdFx0XHR2YXIgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cdFx0XHR2YWx1ZS50ZXh0ID0gZS50YXJnZXQudmFsdWU7XG5cdFx0XHR0aGlzLnNldFZhbHVlKCB2YWx1ZSApO1xuXHRcdH1cblx0fSApLFxuXG5cdGxpbmtJbnB1dENoYW5nZWQ6IF8uZGVib3VuY2UoIGZ1bmN0aW9uKGUpIHtcblx0XHRpZiAoIGUgJiYgZS50YXJnZXQgKSB7XG5cdFx0XHR2YXIgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cdFx0XHR2YWx1ZS5saW5rID0gZS50YXJnZXQudmFsdWU7XG5cdFx0XHR0aGlzLnNldFZhbHVlKCB2YWx1ZSApO1xuXHRcdH1cblx0fSApLFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZExpbms7XG4iLCJ2YXIgJCAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG52YXIgRmllbGRUZXh0ID0gRmllbGQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogICQoICcjdG1wbC1tcGItZmllbGQtdGV4dCcgKS5odG1sKCksXG5cblx0ZGVmYXVsdENvbmZpZzoge1xuXHRcdGNsYXNzZXM6ICdyZWd1bGFyLXRleHQnLFxuXHRcdHBsYWNlaG9sZGVyOiBudWxsLFxuXHR9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdrZXl1cCAgIGlucHV0JzogJ2lucHV0Q2hhbmdlZCcsXG5cdFx0J2NoYW5nZSAgaW5wdXQnOiAnaW5wdXRDaGFuZ2VkJyxcblx0fSxcblxuXHRpbnB1dENoYW5nZWQ6IF8uZGVib3VuY2UoIGZ1bmN0aW9uKGUpIHtcblx0XHRpZiAoIGUgJiYgZS50YXJnZXQgKSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlKCBlLnRhcmdldC52YWx1ZSApO1xuXHRcdH1cblx0fSApLFxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGRUZXh0O1xuIiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEZpZWxkVGV4dCA9IHJlcXVpcmUoJy4vZmllbGQtdGV4dC5qcycpO1xuXG52YXIgRmllbGRUZXh0YXJlYSA9IEZpZWxkVGV4dC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAgJCggJyN0bXBsLW1wYi1maWVsZC10ZXh0YXJlYScgKS5odG1sKCksXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2tleXVwICB0ZXh0YXJlYSc6ICdpbnB1dENoYW5nZWQnLFxuXHRcdCdjaGFuZ2UgdGV4dGFyZWEnOiAnaW5wdXRDaGFuZ2VkJyxcblx0fSxcblxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpZWxkVGV4dGFyZWE7XG4iLCJ2YXIgJCAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZC5qcycpO1xuXG4vKipcbiAqIFRleHQgRmllbGQgVmlld1xuICpcbiAqIFlvdSBjYW4gdXNlIHRoaXMgYW55d2hlcmUuXG4gKiBKdXN0IGxpc3RlbiBmb3IgJ2NoYW5nZScgZXZlbnQgb24gdGhlIHZpZXcuXG4gKi9cbnZhciBGaWVsZFdZU0lXWUcgPSBGaWVsZC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAgJCggJyN0bXBsLW1wYi1maWVsZC13eXNpd3lnJyApLmh0bWwoKSxcblx0ZWRpdG9yOiBudWxsLFxuXHR2YWx1ZTogbnVsbCxcblxuXHQvKipcblx0ICogSW5pdC5cblx0ICpcblx0ICogb3B0aW9ucy52YWx1ZSBpcyB1c2VkIHRvIHBhc3MgaW5pdGlhbCB2YWx1ZS5cblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0RmllbGQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgb3B0aW9ucyBdICk7XG5cblx0XHQvLyBBIGZldyBoZWxwZXJzLlxuXHRcdHRoaXMuZWRpdG9yID0ge1xuXHRcdFx0aWQgICAgICAgICAgIDogJ21wYi10ZXh0LWJvZHktJyArIHRoaXMuY2lkLFxuXHRcdFx0bmFtZVJlZ2V4ICAgIDogbmV3IFJlZ0V4cCggJ21wYi1wbGFjZWhvbGRlci1uYW1lJywgJ2cnICksXG5cdFx0XHRpZFJlZ2V4ICAgICAgOiBuZXcgUmVnRXhwKCAnbXBiLXBsYWNlaG9sZGVyLWlkJywgJ2cnICksXG5cdFx0XHRjb250ZW50UmVnZXggOiBuZXcgUmVnRXhwKCAnbXBiLXBsYWNlaG9sZGVyLWNvbnRlbnQnLCAnZycgKSxcblx0XHR9O1xuXG5cdFx0Ly8gVGhlIHRlbXBsYXRlIHByb3ZpZGVkIGlzIGdlbmVyaWMgbWFya3VwIHVzZWQgYnkgVGlueU1DRS5cblx0XHQvLyBXZSBuZWVkIGEgdGVtcGxhdGUgdW5pcXVlIHRvIHRoaXMgdmlldy5cblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IubmFtZVJlZ2V4LCB0aGlzLmVkaXRvci5pZCApO1xuXHRcdHRoaXMudGVtcGxhdGUgID0gdGhpcy50ZW1wbGF0ZS5yZXBsYWNlKCB0aGlzLmVkaXRvci5pZFJlZ2V4LCB0aGlzLmVkaXRvci5pZCApO1xuXHRcdHRoaXMudGVtcGxhdGUgID0gdGhpcy50ZW1wbGF0ZS5yZXBsYWNlKCB0aGlzLmVkaXRvci5jb250ZW50UmVnZXgsICc8JT0gdmFsdWUgJT4nICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuXHRcdC8vIENyZWF0ZSBlbGVtZW50IGZyb20gdGVtcGxhdGUuXG5cdFx0dGhpcy4kZWwuaHRtbCggXy50ZW1wbGF0ZSggdGhpcy50ZW1wbGF0ZSwgeyB2YWx1ZTogdGhpcy5nZXRWYWx1ZSgpIH0gKSApO1xuXG5cdFx0Ly8gSGlkZSBlZGl0b3IgdG8gcHJldmVudCBGT1VDLiBTaG93IGFnYWluIG9uIGluaXQuIFNlZSBzZXR1cC5cblx0XHQkKCAnLndwLWVkaXRvci13cmFwJywgdGhpcy4kZWwgKS5jc3MoICdkaXNwbGF5JywgJ25vbmUnICk7XG5cblx0XHQvLyBJbml0LiBEZWZmZXJyZWQgdG8gbWFrZSBzdXJlIGNvbnRhaW5lciBlbGVtZW50IGhhcyBiZWVuIHJlbmRlcmVkLlxuXHRcdF8uZGVmZXIoIHRoaXMuaW5pdFRpbnlNQ0UuYmluZCggdGhpcyApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIHRoZSBUaW55TUNFIGVkaXRvci5cblx0ICpcblx0ICogQml0IGhhY2t5IHRoaXMuXG5cdCAqXG5cdCAqIEByZXR1cm4gbnVsbC5cblx0ICovXG5cdGluaXRUaW55TUNFOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBzZWxmID0gdGhpcywgaWQsIGVkLCAkZWwsIHByb3A7XG5cblx0XHRpZCAgPSB0aGlzLmVkaXRvci5pZDtcblx0XHRlZCAgPSB0aW55TUNFLmdldCggaWQgKTtcblx0XHQkZWwgPSAkKCAnI3dwLScgKyBpZCArICctd3JhcCcsIHRoaXMuJGVsICk7XG5cblx0XHRpZiAoIGVkICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEdldCBzZXR0aW5ncyBmb3IgdGhpcyBmaWVsZC5cblx0XHQvLyBJZiBubyBzZXR0aW5ncyBmb3IgdGhpcyBmaWVsZC4gQ2xvbmUgZnJvbSBwbGFjZWhvbGRlci5cblx0XHRpZiAoIHR5cGVvZiggdGlueU1DRVByZUluaXQubWNlSW5pdFsgaWQgXSApID09PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdHZhciBuZXdTZXR0aW5ncyA9IGpRdWVyeS5leHRlbmQoIHt9LCB0aW55TUNFUHJlSW5pdC5tY2VJbml0WyAnbXBiLXBsYWNlaG9sZGVyLWlkJyBdICk7XG5cdFx0XHRmb3IgKCBwcm9wIGluIG5ld1NldHRpbmdzICkge1xuXHRcdFx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YoIG5ld1NldHRpbmdzW3Byb3BdICkgKSB7XG5cdFx0XHRcdFx0bmV3U2V0dGluZ3NbcHJvcF0gPSBuZXdTZXR0aW5nc1twcm9wXS5yZXBsYWNlKCB0aGlzLmVkaXRvci5pZFJlZ2V4LCBpZCApLnJlcGxhY2UoIHRoaXMuZWRpdG9yLm5hbWVSZWdleCwgbmFtZSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdID0gbmV3U2V0dGluZ3M7XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGZ1bGxzY3JlZW4gcGx1Z2luLlxuXHRcdHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0ucGx1Z2lucyA9IHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0ucGx1Z2lucy5yZXBsYWNlKCAnZnVsbHNjcmVlbiwnLCAnJyApO1xuXG5cdFx0Ly8gR2V0IHF1aWNrdGFnIHNldHRpbmdzIGZvciB0aGlzIGZpZWxkLlxuXHRcdC8vIElmIG5vbmUgZXhpc3RzIGZvciB0aGlzIGZpZWxkLiBDbG9uZSBmcm9tIHBsYWNlaG9sZGVyLlxuXHRcdGlmICggdHlwZW9mKCB0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHR2YXIgbmV3UVRTID0galF1ZXJ5LmV4dGVuZCgge30sIHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgJ21wYi1wbGFjZWhvbGRlci1pZCcgXSApO1xuXHRcdFx0Zm9yICggcHJvcCBpbiBuZXdRVFMgKSB7XG5cdFx0XHRcdGlmICggJ3N0cmluZycgPT09IHR5cGVvZiggbmV3UVRTW3Byb3BdICkgKSB7XG5cdFx0XHRcdFx0bmV3UVRTW3Byb3BdID0gbmV3UVRTW3Byb3BdLnJlcGxhY2UoIHRoaXMuZWRpdG9yLmlkUmVnZXgsIGlkICkucmVwbGFjZSggdGhpcy5lZGl0b3IubmFtZVJlZ2V4LCBuYW1lICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgaWQgXSA9IG5ld1FUUztcblx0XHR9XG5cblx0XHQvLyBXaGVuIGVkaXRvciBpbml0cywgYXR0YWNoIHNhdmUgY2FsbGJhY2sgdG8gY2hhbmdlIGV2ZW50LlxuXHRcdHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbaWRdLnNldHVwID0gZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0c2VsZi5zZXRWYWx1ZSggZS50YXJnZXQuZ2V0Q29udGVudCgpICk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdC8vIFByZXZlbnQgRk9VQy4gU2hvdyBlbGVtZW50IGFmdGVyIGluaXQuXG5cdFx0XHR0aGlzLm9uKCAnaW5pdCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkZWwuY3NzKCAnZGlzcGxheScsICdibG9jaycgKTtcblx0XHRcdH0pO1xuXG5cdFx0fTtcblxuXHRcdC8vIEN1cnJlbnQgbW9kZSBkZXRlcm1pbmVkIGJ5IGNsYXNzIG9uIGVsZW1lbnQuXG5cdFx0Ly8gSWYgbW9kZSBpcyB2aXN1YWwsIGNyZWF0ZSB0aGUgdGlueU1DRS5cblx0XHRpZiAoICRlbC5oYXNDbGFzcygndG1jZS1hY3RpdmUnKSApIHtcblx0XHRcdHRpbnlNQ0UuaW5pdCggdGlueU1DRVByZUluaXQubWNlSW5pdFtpZF0gKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JGVsLmNzcyggJ2Rpc3BsYXknLCAnYmxvY2snICk7XG5cdFx0fVxuXG5cdFx0Ly8gSW5pdCBxdWlja3RhZ3MuXG5cdFx0cXVpY2t0YWdzKCB0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gKTtcblx0XHRRVGFncy5fYnV0dG9uc0luaXQoKTtcblxuXHRcdC8vIEhhbmRsZSB0ZW1wb3JhcnkgcmVtb3ZhbCBvZiB0aW55TUNFIHdoZW4gc29ydGluZy5cblx0XHR0aGlzLiRlbC5jbG9zZXN0KCcudWktc29ydGFibGUnKS5vbiggJ3NvcnRzdGFydCcsIGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG5cdFx0XHRpZiAoIHVpLml0ZW1bMF0uZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpID09PSB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSApIHtcblx0XHRcdFx0dGlueU1DRS5leGVjQ29tbWFuZCggJ21jZVJlbW92ZUVkaXRvcicsIGZhbHNlLCBpZCApO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0Ly8gSGFuZGxlIHJlLWluaXQgYWZ0ZXIgc29ydGluZy5cblx0XHR0aGlzLiRlbC5jbG9zZXN0KCcudWktc29ydGFibGUnKS5vbiggJ3NvcnRzdG9wJywgZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblx0XHRcdGlmICggdWkuaXRlbVswXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2lkJykgPT09IHRoaXMuZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpICkge1xuXHRcdFx0XHR0aW55TUNFLmV4ZWNDb21tYW5kKCdtY2VBZGRFZGl0b3InLCBmYWxzZSwgaWQpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdH0sXG5cblx0cmVtb3ZlOiBmdW5jdGlvbigpIHtcblx0XHR0aW55TUNFLmV4ZWNDb21tYW5kKCAnbWNlUmVtb3ZlRWRpdG9yJywgZmFsc2UsIHRoaXMuZWRpdG9yLmlkICk7XG5cdH0sXG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZFdZU0lXWUc7XG4iLCIvKipcbiAqIEFic3RyYWN0IEZpZWxkIENsYXNzLlxuICpcbiAqIEhhbmRsZXMgc2V0dXAgYXMgd2VsbCBhcyBnZXR0aW5nIGFuZCBzZXR0aW5nIHZhbHVlcy5cbiAqIFByb3ZpZGVzIGEgdmVyeSBnZW5lcmljIHJlbmRlciBtZXRob2QgLSBidXQgcHJvYmFibHkgYmUgT0sgZm9yIG1vc3Qgc2ltcGxlIGZpZWxkcy5cbiAqL1xudmFyIEZpZWxkID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAgICAgIG51bGwsXG5cdHZhbHVlOiAgICAgICAgIG51bGwsXG5cdGNvbmZpZzogICAgICAgIHt9LFxuXHRkZWZhdWx0Q29uZmlnOiB7fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZS5cblx0ICogSWYgeW91IGV4dGVuZCB0aGlzIHZpZXcgLSBpdCBpcyByZWNjb21tZWRlZCB0byBjYWxsIHRoaXMuXG5cdCAqXG5cdCAqIEV4cGVjdHMgb3B0aW9ucy52YWx1ZSBhbmQgb3B0aW9ucy5jb25maWcuXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblxuXHRcdHZhciBjb25maWc7XG5cblx0XHRfLmJpbmRBbGwoIHRoaXMsICdnZXRWYWx1ZScsICdzZXRWYWx1ZScgKTtcblxuXHRcdGlmICggJ3ZhbHVlJyBpbiBvcHRpb25zICkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggb3B0aW9ucy52YWx1ZSApO1xuXHRcdH1cblxuXHRcdGNvbmZpZyA9ICggJ2NvbmZpZycgaW4gb3B0aW9ucyApID8gb3B0aW9ucy5jb25maWcgOiB7fTtcblx0XHR0aGlzLmNvbmZpZyA9IF8uZXh0ZW5kKCB7fSwgdGhpcy5kZWZhdWx0Q29uZmlnLCBjb25maWcgKTtcblxuXHR9LFxuXG5cdGdldFZhbHVlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy52YWx1ZTtcblx0fSxcblxuXHRzZXRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXG5cdFx0dGhpcy52YWx1ZSA9IHZhbHVlO1xuXG5cdFx0dGhpcy50cmlnZ2VyKCAnY2hhbmdlJywgdGhpcy5nZXRWYWx1ZSgpICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRpZDogICAgIHRoaXMuY2lkLFxuXHRcdFx0dmFsdWU6ICB0aGlzLnZhbHVlLFxuXHRcdFx0Y29uZmlnOiB0aGlzLmNvbmZpZ1xuXHRcdH07XG5cblx0XHR0aGlzLiRlbC5odG1sKCBfLnRlbXBsYXRlKCB0aGlzLnRlbXBsYXRlLCBkYXRhICkgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGQ7XG4iLCJ2YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdCA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcbnZhciBGaWVsZFRleHQgPSByZXF1aXJlKCcuL2ZpZWxkcy9maWVsZC10ZXh0LmpzJyk7XG52YXIgRmllbGRDb250ZW50RWRpdGFibGUgPSByZXF1aXJlKCcuL2ZpZWxkcy9maWVsZC1jb250ZW50LWVkaXRhYmxlLmpzJyk7XG5cbi8qKlxuICogSGlnaGxpZ2h0IE1vZHVsZS5cbiAqIEV4dGVuZHMgZGVmYXVsdCBtb3VkdWxlLFxuICogY3VzdG9tIGRpZmZlcmVudCB0ZW1wbGF0ZS5cbiAqL1xudmFyIEhpZ2hsaWdodE1vZHVsZUVkaXRWaWV3ID0gTW9kdWxlRWRpdC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAkKCAnI3RtcGwtbXBiLW1vZHVsZS1lZGl0LWJsb2NrcXVvdGUnICkuaHRtbCgpLFxuXG5cdGZpZWxkczoge1xuXHRcdHRleHQ6IG51bGwsXG5cdFx0c291cmNlOiBudWxsLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBhdHRyaWJ1dGVzLCBvcHRpb25zIF0gKTtcblxuXHRcdHRoaXMuZmllbGRzLnRleHQgPSBuZXcgRmllbGRDb250ZW50RWRpdGFibGUoIHtcblx0XHRcdHZhbHVlOiB0aGlzLm1vZGVsLmdldEF0dHIoJ3RleHQnKS5nZXQoJ3ZhbHVlJyksXG5cdFx0fSApO1xuXG5cdFx0dGhpcy5maWVsZHMudGV4dC5vbiggJ2NoYW5nZScsIGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRcdHRoaXMuc2V0QXR0ciggJ3RleHQnLCB2YWx1ZSApO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0dGhpcy5maWVsZHMuc291cmNlID0gbmV3IEZpZWxkVGV4dCgge1xuXHRcdFx0dmFsdWU6IHRoaXMubW9kZWwuZ2V0QXR0cignc291cmNlJykuZ2V0KCd2YWx1ZScpLFxuXHRcdH0gKTtcblxuXHRcdHRoaXMuZmllbGRzLnNvdXJjZS5vbiggJ2NoYW5nZScsIGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRcdHRoaXMuc2V0QXR0ciggJ3NvdXJjZScsIHZhbHVlICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzICk7XG5cblx0XHQkKCAnLmZpZWxkLXRleHQnLCB0aGlzLiRlbCApLmFwcGVuZCggdGhpcy5maWVsZHMudGV4dC5yZW5kZXIoKS4kZWwgKTtcblx0XHQkKCAnLmZpZWxkLXNvdXJjZScsIHRoaXMuJGVsICkuYXBwZW5kKCB0aGlzLmZpZWxkcy5zb3VyY2UucmVuZGVyKCkuJGVsICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIaWdobGlnaHRNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ICAgID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xudmFyIEZpZWxkVGV4dCAgICAgPSByZXF1aXJlKCcuL2ZpZWxkcy9maWVsZC10ZXh0LmpzJyk7XG52YXIgRmllbGRUZXh0YXJlYSA9IHJlcXVpcmUoJy4vZmllbGRzL2ZpZWxkLXRleHRhcmVhLmpzJyk7XG5cbi8qKlxuICogSGVhZGVyIE1vZHVsZS5cbiAqIEV4dGVuZHMgZGVmYXVsdCBtb3VkdWxlIHdpdGggY3VzdG9tIGRpZmZlcmVudCB0ZW1wbGF0ZS5cbiAqL1xudmFyIEhlYWRlck1vZHVsZUVkaXRWaWV3ID0gTW9kdWxlRWRpdC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAkKCAnI3RtcGwtbXBiLW1vZHVsZS1lZGl0LWhlYWRlcicgKS5odG1sKCksXG5cblx0ZmllbGRzOiB7XG5cdFx0aGVhZGluZzogbnVsbCxcblx0XHRzdWJoZWFkaW5nOiBudWxsLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBhdHRyaWJ1dGVzLCBvcHRpb25zIF0gKTtcblxuXHRcdHRoaXMuZmllbGRzLmhlYWRpbmcgPSBuZXcgRmllbGRUZXh0KCB7XG5cdFx0XHR2YWx1ZTogdGhpcy5tb2RlbC5nZXRBdHRyKCdoZWFkaW5nJykuZ2V0KCd2YWx1ZScpLFxuXHRcdH0gKTtcblxuXHRcdHRoaXMuZmllbGRzLmhlYWRpbmcub24oICdjaGFuZ2UnLCBmdW5jdGlvbiggdmFsdWUgKSB7XG5cdFx0XHR0aGlzLnNldEF0dHIoICdoZWFkaW5nJywgdmFsdWUgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHRoaXMuZmllbGRzLnN1YmhlYWRpbmcgPSBuZXcgRmllbGRUZXh0YXJlYSgge1xuXHRcdFx0dmFsdWU6IHRoaXMubW9kZWwuZ2V0QXR0cignc3ViaGVhZGluZycpLmdldCgndmFsdWUnKSxcblx0XHR9ICk7XG5cblx0XHR0aGlzLmZpZWxkcy5zdWJoZWFkaW5nLm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdFx0dGhpcy5zZXRBdHRyKCAnc3ViaGVhZGluZycsIHZhbHVlICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcyApO1xuXHRcdCQoICcuZmllbGQtaGVhZGluZycsIHRoaXMuJGVsICkuYXBwZW5kKCB0aGlzLmZpZWxkcy5oZWFkaW5nLnJlbmRlcigpLiRlbCApO1xuXHRcdCQoICcuZmllbGQtc3ViaGVhZGluZycsIHRoaXMuJGVsICkuYXBwZW5kKCB0aGlzLmZpZWxkcy5zdWJoZWFkaW5nLnJlbmRlcigpLiRlbCApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJNb2R1bGVFZGl0VmlldztcbiIsInZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ID0gcmVxdWlyZSgnLi9tb2R1bGUtZWRpdC5qcycpO1xudmFyIEZpZWxkQXR0YWNobWVudCA9IHJlcXVpcmUoJy4vZmllbGRzL2ZpZWxkLWF0dGFjaG1lbnQuanMnKTtcblxuLyoqXG4gKiBIaWdobGlnaHQgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUsXG4gKiBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgSW1hZ2VNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLW1wYi1tb2R1bGUtZWRpdC1pbWFnZScgKS5odG1sKCksXG5cblx0ZmllbGRzOiB7XG5cdFx0aW1hZ2U6IG51bGxcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggYXR0cmlidXRlcywgb3B0aW9ucyApIHtcblxuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgYXR0cmlidXRlcywgb3B0aW9ucyBdICk7XG5cblx0XHR0aGlzLmltYWdlQXR0ciA9IHRoaXMubW9kZWwuZ2V0QXR0cignaW1hZ2UnKTtcblxuXHRcdHZhciBjb25maWcgPSB0aGlzLmltYWdlQXR0ci5nZXQoJ2NvbmZpZycpIHx8IHt9O1xuXG5cdFx0Y29uZmlnID0gXy5leHRlbmQoIHtcblx0XHRcdG11bHRpcGxlOiBmYWxzZSxcblx0XHR9LCBjb25maWcgKTtcblxuXHRcdHRoaXMuZmllbGRzLmltYWdlID0gbmV3IEZpZWxkQXR0YWNobWVudCgge1xuXHRcdFx0dmFsdWU6IHRoaXMuaW1hZ2VBdHRyLmdldCgndmFsdWUnKSxcblx0XHRcdGNvbmZpZzogY29uZmlnLFxuXHRcdH0gKTtcblxuXHRcdHRoaXMuZmllbGRzLmltYWdlLm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XHR0aGlzLnNldEF0dHIoICdpbWFnZScsIGRhdGEgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMgKTtcblxuXHRcdCQoICcuaW1hZ2UtZmllbGQnLCB0aGlzLiRlbCApLmFwcGVuZChcblx0XHRcdHRoaXMuZmllbGRzLmltYWdlLnJlbmRlcigpLiRlbFxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZU1vZHVsZUVkaXRWaWV3O1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG52YXIgRmllbGRUZXh0ICA9IHJlcXVpcmUoJy4vZmllbGRzL2ZpZWxkLXd5c2l3eWcuanMnKTtcblxudmFyIFRleHRNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLW1wYi1tb2R1bGUtZWRpdC10ZXh0JyApLmh0bWwoKSxcblx0dGV4dEZpZWxkOiBudWxsLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgWyBhdHRyaWJ1dGVzLCBvcHRpb25zIF0gKTtcblxuXHRcdC8vIEluaXRpYWxpemUgb3VyIHRleHRmaWVsZCBzdWJ2aWV3LlxuXHRcdHRoaXMudGV4dEZpZWxkID0gbmV3IEZpZWxkVGV4dCgge1xuXHRcdFx0dmFsdWU6IHRoaXMubW9kZWwuZ2V0QXR0cignYm9keScpLmdldCgndmFsdWUnKSxcblx0XHR9ICk7XG5cblx0XHQvLyBMaXN0ZW4gZm9yIGNoYW5nZSBldmVudCBpbiBzdWJ2aWV3IGFuZCB1cGRhdGUgY3VycmVudCB2YWx1ZS5cblx0XHR0aGlzLnRleHRGaWVsZC5vbiggJ2NoYW5nZScsIGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRcdHRoaXMuc2V0QXR0ciggJ2JvZHknLCB2YWx1ZSApO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0LyoqXG5cdFx0ICogRGVzdHJveSB0aGUgdGV4dCBmaWVsZCB3aGVuIG1vZGVsIGlzIHJlbW92ZWQuXG5cdFx0ICovXG5cdFx0dGhpcy5tb2RlbC5vbiggJ2Rlc3Ryb3knLCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMudGV4dEZpZWxkLnJlbW92ZSgpO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblxuXHRcdC8vIENhbGwgZGVmYXVsdCBNb2R1bGVFZGVpdCByZW5kZXIuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzICk7XG5cblx0XHQvLyBSZW5kZXIgYW5kIGluc2VydCB0ZXh0RmllbGQgdmlldy5cblx0XHQkKCAnLnRleHQtZmllbGQnLCB0aGlzLiRlbCApLmFwcGVuZChcblx0XHRcdHRoaXMudGV4dEZpZWxkLnJlbmRlcigpLiRlbFxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUZXh0TW9kdWxlRWRpdFZpZXc7XG4iLCJ2YXIgQmFja2JvbmUgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG4vKipcbiAqIFZlcnkgZ2VuZXJpYyBmb3JtIHZpZXcgaGFuZGxlci5cbiAqIFRoaXMgZG9lcyBzb21lIGJhc2ljIG1hZ2ljIGJhc2VkIG9uIGRhdGEgYXR0cmlidXRlcyB0byB1cGRhdGUgc2ltcGxlIHRleHQgZmllbGRzLlxuICovXG52YXIgTW9kdWxlRWRpdCA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHRjbGFzc05hbWU6ICAgICAnbW9kdWxlLWVkaXQnLFxuXHR0b29sc1RlbXBsYXRlOiAkKCcjdG1wbC1tcGItbW9kdWxlLWVkaXQtdG9vbHMnICkuaHRtbCgpLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdF8uYmluZEFsbCggdGhpcywgJ3JlbW92ZU1vZGVsJywgJ3NldEF0dHInICk7XG5cdH0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIC5idXR0b24tc2VsZWN0aW9uLWl0ZW0tcmVtb3ZlJzogJ3JlbW92ZU1vZGVsJyxcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGRhdGEgID0gdGhpcy5tb2RlbC50b0pTT04oKTtcblx0XHRkYXRhLmF0dHIgPSB7fTtcblxuXHRcdC8vIEZvcm1hdCBhdHRyaWJ1dGUgYXJyYXkgZm9yIGVhc3kgdGVtcGxhdGluZy5cblx0XHQvLyBCZWNhdXNlIGF0dHJpYnV0ZXMgaW4gYW4gYXJyYXkgaXMgZGlmZmljdWx0IHRvIGFjY2Vzcy5cblx0XHR0aGlzLm1vZGVsLmdldCgnYXR0cicpLmVhY2goIGZ1bmN0aW9uKCBhdHRyICkge1xuXHRcdFx0ZGF0YS5hdHRyWyBhdHRyLmdldCgnbmFtZScpIF0gPSBhdHRyLnRvSlNPTigpO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJGVsLmh0bWwoIF8udGVtcGxhdGUoIHRoaXMudGVtcGxhdGUsIGRhdGEgKSApO1xuXG5cdFx0Ly8gSUQgYXR0cmlidXRlLCBzbyB3ZSBjYW4gY29ubmVjdCB0aGUgdmlldyBhbmQgbW9kZWwgYWdhaW4gbGF0ZXIuXG5cdFx0dGhpcy4kZWwuYXR0ciggJ2RhdGEtY2lkJywgdGhpcy5tb2RlbC5jaWQgKTtcblxuXHRcdC8vIEFwcGVuZCB0aGUgbW9kdWxlIHRvb2xzLlxuXHRcdHRoaXMuJGVsLnByZXBlbmQoIF8udGVtcGxhdGUoIHRoaXMudG9vbHNUZW1wbGF0ZSwgZGF0YSApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgYXR0cmlidXRlLlxuXHQgKlxuXHQgKiBOb3RlIG1hbnVhbCBjaGFuZ2UgZXZlbnQgdHJpZ2dlciB0byBlbnN1cmUgZXZlcnl0aGluZyBpcyB1cGRhdGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gc3RyaW5nIGF0dHJpYnV0ZVxuXHQgKiBAcGFyYW0gbWl4ZWQgIHZhbHVlXG5cdCAqL1xuXHRzZXRBdHRyOiBmdW5jdGlvbiggYXR0cmlidXRlLCB2YWx1ZSApIHtcblxuXHRcdHZhciBhdHRyID0gdGhpcy5tb2RlbC5nZXRBdHRyKCBhdHRyaWJ1dGUgKTtcblxuXHRcdGlmICggYXR0ciApIHtcblx0XHRcdGF0dHIuc2V0KCAndmFsdWUnLCB2YWx1ZSApO1xuXHRcdFx0dGhpcy5tb2RlbC50cmlnZ2VyKCAnY2hhbmdlJywgdGhpcy5tb2RlbCApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgbW9kZWwgaGFuZGxlci5cblx0ICovXG5cdHJlbW92ZU1vZGVsOiBmdW5jdGlvbihlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHRoaXMucmVtb3ZlKCk7XG5cdFx0dGhpcy5tb2RlbC5kZXN0cm95KCk7XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZUVkaXQ7XG4iXX0=
