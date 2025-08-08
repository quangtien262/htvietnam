<div class="modal fade" id="sortOrderModal" tabindex="-1" role="dialog" aria-labelledby="sortOrderModal" aria-hidden="false">
    <div class="modal-dialog " role="document">
        <div class="modal-content">
            <form method="POST" action="{{ route('land.update') }}" enctype="multipart/form-data">
                @csrf

                {{-- btn add/close --}}
                <div class="modal-footer modal-footer-ht">
                    <button id="btnAddLand" onclick="ajaxLoadUrl('{{ route('land.create', [$menuId]) }}', '#content-modal-sort-order')"
                        type="button"
                        class="btn btn-danger">Thêm khối mới</button>
                    <button type="button" class="btn btn-warning" onclick="closeSortOrder()">Đóng</button>
                    <input type="hidden" id="isReload" value="0"/>
                    <button id="btnCloseSsortOrder_hidden" type="button" class="btn btn-default _hidden" data-dismiss="modal" aria-label="Close">Đóng</button>
                </div>

                {{-- btn update --}}
                <div class="modal-footer modal-footer-ht">
                    <button id="btnUpdateSortOrderLand" type="button" class="btn btn-htvn" onclick="updateSortOrder()">Cập nhật thứ tự</button>
                </div>
                {{-- result --}}
                <p class="text-center text-success" id="result-sort-order"></p>

                {{-- content --}}
                <div id="content-modal-sort-order" class="modal-body modal-body-01"></div>




            </form>
        </div>
    </div>
</div>
