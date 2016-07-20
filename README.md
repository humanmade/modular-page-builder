# Modular Page Builder

Modular page builder for WordPress

![image](https://cloud.githubusercontent.com/assets/494927/10787478/1d80dd16-7d69-11e5-829e-725995593538.png)

## Basic usage

Out of the box, modules are available for header, text and image only.

You must add post type support for the builder `add_post_type_support( 'page', 'modular-page-builder' );`

You must handle the output of the page builder data manually. Here is an example of simply replacing the post content.

```php
add_filter( 'the_content', function( $content, $id = null ) {

    $id = $id ?: get_the_ID();

    if ( post_type_supports( get_post_type( $id ), 'modular-page-builder' ) ) {
        $plugin  = ModularPageBuilder\Plugin::get_instance()->get_builder( 'modular-page-builder' );
        $content = $plugin->get_rendered_data( $id );
    }
    
    return $content;

});
```

## Custom Modules

* Register module using `$plugin->register_module( 'module-name', 'ModuleClass' );
	* Module Class should extend `ModularPageBuilder\Modules\Module`.
	* It should provide a `render` method.
	* Set `$name` property the same as `module-name`
	* Define all available attributes in `$attr` array.
	* Each attribute should have name, label and type where type is an available field type.

### Extra Customization

* By default, your module will use the `edit-form-default.js` view.
* You can provide your own view by adding it to the edit view map: `window.modularPageBuilder.editViewMap`. Where the property is your module name and the view is your view object.
* You should probably extend `window.modularPageBuilder.views.ModuleEdit`.
* You can still make use of the built in field view objects if you want.

## Available Field Types

* `text`
* `textarea`
* `select`
* `html`
* `link`
* `attachment`
* `post_select`

### Text Field

Example.

```php
array( 
	'name'  => 'caption', 
	'label' => __( 'Test Text Field', 'mpb' ), 
	'type'  => 'text' 
)
```

### Select Field

Example.

```php
array(
	'name'   => 'select_test',
	'label'  => 'Select Test',
	'type'   => 'select',
	'config' => array(
		'options' => array(
			array( 'value' => 'a', 'text' => 'Option A' ),
			array( 'value' => 'b', 'text' => 'Option B' )
		)
	)
)
```
