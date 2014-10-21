define('views/comm',
    ['cache', 'jquery', 'jquery.fakefilefield', 'l10n', 'notification', 'nunjucks', 'requests', 'settings', 'storage', 'underscore', 'urls', 'user', 'utils', 'z'],
    function(cache, $, fakefilefield, l10n, notification, nunjucks, requests, settings, storage, _, urls, user, utils, z) {
    'use strict';

    var gettext = l10n.gettext;
    var ngettext = l10n.ngettext;

    var postNoteEnabled = true;  // Wait till request finish before post again.
    var postNote = function($text_elem, isCreateThread) {
        /*
          isCreateThread -- if creating a thread. Changes API endpioint, adds
                            some additional POST parameters.
        */
        var $threadItem = $text_elem.closest('.thread-item');
        var threadId = $threadItem.data('thread-id');

        // Deduce the correct note type.
        var note_type = settings.NOTE_TYPE_NO_ACTION;
        if (user.get_apps().developed.indexOf($threadItem.data('app-id')) !== -1) {
            note_type = settings.NOTE_TYPE_DEVELOPER_COMMENT;
        } else if (user.get_permission('reviewer')) {
            note_type = settings.NOTE_TYPE_REVIEWER_COMMENT;
        }

        var data = {
            note_type: note_type,
            body: $text_elem.val()
        };
        if (isCreateThread) {
            data.app = $threadItem.data('app-slug');
            data.version = $threadItem.data('version-number');
        }

        var $threadAction = $('.thread-action .button', $threadItem);
        var $btnText = $('.reply, .loading', $threadAction);
        $btnText.toggle();

        var def = $.Deferred();
        postNoteEnabled = false;
        var postUrl = isCreateThread ? urls.api.url('threads') : urls.api.url('notes', [threadId]);
        requests.post(postUrl, data).done(function(data) {
            var $threadElem = $threadItem.find('.thread-header');

            // Add a new note element.
            $threadElem.find('.filter-recent').trigger('click');
            var noteMarkup = nunjucks.env.render('comm/note_detail.html', {note: data});
            var $noteCount = $threadElem.find('.note-count');
            var count = $noteCount.data('count') + 1;
            $noteCount.html(ngettext('{n} note', '{n} notes', {n: count}))
                      .data('count', count);
            $threadItem.find('.notes-container').prepend(noteMarkup).find('.empty').remove();

            // Close the reply box.
            $threadElem.find('.reply-box').addClass('hidden');
            $threadElem.find('.reply.button.close-reply')
                       .removeClass('close-reply')
                       .addClass('open-reply')
                       .find('.reply')
                       .html(gettext('Reply'));
            $btnText.toggle();

            $text_elem.siblings('button.post').addClass('disabled');
            $text_elem.val('');

            postNoteEnabled = true;
            notification.notification({message: gettext('Message sent.')});
            def.resolve(data);

        }).fail(function() {
            postNoteEnabled = true;
            notification.notification({message: gettext('Message sending failed.')});
            console.warn('Failed while trying to send the message');
            def.reject();
        });

        return def;
    };

    var postAttachments = function($thread, note_id) {
        var $attachments = $thread.find('.attachment-field');
        var attachUrl = urls.api.url('attachments', [note_id]);

        // Send attachment with XHR2.
        var formData = new FormData();
        var hasInput;
        $attachments.each(function(i, attachment) {
            var $attachment = $(attachment);
            if ($('[type="file"]', $attachment).val() != '') {
                hasInput = true;
            }
            formData.append('form-' + i + '-attachment', $attachment.find('.realfileinput').get(0).files[0]);
            formData.append('form-' + i + '-description', $attachment.find('.attach-description input').val());
        });
        if (!hasInput) {
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            // Add attachment response to note.
            var data = JSON.parse(this.responseText);
            var $attachmentList = $('.note-detail[data-note-id="' + note_id + '"] .note-attachments');

            var markup = '';
            if (!$('li', $attachmentList).length) {
              data.attachments.forEach(function(attachment) {
                markup += nunjucks.env.render('_includes/attachment.html', {
                    note: data,
                    attachment: attachment
                });
              });
            }
            $attachmentList.html(markup);
        };
        xhr.open('POST', attachUrl);
        xhr.send(formData);

        // Clear input.
        $thread.find('.attachment-field:first-child input').val('');
        $thread.find('.attachment-field:not(:first-child)').remove();
    };

    z.page.on('click', '.reply.button.open-reply', function(e) {
        // Open reply box.
        var $this = $(this);
        var $thread = $this.closest('.thread-header');
        $thread.find('.reply-box').removeClass('hidden');
        $this.removeClass('open-reply')
             .addClass('close-reply')
             .find('.reply')
             .html(gettext('Cancel reply'));
        showAttachmentForm($thread);

    }).on('click', '.reply.button.close-reply', function(e) {
        // Close/hide reply box.
        var $this = $(this);
        $this.closest('.thread-header').find('.reply-box').addClass('hidden').find('textarea').val('');
        $this.removeClass('close-reply')
             .addClass('open-reply')
             .find('.reply')
             .html(gettext('Reply'));

    }).on('keyup', '.reply-text', function(e) {
        // Disable post button if empty note body.
        var $this = $(this);
        $this.siblings('button.post').toggleClass('disabled', !$this.val().length);

    }).on('click', 'button.post', function(e) {
        // Post the note.
        var $this = $(this);
        var replyBox = $this.closest('.thread-header').find('.reply-box').addClass('hidden');
        if (postNoteEnabled) {
            postNote($this.siblings('.reply-text'), $this.hasClass('create-thread')).done(function(note) {
                replyBox.val('');
                postAttachments($this.closest('.thread-item'), note.id);
            });
        }

    }).on('click', '.view-older-notes', function(e) {
        // Fetch next page of notes.
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

    }).on('click', '.unsubscribe', function() {
        var $threadItem = $(this).closest('.thread-item');
        var threadId = $threadItem.data('thread-id');
        notification.confirmation({
            message: gettext('By unsubscribing from this thread, you will no longer receive email notifications from this thread. Are you sure?')
        }).done(function() {
            requests.del(urls.api.url('subscribe', [threadId])).done(function(data) {
                $threadItem.remove();
                notification.notification({
                    message: gettext('Successfully unsubscribed. You will no longer receive email notifications for that thread.')});
            });
        });
    });

    var attachTemplate;
    function showAttachmentForm($thread) {
        if (!attachTemplate) {
            attachTemplate = _.template($('#attachment-field').html());
        }

        var $attachments = $('.attachments', $thread);

        // Add a new attachment field when the button is clicked.
        var $addField = $('.add-attach-field', $attachments);
        $addField.on('click', utils._pd(function(e) {
            $('.fields', $attachments).append(attachTemplate({'n' : 0}));
            $('.fileinput', $attachments).fakeFileField();
        }));

        // Initialize the first attachment field.
        if (!$('.fileinput', $attachments).length) {
            $addField.trigger('click');
        }
    }

    return function(builder) {
        builder.start('comm/main.html');
    };
});
