var $          = require('jquery');
var ModuleEdit = require('views/module-edit');

/**
 * Image Field
 *
 * Initialize and listen for the 'change' event to get updated data.
 *
 */
var FieldImage = Backbone.View.extend({

	template: $( '#tmpl-ustwo-field-image' ).html(),
	frame: null,
	imageAttr: null,
	value: [],
	config: {},

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

		_.bindAll( this, 'editImage', 'onSelectImage', 'removeImage', 'isAttachmentSizeOk' );

		if ( 'value' in options ) {
			this.value = options.value
		}

		if ( 'config' in options ) {
			this.config = _.extend( {
				multiple: false,
			}, options.config );
		}

		this.on( 'change', this.render );

	},

	render: function() {

		var template = _.memoize( function( value, config ) {
			return _.template( this.template, {
				value: value,
				config: config,
			} )
		}.bind(this) );

		this.$el.html( template( this.value, this.config ) );

		return this;

	},

	onSelectImage: function() {

		var frame = this.frame || null;

		if ( ! frame ) {
			return;
		}

		frame.close();

		var selection = frame.state().get('selection');
		this.value    = [];

		selection.each( function( attachment ) {
			if ( this.isAttachmentSizeOk( attachment ) ) {
				this.value.push( attachment.toJSON() );
			}
		}.bind(this) );

		this.trigger( 'change', this.value );

	},

	editImage: function(e) {

		e.preventDefault();

		var frame = this.frame;

		if ( ! Array.isArray( this.value ) ) {
			this.value = [];
		}

		this.value.map( function( item ) {
			return new wp.media.model.Attachment( item );
		} );

		if ( ! frame ) {

			var frameArgs = {
				library: { type: 'image' },
				multiple: this.config.multiple,
				title: 'Select Image',
				frame: 'select',
				selection: this.value,
			}

			frame = this.frame = wp.media( frameArgs );

			frame.on( 'content:create:browse', this.setupFilters, this );
			frame.on( 'select', this.onSelectImage, this );

		}

		frame.open();

	},

	/**
	 * Add a filter to the frame library collection to limit to required size.
	 * @return null
	 */
	setupFilters: function() {

		var lib    = this.frame.state().get('library');

		if ( 'sizeReq' in this.config ) {
			lib.filters['size'] = this.isAttachmentSizeOk;
		}

	},

	removeImage: function(e) {

		e.preventDefault();

		var $target, attrModel, id;

		$target   = $(e.target);
		$target   = ( $target.prop('tagName') === 'BUTTON' ) ? $target : $target.closest('button.remove');
		id        = $target.data( 'image-id' );

		if ( ! id  ) {
			return;
		}

		this.value = _.filter( this.value, function( image ) {
			return ( image.id !== id );
		} );

		this.value = ( this.value.length > 0 ) ? this.value : '';

		this.trigger( 'change', this.value );

	},

	/**
	 * Does attachment meet size requirements?
	 *
	 * @param  Attachment
	 * @return boolean
	 */
	isAttachmentSizeOk: function( attachment ) {

		if ( ! 'sizeReq' in this.config ) {
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
