@extends('admin.page_setting.page_setting_layout')

@section('section_title', 'Sắp xếp thứ tự')

@section('content')
    <div class="modal-header">
        <button id="updateSortOrder" type="button" class="btn btn-primary">
            <i class="fa-solid fa-check"></i>
            Cập nhật thứ tự
        </button>
        
        @csrf
        <textarea id="nestable-output" class="well sort-order-output _hidden"></textarea>
    </div>
    <p id="resultSortOrder"></p>
    <div class="modal-body">
        <div id="nestable" class="dd">
            {!! $htmlListDragDrop !!}
        </div>
    </div>

    <script>
        $(document).ready(function () {
            $('#updateSortOrder').click(function () {
                $('#resultSortOrder').text('Đang lưu thay đổi...');
                var sortOrder = $('#nestable-output').val();
                $.ajax({
                    url: '{{ route('pageSetting.sort_order_data') }}',
                    method: 'POST',
                    data: {
                        _token: '{{ csrf_token() }}',
                        data: sortOrder
                    },
                    success: function (response) {
                        $('#resultSortOrder').text('Lưu thay đổi thành công!');
                        // $('#btnCloseModalXL').hide();
                        window.parent.document.getElementById('btnCloseModalXL1').style.display = 'none';
                        window.parent.document.getElementById('btnCloseModalXL2').style.display = 'none';
                        window.parent.document.getElementById('btnReloadModalXL1').style.display = 'block';
                        window.parent.document.getElementById('btnReloadModalXL2').style.display = 'block';
                        // Handle success
                    },
                    error: function (xhr) {
                        // Handle error
                    }
                });
            });
        });
    </script>

@endsection
