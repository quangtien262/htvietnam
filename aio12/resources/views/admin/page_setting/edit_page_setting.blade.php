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
    </style>

    <div class="main-content">

        {{-- <fieldset> --}}
        <form id="formData" method="post" action="{{ route('saveData', $id) }}">
            @csrf
            <input type="hidden" name="id" value="{{ $id }}" />
            <input type="hidden" name="tbl" value="{{ $tblName }}" />

            <div class="row">

                <div class="col-sm-12">
                    <input id="chk_active" name="data[active]" type="checkbox" value="0" />
                    <span for="chk_active">
                        <em>Tạm Ẩn khối này</em>
                    </span>
                    <br /><br />
                </div>

                <div class="col-sm-12">
                    <span>Chọn hình ảnh</span>
                    <input multiple="multiple" class="form-control" type="file" name="file[]" />
                    @if(!empty($data->images) && !empty($data->images['images']))
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
                    <div id="tab{{ $language->id }}" class="tab-pane fade {{ $idx === 0 ? 'in active' : '' }}">

                        <div class="row">
                            <input type="hidden" name="lang[{{ $language->id }}][id]"
                                value="{{ $languagesData[$language->id]->id }}" />
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
                            <div class="col-sm-12">
                                <label>
                                    <b>Mô tả ngắn</b>
                                    <span class="_red">*</span>
                                </label>
                                <textarea id="description" name="lang[{{ $language->id }}][description]" class="form-control required valid">{{ $languagesData[$language->id]->description ?? '' }}</textarea>
                                <br>
                            </div>

                            <div class="col-sm-12">
                                <label>
                                    <b>Nội dung</b>
                                    <span class="_red">*</span>
                                </label>
                                <textarea class="form-control required valid summernote" name="lang[{{ $language->id }}][content]">{{ $languagesData[$language->id]->content ?? '' }}</textarea>
                                <br>
                            </div>
                        </div>
                    </div>
                @endforeach

            </div>

            <div class="row">

                <div class="col-sm-12">
                    <button id="btnSave" type="button" class="btn btn-save">
                        <i class="fa fa-save"></i> Cập nhật
                    </button>
                    <p id="result" class="txt-success"></p>
                </div>
            </div>

        </form>
        {{-- </fieldset> --}}
    </div>

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
