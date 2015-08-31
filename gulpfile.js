var gulp=require('gulp');
var jade=require('gulp-jade');
var sourcemaps=require('gulp-sourcemaps');
var uglify=require('gulp-uglify');

gulp.task('html',function(){
	gulp.src('src/index.jade')
		.pipe(jade())
		.pipe(gulp.dest('public_html'));
});

gulp.task('js',function(){
	gulp.src('src/index.js')
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write('.',{
			sourceRoot: '.'
		}))
		.pipe(gulp.dest('public_html'));
});

gulp.task('default',['html','js']);
