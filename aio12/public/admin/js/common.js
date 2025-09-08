// ready
$(document).ready(function () {
    $('.select2').select2();
    $('#update-sort-order').click(function () {
        $('.loading').show()
        const data = {
            _token: $('input[name="_token"]').val(),
            sort_order: $('.sort-order-output').text()
        }
        console.log('data', data)
        $.post('/adm/menu/update-sort-order', data, function (result) {
            $('.loading').hide()
        })
    })

    $('#check-all').click(function () {
        $('input:checkbox').not(this).prop('checked', this.checked)
        getCountCheckbox()
    })

    //
    // sumernote
    $(".note-icon-picture").click(function(){
        console.log('click');
        $('#output').val('editor');
    });

    // $("select[]").click(function(){
    //     console.log('click');
    //     $('#output').val('editor');
    // });

        // Clockpicker
    // var cpInput = $('.clockpicker').clockpicker();

    // // auto close picker on scroll
    // $('main').scroll(function() {
    //     cpInput.clockpicker('hide');
    // });

})

function loading () {
    return '<div class="main-loading"> <div class="loader-inner ball-pulse"><div></div><div></div><div></div> </div></div>'
}

function fmSetLink (url) {
    output = $('#output').val();
    switch (output) {
        case 'editor':
            $('.summernote').summernote('insertImage', url)
            break
        case 'image':
            input = $('#input-id').val();
            image = $('#image-id').val();
            $(input).val(url)
            $(image).attr('src', url)
            break
        case 'demo':
            console.log('demo', output)
            $('#video_demo').val(url)
            break
        case 'video':
            console.log('video', output)
            $('#video_file').val(url)
        default:
            break
    }
}

function loadDataPopup (url) {
    $('.popup-content').html(loading())
    $.ajax({
        type: 'get',
        url: url,
        success: function (data) {
            $('.popup-content').html(data)
        }
    })
}

function deleteMenu (id, name, action) {
    $('#form-delete').attr('action', action)
    $('#item-delete').html(
        '<li><input value="' +
            id +
            '" id="ids" name="ids[]" type="hidden"><label for="name">' +
            name +
            '</label></li>'
    )
}

// Necessary to place dyncamic error messages
// without breaking the expected markup for custom input
function errorPlacementInput (error, element) {
    if (element.parent().parent().is('.mda-input-group')) {
        error.insertAfter(element.parent().parent()) // insert at the end of group
    } else if (element.parent().is('.mda-form-control')) {
        error.insertAfter(element.parent()) // insert after .mda-form-control
    } else if (element.is(':radio') || element.is(':checkbox')) {
        error.insertAfter(element.parent())
    } else {
        error.insertAfter(element)
    }
}

function getCountCheckbox () {
    const count = $('.select-box:checkbox:checked').length
    $('#count-item').text('(' + count + ')')
    if (count > 0) {
        $('#btn-delete').prop('disabled', false)
    } else {
        $('#btn-delete').prop('disabled', true)
    }
}

function deleteItems (action) {
    $('#form-delete').attr('action', action)
    $('#item-delete').html('')
    $('input.select-box').each(function (index) {
        if ($(this).is(':checked')) {
            $('#item-delete').append(
                '<li><input value="' +
                    $(this).val() +
                    '" id="ids" name="ids[]" type="hidden"><label for="name">' +
                    $(this).attr('item-name') +
                    '</label></li>'
            )
        }
    })
}

function deleteItem (action, id, name) {
    $('#form-delete').attr('action', action)
    $('#item-delete').html('')
    $('#item-delete').append(
        '<li><input value="' + id + '" id="ids" name="ids[]" type="hidden"><label for="name">' + name + '</label></li>'
    )
}

function deleteImage (_this) {
    parent = $(_this).parent('.item-images')
    $(parent).hide()
    $(parent).find('textarea').attr('name', 'img_delete[]')
    // $(_this).parent(".item-images").remove();
}

function chooseAvatar (_this) {
    $('.hidden-avatar').val('0')
    $(_this).children('.hidden-avatar').val('1')
}

function submitForm (classLoading, classForm, classReload) {
    $(classLoading).html(loading)
    $(classForm)
        .ajaxForm({
            target: classLoading,
            delegation: true,
            dataType: 'script',
            success: function (result) {
                var data = $.parseJSON(result)
                if (data[0] === 'success') {
                    if (data[1] == 'reload') {
                        location.reload();
                    } else {
                        console.log(data[1])
                        $(classLoading).html(data[1])
                    }
                    //$('#myModal').modal('hide');
                } else {
                    $(classLoading).html(data[1])
                }
            }
        })
        .submit()
}

function ajaxSubmitForm (
    classLoading = '#main-sub-content',
    classForm = '.form-ajax',
    classReload = '#main-sub-content',
    urlReload = '',
    addParam = {}
) {
    checkLoading()
    $(classForm)
        .ajaxForm({
            target: classLoading,
            headers: {
                'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
            },
            delegation: true,
            dataType: 'text',
            data: addParam,
            success: function (result) {
                if (urlReload) {
                    location.reload();
                    // reload(classReload, urlReload);
                } else {
                    if (
                        $('.bs-modal-lg').attr('style') &&
                        $('.bs-modal-lg').attr('style') != 'display: none;'
                    ) {
                        $('.bs-modal-lg').modal('toggle')
                    }
                    reload()
                }
                checkLoading()
            }
        })
        .submit()
}

function reload (url = '', classLoad = '#main-sub-content', showLoading = true) {
    if (!$(classLoad).length) {
        return
    }
    if (showLoading) {
        checkLoading()
    }

    if (!url) {
        url = document.URL
    }
    $.ajax({
        url: url,
        data: {
            reload: 1
        },
        success: function (data) {
            $(classLoad).html(data)
            // checkLoading();
            $('#_loading').addClass('_hidden')
        }
    })
}

function updateSoftOrder (tname) {
    $('.status-update').html(loading)
    $.ajax({
        type: 'get',
        url: '/admin/update-sort-order',
        data: {
            json: $('#nestable-output').html(),
            tname: tname
        },
        success: function (data) {
            $('.status-update').html(data)
        }
    })
}

function deleteRow (deleteAPI, urlReload, classReload) {
    swal(
        {
            title: 'Are you sure?',
            text: 'You will not be able to recover this item',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, delete it!',
            closeOnConfirm: false
        },
        function () {
            $.ajax({
                type: 'get',
                url: deleteAPI,
                success: function (data) {
                    if (data === 'success') {
                        if (!classReload) {
                            classReload = '#nestable'
                        }
                        swal(
                            'Deleted!',
                            'Your category has been deleted.',
                            'success'
                        )
                        reload(urlReload, classReload)
                    }
                }
            })
        }
    )
}

function loadPopupLarge (url) {
    // $('.popup-content').html(loading);
    checkLoading()
    $.ajax({
        type: 'get',
        url: url,
        success: function (data) {
            checkLoading()
            $('.popup-content').html(data)
        }
    })
}

function loadContent (classLoad, url) {
    $(classLoad).html(loading)
    checkLoading()
    $.ajax({
        url: url,
        success: function (data) {
            checkLoading()
            $(classLoad).html(data)
        }
    })
}

function addHtml (typeElement, classCopy, classPaste) {
    if (typeElement === 'form') {
        $(classPaste).html($(classCopy).html())
    } else {
        $(classPaste).html($(classCopy).html())
    }
}

function addHtml2Editor (classCopy, classEditor) {
    $('.main-editor').html('')
    $('.main-editor').html(
        '<textarea class="summernote" name="footer"> ' +
            $(classCopy).html() +
            ' </textarea>'
    )
    $('.summernote').each(function () {
        $(this).summernote({
            height: 380
        })
    })
    $(classEditor).val('')
}

function YNconfirm (url, msg) {
    if (window.confirm(msg)) {
        redirectUrl(url)
        return true
    } else {
        return false
    }
}

function changeStt (_this, id) {
    var classLoad = '#result-' + id
    $(classLoad).html(loading)
    checkLoading()
    $.ajax({
        url: '/admin/update-stt',
        data: {
            id: id,
            sortOrder: $(_this).val()
        },
        success: function (data) {
            checkLoading()
            $(classLoad).html(
                '<span style="color:#23c85e;font-weight:normal">Success</span>'
            )
            setTimeout(function () {
                $(classLoad).fadeOut('fast')
            }, 3000) // <-- time in milliseconds
        }
    })
}

function openTab (e) {
    let href = $(e).attr('href')
    $('.tab-pane').hide()
    $(href).show()
}

function readFileAsync (file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.onload = () => {
            resolve(reader.result)
        }
        // reader.onerror = reject;
        // reader.readAsArrayBuffer(file);
        reader.readAsDataURL(file)
    })
}

async function processFile (file) {
    try {
        let arrayBuffer = await readFileAsync(file)
        return arrayBuffer
    } catch (err) {
        console.log(err)
    }
}

function updateMultipleImages (_this) {
    const dataId = $(_this).attr('data-id')
    const tblId = $(_this).attr('tbl-id')
    const fileType = $(_this).attr('file-type')
    var files = _this.files
    var data = []
    loading = true
    console.log('start')
    checkLoading()
    $.each(files, function (index, file) {
        console.log(index + 1, files.length)
        if (files.length == index + 1) {
            console.log(index + 1, files.length)
            loading = false
        }
        readFileAsync(file).then(contentBuffer => {
            uploadBase64(contentBuffer, tblId, dataId, fileType, loading)
        })
    })
}

function uploadBase64 (
    base64,
    tblId,
    dataId,
    fileType = 'image',
    loading = true
) {
    $.ajax({
        headers: {
            'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
        },
        url: '/file/upload',
        type: 'post',
        data: {
            fileType: fileType,
            type: 'base64',
            file: base64,
            tblId: tblId,
            dataId: dataId
        },
        success: function (result) {
            console.log('result', result)
            if (!loading) {
                console.log('endloading')
                reload()
                $('#_loading').addClass('_hidden')
            }
            return true
        },
        error: function (e) {
            console.log('e', e)
            $('#_loading').addClass('_hidden')
        }
    })
}

function updateInput (e) {
    const input = $(e)
    const type = input.attr('type')
    $.ajax({
        headers: {
            'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
        },
        url:
            '/tbl/update-current-row/' +
            input.attr('name') +
            '/' +
            input.attr('table-id') +
            '/' +
            input.attr('data-id'),
        type: 'post',
        data: {
            value: input.val()
        },
        success: function (result) {
            if (type && type == 'select') {
                if (input.val() === '0') {
                    $(input.attr('element-update')).html('empty')
                } else {
                    $(input.attr('element-update')).html(
                        input.children('option:selected').text()
                    )
                }
            } else {
                $(input.attr('element-update')).html(input.val())
            }
            // $(input).notify('Luu Th�nh c�ng', 'success');
            $.notify('Luu Th�nh c�ng', 'success')
        },
        error: function (e) {
            $(input).notify(
                'Lưu thất bại',
                'error'
            )
            $('#_loading').addClass('_hidden')
        }
    })
}

function checkFastEdit (e) {
    const checkbox = $(e)
    if (checkbox.prop('checked') == true) {
        $('.input-fast-edit').show()
        $('.editable').hide()
    } else if (checkbox.prop('checked') == false) {
        $('.input-fast-edit').hide()
        $('.editable').show()
    }
}

function checkConfirm (msg) {
    if (!confirm(msg)) {
        return false
    }
}

// load-value-type
function loadValueType (_this) {
    checkLoading()
    $.ajax({
        url: '/admin/load-input-by-col/' + $(_this).val(),
        success: function (data) {
            checkLoading()
            $('.load-value-type').html(data)
        }
    })
}

function showLength (_this, classShow) {
    length = $(_this).val().length
    $(classShow).html(length)
}

function Viewed(e, url) {
    console.log('url', url);
    $(e).attr("disabled", true);
    $.ajax({
        headers: {
            'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
        },
        url: url,
        type: 'post',
        data: {},
        success: function (result) {
            $(e).removeAttr("disabled");
            console.log('result', result)
            if (!loading) {
                console.log('endloading')
                $('#_loading').addClass('_hidden')
            }
            return true
        },
        error: function (e) {
            console.log('e', e)
            $('#_loading').addClass('_hidden')
        }
    })
}

function getCountCheckbox() {
    const count = $('.select-box:checkbox:checked').length;
    $('#count-item').text('('+ count +')');
    if(count > 0) {
        $('#btn-delete').prop('disabled', false);
    } else {
        $('#btn-delete').prop('disabled', true);
    }
}
