@extends('admin.page_setting.page_setting_layout')

@section('content')
    <div class="card">
        <div class="card-body">
            <h4><span class="type-block" style="color: #000;">Tên khối: {{ $page->display_name }} </span></h4>
            <fieldset>
                <form>
                    <input type="hidden" name="id" value="{{ $pageId }}" />
                    <input type="hidden" name="block_name" value="" />
                    <div class="row">

                        <div class="col-sm-12">
                            <input id="chk_active" name="data[active]" type="checkbox" value="0" />
                            <label for="chk_active">
                                Tạm Ẩn khối này
                            </label>
                            <br>
                            <br>
                        </div>

                        <div class="col-sm-12">
                            <label>
                                <b>Tiêu đề</b>
                                <span class="_red">*</span>
                            </label>
                            <input id="{{ $page_name }}" name="data[{{ $name }}]"
                                value="{{ $landingpage->{$name} }}" type="text" maxlength="250"
                                class="form-control required valid" />
                            <br>
                        </div>
                    </div>
                </form>
            </fieldset>
        </div>
    </div>
@endsection
