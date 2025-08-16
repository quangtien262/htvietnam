@extends('admin.page_setting.page_setting_layout')

@section('section_title', 'Sắp xếp thứ tự')

@section('content')
    <div id="mainContentBlock">
        <div class="modal-header">
            <button id="updateSortOrder" type="button" class="btn btn-primary">
                <i class="fa-solid fa-check"></i>
                Cập nhật thứ tự
            </button>
            <a href="{{ route('pageSetting.edit', ['tblName' => $tblName, 'id' => 0]) }}">
            <button id="addNewBlock" type="button" class="btn btn-success">
                <i class="fa-solid fa-check"></i>
                Thêm mới
            </button>
            </a>
            <textarea id="nestable-output" class="well sort-order-output _hidden"></textarea>
        </div>
        <p id="resultSortOrder"></p>
        <div class="modal-body">
            <div id="nestable" class="dd">
                {!! $htmlListDragDrop !!}
            </div>
        </div>
    </div>
    <script>
        $(document).ready(function() {
            
            // $('#addNewBlock').click(function() {
            //     link('{{ route('pageSetting.edit', ['tblName' => $tblName, 'id' => 0]) }}');
            // });

            $('#updateSortOrder').click(function() {
                $('#resultSortOrder').html('<img class="img-loading" src="/images/loading/loading.jpg" style="width: 100px;" />');
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
                        window.parent.document.getElementById('btnCloseModalXL1').style
                            .display = 'none';
                        window.parent.document.getElementById('btnCloseModalXL2').style
                            .display = 'none';
                        window.parent.document.getElementById('btnReloadModalXL1').style
                            .display = 'block';
                        window.parent.document.getElementById('btnReloadModalXL2').style
                            .display = 'block';
                        // Handle success
                    },
                    error: function(xhr) {
                        // Handle error
                    }
                });
            });

            function link(url) {
                $('#mainContentBlock').html('<img class="img-loading" src="/images/loading/loading.jpg" style="width: 100px;" />');
                $.ajax({
                    type: "get",
                    url: url,
                    success: function(data) {
                        $('#mainContentBlock').html(data);
                    },
                    error: function(data) {
                        $('#mainContentBlock').html(
                            "<p>Có lỗi xảy ra, vui lòng tải lại trình duyệt và thử lại</p>"
                        );
                    },
                });
            }
        });
    </script>

@endsection
