/*
    Karma configuration. Generated from marketplace-gulp/templates.
*/
var mktConfig = require('./config');

module.exports = function(config) {
    config.set({
        // Base path that will be used to resolve all patterns.
        basePath: '',

        // Frameworks to use
        // Available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        // Include requirejs first or else chai complains.
        frameworks: ['requirejs', 'chai', 'mocha', 'sinon'],

        // List of files / patterns to load in the browser.
        files: [
            'test-main.js',
            {pattern: 'bower_components/marketplace-core-modules/core/**/*.js',
             included: false},
            {pattern: 'bower_components/squire/src/Squire.js',
             included: false},
            {pattern: 'src/media/js/**/*.js', included: false},
            {pattern: 'src/templates.js', included: false},
            {pattern: 'tests/unit/*.js', included: false},
        ],

        // List of files to exclude.
        exclude: [
            'src/media/js/lib/marketplace-core-modules/**/*',
        ],

        // Preprocess matching files before serving them to the browser.
        // Available PPs: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
        },

        // Test results reporter to use.
        // Available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha'],

        // Web server port.
        port: mktConfig.PORT ? mktConfig.PORT + 2000 : 9876,

        // Enable / disable colors in the output (reporters and logs).
        colors: true,


        // Level of logging (config.LOG_DISABLE, config.LOG_ERROR,
        //                   config.LOG_WARN || config.LOG_INFO ||
        //                   config.LOG_DEBUG).
        logLevel: config.LOG_INFO,


        // File-watching and executing tests when a file changes.
        autoWatch: true,


        // Start these browsers.
        // Available browsers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Firefox'],

        // Continuous Integration mode. If true, Karma captures browsers,
        // runs tests and exits.
        singleRun: false
    });
};
