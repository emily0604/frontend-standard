'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var gutil   = require('gulp-util');
var $ = require('gulp-load-plugins')();

var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var del = require('del');
var fs = require('fs');
var pug = require('pug');

var errorHandler = function(){
  return gplumber(function(error){
    var msg = error.codeFrame.replace(/\n/g, '\n    ');

    gutil.log('|- ' + gutil.colors.bgRed.bold('Build Error in ' + error.plugin));
    gutil.log('|- ' + gutil.colors.bgRed.bold(error.message));
    gutil.log('|- ' + gutil.colors.bgRed('>>>'));
    gutil.log('|\n    ' + msg + '\n           |');
    gutil.log('|- ' + gutil.colors.bgRed('<<<'));
  });
};

var
  source = 'source/',
  dest = 'dest/';
/**
 * Filter block:
 * Allow add filter
 *
 */
pug.filters.code = function( block ) {
  return block
    .replace( /&/g, '&amp;' )
    .replace( /</g, '&lt;' )
    .replace( />/g, '&gt;' )
    .replace( /"/g, '&quot;' );
}

var options = {
  del: [
    'dest'
  ],
  browserSync: {
    server: {
      baseDir: dest
    }
  },
  htmlPrettify: {
    'indent_size': 2,
    'unformatted': ['pre', 'code'],
    'indent_with_tabs': false,
    'preserve_newlines': true,
    'brace_style': 'expand',
    'end_with_newline': true
  },
  include: {
    hardFail: true,
    includePaths: [
      __dirname + "/",
      __dirname + "/node_modules",
      __dirname + "/source/js"
    ]
  },
  pug: {
    pug: pug,
    pretty: '\t'
  },
}

var scss = {
  sassOpts: {
    outputStyle: 'nested',
    precison: 3,
    errLogToConsole: true,
    includePaths: [
      './node_modules/bootstrap-sass/assets/stylesheets',
      './node_modules/font-awesome/scss/',
      './node_modules/owl.carousel/src/scss',
    ]
  }
};


// fonts
var fonts = {
  in: [
    source + 'fonts/*.*',
    './node_modules/bootstrap-sass/assets/fonts/**/*.*',
    './node_modules/font-awesome/fonts/*', source + 'fonts-2/**/*'
  ],
  out: dest + 'fonts/'
};

// js
var js = {
  in: [
    source + 'js/*.*',
    './node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js'
  ],
  out: dest + 'js/'
};




/**
 * Tasks
 * Allow add filter
 *
 */
gulp.task('browser-sync', function() {
  return browserSync.init(options.browserSync);
});

gulp.task('watch', function (cb) {
  $.watch(source + '/sass/**/*.scss', function () {
    gulp.start('compile-styles');
  });
  $.watch(source + '/images/**/*', function () {
    gulp.start('compile-images');
    gulp.start('build-images-name');
  });

  $.watch([
    source + '/*.html',
    source + '/**/*.html'
    ], function () {
    return runSequence('compile-html', browserSync.reload);
  })

  $.watch([
    source + '/*.pug',
    source + '/**/*.pug'
  ], function () {
    return runSequence('compile-pug', browserSync.reload);
  })

  $.watch(source + '/**/*.js', function () {
    return runSequence('compile-js', browserSync.reload);
  })

  $.watch(source + '/modules/*/data/*.json', function () {
    return runSequence('build-html', browserSync.reload);
  })

})

// copy js
gulp.task('js', function () {
  return gulp
    .src(js.in)
    .pipe(gulp.dest(js.out));
});

// copy font
gulp.task('fonts', function () {
  return gulp
    .src(fonts.in)
    .pipe(gulp.dest(fonts.out));
});

// = Delete
gulp.task('cleanup', function (cb) {
  return del(options.del, cb);
});


// = Build Style
gulp.task('compile-styles',['fonts'], function (cb) {
  return gulp.src([
    source + '/sass/*.scss',
    '!'+ source +'/sass/_*.scss'
  ])
  .pipe($.sourcemaps.init())
  .pipe($.sass(scss.sassOpts)
    .on('error', $.sass.logError))
  .pipe($.autoprefixer('last 2 versions'))
  .pipe($.sourcemaps.write('./', {
    includeContent: false,
    sourceRoot: source + '/sass'
  }))
  .pipe(gulp.dest(dest + '/css'))
  .pipe(browserSync.stream());
})

// = Build HTML
gulp.task('compile-html', function (cb) {
  return gulp.src(['*.html', '!_*.html'], {cwd: 'source'})
  .pipe($.prettify(options.htmlPrettify))
  .pipe(gulp.dest(dest));

})

// = Build Pug
gulp.task('compile-pug', function (cb) {

  var jsonData = JSON.parse(fs.readFileSync('./tmp/data.json'));
  options.pug.locals = jsonData;

  return gulp.src(['*.pug', '!_*.pug'], {cwd: 'source'})
    .pipe(plumber(function(error){
        console.log("Error happend!", error.message);
        this.emit('end');
    }))
    .pipe($.changed('dest', {extension: '.html'}))
    .pipe($.pugInheritance({
      basedir: "source",
      skip: ['node_modules']
    }))
    .pipe($.pug(options.pug))
    .on('error', function (error) {
      console.error('' + error);
      this.emit('end');
    })
    .pipe($.prettify(options.htmlPrettify))
    .pipe(plumber.stop())
    .pipe(gulp.dest(dest));

})

gulp.task('build-html', function (cb) {
  return runSequence(
    'combine-data',
    'compile-pug',
    'compile-html',
    cb
  );
});


// = Build JS

gulp.task('compile-js', function() {
  return gulp.src(["*.js", "!_*.js"], {cwd: 'source/js'})
  .pipe($.include(options.include))
  .pipe(gulp.dest(dest + '/js'));
});


// = Build image
gulp.task('compile-images', function() {
  return gulp.src(source + "/images/*.*")
  .pipe(gulp.dest(dest + '/images'));
});

// = Build images name in json file
gulp.task('build-images-name', function () {
  return gulp.src(source + '/images/**/*')
    .pipe(require('gulp-filelist')('filelist.json'))
    .pipe(gulp.dest(dest));
});

// = Build DataJson
gulp.task('combine-modules-json', function (cb) {
  return gulp.src(['**/*.json', '!**/_*.json'], {cwd: 'source/modules/*/data'})
    .pipe($.mergeJson('data-json.json'))
    .pipe(gulp.dest('tmp/data'));
});

gulp.task('combine-modules-data', function (cb) {
  return gulp.src('**/*.json', {cwd: 'tmp/data'})
    .pipe($.mergeJson('data.json'))
    .pipe(gulp.dest('tmp'));
});

// Service tasks
gulp.task('combine-data', function (cb) {
  return runSequence(
    [
      'combine-modules-json'
    ],
    'combine-modules-data',
    cb
  );
});

// ================ Develop

gulp.task('dev', function (cb) {
  return runSequence(
    'build',
    [
      'browser-sync',
      'build-images-name',
      'watch'
    ],
    cb
    )
})

// ================ Build
gulp.task('build', function (cb) {
  return runSequence(
    'cleanup',
    'compile-images',
    'compile-styles',
    'compile-js',
    'build-html',
    cb
    );
});
