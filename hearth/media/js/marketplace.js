// Do this last- initialize the marketplace!
console.log('Starting commbadge...');

require.config({
    enforceDefine: true,
    paths: {
        'jquery': 'lib/jquery-2.0.2',
        'underscore': 'lib/underscore',
        'nunjucks': 'lib/nunjucks',
        'nunjucks.compat': 'lib/nunjucks.compat',
        'templates': '../../templates',
        'settings': ['settings_local', 'settings'],
        'format': 'lib/format'
    },
    shim: {
        'jquery': {exports: 'jQuery'},
        'underscore': {exports: '_'}
    }
});

(function() {

    define(
        'marketplace',
        [
            'underscore',
            'helpers',  // Must come before mostly everything else.
            'capabilities',
            'forms',
            'header',
            'l10n',
            'log',
            'login',
            'navigation',
            'outgoing_links',
            'overlay',
            'settings',
            'storage',
            'templates',
            'tracking',
            'user',
            'z'
        ],
    function(_) {
        var console = require('log')('mkt');
        console.log('Dependencies resolved, starting init');

        var capabilities = require('capabilities');
        var nunjucks = require('templates');
        var settings = require('settings');
        var z = require('z');

        nunjucks.env.dev = true;

        z.body.addClass('html-' + require('l10n').getDirection());
        if (settings.body_classes) {
            z.body.addClass(settings.body_classes);
        }

        z.page.one('loaded', function() {
            console.log('Hiding splash screen');
            $('#splash-overlay').addClass('hide');
        });

        // This lets you refresh within the app by holding down command + R.
        if (capabilities.chromeless) {
            window.addEventListener('keydown', function(e) {
                if (e.keyCode == 82 && e.metaKey) {
                    window.location.reload();
                }
            });
        }

        // Do some last minute template compilation.
        z.page.on('reload_chrome', function() {
            console.log('Reloading chrome');
            var context = {z: z};
            $('#site-header').html(
                nunjucks.env.getTemplate('header.html').render(context));
            $('#site-footer').html(
                nunjucks.env.getTemplate('footer.html').render(context));

            z.body.toggleClass('logged-in', require('user').logged_in());
            z.page.trigger('reloaded_chrome');
        }).trigger('reload_chrome');

        window.addEventListener(
            'resize',
            _.debounce(function() {z.doc.trigger('saferesize');}, 200),
            false
        );

        // Perform initial navigation.
        console.log('Triggering initial navigation');
        if (!z.spaceheater) {
            z.page.trigger('navigate', [window.location.pathname + window.location.search]);
        } else {
            z.page.trigger('loaded');
        }

        // Debug page
        (function() {
            var to = false;
            z.doc.on('touchstart mousedown', '.wordmark', function(e) {
                console.log('hold for debug...', e.type);
                clearTimeout(to);
                to = setTimeout(function() {
                    console.log('navigating to debug...');
                    z.page.trigger('navigate', ['/debug']);
                }, 3000);
            }).on('touchend mouseup', '.wordmark', function(e) {
                console.log('debug hold released...', e.type);
                clearTimeout(to);
            });
        })();

        console.log('Initialization complete');
    });

})();
