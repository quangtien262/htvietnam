<style>
    /* Đặt dạng lưới cho danh sách icon */
    .icon-listing {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        /* 5 cột, có thể đổi số cột */
        gap: 20px;
        padding: 20px 0;
    }

    /* Định dạng từng ô icon */
    .wrap-icon {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 8px 1px;
        background: #fff;
        border: 1px solid #eee;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        transition: box-shadow 0.2s;
        cursor: pointer;
    }

    .wrap-icon:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        border-color: #b3d4fc;
    }

    .wrap-icon i {
        font-size: 2rem;
        margin-bottom: 8px;
        color: #1890ff;
    }

    .icon-name {
        font-size: 1rem;
        color: #333;
        margin-top: 4px;
    }
    #showIcon i {
        font-size: 40px;
        margin-bottom: 8px;
        color: #1890ff;
    }
</style>

<div class="modal fade" id="modal-xl" data-backdrop="static" tabindex="-1" aria-labelledby="exampleModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Vui lòng click chọn icon</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                @include('icons.icon_list01')
                @include('icons.icon_list02')
                @include('icons.icon_list03')
                @include('icons.icon_list04')
                @include('icons.icon_list05')
                @include('icons.icon_list06')
                @include('icons.icon_list07')
                @include('icons.icon_list08')
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary">Save changes</button>
            </div>
        </div>
    </div>
</div>
<script>
    $('.wrap-icon').on('click', function() {
        var classIcon = $(this).find('i').attr('class');
        var icon = '<i class="' + classIcon + '"></i>';
        $('#showIcon').html(icon);
        $('#inputIcon').val(icon);
        $('#modal-xl').modal('hide');
    });
</script>
