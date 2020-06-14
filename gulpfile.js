'use strict';

const { src, dest, watch, series } = require('gulp'),
  sass = require('gulp-sass'),
  concat = require('gulp-concat'),
  terser = require('gulp-terser-js'),
  rename = require('gulp-rename'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  imagemin = require('gulp-imagemin'),
  changed = require('gulp-changed'),
  newer = require('gulp-newer'),
  cleanCSS = require('gulp-clean-css'),
  cleanDir = require('gulp-clean-dir'),
  browserSync = require('browser-sync').create(),
  path = {
    scss: './src/scss/**/*.scss',
    js: './src/js/**/*.js',
    images: './src/images/**/*.*',
    html: './src/*.html',
  };

function buildCSS() {
  return src(path.scss)
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(changed('./src/css'))
    .pipe(sass().on('error', sass.logError))
    .pipe(rename('style.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./src/css'))
    .pipe(browserSync.stream());
}

function copyCSS() {
  return src('./src/css/**/*.{css,map}')
    .pipe(cleanCSS())
    .pipe(cleanDir('./public/css'))
    .pipe(dest('./public/css'));
}

function buildJS() {
  return src(path.js)
    .pipe(sourcemaps.init())
    .pipe(changed('./public/js'))
    .pipe(terser())
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(cleanDir('./public/js'))
    .pipe(dest('./public/js'))
    .pipe(browserSync.stream());
}

function copyImages() {
  return src(path.images)
    .pipe(newer('./public/images'))
    .pipe(imagemin())
    .pipe(cleanDir('./public/images'))
    .pipe(dest('./public/images'));
}

function copyHTML() {
  return src(path.html).pipe(dest('./public'));
}

function serve() {
  browserSync.init({
    server: './public',
    //proxy: 'localhost:3000',
  });

  watch(path.scss, series(buildCSS, copyCSS));
  watch(path.js, buildJS);
  watch(path.images, copyImages);
  watch(path.html, copyHTML).on('change', browserSync.reload);
}

exports.default = serve;
