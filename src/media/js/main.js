console.log('Marketplace Communication Dashboard');

define('main', ['init'], function(init) {
init.done(function() {
require(
    [// Modules actually used in main.
     'core/l10n', 'core/log', 'core/login', 'core/navigation',
     'core/nunjucks', 'core/settings', 'core/urls', 'core/user', 'core/z',
     // Modules we require to initialize global stuff.
     'core/forms', 'header', 'helpers_local'],
    function(l10n, log, login, navigation,
             nunjucks, settings, urls, user, z) {
    var logger = log('main');

    // Nunjucks helpers.
    nunjucks.env.dev = true;
    var nunjucks_globals = nunjucks.require('globals');
    nunjucks_globals.gravatar = function(gravatar_hash, size) {
        return ('https://secure.gravatar.com/avatar/' + gravatar_hash + '?s=' +
                (size || 36));
    };

    nunjucks_globals.note_action = function(note_type) {
        return settings.note_types[note_type];
    };

    z.body.addClass('html-' + l10n.getDirection());

    z.page.one('loaded', function() {
        $('#splash-overlay').addClass('hide');
    });

    // Do some last minute template compilation.
    z.page.on('reload_chrome', function() {
        logger.log('Reloading chrome');
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
        navigation.back();
    });

    // Perform initial navigation.
    if (!user.logged_in() &&
        window.location.pathname != urls.reverse('fxa_authorize')) {
        z.page.trigger('navigate', [urls.reverse('login')]);
    } else if (!z.spaceheater) {
        z.page.trigger('navigate', [window.location.pathname +
                                    window.location.search +
                                    window.location.hash]);
    } else {
        z.page.trigger('loaded');
    }
});
});
});
