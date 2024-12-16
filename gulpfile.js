import browserSync from "browser-sync";
import gulp from "gulp";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import concat from "gulp-concat";
import htmlmin from "gulp-htmlmin";
import gulpSass from "gulp-sass";
import sourcemaps from "gulp-sourcemaps";
import uglify from "gulp-uglify";
import * as dartSass from "sass";
import yargs from "yargs";

const sass = gulpSass(dartSass);

const argv = yargs(process.argv.slice(2)).argv;
const isProduction = argv.production;
const isDev = !isProduction;

const paths = {
  html: "./src/**/*.html",
  scss: "./src/styles/*.scss",
  js: "./src/scripts/**/*.js",
  assets: "./src/assets/**/*",
};

function html() {
  return gulp
    .src(paths.html)
    .pipe(
      isProduction
        ? htmlmin({ collapseWhitespace: true })
        : gulp.dest("./dist"),
    )
    .pipe(gulp.dest("./dist"));
}

function styles() {
  return gulp
    .src(paths.scss)
    .pipe(isDev ? sourcemaps.init() : gulp.dest("./dist/styles"))
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(isDev ? sourcemaps.write(".") : gulp.dest("./dist/styles"))
    .pipe(gulp.dest("./dist/styles"));
}

function scripts() {
  return gulp
    .src(paths.js)
    .pipe(concat("main.js"))
    .pipe(isProduction ? uglify() : gulp.dest("./dist/scripts"))
    .pipe(gulp.dest("./dist/scripts"));
}

function assets() {
  return gulp
    .src(paths.assets, { encoding: false })
    .pipe(gulp.dest("./dist/assets"));
}

function fonts() {
  return gulp.src("./src/fonts/**/*").pipe(gulp.dest("./dist/fonts"));
}

function watchFiles() {
  if (isDev) {
    browserSync.init({
      server: {
        baseDir: "./dist",
      },
      notify: false,
      open: false,
      ui: false,
    });
    gulp.watch(paths.html, html).on("change", browserSync.reload);
    gulp.watch(paths.scss, styles);
    gulp.watch(paths.js, scripts).on("change", browserSync.reload);
    gulp.watch(paths.assets, assets).on("change", browserSync.reload);
  }
}

const dev = gulp.series(
  gulp.parallel(html, styles, scripts, assets, fonts),
  watchFiles,
);

const build = gulp.series(gulp.parallel(html, styles, scripts, assets, fonts));

export { build, dev };
export default isProduction ? build : dev;
