(function() {

// Please leave quotes around keys! They're needed for Space Heater.
var routes = window.routes = [
    {'pattern': '^/comm/?$', 'view_name': 'comm'},
    {'pattern': '^/comm/app/([^/<>"\']+)$', 'view_name': 'app_dashboard'},
    {'pattern': '^/comm/login$', 'view_name': 'login'},
    {'pattern': '^/comm/thread/(\\d+)$', 'view_name': 'show_thread'}
];

define('routes', [
    'views/app_dashboard',
    'views/comm',
    'views/login',
    'views/show_thread'
], function() {
    for (var i = 0; i < routes.length; i++) {
        var route = routes[i];
        var view = require('views/' + route.view_name);
        route.view = view;
    }
    return routes;
});

})();
