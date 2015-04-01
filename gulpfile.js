/*
    The common Marketplace gulpfiles reside in mozilla/marketplace-gulp.
*/
var gulp = require('gulp');
var config = require('./config');
var marketplaceGulp = require('marketplace-gulp')(config);
gulp.tasks = marketplaceGulp.gulp.tasks;
