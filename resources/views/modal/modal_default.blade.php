<div class="modal fade" id="modalDefault" data-backdrop="static" tabindex="-1" aria-labelledby="exampleModalLabel"
    aria-hidden="true">
    {{-- modal-dialog-scrollable --}}
    <div class="modal-dialog modal-dialog-centered ">
        <div id="modalDefault" class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <p>This <a href="#" role="button" class="btn btn-secondary popover-test" title="Popover title"
                        data-content="Popover body content is set in this attribute.">button</a> triggers a popover on
                    click.</p>
                <hr>
                <iframe id="modalDefaultContent" class="modal-content" style="width:100%;height:80vh;border:none;">
                    {{-- <img style="max-height:100px" class="img-loading" src="/images/loading/pink_loader.gif"/> --}}
                </iframe>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-dismiss="modal" aria-label="Close">Đóng</button>
            </div>
        </div>

    </div>
</div>
