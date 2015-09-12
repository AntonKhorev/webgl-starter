var gulp=require('gulp');
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
		.pipe(autoprefixer())
		.pipe(minifyCss())
		.pipe(sourcemaps.write('.',{
			sourceRoot: '.'
		}))
		.pipe(gulp.dest(destination));
});

gulp.task('watch',function(){
	// TODO html, error handling
	gulp.watch(['src/main.js','src/options.js','src/code.js','src/listeners.js'],['js']);
	gulp.watch(['src/index.less'],['css']);
});

gulp.task('test',function(){
	gulp.src('tests/listeners.js')
		.pipe(mocha());
});

gulp.task('default',['html','js','css']);
