/* global require, Buffer */
/*jshint eqnull: true*/

'use strict';

var gulp = require('gulp');
var del = require('del');
var derequire = require('gulp-derequire');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var tap = require('gulp-tap');
var header = require('gulp-header');
var concat = require('gulp-concat');
var less = require('gulp-less');
var cleancss = require("gulp-minify-css");
var jasmine = require('gulp-jasmine');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');
var path = require('path');
var gutil = require('gulp-util');

var pkg = require('./package.json');
var year = new Date().getFullYear();
var years = '2014' + (year > 2014 ? '-' + year : '');
var banner =
    '/**\n' +
    ' * <%= pkg.name %> v<%= pkg.version %>, <%= pkg.description %>.\n' +
    ' *\n' +
    ' * Copyright (c) <%= years %> <%= pkg.author %>.\n' +
    ' *\n' +
    ' * @version v<%= pkg.version %>\n' +
    ' * @link <%= pkg.homepage %>\n' +
    ' * @license <%= pkg.license %>\n' +
    ' */\n\n';

var namelatest = 'orb';
var distlatest = './dist/';
var demoPath = './demo';

function parseLessVars(obj, ret, prefix) {
    prefix = prefix || '';
    for (var prop in obj) {
        if (typeof obj[prop] === 'object') {
            ret = parseLessVars(obj[prop], ret, prefix + prop + '-');
        } else {
            if (obj[prop]) {
                ret += '@' + prefix + prop + ': ' + obj[prop] + ';\n';
            }
        }
    }
    return ret;
}

gulp.task('clean', function (cb) {
    del([
        distlatest + '*.js',
        distlatest + '*.css',
        distlatest + '*.map'
    ], {force: true}, cb);
});

var customless = require('./src/css/parselessvars');

gulp.task('less', ['clean'], function () {
    return gulp.src(['./src/css/orb.css', './src/css/orb.bootstrap.less'])
        .pipe(concat('orb.less'))
        // remove comments
        .pipe(replace(/\/\*[\s\S]+?\*\//gm, ''))
        // prepend less variables
        .pipe(less())
        .pipe(tap(function (file) {
            file.contents = Buffer.concat([
                file.contents,
                new Buffer(customless(require('fs').readFileSync('./src/css/orb.theme.less', 'utf8'), require('./src/css/theme.default.json')))
            ]);
        }))
        // group classes
        .pipe(cleancss({keepBreaks: true}))
        // add banner
        .pipe(header(banner, {pkg: pkg, years: years}))

        // to latest folder
        .pipe(rename(namelatest + '.css'))
        .pipe(gulp.dest(distlatest))

        // minify
        .pipe(cleancss())

        // to latest folder
        .pipe(rename(namelatest + '.min.css'))
        .pipe(gulp.dest(distlatest));

});

gulp.task('webpack:build', function (cb) {
    var config = Object.create(webpackConfig);
    config.output.path = distlatest;
    config.output.filename = "orb.js";
    config.output.libraryTarget = 'var';
    config.devtool = "source-map";
    config.plugins = [
        new webpack.optimize.UglifyJsPlugin()
    ];
    function webpackCb(err, stats) {
        if (err) throw new gutil.PluginError("webpack:build", err);
        // Write stats to build log
        gutil.log("[webpack:build]", stats.toString({
            colors: true
        }));
        cb();
    }

    webpack(config, webpackCb);
});

gulp.task('webpack:build-demo', ['webpack:build'], function(cb) {
    var config = Object.create(webpackConfig);
    config.output.path = path.join(demoPath, 'js');
    config.output.filename = "demo.js";
    delete config.output.libraryTarget;
    config.entry = './src/js/entry/demo.js';
    config.devtool = "source-map";
    function webpackCb(err, stats) {
        if (err) throw new gutil.PluginError("webpack:build", err);
        // Write stats to build log
        gutil.log("[webpack:build]", stats.toString({
            colors: true
        }));
        cb();
    }

    webpack(config, webpackCb);
});

gulp.task('test', ['webpack:build'], function () {
    return gulp.src('test/spec/orb.query.js')
        .pipe(jasmine({
            verbose: true
        }));
});

gulp.task('default', ['test', 'webpack:build-demo']);