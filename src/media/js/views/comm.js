define('views/comm',
    ['cache', 'l10n', 'notification', 'nunjucks', 'requests', 'storage', 'urls', 'z'],
    function(cache, l10n, notification, nunjucks, requests, storage, urls, z) {
    'use strict';

    var gettext = l10n.gettext;
    var ngettext = l10n.ngettext;

    var postNoteEnabled = true;  // Wait till request finish before post again.
    var postNote = function($text_elem) {
        var $threadItem = $text_elem.closest('.thread-item');
        var threadId = $threadItem.data('thread-id');
        var data = {
            note_type: 0,
            body: $text_elem.val()
        };

        var def = $.Deferred();
        postNoteEnabled = false;
        requests.post(urls.api.url('notes', [threadId]), data).done(function(data) {
            var $threadElem = $threadItem.find('.thread-header');

            // Add a new note element.
            $threadElem.find('.filter-recent').trigger('click');
            var noteMarkup = nunjucks.env.render('comm/note_detail.html', {note: data});
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
                       .html(gettext('Reply'));

            $text_elem.siblings('button.post').addClass('disabled');
            $text_elem.val('');

            postNoteEnabled = true;
            notification.notification({message: gettext('Message sent.')});
            def.resolve();

        }).fail(function() {
            postNoteEnabled = true;
            notification.notification({message: gettext('Message sending failed.')});
            console.warn('Failed while trying to send the message');
            def.reject();
        });

        return def;
    };

    z.page.on('click', '.reply.button.open-reply', function(e) {
        var $this = $(this);
        $this.closest('.thread-header').find('.reply-box').removeClass('hidden');
        $this.removeClass('open-reply')
             .addClass('close-reply')
             .html(gettext('Cancel reply'));

    }).on('click', '.reply.button.close-reply', function(e) {
        var $this = $(this);
        $this.closest('.thread-header').find('.reply-box').addClass('hidden').find('textarea').val('');
        $this.removeClass('close-reply')
             .addClass('open-reply')
             .html(gettext('Reply'));

    }).on('keyup', '.reply-text', function(e) {
        var $this = $(this);
        $this.siblings('button.post').toggleClass('disabled', !$this.val().length);

    }).on('click', 'button.post', function(e) {
        var replyBox = $(this).closest('.thread-header').find('.reply-box').addClass('hidden');
        if (postNoteEnabled) {
            postNote($(this).siblings('.reply-text')).done(function() {
                replyBox.val('');
            });
        }

    }).on('click', '.notes-filter', function(e) {
        var $this = $(this);
        var $threadItem = $this.closest('.thread-item');
        var threadId = $threadItem.data('thread-id');
        var filterMode = $this.data('filter-mode');
        var params = {ordering: '-created', limit: 5};

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

        var url = urls.api.url('notes', [threadId], params);
        requests.get(url, true).done(function(data) {
            var markup = '';
            $threadItem.find('.notes-filter').removeClass('selected');
            $this.addClass('selected');

            if (!data.meta.next) {
                $threadItem.find('.view-older-notes').hide();
                $threadItem.data('notes-page', -1);
            } else {
                $threadItem.find('.view-older-notes').show();
            }
            if (data.objects.length) {
                data.objects.forEach(function(object) {
                    markup += nunjucks.env.render('comm/note_detail.html', {note: object});
                });
            } else {
                markup = nunjucks.env.getTemplate('comm/no_notes.html').render();
            }
            $threadItem.find('.notes-container').html(markup);
        });

    }).on('click', '.view-older-notes', function(e) {
        var $this = $(this);
        var $threadItem = $this.closest('.thread-item');
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
                $this.hide();
                pageNumber = -1;
            }
            data.objects.forEach(function(object) {
                markup += nunjucks.env.render('comm/note_detail.html', {note: object});
            });
            $threadItem.find('.notes-container').append(markup);
            $threadItem.data('notes-page', pageNumber);
        });

    }).on('click', '.mark-note-read', function(e) {
        var $this = $(this);
        var $noteItem = $this.closest('.note-detail');
        var noteId = $noteItem.data('note-id');
        var $threadItem = $this.closest('.thread-item');
        var threadId = $threadItem.data('thread-id');

        requests.patch(urls.api.url('note', [threadId, noteId]), {is_read: true})
        .done(function(data) {
            $this.remove();
            $noteItem.removeClass('unread');
            $noteItem.addClass('read');

            if ($threadItem.data('notes-filter') === 'unread') {
                $noteItem.remove();
            }

        }).fail(function(err) {
            notification.notification({message: gettext('There was some problem marking the note as read. Try again.')});
        });

    }).on('click', '.mark-thread-read', function(e) {
        var $this = $(this);
        var $threadItem = $this.closest('.thread-item');
        var threadId = $threadItem.data('thread-id');

        requests.patch(urls.api.url('thread', [threadId]), {is_read: true}).done(function(data) {
            var filterMode = $threadItem.data('notes-filter');
            if (filterMode === 'unread') {
                $threadItem.find('.note-detail.unread').remove();
                $threadItem.find('.notes-container').html('<div>' + gettext('No notes to show.') + '</div>');
            } else {
                $threadItem.find('.note-detail.unread').removeClass('unread');
                $threadItem.find('.mark-note-read').remove();
            }

        }).fail(function(err) {
            notification.notification({message: gettext('There was some problem marking the thread as read. Try again.')});
        });
    });

    return function(builder) {
        builder.start('comm/main.html', {notes_page: 1, notes_filter: 'recent'});
    };
});
