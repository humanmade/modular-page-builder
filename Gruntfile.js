module.exports = function( grunt ) {

	'use strict';

	var remapify = require('remapify');

	grunt.initConfig( {

		pkg:    grunt.file.readJSON( 'package.json' ),

		sass: {
			dist: {
				files: {
					'assets/css/dist/ustwo-page-builder.css' : 'assets/css/src/ustwo-page-builder.scss',
				},
				options: {
					sourceMap: true
				}
			}
		},

		autoprefixer: {
			options: {
				browsers: ['last 2 versions', 'ie 8', 'ie 9'],
				map: true,
			},
			your_target: {
				src: 'assets/css/dist/ustwo-page-builder.css',
				dest: 'assets/css/dist/ustwo-page-builder.css',
			},
		},

		watch:  {

			styles: {
				files: ['assets/css/src/*.scss','assets/css/src/**/*.scss'],
				tasks: ['styles'],
				options: {
					debounceDelay: 500,
					livereload: true,
					sourceMap: true
				}
			},

			scripts: {
				files: [ 'assets/js/src/*.js', 'assets/js/src/**/*.js' ],
				tasks: ['scripts'],
				options: {
					debounceDelay: 500,
					livereload: true,
					sourceMap: true
				}
			}

		},

		browserify : {

			options: {

				browserifyOptions: {
					debug: true
				},

				preBundleCB: function(b) {

					b.plugin(remapify, [
						{
							cwd: 'assets/js/src/models',
							src: '**/*.js',
							expose: 'models'
						},
						{
							cwd: 'assets/js/src/collections',
							src: '**/*.js',
							expose: 'collections'
						},
						{
							cwd: 'assets/js/src/views',
							src: '**/*.js',
							expose: 'views'
						},
						{
							cwd: 'assets/js/src/utils',
							src: '**/*.js',
							expose: 'utils'
						}
					]);

				}
			},

			dist: {
				files : {
					'assets/js/dist/ustwo-page-builder.js' : ['assets/js/src/ustwo-page-builder.js'],
				},
				options: {
					transform: ['browserify-shim']
				}
			},

		},

		phpcs: {
			application: {
				src: ['./**/*.php', '!./node_modules/**/*.php'],
			},
			options: {
				standard: 'WordPress'
			}
		},

		jshint: {
			all: ['Gruntfile.js', 'assets/js/src/**/*.js'],
			options: {
				jshintrc: true,
			},
		}

	} );

	grunt.loadNpmTasks( 'grunt-sass' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-browserify' );
	grunt.loadNpmTasks( 'grunt-autoprefixer' );
	grunt.loadNpmTasks( 'grunt-phpcs' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );

	grunt.registerTask( 'scripts', ['browserify', 'jshint'] );
	grunt.registerTask( 'styles', ['sass', 'autoprefixer'] );
	grunt.registerTask( 'php', ['phpcs'] );
	grunt.registerTask( 'default', ['scripts', 'styles', 'php'] );

	grunt.util.linefeed = '\n';

};
