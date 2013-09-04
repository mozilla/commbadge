(function() {

// Please leave quotes around keys! They're needed for Space Heater.
var routes = window.routes = [
    {'pattern': '^/tests$', 'view_name': 'tests'},
    {'pattern': '^/debug$', 'view_name': 'debug'},
    {'pattern': '^/login$', 'view_name': 'login'},

    {'pattern': '^/comm$', 'view_name': 'comm'},
    {'pattern': '^/comm/$', 'view_name': 'comm'},
    {'pattern': '^/comm/thread/([^/<>"\']+)$', 'view_name': 'show_thread'}
];

define(
    'routes',
    routes.map(function(i) {return 'views/' + i.view_name;}),
    function() {
        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            var view = require('views/' + route.view_name);
            route.view = view;
        }
        return routes;
    }
);

})();
