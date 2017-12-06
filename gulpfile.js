var gulp = require('gulp')
var ts = require('gulp-typescript')
var tsProject = ts.createProject('tsconfig.json')
var less = require('gulp-less')
// var rename = require('gulp-rename')

gulp.task('default', function () {
  console.log('default')
})

gulp.task('less', function () {
  return gulp.src('./src/less/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('./dist/css'))
})

gulp.task('ts', function () {
  return tsProject.src()
    .pipe(tsProject())
    .js
    .pipe(gulp.dest('./dist/js'))
})

gulp.task('html', function () {
  return gulp.src('./src/**/*.html')
    // .pipe(rename({extname: '.wxml'}))
    .pipe(gulp.dest('./dist'))
})

gulp.task('js', function () {
  return gulp.src('./src/ts/require.js')
    .pipe(gulp.dest('./dist/js'))
})

gulp.task('watch', ['less', 'ts', 'html', 'js'], function () {
  gulp.watch('./src/less/**/*.less', ['less'])
  gulp.watch('./src/ts/**/*.ts', ['ts'])
  gulp.watch('./src/**/*.html', ['html'])
  gulp.watch('./src/ts/require.js', ['js'])
})
