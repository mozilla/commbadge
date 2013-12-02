define('routes_api', [], function() {

    // List API routes here.
    // E.g.:
    // {
    //     "route": "/foo/bar/{0}",
    //     "another_route": "/foo/bar/{0}/asdf"
    // }
	return {
        'login': '/api/v1/account/login/',
        'permissions': '/api/v1/account/permissions/mine/',
        'threads': '/api/v1/comm/thread/',
        'thread': '/api/v1/comm/thread/{0}/',
        'notes': '/api/v1/comm/thread/{0}/note/',
        'note': '/api/v1/comm/thread/{0}/note/{1}/'

    };
});
