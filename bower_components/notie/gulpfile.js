var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var cssnano = require('gulp-cssnano');
var del = require('del');

gulp.task('clean', function() {
     return del(['./dist']);
});

gulp.task('script', function() {
    gulp.src('./notie.js')
		.pipe(gulp.dest('./dist'))
        .pipe(uglify())
        .pipe(rename('notie.min.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('style', function () {
    gulp.src(['./notie.scss'])
        .pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./dist'));
});

gulp.task('default', ['clean'], function() {
    gulp.start('script', 'style');
});

gulp.task('watch', function() {
    gulp.watch('./notie.scss', ['style']);
	gulp.watch('./notie.js', ['script'])
});