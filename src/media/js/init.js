/*
    Contains things to initialize before we kick off the app.
    Exposes a promise that the `main` module should wait on.
*/
define('init',
    ['core/init', 'helpers_local', 'routes', 'settings_app', 'templates'],
    function(init, helpersLocal, routes, settingsApp, templates) {

    return init.ready;
});
