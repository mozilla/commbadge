define('views/show_thread',
    ['core/urls'],
    function(urls) {
    'use strict';

    return function(builder, args) {
        builder.start('comm/show_thread.html', {
            endpoint: urls.api.url('thread', [args[0]]),
        });
    };
});
