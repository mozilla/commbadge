(function() {

var root = '^/comm/';

// Please leave quotes around keys! They're needed for Space Heater.
var routes = window.routes = [
    {'pattern': root + '?$', 'view_name': 'comm'},
    {'pattern': root + 'app/([^/<>"\']+)$', 'view_name': 'app_dashboard'},
    {'pattern': '^/fxa-authorize$', 'view_name': 'fxa_authorize'},
    {'pattern': root + 'login$', 'view_name': 'login'},
    {'pattern': root + 'thread/(\\d+)$', 'view_name': 'show_thread'}
];

define('routes', [
    'views/app_dashboard',
    'views/comm',
    'views/fxa_authorize',
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
