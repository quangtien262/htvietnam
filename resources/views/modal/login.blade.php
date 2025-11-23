<div class="modal fade" id="modalLogin" tabindex="-1" aria-labelledby="exampleModalLabel" data-backdrop="static"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">

            <form id="formLogin" action="{{ route('postLogin_api') }}" method="post">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">{{ __('user.login_account') }}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <label for="username">{{ __('user.username') }}<span class="required _red">*</span></label>
                        <input type="text" class="woocommerce-Input woocommerce-Input--text input-text" name="username"
                            id="username" autocomplete="username" value="" />
                    </p>
                    <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <label for="password">{{ __('user.password') }}<span class="required _red">*</span></label>
                        <input class="woocommerce-Input woocommerce-Input--text input-text" type="password"
                            name="password" id="password" autocomplete="current-password" />
                    </p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal"><i
                            class="fa-solid fa-circle-xmark"></i> {{ __('user.close') }}</button>
                    <button type="submit" class="btn btn-01"><i class="fa-solid fa-right-to-bracket"></i> {{
                        __('user.login') }}</button>
                </div>
            </form>

            {{-- formChangePassword --}}
            <form id="formChangePassword" action="{{ route('requireChangePassword') }}" method="post"
                style="display:none">
                @csrf
                <input id="usernameChangepw" type="text" name="username_changepw" value="" />
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">
                        <span class="_red">YÊU CẦU ĐỔI MẬT KHẨU</span>
                        <br />
                        <em class="_red">Hãy tạo mật khẩu mới bảo mật hơn để tiếp tục</em>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">

                    <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <label for="username">Mật khẩu mới<span class="required _red">*</span></label>
                        <input type="password" class="woocommerce-Input woocommerce-Input--text input-text"
                            name="password_new" id="password_new" value="" />
                    </p>
                    <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <label for="password">Xác nhận mật khẩu mới<span class="required _red">*</span></label>

                        <input type="password" class="woocommerce-Input woocommerce-Input--text input-text"
                            name="password_confirm" id="password_confirm" value="" />
                    </p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">
                        <i class="fa-solid fa-circle-xmark"></i> {{ __('user.close') }}</button>
                    <button type="submit" class="btn btn-01"><i class="fa-solid fa-right-to-bracket"></i>Xác nhận Đổi
                        mật khẩu</button>
                </div>
            </form>
        </div>
    </div>
</div>

<style>
    .alert-success {
        color: #155724;
        background-color: #d4edda;
        border-color: #c3e6cb;
        background-color: #d0f7c3 !important;
        font-weight: bold;
    }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function () {
    // login form submit
    var loginForm = document.querySelector('#formLogin');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function (e) {
        // Xóa thông báo lỗi cũ nếu có
        var oldAlert = loginForm.querySelector('.js-login-alert');
        if (oldAlert) oldAlert.remove();

        var username = loginForm.querySelector('[name="username"]').value.trim();
        var password = loginForm.querySelector('[name="password"]').value;

        var errors = [];
        if (!username) errors.push('Vui lòng nhập tên đăng nhập.');
        if (!password) errors.push('Vui lòng nhập mật khẩu.');

        if (errors.length > 0) {
            e.preventDefault();
            // Hiển thị lỗi ngay trên form
            var alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger js-login-alert';
            alertDiv.style = 'margin-bottom:10px;';
            alertDiv.innerHTML = errors.join('<br>');
            var modalBody = loginForm.querySelector('.modal-body');
            if (modalBody) modalBody.prepend(alertDiv);
            return;
        }

        // Xử lý AJAX login
        e.preventDefault();
        var formData = new FormData(loginForm);

        // Hiển thị loading
        var submitBtn = loginForm.querySelector('button[type="submit"]');
        var oldText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang đăng nhập...';
        var csrfToken = loginForm.querySelector('input[name="_token"]').value;
        fetch(loginForm.action, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: formData,
            credentials: 'same-origin'
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(res) {
            if (res && res.status_code === 200) {
                // Đăng nhập thành công
                var alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-success js-login-alert';
                alertDiv.style = 'margin-bottom:10px;';
                alertDiv.innerHTML = res.message || 'Đăng nhập thành công, chuyển hướng...';

                if(res.data.role && res.data.role === 'user' && res.data.change_pw) {
                    // ẩn form login, hiện form change password
                    document.querySelector('#formLogin').style.display = 'none';
                    document.querySelector('#formChangePassword').style.display = 'block';
                    document.querySelector('#usernameChangepw').value = res.data.username;

                    return;
                }

                // redirect
                if(res.data.role && res.data.role === 'admin') {
                    window.location.href = '/w-aio/?p=home';
                    return;
                }
                // window.location.reload();
                window.location.href = '/user/';
            } else {
                // Đăng nhập thất bại
                var msg = res.message || 'Đăng nhập thất bại!';
                // if (res.errors) {
                //     var arr = [];
                //     for (var k in res.errors) {
                //         arr.push(res.errors[k]);
                //     }
                //     msg = arr.join('<br>');
                // }
                console.log('Login error message:', res.message);
                var alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-danger js-login-alert';
                alertDiv.style = 'margin-bottom:10px;';
                alertDiv.innerHTML = msg;
                var modalBody = loginForm.querySelector('.modal-body');
                if (modalBody) modalBody.prepend(alertDiv);
            }
        })
        .catch(function(error) {
            console.log('errorrrr', error);
            var alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger js-login-alert';
            alertDiv.style = 'margin-bottom:10px;';
            alertDiv.innerHTML = 'Có lỗi xảy ra, vui lòng thử lại!';
            var modalBody = loginForm.querySelector('.modal-body');
            if (modalBody) modalBody.prepend(alertDiv);
        })
        .finally(function() {
            submitBtn.disabled = false;
            submitBtn.innerHTML = oldText;
        });
    });

    // Change password form submit
    var changePasswordForm = document.querySelector('#formChangePassword');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Xóa thông báo lỗi cũ nếu có
            var oldAlert = changePasswordForm.querySelector('.js-changepw-alert');
            if (oldAlert) oldAlert.remove();

            var passwordNew = changePasswordForm.querySelector('[name="password_new"]').value;
            var passwordConfirm = changePasswordForm.querySelector('[name="password_confirm"]').value;

            var errors = [];
            if (!passwordNew) errors.push('Vui lòng nhập mật khẩu mới.');
            if (!passwordConfirm) errors.push('Vui lòng xác nhận mật khẩu mới.');
            if (passwordNew && passwordConfirm && passwordNew !== passwordConfirm) {
                errors.push('Mật khẩu xác nhận không khớp.');
            }
            if (passwordNew && passwordNew.length < 6) {
                errors.push('Mật khẩu mới phải có ít nhất 6 ký tự.');
            }

            if (errors.length > 0) {
                // Hiển thị lỗi ngay trên form
                var alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-danger js-changepw-alert';
                alertDiv.style = 'margin-bottom:10px;';
                alertDiv.innerHTML = errors.join('<br>');
                var modalBody = changePasswordForm.querySelector('.modal-body');
                if (modalBody) modalBody.prepend(alertDiv);
                return;
            }

            // Xử lý AJAX change password
            var formData = new FormData(changePasswordForm);

            // Hiển thị loading
            var submitBtn = changePasswordForm.querySelector('button[type="submit"]');
            var oldText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang xử lý...';

            var csrfToken = changePasswordForm.querySelector('input[name="_token"]').value;

            fetch(changePasswordForm.action, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: formData,
                credentials: 'same-origin'
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(res) {
                if (res && res.status_code === 200) {
                    // Đổi mật khẩu thành công
                    var alertDiv = document.createElement('div');
                    alertDiv.className = 'alert alert-success js-changepw-alert';
                    alertDiv.style = 'margin-bottom:10px;';
                    alertDiv.innerHTML = res.message || 'Đổi mật khẩu thành công, đang chuyển hướng...';
                    var modalBody = changePasswordForm.querySelector('.modal-body');
                    if (modalBody) modalBody.prepend(alertDiv);

                    // Sau khi đổi mật khẩu thành công, xử lý login như form login
                    setTimeout(function() {
                        window.location.href = '/user/';
                    }, 1000);
                } else {
                    // Đổi mật khẩu thất bại
                    var msg = res.message || 'Đổi mật khẩu thất bại!';
                    if (res.errors) {
                        var arr = [];
                        for (var k in res.errors) {
                            arr.push(res.errors[k]);
                        }
                        msg = arr.join('<br>');
                    }
                    var alertDiv = document.createElement('div');
                    alertDiv.className = 'alert alert-danger js-changepw-alert';
                    alertDiv.style = 'margin-bottom:10px;';
                    alertDiv.innerHTML = msg;
                    var modalBody = changePasswordForm.querySelector('.modal-body');
                    if (modalBody) modalBody.prepend(alertDiv);
                }
            })
            .catch(function(error) {
                console.log('error', error);
                var alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-danger js-changepw-alert';
                alertDiv.style = 'margin-bottom:10px;';
                alertDiv.innerHTML = 'Có lỗi xảy ra, vui lòng thử lại!';
                var modalBody = changePasswordForm.querySelector('.modal-body');
                if (modalBody) modalBody.prepend(alertDiv);
            })
            .finally(function() {
                submitBtn.disabled = false;
                submitBtn.innerHTML = oldText;
            });
        });
    }
});
</script>
