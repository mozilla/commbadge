define('views/comm',
    ['l10n', 'z', 'urls', 'requests', 'nunjucks', 'notification', 'storage'],
    function(l10n, z, urls, requests, nunjucks, notification, storage) {
    'use strict';

    var gettext = l10n.gettext;
    var ngettext = l10n.ngettext;

    var postNote = function($text_elem) {
        var $threadItem = $text_elem.closest('.thread-item');
        var threadId = $threadItem.data('thread-id');
        var data = {
            note_type: 0,
            body: $text_elem.val()
        };

        requests.post(urls.api.url('notes', [threadId]), data).done(function(data) {
            var $threadElem = $threadItem.find('.thread-header');

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

    }).on('click', '.notes-filter', function(e) {
        var $this = $(this);
        var $threadItem = $this.closest('.thread-item');
        var threadId = $threadItem.data('thread-id');
        var filterMode = $this.data('filter-mode');
        var params = {ordering: '-created', limit: 5};

        $('.notes-filter').removeClass('selected');
        $this.addClass('selected');
        $threadItem.data('notes-filter', filterMode);
        $threadItem.data('notes-page', 1);

        switch (filterMode) {
            case 'read':
                params.show_read = '1';
                break;
            case 'unread':
                params.show_read = '0';
                break;
        }

        requests.get(urls.api.url('notes', [threadId], params)).done(function(data) {
            var markup = '';
            if (!data.meta.next) {
                $threadItem.data('notes-page', -1);
            }
            if (data.objects.length) {
                data.objects.forEach(function(object) {
                    markup += nunjucks.env.getTemplate('comm/note_detail.html').render({note: object});
                });
            } else {
                markup = '<p>' + gettext('No notes to show.') + '</p>';
            }
            $threadItem.find('.notes-container').html(markup);
        });

    }).on('click', '.view-older-notes', function(e) {
        var $threadItem = $(this).closest('.thread-item');
        var threadId = $threadItem.data('thread-id');
        var filterMode = $threadItem.data('notes-filter');
        var params = {ordering: '-created', limit: 5};
        var pageNumber = $threadItem.data('notes-page');

        if (pageNumber < 0) {
            notification.notification({message: gettext('There are no more older notes.')});
            return;
        }
        params.page = ++pageNumber;

        switch (filterMode) {
            case 'read':
                params.show_read = '1';
                break;
            case 'unread':
                params.show_read = '0';
                break;
            case 'recent':
                break;
        }

        requests.get(urls.api.url('notes', [threadId], params)).done(function(data) {
            var markup = '';
            // Set pageNumber = negative value so we can identify if we have more results to load.
            if (data.meta.next === null) {
                pageNumber = -1;
            }
            data.objects.forEach(function(object) {
                markup += nunjucks.env.getTemplate('comm/note_detail.html').render({note: object});
            });
            $threadItem.find('.notes-container').append(markup);
            $threadItem.data('notes-page', pageNumber);
        });
    });

    return function(builder) {
        builder.start('comm/main.html', {notes_page: 1, notes_filter: 'recent'});
    };
});
