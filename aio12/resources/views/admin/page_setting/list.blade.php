@extends('admin.page_setting.page_setting_layout')

@section('content')

    <style>
        .table-list-block {
            width: 100%;
            border-collapse: collapse;
        }

        .table-list-block td {
            padding: 10px;
            border: 1px solid #78f348;
        }

        .table-list-block img {
            max-height: 400px;
            height: auto;
            cursor: pointer;
        }

        .table-list-block img:hover {
            opacity: 0.8;
        }

        .block-type {
            font-weight: bold;
            color: #cf0c15;
            font-size: 18px;
            text-transform: uppercase;
        }

        .title02 {
            text-align: center;
            font-weight: bold;
            font-size: 20px;
            text-transform: uppercase;
            color: #04b11b
        }
    </style>

    @csrf

    <div id="content" class="card">
        <div class="card-body">
            <div class="row">

                <div class="col-12 ">
                    <h3 class="title02">Vui lòng CLICK chọn khối mà bạn muốn thêm</h3>
                </div>
                <table class="table-list-block">
                    @foreach ($list as $land)
                        <tr>
                            <td><b class="block-type">{{ $land->display_name }}:</b></td>
                        </tr>
                        <tr>
                            <td class="admin-land-item"
                                onclick="addLandingpage('{{ $land->id }}', '{{ $menuId }}')">
                                <img src="{{ $land->image }}" />
                            </td>
                        </tr>
                    @endforeach
                </table>
            </div>

        </div>
    </div>

    <script>
        function addLandingpage(id, menuId) {
            $("#content").html('<img class="img-loading" src="/images/loading/loading.jpg" style="width: 100px;" />');
            $.ajax({
                headers: {
                    "X-CSRF-Token": $('input[name="_token"]').val(),
                },
                type: "post",
                url: "/adm/page-setting/create",
                data: {
                    id: id,
                    menu_id: menuId,
                },
                success: function(data) {
                    console.log("data", data);
                    $("#content").html(data);
                },
            });
        }
    </script>
@endsection
