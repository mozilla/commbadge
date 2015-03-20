/*
    Contains things to initialize before we kick off the app.
    Exposes a promise that the `main` module should wait on.
*/
define('init',
    ['core/init', 'routes', 'settings_app', 'templates'],
    function(init, routes, settingsApp, templates) {

    return init.ready;
});
