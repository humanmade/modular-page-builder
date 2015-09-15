var $          = require('jquery');
var ModuleEdit = require('views/module-edit');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var HighlightModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-ustwo-module-edit-text' ).html(),

	initialize: function() {

		ModuleEdit.prototype.initialize.apply( this );

		// Make sure the template for this module is unique to this instance.
		this.editor = {
			id           : 'ustwo-text-body-' + this.model.cid,
			nameRegex    : new RegExp( 'ustwo-placeholder-name', 'g' ),
			idRegex      : new RegExp( 'ustwo-placeholder-id', 'g' ),
			contentRegex : new RegExp( 'ustwo-placeholder-content', 'g' ),
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
			var newSettings = jQuery.extend( {}, tinyMCEPreInit.mceInit[ 'ustwo-placeholder-id' ] );
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
			var newQTS = jQuery.extend( {}, tinyMCEPreInit.qtInit[ 'ustwo-placeholder-id' ] );
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
