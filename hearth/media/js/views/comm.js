define('views/comm',
    ['l10n', 'z', 'urls', 'requests', 'nunjucks', 'notification'],
    function(l10n, z, urls, requests, nunjucks, notification) {
    'use strict';

    var gettext = l10n.gettext;
    var ngettext = l10n.ngettext;

    var postNote = function($text_elem) {
        var thread_id = $text_elem.data('thread-id');
        var data = {
            note_type: 0,
            body: $text_elem.val(),
        };

        requests.post(urls.api.url('notes', [thread_id]), data).done(function(data) {
            var $threadElem = $text_elem.closest('.thread-header');

            // Add a new note element.
            var noteMarkup = nunjucks.env.getTemplate('comm/note_detail.html').render({note: data});
            var $noteCount = $threadElem.find('.note-count');
            var count = $noteCount.data('count') + 1;
            $noteCount.html(ngettext('{n} note', '{n} notes', {n: count}))
                      .data('count', count);
            $threadElem.siblings('.notes-container').prepend(noteMarkup);

            // Close the reply box.
            $threadElem.find('.reply-box').addClass('hidden');
            $threadElem.find('.reply.button.close-reply')
                       .removeClass('close-reply')
                       .addClass('open-reply')
                       .html(gettext('Respond'));

            $text_elem.siblings('button.post').addClass('disabled');
            $text_elem.val('');

        }).fail(function() {
            notification.notification({message: gettext('Message sending failed.')});
            console.warn('Failed while trying to send the message');
        });
    };

    z.page.on('click', '.reply.button.open-reply', function(e) {
        var $this = $(this);
        $(this).parent().siblings('.reply-box').removeClass('hidden');
        $this.removeClass('open-reply')
             .addClass('close-reply')
             .html(gettext('Cancel reply'));

    }).on('click', '.reply.button.close-reply', function(e) {
        var $this = $(this);
        $this.parent().siblings('.reply-box').addClass('hidden');
        $this.removeClass('close-reply')
             .addClass('open-reply')
             .html(gettext('Respond'));

    }).on('keyup', '.reply-text', function(e) {
        var $this = $(this);
        $this.siblings('button.post').toggleClass('disabled', !$this.val().length);

    }).on('click', 'button.post', function(e) {
        postNote($(this).siblings('.reply-text'));
    });

    return function(builder) {
        builder.start('comm/main.html');
    };
});
