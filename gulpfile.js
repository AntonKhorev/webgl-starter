var gulp=require('gulp');
var notify=require("gulp-notify");
var jade=require('gulp-jade');
var browserify=require('browserify');
var source=require('vinyl-source-stream');
var buffer=require('vinyl-buffer');
var sourcemaps=require('gulp-sourcemaps');
var uglify=require('gulp-uglify');
var less=require('gulp-less');
var autoprefixer=require('gulp-autoprefixer');
var minifyCss=require('gulp-minify-css');
var mocha=require('gulp-mocha');

var destination='public_html/en/base';

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
	gulp.src('src/index.jade')
		.pipe(jade({
			locals: {
				navbar: require('./src/navbar.js')
			}
		}))
		.pipe(gulp.dest(destination));
});

gulp.task('js',function(){
	browserify({
		entries: 'src/main.js',
		debug: true
	})
		.bundle()
		.on('error',handleErrors)
		.pipe(source('index.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({
			loadMaps: true
		}))
		.pipe(uglify())
		.pipe(sourcemaps.write('.',{
			sourceRoot: '.'
		}))
		.pipe(gulp.dest(destination));
});

gulp.task('css',function(){
	gulp.src('src/index.less')
		.pipe(sourcemaps.init())
		.pipe(less())
		.on('error',handleErrors)
		.pipe(autoprefixer())
		.pipe(minifyCss())
		.pipe(sourcemaps.write('.',{
			sourceRoot: '.'
		}))
		.pipe(gulp.dest(destination));
});

gulp.task('watch',function(){
	// TODO html - will have to reload navbar.js
	gulp.watch(['src/main.js','src/i18n.js','src/options.js','src/code.js','src/listeners.js','src/shapes.js','src/lines.js'],['js']);
	gulp.watch(['src/index.less'],['css']);
});

gulp.task('test',function(){
	gulp.src('tests/*.js')
		.pipe(mocha());
});

gulp.task('default',['html','js','css']);
