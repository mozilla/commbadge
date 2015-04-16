define('routes',
    ['core/router'],
    function(router) {
    var root = '^/comm/';

    router.addRoutes([
        {'pattern': root + '?$', 'view_name': 'comm'},
        {'pattern': root + 'app/([^/<>"\']+)$', 'view_name': 'app_dashboard'},
        {'pattern': '^/fxa-authorize$', 'view_name': 'core/fxa_authorize'},
        {'pattern': root + 'login$', 'view_name': 'login'},
        {'pattern': root + 'thread/(\\d+)$', 'view_name': 'show_thread'}
    ]);

	router.api.addRoutes({
        'app': '/api/v2/apps/app/{0}/',
        'threads': '/api/v1/comm/thread/',
        'thread': '/api/v1/comm/thread/{0}/',
        'subscribe': '/api/v1/comm/thread/subscribe/{0}/',
        'notes': '/api/v1/comm/thread/{0}/note/',
        'note': '/api/v1/comm/thread/{0}/note/{1}/',
        'attachments': '/api/v1/comm/note/{0}/attachment/',
        'attachment': '/api/v1/comm/note/{0}/attachment/{1}',
    });
});
