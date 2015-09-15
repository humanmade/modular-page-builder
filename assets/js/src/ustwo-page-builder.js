var Builder       = require('models/builder');
var BuilderView   = require('views/builder');
var $             = require('jquery');
var ModuleFactory = require('utils/module-factory');

$(document).ready(function(){

	// A field for storing the builder data.
	var $field = $( '[name=ustwo-page-builder-data]' );

	if ( ! $field.length ) {
		return;
	}

	// A container element for displaying the builder.
	var $container = $( '#ustwo-page-builder' );

	// Create a new instance of Builder model.
	// Pass an array of module names that are allowed for this builder.
	var builder = new Builder({
		allowedModules: $( '[name=ustwo-page-builder-allowed-modules]' ).val().split(',')
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

$(document).ready(function(){

	// A field for storing the builder data.
	var $field = $( '[name=ustwo-hero-data]' );

	if ( ! $field.length ) {
		return;
	}

	// A container element for displaying the builder.
	var $container = $( '#ustwo-hero' );

	// Create a new instance of Builder model.
	// Pass an array of module names that are allowed for this builder.
	var builder = new Builder({
		allowedModules: $( '[name=ustwo-hero-allowed-modules]' ).val().split(','),
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

	// Enforce at least 1 header module.
	var selection = builder.get('selection');
	if ( selection.length < 1 ) {
		selection.add( ModuleFactory.create( 'header' ) );
	}
	// Hide add new to prevent adding any more.
	// todo maybe we could support max number of modules.
	$( '.add-new', builderView.$el ).hide();
	$( '.module-edit-tools', builderView.$el ).hide();

});
