var $jq = jQuery.noConflict();
$jq(document).ready(function () {
    $jq("#btnAddLand").click(function () {
        $jq("#btnUpdateSortOrderLand").hide();
        $jq("#btnAddLand").hide();
    });

    $jq("#sort_order_block").click(function () {
        $jq("#btnUpdateSortOrderLand").show();
        $jq("#btnAddLand").show();
    });
});

/**
 * Cập nhật số lượng giỏ hàng
 */
function updateQty(cartId) {
    e = $jq("#" + cartId);
}

function productSupport(pname, pid) {
    $jq("#support-product-name").text(pname);
    $jq("#input-product-name").val(pname);
    $jq("#input-product-id").val(pid);
}

function ajaxLoadUrl(url, result) {
    $jq(result).html(
        '<img style="max-height:100px" class="img-loading" src="/images/loading/pink_loader.gif"/>'
    );
    $jq(result).attr('src', url);
    // $jq.ajax({
    //     type: "get",
    //     url: url,
    //     success: function (data) {
    //         $jq(result).html(data);
    //     },
    //     error: function (data) {
    //         $jq(result).html(
    //             "Có lỗi xảy ra, vui lòng tải lại trình duyệt và thử lại"
    //         );
    //     },
    // });
}

function addItem(e, eShow, next) {
    $jq(e).hide();
    $jq(eShow).show();
    $jq(next).show();
}

function submitForm(url, result) {
    $jq(result).html(
        '<img class="img-loading" src="/images/loading/loader.big.black.gif"/>'
    );
    $jq.ajax({
        type: "get",
        url: url,
        success: function (data) {
            $jq(result).html(data);
        },
        error: function (data) {
            $jq(result).html(
                "Có lỗi xảy ra, vui lòng tải lại trình duyệt và thử lại"
            );
        },
    });
}

function removeElement(e) {
    $jq(e).remove();
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
    $jq("#result-sort-order").html(
        '<img class="img-loading" src="/images/loading/loader.big.black.gif"/>'
    );
    $jq.ajax({
        headers: {
            "X-CSRF-Token": $jq('meta[name="csrf-token"]').attr("content"),
        },
        type: "post",
        url: "/adm/landingpage/sort-order",
        data: {
            data: $jq("#nestable-output").val(),
        },
        success: function (data) {
            $jq("#isReload").val("1");
            $jq("#result-sort-order").html("Cập nhật thứ tự thành công");
        },
        error: function (err) {
            $jq("#result-sort-order").html(
                '<em class="_red">Cập nhật thứ tự thất bại</em>'
            );
        },
    });
}

function closeSortOrder() {
    $jq("#result-sort-order").html(
        '<img class="img-loading" src="/images/loading/loader.big.black.gif"/>'
    );
    if ($jq("#isReload").val() === "1") {
        location.reload();
        return;
    }
    $jq("#btnCloseSsortOrder_hidden").click();
    $jq("#result-sort-order").html("");
}

function addLandingpage(id, menuId) {
    $jq("#content").html(
        '<img class="img-loading" src="/images/loading/loader.big.black.gif"/>'
    );
    $jq.ajax({
        headers: {
            "X-CSRF-Token": $jq('meta[name="csrf-token"]').attr("content"),
        },
        type: "post",
        url: "/adm/page-setting/create",
        data: {
            id: id,
            menu_id: menuId,
        },
        success: function (data) {
            console.log("data", data);
            $jq("#content").html(data);
        },
    });
}

function hideLand(e) {
    $jq("#result-sort-order").html(
        '<img class="img-loading" src="/images/loading/loader.big.black.gif"/>'
    );
    var id = $jq(e).val();
    var is_active = 1;
    if ($jq(e).is(":checked")) {
        is_active = 0;
    }

    $jq.ajax({
        headers: {
            "X-CSRF-Token": $jq('meta[name="csrf-token"]').attr("content"),
        },
        type: "post",
        url: "/adm/landingpage/active",
        data: {
            id: id,
            active: is_active,
        },
        success: function (data) {
            $jq("#isReload").val("1");
            $jq("#result-sort-order").html("");
            if (is_active == 1)
                $jq("#result-sort-order").html(
                    "Cài đặt <b>HIỂN THỊ</b> thành công"
                );
            else $jq("#result-sort-order").html("Cài đặt <b>ẨN</b> thành công");
        },
        error: function (err) {
            $jq("#result-sort-order").html("");
            $jq("#result-sort-order").html(
                '<em class="error">Ẩn khối không thành công, vui lòng refresh lại trình duyệt và thử lại</em>'
            );
        },
    });
}

function deleteConfirm(eConfirm) {
    $jq(eConfirm).show();
}

function cancelDeleteLand(eConfirm) {
    $jq(eConfirm).hide();
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
    $jq(e_tr).children('td').children('input').val('');
    $jq(e_tr).children('td').children('textarea').val('');
    $jq(e_tr).children('td').children('textarea').text('');
}


// $.ajax({
//   method: "POST",
//   url: "some.php",
//   data: { name: "John", location: "Boston" }
// })
//   .done(function( msg ) {
//     alert( "Data Saved: " + msg );
//   });