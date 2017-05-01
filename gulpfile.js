const gulp = require('gulp');
const del = require('del');
const webpack = require('webpack-stream');
const connect = require('gulp-connect');

const webpackOptions = {
  entry: './src/ts/space-narwhal.ts',
  output: { filename: 'space-narwhal.js' },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  }
};

gulp.task('scripts', () => {
  return gulp.src(['src/**/*.ts'])
         .pipe(webpack(webpackOptions))
         .pipe(gulp.dest('dist'));
});

gulp.task('html', () => {
  return gulp.src(['src/**/*.html'])
         .pipe(gulp.dest('dist'))
         .pipe(connect.reload());
});

gulp.task('lib', () => {
  return gulp.src(['lib/**/*'])
         .pipe(gulp.dest('dist'))
         .pipe(connect.reload());
});

gulp.task('connect', () => {
  connect.server({
    root: 'dist',
    livereload: true
  })
});

gulp.task('watch', ['build'], () => {
  gulp.watch('src/**/*.html', ['html']);
  gulp.watch('src/**/*.ts', ['scripts']);
});

gulp.task('build', ['scripts', 'html', 'lib']);

gulp.task('default', ['connect', 'watch']);
