@extends('admin.page_setting.page_setting_layout')

@section('content')
    <style>
        .main-content {
            padding-top: 15px
        }

        ul.nav-tabs li {
            font-weight: bold
        }

        .txt-success {
            color: green;
            font-weight: bold;
        }

        .btn-back {
            background-color: #919191;
            padding: 10px 50px;
            color: #fff;
            font-weight: normal;
            font-size: 18px;
        }

        .btn-back:hover {
            background-color: #7c7b7b;
            color: #ccc;
        }

        #icon i {
            color: #1890ff;
            font-size: 30px
        }
    </style>

    <div class="main-content">

        {{-- <fieldset> --}}
        <form id="formData" method="post" action="{{ route('saveData', $id) }}">
            @csrf
            <input type="hidden" name="id" value="{{ $id }}" />
            <input type="hidden" name="tbl" value="{{ $tblName }}" />
            <input type="hidden" name="pageId" value="{{ $pageId }}" />

            <div class="row">
                <div class="col-sm-12">
                    <p><em>Mã khối: {{$page->block_type}}</em></p>
                </div>
                @if ($config['active'])
                    <div class="col-sm-12">
                        <input id="chk_active" name="active" type="checkbox"
                            {{ isset($data->active) && $data->active == 1 ? 'checked' : '' }} value="1" />
                        <span for="chk_active">
                            <b>Hiển thị / Ẩn</b>
                        </span>
                        <br /><br />
                    </div>
                @endif

                @if ($config['icon'])
                    <div class="col-sm-12">
                        <a data-toggle="modal" data-target="#modal-xl">
                            <i class="fa-solid fa-code"></i>
                            <b>Click để Chọn icon: </b>
                        </a>
                        <b id="showIcon">{!! $data->icon ?? '' !!}</b>
                        <input id="inputIcon" type="hidden" name="icon" value="{{ $data->icon ?? '' }}" />
                        <br /><br />
                    </div>
                @endif

                @if ($config['link'])
                    <div class="col-sm-12">
                        <b>Liên kết (nếu có): </b>
                        <input class="form-control" type="text" name="data[link]" value="{{ $data->link ?? '' }}" />
                        <br /><br />
                    </div>
                @endif

                @if ($config['note'])
                    <div class="col-sm-12">
                        <b>Ghi chú (nếu có): </b>
                        <input class="form-control" type="text" name="data[note]" value="{{ $data->note ?? '' }}" />
                        <br /><br />
                    </div>
                @endif

                @if ($config['image'])
                    <div class="col-sm-12">
                        <b>Chọn hình ảnh</b>
                        <input class="form-control" type="file" name="image" />
                        @if (!empty($data->image))
                            <div class="row">
                                <div id="image" class="col-sm-3">
                                    <img src="{{ $data->image }}" alt="" style="width: 100%; height: auto;" />
                                    <input type="hidden" name="image_hidden" value="{{ $data->image }}" />
                                    <button type="button" class="btn btn-danger btn-sm remove-image"
                                        onclick=" $('#image').remove()">Xóa</button>
                                </div>
                            </div>
                        @endif
                        <br /><br />
                    </div>
                @endif


                @if ($config['images'])
                    <div class="col-sm-12">
                        <span>Chọn nhiều hình ảnh</span>
                        <input multiple="multiple" class="form-control" type="file" name="file[]" />
                        @if (!empty($data->images) && !empty($data->images['images']))
                            <div class="row">
                                @foreach ($data->images['images'] as $key => $image)
                                    <div id="image-{{ $key }}" class="col-sm-3">
                                        <img src="{{ $image }}" alt="" style="width: 100%; height: auto;" />
                                        <input type="hidden" name="images[]" value="{{ $image }}" />
                                        <button type="button" class="btn btn-danger btn-sm remove-image"
                                            onclick=" $('#image-{{ $key }}').remove()"
                                            data-id="{{ $key }}">Xóa</button>
                                    </div>
                                @endforeach
                            </div>
                        @endif
                        <br /><br />
                    </div>
                @endif
            </div>
            <ul class="nav nav-tabs">
                @foreach ($languages as $idx => $language)
                    <li class="{{ $idx === 0 ? 'active' : '' }}">
                        <a href="#tab{{ $language->id }}" data-toggle="tab">{{ $language->name }}</a>
                    </li>
                @endforeach
            </ul>
            <div class="tab-content">
                <br />
                @foreach ($languages as $idx => $language)
                    {{-- hidden --}}
                    <input type="hidden" name="lang[{{ $language->id }}][id]"
                        value="{{ $languagesData[$language->id]->id ?? 0 }}" />

                    {{-- tab content --}}
                    <div id="tab{{ $language->id }}" class="tab-pane fade {{ $idx === 0 ? 'in active' : '' }}">

                        <div class="row">

                            @if ($config['name_data'])
                                <div class="col-sm-6">
                                    <label>
                                        <b>Tiêu đề</b>
                                        <span class="_red">*</span>
                                    </label>
                                    <input id="name" name="lang[{{ $language->id }}][name_data]"
                                        value="{{ $languagesData[$language->id]->name_data ?? '' }}" type="text"
                                        maxlength="250" class="form-control required valid" />

                                    <br>
                                </div>
                            @endif

                            @if ($config['title_description'])
                                <div class="col-sm-6">
                                    <label>
                                        <b>Mô tả tiêu đề</b>
                                        <span class="_red">*</span>
                                    </label>
                                    <input id="name" name="lang[{{ $language->id }}][title_description]"
                                        value="{{ $languagesData[$language->id]->title_description ?? '' }}" type="text"
                                        maxlength="250" class="form-control required valid" />
                                    <br>
                                </div>
                            @endif

                            @if ($config['description'])
                                <div class="col-sm-12">
                                    <label>
                                        <b>Mô tả ngắn</b>
                                        <span class="_red">*</span>
                                    </label>
                                    <textarea id="description" name="lang[{{ $language->id }}][description]" class="form-control required valid">{{ $languagesData[$language->id]->description ?? '' }}</textarea>
                                    <br>
                                </div>
                            @endif

                            @if ($config['content'])
                                <div class="col-sm-12">
                                    <label>
                                        <b>Nội dung</b>
                                        <span class="_red">*</span>
                                    </label>
                                    <textarea class="form-control required valid summernote" name="lang[{{ $language->id }}][content]">{{ $languagesData[$language->id]->content ?? '' }}</textarea>
                                    <br>
                                </div>
                            @endif

                        </div>
                    </div>
                @endforeach

            </div>

            <div class="row">

                <div class="col-sm-12">
                    <p id="result" class="txt-success"></p>
                    @if ($id > 0)
                        <button id="btnSave" type="button" class="btn btn-save">
                            <i class="fa fa-save"></i> Cập nhật
                        </button>
                        <button id="btnSaveAndClose" type="button" class="btn btn-save">
                            <i class="fa fa-save"></i> Lưu và đóng
                        </button>
                    @else
                        <button id="btnSave" type="button" class="btn btn-save">
                            <i class="fa fa-save"></i> Lưu & tiếp tục thêm mới
                        </button>
                        <button id="btnSaveAndClose" type="button" class="btn btn-save">
                            <i class="fa fa-save"></i> Thêm và đóng
                        </button>
                    @endif

                    <a href="{{ route('pageSetting.listBlock', [$tblName, $pageId]) }}" class="btn">
                        <button id="btnBack" type="button" class="btn btn-back">
                            <i class="fa fa-arrow-left"></i> Quay lại
                        </button>
                    </a>
                </div>
            </div>

        </form>
        {{-- </fieldset> --}}
    </div>

    @include('admin.page_setting.icon_modal')

    <script>

        $('#btnSave').on('click', function() {
            var $btn = $(this);
            $btn.prop('disabled', true); // Disable nút

            var result = '#result';
            $(result).html(
                '<img class="img-loading" src="/images/loading/loading.jpg" style="width: 100px;" />'
            );
            $('#formData')
                .ajaxForm({
                    target: result,
                    delegation: true,
                    dataType: 'json',
                    success: function(result) {
                        $('#result').text('Đã cập nhật lại dữ liệu thành công');
                        $btn.prop('disabled', false); // Enable lại nút
                        window.parent.document.getElementById('btnCloseModalXL2').style.display = 'none';
                        window.parent.document.getElementById('btnReloadModalXL2').style.display = 'block';
                        location.reload();
                    },
                    error: function() {
                        $('#result').text('Có lỗi xảy ra!');
                        $btn.prop('disabled', false); // Enable lại nút
                    }
                })
                .submit()
        });


        // save and close
        $('#btnSaveAndClose').on('click', function() {
            var $btn = $(this);
            $btn.prop('disabled', true); // Disable nút

            var result = '#result';
            $(result).html(
                '<img class="img-loading" src="/images/loading/loading.jpg" style="width: 100px;" />'
            );
            $('#formData')
                .ajaxForm({
                    target: result,
                    delegation: true,
                    dataType: 'json',
                    success: function(result) {
                        window.parent.location.reload();
                    },
                    error: function() {
                        $('#result').text('Có lỗi xảy ra!');
                        $btn.prop('disabled', false); // Enable lại nút
                    }
                })
                .submit()
        });

    </script>
@endsection
