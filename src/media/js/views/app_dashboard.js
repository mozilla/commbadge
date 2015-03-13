define('views/app_dashboard',
    ['core/urls'],
    function(urls) {
    'use strict';

    return function(builder, args) {
        builder.start('comm/app_dashboard.html', {
            app_endpoint: urls.api.url('app', [args[0]]),
            app_slug: args[0],
        });
    };
});
