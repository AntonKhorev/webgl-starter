'use strict';

const gulp=require('gulp');
const reload=require('require-reload')(require);
const notify=require('gulp-notify');
const file=require('gulp-file');
const browserify=require('browserify');
const source=require('vinyl-source-stream');
const buffer=require('vinyl-buffer');
const sourcemaps=require('gulp-sourcemaps');
const wrapJS=require('gulp-wrap-js');
const uglify=require('gulp-uglify');
const less=require('gulp-less');
const autoprefixer=require('gulp-autoprefixer');
const minifyCss=require('gulp-minify-css');
const mocha=require('gulp-mocha');

const demoDestination='public_html/en/base';
const libDestination='public_html/lib';

// https://github.com/greypants/gulp-starter/blob/master/gulp/util/handleErrors.js
function handleErrors() {
	const args=Array.prototype.slice.call(arguments);
	notify.onError({
		title: "Compile Error",
		message: "<%= error %>"
	}).apply(this,args);
	this.emit('end');
}

gulp.task('html',()=>{
	return file(
		'index.html',
		reload('./demos/template.js')(
			"WebGL starter code generator",
			['http://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.7/styles/default.min.css'],
			['http://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.7/highlight.min.js']
		),
		{src: true}
	)
		.pipe(gulp.dest(demoDestination));
});

gulp.task('css',()=>{
	gulp.src('src/webgl-starter.less')
		.pipe(sourcemaps.init())
		.pipe(less())
		.on('error',handleErrors)
		.pipe(autoprefixer())
		.pipe(minifyCss())
		.pipe(sourcemaps.write('.',{
			sourceRoot: '.'
		}))
		.pipe(gulp.dest(libDestination));
});

function makeJsTaskFn(doUglify) {
	return ()=>{
		let stream=browserify({
			entries: 'src/main.js',
			debug: true
		})
			.transform('babelify',{
				presets:['es2015-loose'],
				plugins:['external-helpers-2'],
			})
			.bundle()
			.on('error',handleErrors)
			.pipe(source('webgl-starter.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init({
				loadMaps: true
			}))
			.pipe(wrapJS(
				reload('./src/base/babel-helpers-wrapper.js')()
			));
		if (doUglify) {
			stream=stream.pipe(uglify());
		}
		stream
			.pipe(sourcemaps.write('.',{
				sourceRoot: '.'
			}))
			.pipe(gulp.dest(libDestination));
	}
}
gulp.task('js',makeJsTaskFn(true));
gulp.task('js-no-uglify',makeJsTaskFn(false));

gulp.task('watch',()=>{
	gulp.watch(['demos/*'],['html']);
	gulp.watch(['src/**/*.js'],['js']);
	gulp.watch(['src/*.less'],['css']);
});

gulp.task('test',()=>{
	gulp.src('tests/**/*.js')
		.pipe(mocha());
});

gulp.task('default',['html','css','js']);
