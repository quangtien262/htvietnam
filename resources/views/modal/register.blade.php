<div class="modal fade" id="modalRegister" data-backdrop="static" tabindex="-1" aria-labelledby="exampleModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content content-register">

            <form action="{{ route('postRegister_api') }}" method="post">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Đăng ký tài khoản</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        {{-- Thoong tin tài khoản --}}
                        <div class="col-md-12">
                            <p class="title02">Thông tin tài khoản:
                                <hr />
                            </p>
                        </div>
                        <div class="col-md-12">
                            <div class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                <label for="username">Số điện thoại (Là tên đăng nhập) <span
                                        class="required _red">*</span></label>
                                <input type="text" class="woocommerce-Input woocommerce-Input--text input-text"
                                    name="username" id="username" autocomplete="username" value="" />
                            </div>
                        </div>
                        <div class="col-md-6">
                            <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                <label for="password">{{ __('user.password') }}<span
                                        class="required _red">*</span></label>
                                <input class="woocommerce-Input woocommerce-Input--text input-text" type="password"
                                    name="password" id="password" autocomplete="new-password" />
                            </p>
                        </div>
                        <div class="col-md-6">
                            <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                <label for="password">Xác nhận lại MK<span class="required _red">*</span></label>
                                <input class="woocommerce-Input woocommerce-Input--text input-text" type="password"
                                    name="password_confirmation" id="password_confirmation"
                                    autocomplete="current-password" />
                            </p>
                        </div>

                    </div>

                    {{-- Tạm ẩn phần chọn phương thức nhập liệu vì tính năng CCCD đang lỗi --}}
                    <div class="row" style="display:none;">
                        <div class="col-md-12">
                            <p class="title02">Chọn cách nhập liệu:
                            </p>
                        </div>
                        <div class="col-md-12">
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="input_method" id="input_method_image"
                                    value="camera">
                                <label class="form-check-label" for="input_method_image">
                                    Chọn từ ảnh CCCD
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="input_method"
                                    id="input_method_manual" value="manual" checked>
                                <label class="form-check-label" for="input_method_manual">
                                    Nhập liệu thủ công
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Tạm ẩn block upload ảnh CCCD vì tính năng đang lỗi --}}
                <div id="cccd_block" class="row" style="display:none">
                    {{-- Ảnh CCCD --}}
                    <div class="col-md-12">
                        <p class="title02">Ảnh CCCD:
                            <hr />
                        </p>
                    </div>
                    <div class="col-md-12">
                        <label>Ảnh CCCD mặt trước <span class="required _red">*</span></label>
                        <input type="file" accept="image/*" capture="environment" name="cccd_front" id="cccd_front"
                             />
                    </div>
                    <div class="col-md-12">
                        <label>Ảnh CCCD mặt sau <span class="required _red">*</span></label>
                        <input type="file" accept="image/*" capture="environment" name="cccd_back" id="cccd_back"
                             />
                    </div>
                </div>

                <div id="nhapThuCong" class="row">

                    {{-- Thông tin cá nhân --}}
                    <div class="col-md-12">
                        <p class="title02">Thông tin cá nhân:
                            <hr />
                        </p>
                    </div>
                    <div class="col-md-6">
                        <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                            <label for="name">Họ và tên<span class="required _red">*</span></label>
                            <input type="text" class="woocommerce-Input woocommerce-Input--text input-text" name="name"
                                id="name" value="" />
                        </p>
                    </div>
                    <div class="col-md-6">
                        <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                            <label for="email">{{ __('user.email') }}<span class="required _red">*</span></label>
                            <input type="email" class="woocommerce-Input woocommerce-Input--text input-text"
                                name="email" id="email" autocomplete="email" value="" />
                        </p>
                    </div>

                    <div class="col-md-6">
                        <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                            <label for="cccd">CCCD<span class="required _red">*</span></label>
                            <input type="text" class="woocommerce-Input woocommerce-Input--text input-text" name="cccd"
                                id="cccd" value="" />
                        </p>
                    </div>
                    <div class="col-md-6">
                        <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                            <label for="ngay_cap">Ngày cấp<span class="required _red">*</span></label>
                            <input type="text" class="woocommerce-Input woocommerce-Input--text input-text datepicker"
                                name="ngay_cap" id="ngay_cap" value="" autocomplete="off" />
                        </p>
                    </div>

                    <div class="col-md-12">
                        <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                            <label for="noi_cap">Nơi cấp<span class="required _red">*</span></label>
                            <select class="woocommerce-Input woocommerce-Input--text input-text" name="noi_cap"
                                id="noi_cap">
                                <option value="">Chọn nơi cấp</option>
                                <option value="Cục trưởng cục Cảnh sát">Cục trưởng cục Cảnh sát</option>
                                <option value="Bộ Công An">Bộ Công An</option>
                            </select>
                        </p>
                    </div>
                    <div class="col-md-12">
                        <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                            <label for="hktt">Thường trú<span class="required _red">*</span></label>
                            <input type="text" class="woocommerce-Input woocommerce-Input--text input-text" name="hktt"
                                id="hktt" value="" />
                        </p>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal"><i
                            class="fa-solid fa-circle-xmark"></i> {{ __('user.close')
                        }}
                    </button>

                    <button type="submit" class="btn btn-01"><i class="fa-solid fa-user-check"></i> {{
                        __('user.register') }}

                    </button>
                    <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
    (function ($) {
        $(document).ready(function () {
            // Init datepicker (bootstrap-datepicker required)
            if ($.fn.datepicker) {
                $('#modalRegister').on('shown.bs.modal', function () {
                    $('#ngay_cap').datepicker({
                        format: 'yyyy-mm-dd',
                        autoclose: true,
                        todayHighlight: true,
                        orientation: 'bottom auto'
                    });
                    // focus first input
                    $('#username').trigger('focus');
                });
            }

            const $form = $('#modalRegister').find('form');
            const $submit = $form.find('button[type="submit"]');
            const $spinner = $form.find('.spinner-border');

            $spinner.hide();

            function validateEmail(email) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            }

            function validatePhone(phone) {
                // simple VN phone validation: allow digits, +, spaces; length 9-15
                const p = phone.replace(/\s+/g, '');
                return /^[\d\+]{9,15}$/.test(p);
            }

            function validateCCCD(cccd) {
                const v = cccd.replace(/\s+/g, '');
                return /^[0-9]{9,12}$/.test(v);
            }

            function validateDate(d) {
                if (!d) return false;
                // Định dạng yyyy-mm-dd
                const parts = d.split('-');
                if (parts.length !== 3) return false;
                const yy = parseInt(parts[0], 10), mm = parseInt(parts[1], 10), dd = parseInt(parts[2], 10);
                if (isNaN(dd) || isNaN(mm) || isNaN(yy)) return false;
                if (mm < 1 || mm > 12) return false;
                const mdays = [31, (yy % 4 === 0 && (yy % 100 !== 0 || yy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                return dd >= 1 && dd <= mdays[mm - 1];
            }

            function showError(msg) {
                // use Bootstrap alert inside modal if available, fallback to alert()
                let $alert = $form.find('.js-form-alert');
                if (!$alert.length) {
                    $alert = $('<div class="alert alert-danger js-form-alert" role="alert" style="display:none;"></div>');
                    $form.find('.modal-body').prepend($alert);
                }
                $alert.text(msg).slideDown();
                setTimeout(() => $alert.slideUp(), 6000);
            }

            function showSuccess(msg) {
                let $alert = $form.find('.js-form-success');
                if (!$alert.length) {
                    $alert = $('<div class="alert alert-success js-form-success" role="alert" style="display:none;"></div>');
                    $form.find('.modal-body').prepend($alert);
                }
                $alert.text(msg).slideDown();
                setTimeout(() => $alert.slideUp(), 4000);
            }

            // Xử lý ẩn/hiện khối nhập liệu
            function toggleInputMethod() {
                if ($('#input_method_image').is(':checked')) {
                    $('#cccd_block').show();
                    $('#nhapThuCong').hide();
                } else {
                    $('#cccd_block').hide();
                    $('#nhapThuCong').show();
                }
            }

            // Gọi khi trang load
            toggleInputMethod();

            // Gọi khi thay đổi radio
            $('input[name="input_method"]').on('change', function () {
                toggleInputMethod();
            });

            $form.on('submit', function (e) {
                e.preventDefault();

                $form.find('.js-form-alert, .js-form-success').remove();

                // Kiểm tra số điện thoại và mật khẩu luôn cần
                const username = $.trim($form.find('[name="username"]').val() || '');
                const password = $form.find('[name="password"]').val() || '';
                const password_confirmation = $form.find('[name="password_confirmation"]').val() || '';

                if (!username) { showError('Số điện thoại không được để trống'); return; }
                if (!validatePhone(username)) { showError('Số điện thoại không đúng định dạng'); return; }
                if (!password) { showError('Mật khẩu không được để trống'); return; }
                if (password.length < 6) { showError('Mật khẩu phải ít nhất 6 ký tự'); return; }
                if (password !== password_confirmation) { showError('Mật khẩu xác nhận không khớp'); return; }

                // Nếu chọn nhập từ ảnh CCCD thì phải chọn đủ 2 file
                if ($('#input_method_image').is(':checked')) {
                    const cccdFront = $form.find('[name="cccd_front"]').val();
                    const cccdBack = $form.find('[name="cccd_back"]').val();
                    if (!cccdFront) { showError('Vui lòng chọn ảnh CCCD mặt trước'); return; }
                    if (!cccdBack) { showError('Vui lòng chọn ảnh CCCD mặt sau'); return; }
                }

                // Nếu chọn nhập thủ công thì validate thông tin cá nhân như cũ
                if ($('#input_method_manual').is(':checked')) {
                    // Chỉ validate thông tin cá nhân nếu chọn nhập thủ công
                    const name = $.trim($form.find('[name="name"]').val() || '');
                    const email = $.trim($form.find('[name="email"]').val() || '');
                    const cccd = $.trim($form.find('[name="cccd"]').val() || '');
                    const ngay_cap = $.trim($form.find('[name="ngay_cap"]').val() || '');
                    const noi_cap = $.trim($form.find('[name="noi_cap"]').val() || '');
                    const hktt = $.trim($form.find('[name="hktt"]').val() || '');

                    if (!name) { showError('Họ tên không được để trống'); return; }
                    if (!email) { showError('Email không được để trống'); return; }
                    if (!validateEmail(email)) { showError('Email không hợp lệ'); return; }
                    if (!cccd) { showError('CCCD không được để trống'); return; }
                    if (!validateCCCD(cccd)) { showError('CCCD phải là dãy số 9-12 chữ số'); return; }
                    if (!ngay_cap) { showError('Ngày cấp không được để trống'); return; }
                    if (!validateDate(ngay_cap)) { showError('Ngày cấp không đúng định dạng yyyy-mm-dd'); return; }
                    if (!noi_cap) { showError('Nơi cấp không được để trống'); return; }
                    if (!hktt) { showError('Thường trú không được để trống'); return; }
                }

                // Prepare ajax
                const action = $form.attr('action');
                const token = $form.find('input[name="_token"]').val();

                // Disable submit + show spinner
                $submit.prop('disabled', true);
                $spinner.show();

                // Submit via AJAX (expects JSON response)
                $.ajax({
                    url: action,
                    method: 'POST',
                    data: new FormData($form[0]),
                    processData: false,
                    contentType: false,
                    headers: {
                        'X-CSRF-TOKEN': token
                    },
                    dataType: 'json',
                    success: function (res) {
                        console.log('====================================');
                        console.log(res);
                        console.log('====================================');
                        if (res && res.status_code === 200) {
                            showSuccess(res.message || 'Đăng ký thành công');
                            window.location.href = '/user/';
                        } else {
                            if (res && res.errors) {
                                const msgs = [];
                                Object.values(res.errors).forEach(v => {
                                    if (Array.isArray(v)) msgs.push(v.join(' ')); else msgs.push(v);
                                });
                                showError(msgs.join(' - ') || (res.message || 'Đăng ký thất bại'));
                            } else {
                                showError(res.message || 'Đăng ký thất bại');
                            }
                        }
                    },
                    error: function (xhr) {
                        let msg = 'Có lỗi xảy ra, vui lòng tải lại trang và thử lại';
                        if (xhr.responseJSON) {
                            if (xhr.responseJSON.message) msg = xhr.responseJSON.message;
                            else if (xhr.responseJSON.errors) {
                                const msgs = [];
                                Object.values(xhr.responseJSON.errors).forEach(v => {
                                    if (Array.isArray(v)) msgs.push(v.join(' ')); else msgs.push(v);
                                });
                                msg = msgs.join(' - ');
                            }
                        }
                        showError(msg);
                    },
                    complete: function () {
                        $submit.prop('disabled', false);
                        $spinner.hide();
                    },
                    timeout: 20000
                });
            });
        });
    })(jQuery);
</script>
