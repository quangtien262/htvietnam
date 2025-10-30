@extends('admin.page_setting.page_setting_layout')

@section('section_title', 'Sắp xếp thứ tự')

@section('content')
    <style>
        .mda-list-item-text h3 {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
        }
    </style>
    <div id="mainContentBlock">
        <div class="modal-header">
            <button id="updateSortOrder" type="button" class="btn btn-primary">
                <i class="fa-solid fa-bars"></i>
                Cập nhật thứ tự
            </button>
            <a href="{{ route('pageSetting.editBlock', [$tblName, 0, $pageId]) }}">
                <button onclick="loading()" id="addNewBlock" type="button" class="btn btn-success">
                    <i class="fa-solid fa-plus"></i>
                    Thêm mới
                </button>
            </a>
            <textarea id="nestable-output" class="well sort-order-output _hidden"></textarea>
        </div>
        <p id="resultSortOrder" class="text-success" style="font-weight: bold"></p>
        <div class="modal-body">
            <div id="nestable" class="dd">
                {!! $htmlListDragDrop !!}
            </div>
        </div>
    </div>
    <script>
        $(document).ready(function() {


            function loading(e = '#mainContentBlock') {
                $(e).html('<img class="img-loading" src="/images/loading/loading.jpg" style="width: 100px;" />');
            }

            $('#updateSortOrder').click(function() {
                loading('#resultSortOrder');
                var sortOrder = $('#nestable-output').val();
                $.ajax({
                    url: '{{ route('pageSetting.sort_order_data') }}',
                    method: 'POST',
                    data: {
                        _token: '{{ csrf_token() }}',
                        data: sortOrder,
                        tbl: '{{ $tblName }}',
                        pageId: '{{ $pageId }}'
                    },
                    success: function(response) {
                        $('#resultSortOrder').text('Lưu thay đổi thành công!');
                        
                        window.parent.document.getElementById('btnCloseModalXL2').style
                            .display = 'none';
                        window.parent.document.getElementById('btnReloadModalXL2').style
                            .display = 'block';
                        // Handle success
                    },
                    error: function(xhr) {
                        // Handle error
                    }
                });
            });

            function deletedData() {
                alert('Xóa thành công');
            }
        });
    </script>

@endsection
