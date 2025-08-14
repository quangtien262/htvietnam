@extends('admin.page_setting.page_setting_layout')
@section('content')
<div class="card">
    <div class="card-body">
        <div class="row">
            <table>
                <tr>
                    <td>
                        <b class="_red">Vui lòng CLICK chọn khối mà bạn muốn thêm</b>
                    </td>
                </tr>
                @foreach($list as $land)
                        <tr>
                            <td><b>{{ $land->display_name }}</b></td>
                        </tr>
                        <tr>
                            <td class="admin-land-item" onclick="addLandingpage('{{ $land->id }}', '{{ $menuId }}')">
                                <img src="{{ $land->image }}"/>
                            </td>
                        </tr>
                @endforeach
            </table>
        </div>

    </div>
@endsection

