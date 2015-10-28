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
		$plugin  = MPB_Plugin::get_instance()->get_builder( 'modular-page-builder' );
		$content = $builder->get_rendered_data( $id );
	}

	return $content;

}
```
