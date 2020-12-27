let preprocessor = 'less';

const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
concat = require('gulp-concat'),
sass = require('gulp-sass'),
less = require('gulp-less'),
autoprefixer = require('gulp-autoprefixer'),
gcmq = require('gulp-group-css-media-queries'),
smartGrid = require('smart-grid'),
sourcemaps = require('gulp-sourcemaps'),
cleancss = require('gulp-clean-css'),
imagemin = require('gulp-imagemin'),
newer = require('gulp-newer'),
del = require('del'),
webp = require('gulp-webp'),
critical = require('critical');

function browsersync () {
	browserSync.init({
		server: {
			baseDir: 'app/',
			notify: false,
			online: true
		}
	});
}

function scripts () {
	return src([
		'node_modules/jquery/dist/jquery.min.js',
		'app/js/app.js',
	])
	.pipe(concat('app.min.js'))
	.pipe(uglify())
	.pipe(dest('app/js/'))
	.pipe(browserSync.stream());
}

function styles () {
		return src([
		'app/'+ preprocessor +'/main.'+ preprocessor,
	])
	.pipe(sourcemaps.init())
	.pipe(eval(preprocessor)())
	.pipe(concat('app.min.css'))
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
	.pipe(gcmq())
	.pipe(cleancss(( { level: { 1: { specialComments: 0 } }/*, format: 'beautify'*/ } )))
	.pipe(dest('app/css/'))
	.pipe(browserSync.stream());
}

function images () {
	return src('app/img/src/**/*')
	.pipe(newer('app/img/dest/'))
	.pipe(webp())
	.pipe(imagemin())
	.pipe(dest('app/img/dest/'));
}

function startwatch () {
	watch('app/**/' + preprocessor + '/**/*', styles);
	watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
	watch('app/**/*.html').on('change', browserSync.reload);
	watch('app/img/src/**/*', images);
}

function cleanimg () {
	return del('app/img/dest/**/*', {force: true});
}

function cleandist () {
	return del('app/dist/**/*', {force: true});
}

function buildcopy () {
	return src([
		'app/css/**/*.min.css',
		'app/js/**/*.min.js',
		'app/img/dest/**/*',
		'app/**/*.html',
		], { base: 'app'})
	.pipe(dest('dist'));
}

const smartGridConf = {
  outputStyle: preprocessor,
  columns: 10,
  offset: '15px',
  mobileFirst: false,
  container: {
    maxWidth: '1410px',
    fields: '15px'
  },
  breakPoints: {
    slg: {
      width: '2560px',
      fields: '15px'
    },
    lg: {
      width: '1410px',
      fields: '15px'
    },
    smd: {
      width: '1100px',
      fields: '15px'
    },
    md: {
      width: '960px',
      fields: '15px'
    },
    sm: {
      width: '720px',
      fields: '10px'
    },
    xs: {
      width: '321px',
      fields: '5px'
    },
    my: {
      width: '1175px',
      fields: '15px'
    }
  }
}

function grid () {
  smartGrid('app/' + preprocessor, smartGridConf)
}

function criticalgenerate () {
  return critical.generate({
    base: './dist',
    src: 'index.html',
    css: ['css/app.min.css'],
    width: 430,
    height: 600,
    target: {
      css: 'css/critical.css',
      uncritical: 'css/async.css',
    },
    //minify: true,
    //extract: true,
    // Включить класс подвала
    //include: ['.footer'],
    ignore: {
      atrule: ['@font-face'],
    }
  });
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.cleanimg = cleanimg;
exports.grid = grid;
exports.criticalgenerate = criticalgenerate;
exports.build = series(cleandist, styles, scripts, images, buildcopy);

exports.default = parallel(styles, scripts, browsersync, startwatch);