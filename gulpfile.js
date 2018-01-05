var gulp = require('gulp')
var ts = require('gulp-typescript')
var tsProject = ts.createProject('tsconfig.json')
var less = require('gulp-less')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')
var minify = require('gulp-minify-css')
var replace = require('gulp-replace')

var config = {
  include: {
    less: './src/pages/**/*.less',
    ts: './src/**/*.ts',
    html: './src/pages/**/*.html'
  }
}

gulp.task('default', function () {})

gulp.task('less', function () {
  return gulp.src(config.include.less)
    .pipe(less())
    .pipe(rename({dirname: ''}))
    .pipe(minify())
    .pipe(gulp.dest('./dist/css'))
})

gulp.task('ts', function () {
  return tsProject.src()
    .pipe(tsProject())
    .pipe(rename(function (e) {
      if (/^pages/.test(e.dirname)) {
        e.dirname = ''
      }
    }))
    .pipe(uglify())
    .pipe(replace('["require","exports","../../framework/framework"]', '["require","exports","../js/framework/framework"]'))
    .pipe(replace('["require","exports","../model/model"]', '["require","exports","./js/model/model"]'))
    .pipe(replace('["require","exports","../logic/logic"]', '["require","exports","./js/logic/logic"]'))
    .pipe(gulp.dest('./dist/js'))
})

gulp.task('html', function () {
  return gulp.src(['./src/pages/**/*.html', '!./src/pages/**/template.html'])
    .pipe(rename({dirname: ''}))
    .pipe(gulp.dest('./dist'))
})

gulp.task('js', function () {
  return gulp.src('./src/require.js')
    .pipe(gulp.dest('./dist/js'))
})

gulp.task('watch', ['ts', 'less', 'html', 'js'], function () {
  gulp.watch(config.include.less, ['less'])
  gulp.watch(config.include.ts, ['ts'])
  gulp.watch(config.include.html, ['html'])
})
