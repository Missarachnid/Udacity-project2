const gulp = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const uglify = require('gulp-uglify');
const buff = require('vinyl-buffer');
const concat = require('vinyl-source-buffer');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-buffer');
const ugly = require('gulp-uglifycss');
const imagemin = require('gulp-imagemin');


gulp.task('main-scripts', function() {
  browserify(['./src/js/dbhelper.js', './src/js/main.js'])
  .transform(babelify.configure({
    presets: ['babel-preset-es2015']
  }))
  .bundle()
  .pipe(source('bundle_main.js'))
  .pipe(buff())
  .pipe(uglify())
  .pipe(gulp.dest('./dist/js'))
  
});

gulp.task('restaurant-scripts', function() {
  browserify(['./src/js/dbhelper.js', './src/js/restaurant_info.js'])
  .transform(babelify.configure({
    presets: ['babel-preset-es2015']
  }))
  .bundle()
  .pipe(source('bundle_restaurant.js'))
  .pipe(buff())
  .pipe(uglify())
  .pipe(gulp.dest('./dist/js'))
  
});

gulp.task('sw', function() {
  browserify('./src/sw.js')
  .transform(babelify.configure({
    presets: ['babel-preset-es2015']
  }))
  .bundle()
  .pipe(source('sw.js'))
  .pipe(buff())
  .pipe(uglify())
  .pipe(gulp.dest('./dist'));
});

gulp.task('styles', function(){
  gulp.src('./src/css/styles.css')
  .pipe(ugly({
    'maxLineLen': 80,
    'uglyComments': true
  }))
  .pipe(gulp.dest('./dist/css'))
})

gulp.task('images', () =>
    gulp.src('./src/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/img'))
);

gulp.task('default', ['main-scripts', 'restaurant-scripts', 'styles', 'sw']);