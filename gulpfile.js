var gulp=require('gulp');
var reload=require('require-reload')(require);
var notify=require('gulp-notify');
var file=require('gulp-file');
var browserify=require('browserify');
var source=require('vinyl-source-stream');
var buffer=require('vinyl-buffer');
var sourcemaps=require('gulp-sourcemaps');
var wrapJS=require('gulp-wrap-js');
var uglify=require('gulp-uglify');
var less=require('gulp-less');
var autoprefixer=require('gulp-autoprefixer');
var minifyCss=require('gulp-minify-css');
var mocha=require('gulp-mocha');

var demoDestination='public_html/en/base';
var libDestination='public_html/lib';

// https://github.com/greypants/gulp-starter/blob/master/gulp/util/handleErrors.js
function handleErrors() {
	var args=Array.prototype.slice.call(arguments);
	notify.onError({
		title: "Compile Error",
		message: "<%= error %>"
	}).apply(this,args);
	this.emit('end');
}

gulp.task('html',function(){
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

gulp.task('css',function(){
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

gulp.task('js',function(){
	browserify({
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
		))
		.pipe(uglify())
		.pipe(sourcemaps.write('.',{
			sourceRoot: '.'
		}))
		.pipe(gulp.dest(libDestination));
});

gulp.task('watch',function(){
	gulp.watch(['demos/*'],['html']);
	gulp.watch(['src/**/*.js'],['js']);
	gulp.watch(['src/*.less'],['css']);
});

gulp.task('test',function(){
	gulp.src('tests/**/*.js')
		.pipe(mocha());
});

gulp.task('default',['html','css','js']);
