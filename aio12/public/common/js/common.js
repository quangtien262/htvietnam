$(document).ready(function () {
    $("#btnAddLand").click(function () {
        $("#btnUpdateSortOrderLand").hide();
        $("#btnAddLand").hide();
    });

    $("#sort_order_block").click(function () {
        $("#btnUpdateSortOrderLand").show();
        $("#btnAddLand").show();
    });
});

/**
 * Cập nhật số lượng giỏ hàng
 */
function updateQty(cartId) {
    e = $("#" + cartId);
}

function productSupport(pname, pid) {
    $("#support-product-name").text(pname);
    $("#input-product-name").val(pname);
    $("#input-product-id").val(pid);
}

function ajaxLoadUrl(url, result) {
    $(result).html(
        '<img class="img-loading" src="/images/loading/loader.big.black.gif"/>'
    );
    $.ajax({
        type: "get",
        url: url,
        success: function (data) {
            $(result).html(data);
        },
        error: function (data) {
            $(result).html(
                "Có lỗi xảy ra, vui lòng tải lại trình duyệt và thử lại"
            );
        },
    });
}

function addItem(e, eShow, next) {
    $(e).hide();
    $(eShow).show();
    $(next).show();
}

function submitForm(url, result) {
    $(result).html(
        '<img class="img-loading" src="/images/loading/loader.big.black.gif"/>'
    );
    $.ajax({
        type: "get",
        url: url,
        success: function (data) {
            $(result).html(data);
        },
        error: function (data) {
            $(result).html(
                "Có lỗi xảy ra, vui lòng tải lại trình duyệt và thử lại"
            );
        },
    });
}

function removeElement(e) {
    $(e).remove();
}

const form = document.querySelector("#subcriber");

function addSubcriber() {
    const input = document.querySelector("#subcriber_email");
    console.log(input.value);
    if (
        input.value.match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
    ) {
        alert("Cảm ơn đã đăng kí !");
    } else {
        alert("email không hợp lệ!");
    }
}

function updateSortOrder() {
    $("#result-sort-order").html(
        '<img class="img-loading" src="/images/loading/loader.big.black.gif"/>'
    );
    $.ajax({
        headers: {
            "X-CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
        },
        type: "post",
        url: "/adm/landingpage/sort-order",
        data: {
            data: $("#nestable-output").val(),
        },
        success: function (data) {
            $("#isReload").val("1");
            $("#result-sort-order").html("Cập nhật thứ tự thành công");
        },
        error: function (err) {
            $("#result-sort-order").html(
                '<em class="_red">Cập nhật thứ tự thất bại</em>'
            );
        },
    });
}

function closeSortOrder() {
    $("#result-sort-order").html(
        '<img class="img-loading" src="/images/loading/loader.big.black.gif"/>'
    );
    if ($("#isReload").val() === "1") {
        location.reload();
        return;
    }
    $("#btnCloseSsortOrder_hidden").click();
    $("#result-sort-order").html("");
}

function addLandingpage(id, menuId) {
    $("#result-sort-order").html(
        '<img class="img-loading" src="/images/loading/loader.big.black.gif"/>'
    );
    $.ajax({
        headers: {
            "X-CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
        },
        type: "post",
        url: "/adm/landingpage/create",
        data: {
            id: id,
            menu_id: menuId,
        },
        success: function (data) {
            console.log("data", data);
            ajaxLoadUrl(
                "/adm/landingpage/sort-order/" + menuId,
                "#content-modal-sort-order"
            );
            $("#result-sort-order").html("");
            $("#btnUpdateSortOrderLand").show();
            $("#btnAddLand").show();
            $("#isReload").val("1");
        },
    });
}

function hideLand(e) {
    $("#result-sort-order").html(
        '<img class="img-loading" src="/images/loading/loader.big.black.gif"/>'
    );
    var id = $(e).val();
    var is_active = 1;
    if ($(e).is(":checked")) {
        is_active = 0;
    }

    $.ajax({
        headers: {
            "X-CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
        },
        type: "post",
        url: "/adm/landingpage/active",
        data: {
            id: id,
            active: is_active,
        },
        success: function (data) {
            $("#isReload").val("1");
            $("#result-sort-order").html("");
            if (is_active == 1)
                $("#result-sort-order").html(
                    "Cài đặt <b>HIỂN THỊ</b> thành công"
                );
            else $("#result-sort-order").html("Cài đặt <b>ẨN</b> thành công");
        },
        error: function (err) {
            $("#result-sort-order").html("");
            $("#result-sort-order").html(
                '<em class="error">Ẩn khối không thành công, vui lòng refresh lại trình duyệt và thử lại</em>'
            );
        },
    });
}

function deleteConfirm(eConfirm) {
    $(eConfirm).show();
}

function cancelDeleteLand(eConfirm) {
    $(eConfirm).hide();
}

function deletedLand(id) {
    $("#result-sort-order").html(
        '<img class="img-loading" src="/images/loading/loader.big.black.gif"/>'
    );
    $.ajax({
        headers: {
            "X-CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
        },
        type: "post",
        url: "/adm/landingpage/delete",
        data: {
            id: id,
        },
        success: function (data) {
            $("#isReload").val("1");
            $("#result-sort-order").html("");
            $("#result-sort-order").html("Đã <b>XÓA</b> thành công");
            $("#main-block-dad-" + id).remove();
        },
        error: function (err) {
            $("#result-sort-order").html("");
            $("#result-sort-order").html(
                '<em class="error">Xóa khối không thành công, vui lòng refresh lại trình duyệt và thử lại</em>'
            );
        },
    });
}

function emptyLandInput(e_tr) {
    $(e_tr).children('td').children('input').val('');
    $(e_tr).children('td').children('textarea').val('');
    $(e_tr).children('td').children('textarea').text('');
}
