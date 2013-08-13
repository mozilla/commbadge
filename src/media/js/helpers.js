define('helpers',
       ['l10n', 'nunjucks', 'underscore', 'utils', 'format', 'settings', 'urls', 'user'],
       function(l10n, nunjucks, _, utils) {

    var SafeString = nunjucks.require('runtime').SafeString;
    var filters = nunjucks.require('filters');

    function make_safe(func) {
        return function() {
            return new SafeString(func.apply(this, arguments));
        };
    }

    function safe_filter(name, func) {
        filters[name] = make_safe(func);
    }

    filters.urlparams = utils.urlparams;
    filters.urlunparam = utils.urlunparam;

    safe_filter('nl2br', function(obj) {
        return obj.replace(/\n/g, '<br>');
    });

    safe_filter('make_data_attrs', function(obj) {
        return _.pairs(obj).map(function(pair) {
            return 'data-' + utils.escape_(pair[0]) + '="' + utils.escape_(pair[1]) + '"';
        }).join(' ');
    });

    safe_filter('external_href', function(obj) {
        return 'href="' + utils.escape_(obj) + '" target="_blank"';
    });

    filters.numberfmt = function(num) {
        if (typeof num === 'number' && num.toLocaleString) {
            return num.toLocaleString();
        }
        return num;
    };

    filters.datetime = function(date) {
        if (!date) {
            return '';
        }
        var orig_date = date;
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        var dateStr = date.toLocaleString();
        if (dateStr === 'Invalid Date') {
            console.warn('Invalid date: ', orig_date);
            return '';
        } else {
            return dateStr;
        }
    };

    safe_filter('stringify', JSON.stringify);

    filters.format = require('format').format;
    filters.sum = function(obj) {
        return obj.reduce(function(mem, num) {return mem + num;}, 0);
    };

    function gravatar(gravatar_hash, size) {
        return 'http://www.gravatar.com/avatar/' + gravatar_hash + '?s=' + (size || 36);
    }

    function note_action(note_type) {
        var note_types = [
            {'name': 'NO_ACTION', 'class': 'post', 'msg': gettext('Message')},
            {'name': 'APPROVAL', 'class': 'approve', 'msg': gettext('App approved')},
            {'name': 'REJECTION', 'class': 'reject', 'msg': gettext('App rejected')},
            {'name': 'DISABLED', 'class': 'disable', 'msg': gettext('App disabled')},
            {'name': 'MORE_INFO_REQUIRED', 'class': 'need-info', 'msg': gettext('More info required')},
            {'name': 'ESCALATION', 'class': 'escalate', 'msg': gettext('Review escalated to senior reviewer')},
            {'name': 'REVIEWER_COMMENT', 'class': 'comment', 'msg': gettext('Reviewer comment')}
        ];

        return note_types[note_type];
    }

    // Functions provided in the default context.
    var helpers = {
        api: require('urls').api.url,
        apiParams: require('urls').api.params,
        url: require('urls').reverse,
        media: require('urls').media,

        _: make_safe(l10n.gettext),
        _plural: make_safe(l10n.ngettext),
        format: require('format').format,
        settings: require('settings'),
        user: require('user'),

        gravatar: gravatar,
        note_action: note_action,

        escape: utils.escape_,
        len: function(x) {return x.length;},
        max: Math.max,
        min: Math.min,
        range: _.range,

        REGIONS: require('settings').REGION_CHOICES_SLUG,

        navigator: window.navigator,
        language: window.navigator.l10n ? window.navigator.l10n.language : 'en-US'
    };

    // Put the helpers into the nunjucks global.
    var globals = nunjucks.require('globals');
    for (var i in helpers) {
        if (helpers.hasOwnProperty(i)) {
            globals[i] = helpers[i];
        }
    }

    return helpers;
});
