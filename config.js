/* Configures component and module upgrade paths. */
var config = require('commonplace').config;
var extend = require('node.extend');

var LIB_DEST_PATH = config.LIB_DEST_PATH;

var localConfig = extend(true, {
    bowerConfig: {
        // Bower configuration for which files to get, and where to put them.
        // [Source, excluding bower_components]: [Destination].
        // 'isotope/dist/isotope.pkgd.js': config.LIB_DEST_PATH,
    },
    cssBundles: {
        // Arbitrary CSS bundles to create.
        // The key is the bundle name, which'll be excluded from the CSS build.
        // 'splash.css': ['splash.styl.css']
    },
    cssExcludes: [
        // List of CSS filenames to exclude from CSS build.
        // splash.styl.css
    ],
    requireConfig: {
        // RequireJS configuration for development, notably files in lib/.
        // [Module name]: [Module path].
        paths: {
            // 'isotope': 'lib/isotope.pkgd',
        },
        shim: {
            // 'underscore': { 'exports': '_' }
        }
    },
    PORT: 8676
}, config);

localConfig.inlineRequireConfig = config.makeInlineRequireConfig(
    localConfig.requireConfig);

module.exports = localConfig;
