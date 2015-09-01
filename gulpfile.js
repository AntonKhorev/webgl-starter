var gulp=require('gulp');
var jade=require('gulp-jade');
var browserify=require('browserify');
var source=require('vinyl-source-stream');
var buffer=require('vinyl-buffer');
var sourcemaps=require('gulp-sourcemaps');
var uglify=require('gulp-uglify');

gulp.task('html',function(){
	gulp.src('src/index.jade')
		.pipe(jade())
		.pipe(gulp.dest('public_html'));
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
		.pipe(gulp.dest('public_html'));
});

gulp.task('default',['html','js']);
