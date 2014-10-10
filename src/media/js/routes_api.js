define('routes_api', [], function() {
	return {
        'fxa-login': '/api/v2/account/fxa-login/',
        'login': '/api/v2/account/login/',
        'logout': '/api/v2/account/logout/',
        'site-config': '/api/v2/services/config/site/?serializer=commonplace',

        'app': '/api/v2/apps/app/{0}/',

        'threads': '/api/v1/comm/thread/',
        'thread': '/api/v1/comm/thread/{0}/',
        'subscribe': '/api/v1/comm/thread/subscribe/{0}/',
        'notes': '/api/v1/comm/thread/{0}/note/',
        'note': '/api/v1/comm/thread/{0}/note/{1}/',
        'attachments': '/api/v1/comm/note/{0}/attachment/',
        'attachment': '/api/v1/comm/note/{0}/attachment/{1}',
    };
});
