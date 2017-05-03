const gulp = require('gulp');
const del = require('del');
const webpack = require('webpack-stream');
const webpackEngine = require('webpack');
const connect = require('gulp-connect');

const webpackOptions = {
  entry: './src/ts/space-narwhal.ts',
  output: { filename: 'space-narwhal.js' },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        use: "source-map-loader"
      },
      {
        test: /\.ts$/,
        use: [{ loader: 'ts-loader' }]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  devtool: 'inline-source-map',
};

function swallowError(error) {
  console.error(error.toString());
  this.emit('end');
}

gulp.task('assets', () => {
  return gulp.src(['src/assets/**/*'])
         .pipe(gulp.dest('dist/assets'))
         .pipe(connect.reload());
});

gulp.task('levels', () => {
  return gulp.src(['src/levels/**/*'])
         .pipe(gulp.dest('dist/levels'))
         .pipe(connect.reload());
});

gulp.task('scripts', () => {
  return gulp.src(['src/**/*.ts'])
         .pipe(webpack(webpackOptions, webpackEngine))
         .on('error', swallowError)
         .pipe(gulp.dest('dist'))
         .pipe(connect.reload());
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
  gulp.watch('src/ts/**/*.ts', ['scripts']);
  gulp.watch('src/levels/**/*.json', ['levels']);
});

gulp.task('build', ['scripts', 'html', 'lib', 'assets', 'levels']);

gulp.task('default', ['connect', 'watch']);
