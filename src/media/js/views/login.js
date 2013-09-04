define('views/login', ['l10n', 'user', 'urls', 'z'], function(l10n, user, urls, z) {
    var gettext = l10n.gettext;

    return function(builder) {
        if (user.logged_in()) {
            z.page.trigger('navigate', [urls.reverse('comm')]);
        } else {
            builder.start('login.html');
            builder.z('type', 'leaf');
            builder.z('title', gettext('Sign in'));
        }
    };
});
