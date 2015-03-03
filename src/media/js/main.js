console.log('Marketplace Communication Dashboard');

(function() {
    define('main',
    [
        'underscore',
        'helpers',  // Must come before mostly everything else.
        'capabilities',
        'forms',
        'l10n',
        'log',
        'login',
        'navigation',
        'templates',
        //'tracking',
        'user',
        'views',
        'z',
        'header'
    ], function(_) {
        var capabilities = require('capabilities');
        var log = require('log');
        var nunjucks = require('templates');
        var urls = require('urls');
        var user = require('user');
        var z = require('z');

        var console = log('main');
        console.log('Dependencies resolved, starting init');

        // Nunjucks helpers.
        nunjucks.env.dev = true;
        var nunjucks_globals = require('nunjucks').require('globals');
        nunjucks_globals.gravatar = function(gravatar_hash, size) {
            return ('https://secure.gravatar.com/avatar/' + gravatar_hash + '?s=' +
                    (size || 36));
        };

        var settings = require('settings');
        nunjucks_globals.note_action = function(note_type) {
            return settings.note_types[note_type];
        };

        z.body.addClass('html-' + require('l10n').getDirection());

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
                nunjucks.env.render('header.html', context));
            $('#site-footer').html(
                nunjucks.env.render('footer.html', context));

            // Navigate to the hash if necessary.
            var hash = window.location.hash;
            if (hash.indexOf('show-read') !== -1 || hash.indexOf('show-unread') !== -1) {
                $('.notes-filter[href="' + hash + '"]').trigger('click');
            }

            z.body.toggleClass('logged-in', user.logged_in());
            z.page.trigger('reloaded_chrome');
        }).trigger('reload_chrome');

        z.page.on('logged_in', function() {
            z.page.trigger('navigate', [urls.reverse('comm')]);
        });

        z.page.on('logged_out', function() {
            z.page.trigger('navigate', [urls.reverse('login')]);
        });

        z.body.on('click', '.site-header .back', function(e) {
            e.preventDefault();
            console.log('← button pressed');
            require('navigation').back();
        });

        // Perform initial navigation.
        console.log('Triggering initial navigation');
        if (!user.logged_in() && window.location.pathname != urls.reverse('fxa_authorize')) {
            z.page.trigger('navigate', [urls.reverse('login')]);
        } else if (!z.spaceheater) {
            z.page.trigger('navigate', [window.location.pathname +
                                        window.location.search +
                                        window.location.hash]);
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
