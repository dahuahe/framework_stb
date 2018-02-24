var gulp = require('gulp')
var ts = require('gulp-typescript')
var tsProject = ts.createProject('tsconfig.json')
var less = require('gulp-less')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')
var minify = require('gulp-minify-css')
var replace = require('gulp-replace')
var htmlmin = require('gulp-htmlmin')
var autoprefixer = require('gulp-autoprefixer')
var imagemin = require('gulp-imagemin')

var config = {
  include: {
    less: './src/pages/**/*.less',
    ts: './src/**/*.ts',
    html: './src/pages/**/*.html'
  }
}

gulp.task('default', function () {})

// ● last 2 versions: 主流浏览器的最新两个版本
// ● last 1 Chrome versions: 谷歌浏览器的最新版本
// ● last 2 Explorer versions: IE的最新两个版本
// ● last 3 Safari versions: 苹果浏览器最新三个版本
// ● Firefox >= 20: 火狐浏览器的版本大于或等于20
// ● iOS 7: IOS7版本
// ● Firefox ESR: 最新ESR版本的火狐
//  ● > 5%: 全球统计有超过5%的使用率
gulp.task('less', function () {
  return gulp.src(config.include.less)
    .pipe(less())
    .pipe(autoprefixer({
      browsers: ['> 5%'],
      cascade: false
    }))
    .pipe(rename({dirname: ''}))
    // .pipe(minify())
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
    // .pipe(uglify())
    .pipe(replace('../../framework/framework', './framework/framework'))
    .pipe(replace('../../logic/logic', './logic/logic'))
    .pipe(replace('../../model/model', './model/model'))
    .pipe(replace('../../config"]', './config'))
    .pipe(gulp.dest('./dist/js'))
})
gulp.task('html', function () {
  return gulp.src(['./src/pages/**/*.html', '!./src/template/template.html'])
    .pipe(rename({dirname: ''}))
    // .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./dist'))
})
gulp.task('js', function () {
  return gulp.src('./src/require.js')
    .pipe(gulp.dest('./dist/js'))
})
// 发布版本相关任务
gulp.task('htmlmin', function () {
  return gulp.src(['./src/pages/**/*.html', '!./src/template/template.html'])
    .pipe(rename({dirname: ''}))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./dist'))
})
gulp.task('lessmin', function () {
  return gulp.src(config.include.less)
    .pipe(less())
    .pipe(rename({dirname: ''}))
    .pipe(autoprefixer({
      browsers: ['> 5%'],
      cascade: false
    }))
    .pipe(minify())
    .pipe(gulp.dest('./dist/css'))
})
gulp.task('tsmin', function () {
  return tsProject.src()
    .pipe(tsProject())
    .pipe(rename(function (e) {
      if (/^pages/.test(e.dirname)) {
        e.dirname = ''
      }
    }))
    .pipe(uglify())
    .pipe(replace('../../framework/framework', './framework/framework'))
    .pipe(replace('../../logic/logic', './logic/logic'))
    .pipe(replace('../../model/model', './model/model'))
    .pipe(replace('../../config', './config'))
    .pipe(gulp.dest('./dist/js'))
})
// gulp.task('imagemin', function () {
//   return gulp.src('./src/images/**/*')
//     .pipe(imagemin({
//       optimizationLevel: 5, // 类型：Number  默认：3  取值范围：0-7（优化等级）
//       progressive: true, // 类型：Boolean 默认：false 无损压缩jpg图片
//       interlaced: true, // 类型：Boolean 默认：false 隔行扫描gif进行渲染
//       multipass: true // 类型：Boolean 默认：false 多次优化svg直到完全优化
//     }))
//     .pipe(gulp.dest('./dist/images'))
// })
// minify
gulp.task('minify', ['tsmin', 'lessmin', 'htmlmin', 'js'])
// noraml
gulp.task('watch', ['ts', 'less', 'html', 'js'], function () {
  gulp.watch(config.include.less, ['less'])
  gulp.watch(config.include.ts, ['ts'])
  gulp.watch(config.include.html, ['html'])
})
