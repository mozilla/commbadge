(function() {
var a = require('assert');
var assert = a.assert;
var eq_ = a.eq_;
var contains = a.contains;
var disincludes = a.disincludes;
var mock = a.mock;

var urls = require('urls');

function mock_routes(routes, runner, fail) {
    var temp = window.routes;
    window.routes = routes;
    try {
        runner();
    } catch(e) {
        fail(e);
    }
    window.routes = temp;
}

test('reverse', function(done, fail) {
    mock_routes([
        {pattern: '^/$', view_name: 'homepage'},
        {pattern: '^/app/(.+)$', view_name: 'app'}
    ], function() {
        var reverse = urls.reverse;
        eq_(reverse('homepage'), '/');
        eq_(reverse('app', ['slug']), '/app/slug');
        done();
    }, fail);
});

test('reverse missing args', function(done, fail) {
    mock_routes([
        {pattern: '^/$', view_name: 'homepage'},
        {pattern: '^/app/(.+)$', view_name: 'app'}
    ], function() {
        var reverse = urls.reverse;
        try {
            reverse('app', []);
        } catch(e) {
            return done();
        }
        fail('reverse() did not throw exception');
    }, fail);
});

test('reverse too many args', function(done, fail) {
    mock_routes([
        {pattern: '^/$', view_name: 'homepage'},
        {pattern: '^/app/(.+)$', view_name: 'app'}
    ], function() {
        var reverse = urls.reverse;
        try {
            reverse('app', ['foo', 'bar']);
        } catch(e) {
            return done();
        }
        fail('reverse() did not throw exception');
    }, fail);
});

test('reverse multiple args', function(done, fail) {
    mock_routes([
        {pattern: '^/apps/([0-9]+)/reviews/([0-9]+)$', view_name: 'two_args'},
    ], function() {
        var reversed = urls.reverse('two_args', [10, 20]);
        eq_('/apps/10/reviews/20', reversed);
        done();
    }, fail);
});

test('api url', function(done, fail) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: function() { return false; }, touch: 'foo'},
            routes_api: {'homepage': '/foo/homepage'},
            routes_api_args: function() {return function() {return function() {return {foo: 'bar'};};};},  // Functions get pre-evaluated.
            settings: {api_url: 'api:'}
        }, function(urls) {
            var homepage_url = urls.api.url('homepage');
            eq_(homepage_url.substr(0, 17), 'api:/foo/homepage');
            contains(homepage_url, 'foo=bar');
            done();
        },
        fail
    );
});

test('api url signage', function(done, fail) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: function() { return false; }, touch: 'foo'},
            routes_api: {'homepage': '/foo/homepage'},
            routes_api_args: function() {return function() {return function() {return {foo: 'bar'};};};},  // Functions get pre-evaluated.
            settings: {api_url: 'api:'},
            user: {
                logged_in: function() { return true; },
                get_setting: function(x) {},
                get_token: function() { return 'mytoken';}
            }
        }, function(urls) {
            var homepage_url, homepage_base_url = urls.api.base.url('homepage');

            homepage_url = homepage_base_url;
            eq_(homepage_url, 'api:/foo/homepage');

            homepage_url = urls.api.url('homepage');
            eq_(homepage_url, urls.api.sign(homepage_base_url));
            contains(homepage_url, '_user=mytoken');

            homepage_url = urls.api.unsigned.url('homepage');
            eq_(homepage_url, urls.api.unsign(homepage_base_url));
            disincludes(homepage_url, '_user=mytoken');
            done();
        },
        fail
    );
});

test('api url blacklist', function(done, fail) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: function() { return false; }, touch: 'foo'},
            routes_api: {'homepage': '/foo/homepage'},
            settings: {api_url: 'api:', api_param_blacklist: ['region']}
        }, function(urls) {
            var homepage_url = urls.api.url('homepage');
            eq_(homepage_url.substr(0, 17), 'api:/foo/homepage');
            disincludes(homepage_url, 'region=');
            done();
        },
        fail
    );
});

test('api url params', function(done, fail) {
    mock(
        'urls',
        {
            routes_api: {'homepage': '/foo/asdf'},
            settings: {api_url: 'api:'}
        }, function(urls) {
            var homepage_url = urls.api.params('homepage', {q: 'poop'});
            eq_(homepage_url.substr(0, 13), 'api:/foo/asdf');
            contains(homepage_url, 'q=poop');
            done();
        },
        fail
    );
});

})();
