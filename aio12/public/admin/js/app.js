// APP START
// -----------------------------------

(function() {
    'use strict';

    $(initNestable);

    function initNestable() {
        var updateOutput = function(e) {
            var list = e.length ? e : $(e.target),
                output = list.data('output');
            if (window.JSON) {
                output.text(window.JSON.stringify(list.nestable('serialize'))); //, null, 2));
            } else {
                output.text('JSON browser support required for this demo.');
            }
        };

        // activate Nestable for list 1
        $('#nestable').each(function() {
            $(this).nestable({
                group: 1
            })
            .on('change', updateOutput);

            // output initial serialised data
            updateOutput($(this).data('output', $('#nestable-output')));
        });

        $('.js-nestable-action').on('click', function(e) {
            var target = $(e.target),
                action = target.data('action');
            if (action === 'expand-all') {
                $('.dd').nestable('expandAll');
            }
            if (action === 'collapse-all') {
                $('.dd').nestable('collapseAll');
            }
        });
    }

})();

(function() {
    'use strict';

    $(formEditor);

    function formEditor() {

        const FMButton = function(context) {
            const ui = $.summernote.ui;
            const button = ui.button({
              contents: '<i class="note-icon-picture"></i> ',
              tooltip: 'File Manager',
              click: function() {
                window.open('/file-manager/summernote', 'fm', 'width=1400,height=800');
              }
            });
            return button.render();
        };

        // Summernote HTML editor
        $('.summernote').each(function(){
            $(this).summernote({
                height: 380,
                toolbar: [
                    // [groupName, [list of button]]
                    ['style', ['bold', 'italic', 'underline', 'clear']],
                    ['font', ['strikethrough', 'superscript', 'subscript']],
                    ['fontsize', ['fontsize']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['height', ['height']],
                    ['fm-button', ['fm']],
                ],
                buttons: {
                    fm: FMButton
                }
            });
        });

    }


})();



