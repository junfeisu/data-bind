var gulp = require('gulp'),
  plugins = require('gulp-load-plugins')(),
  browserSync = require('browser-sync').create();
// server处理
gulp.task('serve', ['scripts'], function() {
  browserSync.init({
    server: "./"
  })

  gulp.watch('source/style/*.scss', ['styles']);
  gulp.watch(['model/*.js', '!build/js/*.min.js'], ['scripts']);
  gulp.watch('source/image/*', ['images']);
  gulp.watch(['build/**', 'index.html', 'example/**']).on('change', browserSync.reload);
})

// js处理
gulp.task('scripts', function() {
  return gulp.src(['model/*.js', '!build/js/*.min.js'])
    .pipe(plugins.babel({presets: ['es2015']}))
    .pipe(plugins.concat('index.js'))
    .pipe(gulp.dest('build/js/'))
    .pipe(plugins.rename({ suffix: '.min' }))
    .pipe(plugins.uglify())
    .pipe(gulp.dest('build/js/'))
    .pipe(plugins.notify({ message: 'Scripts task completed' }));
});

// 样式表处理
gulp.task('styles', function() {
  return gulp.src('./source/style/*.scss')
    .pipe(plugins.sass({ style: 'expanded' }))
    .pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('./build/css/'))
    .pipe(plugins.rename({ suffix: '.min' }))
    .pipe(plugins.minifyCss())
    .pipe(gulp.dest('./build/css/'))
    .pipe(plugins.notify({ message: 'Styles task completed' }));
});

// 图片处理
gulp.task('images', function() {
  return gulp.src('./source/image/*')
    //新建或者修改过的图片才会被压缩(optimizationLevel:3,所有都会被压缩)
    .pipe(plugins.cache(plugins.imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest('./build/img/'))
    .pipe(plugins.notify({ message: 'Images task completed' }));
});

// clean tasks
gulp.task('clean', function(callback) {
  plugins.del(['./build/js', 'build/css'], callback)
});

gulp.task('server', ['serve']);

gulp.task('default', ['server'])
