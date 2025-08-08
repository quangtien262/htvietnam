<div class="modal fade" id="editModal" tabindex="-1" role="dialog" aria-labelledby="editModal" aria-hidden="true">
    <div class="modal-dialog modal-large" role="document">
        <div class="modal-content">
            {{-- <div class="modal-header">
                <h5 class="modal-title" style="color: white" id="exampleModalLabel">Sửa nhanh</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div> --}}

            <form method="POST" action="{{ route('land.update') }}" enctype="multipart/form-data">
                @csrf
                <div id="content-modal-edit" class="modal-body"></div>
                <div id="content-modal-edit" class="modal-footer modal-footer-ht">
                    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Đóng</button>
                    <button type="submit" class="btn btn-htvn">Cập nhật</button>
                </div>
            </form>

        </div>
    </div>
</div>
