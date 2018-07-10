const gulp = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const uglify = require('gulp-uglify');
const buff = require('vinyl-buffer');
const concat = require('vinyl-source-buffer');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-buffer');
const ugly = require('gulp-uglifycss');

//babel-preset-es2015
/*gulp.task('main-scripts', function() {
  browserify(['src/js/dbhelper.js', 'src/js/main.js'])
    .transform(babelify.configure({
      presets: ['babel-preset-es2015']
    }))
    .bundle()
    .pipe(source('main_bundle.js'))
    .pipe(buff())
    //.pipe(uglify())
    .pipe(gulp.dest('./dist/js'));
});*/

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

gulp.task('styles', function(){
  gulp.src('./src/css/styles.css')
  .pipe(ugly({
    'maxLineLen': 80,
    'uglyComments': true
  }))
  .pipe(gulp.dest('./dist/css'))
})

gulp.task('default', ['main-scripts', 'restaurant-scripts', 'styles']);