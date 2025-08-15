<div class="modal fade" id="modal-xl" data-backdrop="static" tabindex="-1" aria-labelledby="exampleModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
        <div id="modalXL" class="modal-content">
            <div class="modal-header ">
                <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                <div class="text-right">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            </div>
            <div class="modal-body">
                <div class="left100">
                    {{-- close --}}
                    <button id="btnCloseModalXL1" type="button" class="btn btn-secondary _right" data-dismiss="modal">Đóng</button>
                    <button id="btnReloadModalXL1" type="button" class="btn btn-secondary _right _hidden" onclick="location.reload()">Đóng</button>
                    {{-- add new block --}}
                    <button id="btnAddNewBlock" 
                        onclick=""
                        type="button" 
                        class="btn btn-primary _right">
                        <i class="fas fa-plus"></i> 
                        Thêm mới block
                    </button>
                    {{-- sort order --}}
                    <button id="btnSortOrder" 
                        type="button" 
                        onclick="ajaxLoadUrl('{{ route('pageSetting.sort_order') }}', '#modalXLContent'); $(this).hide(); $('#btnAddNewBlock').show();"
                        class="btn btn-primary _right _hidden">
                        <i class="fas fa-reply-all"></i>
                        Quay lại danh sách
                    </button>
                </div>
                <iframe id="modalXLContent" class="modal-content" style="width:100%;height:80vh;border:none;">
                </iframe>
            </div>
            <div class="modal-footer">
                <button id="btnCloseModalXL2" type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
                <button id="btnReloadModalXL2" type="button" class="btn btn-secondary _hidden"
                    onclick="location.reload()">Đóng</button>
            </div>
        </div>
    </div>
</div>
