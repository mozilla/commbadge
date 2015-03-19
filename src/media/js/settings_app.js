define('settings_app',
    ['core/l10n', 'core/settings', 'settings_local'],
    function(l10n, settings, settingsLocal) {
    var gettext = l10n.gettext;

    settings._extend({
        api_url: 'http://' + window.location.hostname,

        param_whitelist: ['q', 'sort'],

        model_prototypes: {},

        fragment_error_template: 'errors/fragment.html',
        pagination_error_template: 'errors/pagination.html',

        title_suffix: 'Marketplace Communication Dashboard',

        NOTE_TYPE_NO_ACTION: 0,
        NOTE_TYPE_DEVELOPER_COMMENT: 14,
        NOTE_TYPE_REVIEWER_COMMENT: 28,

        // Must be in order as in mkt/constants/comm.py.
        note_types: [
            {'msg': gettext('Message'), 'class': 'gray'}, // 0
            {'msg': gettext('App approved'), 'class': 'green'},
            {'msg': gettext('App rejected'), 'class': 'red'},
            {'msg': gettext('App banned'), 'class': 'red'},
            {'msg': gettext('Reviewer comment'), 'class': 'gray'},
            {'msg': gettext('Escalated to senior reviewer'), 'class': 'orange'}, // 5
            {'msg': gettext('Private reviewer comment'), 'class': 'gray'},
            {'msg': gettext('App resubmission'), 'class': 'green'},
            {'msg': gettext('Approved but waiting to be made public'), 'class': 'green'},
            {'msg': gettext('Escalated due to high abuse reports'), 'class': 'orange'},
            {'msg': gettext('Escalated due to high refund requests'), 'class': 'orange'}, // 10
            {'msg': gettext('Escalation cleared'), 'class': 'green'},
            {'msg': gettext('Re-review cleared'), 'class': 'green'},
            {'msg': gettext('App submission note'), 'class': 'gray'},
            {'msg': gettext('Developer comment'), 'class': 'gray'},
            {'msg': gettext('Device(s) changed by reviewer'), 'class': 'gray'}, // 15
            {'msg': gettext('Feature(s) changed by reviewer'), 'class': 'gray'},
            {'msg': gettext('Review manifest change'), 'class': 'gray'},
            {'msg': gettext('Review manifest url change'), 'class': 'gray'},
            {'msg': gettext('Review manifest premium type upgrade'), 'class': 'gray'},
            {'msg': gettext('Re-review devices added'), 'class': 'gray'},  // 20
            {'msg': gettext('Re-review features changed'), 'class': 'gray'},
            {'msg': gettext('Escalation due to VIP App'), 'class': 'orange'},
            {'msg': gettext('Escalation due to prerelease App'), 'class': 'orange'},
            {'msg': gettext('Priority review requested'), 'class': 'orange'},  // 25
            {'msg': gettext('Tarako review passed'), 'class': 'green'},
            {'msg': gettext('Tarako review failed'), 'class': 'red'},
            {'msg': gettext('Version notes for reviewer'), 'class': 'gray'},
            {'msg': gettext('Public reviewer comment'), 'class': 'gray'},
            {'msg': gettext('Re-review content rating adult'), 'class': 'gray'}
        ],
    });

    settings._extend(settingsLocal);
});
