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

var destination='public_html';

gulp.task('html',function(){
	gulp.src('src/index.jade')
		.pipe(jade())
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

gulp.task('default',['html','js','css']);
