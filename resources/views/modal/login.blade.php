<div class="modal fade" id="modalLogin" tabindex="-1" aria-labelledby="exampleModalLabel" {{-- data-backdrop="static"
    --}} aria-hidden="true">
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
        </div>
    </div>
</div>
<script>
    document.addEventListener('DOMContentLoaded', function () {
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
                // redirect
                if(res.data.role && res.data.role === 'admin') {
                    window.location.href = '/adm';
                    return;
                }
                // window.location.reload();
                window.location.href = '{{ route('user.index') }}';
            } else {
                // Đăng nhập thất bại
                var msg = res.message || 'Đăng nhập thất bại!';
                if (res.errors) {
                    var arr = [];
                    for (var k in res.errors) {
                        arr.push(res.errors[k]);
                    }
                    msg = arr.join('<br>');
                }
                var alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-danger js-login-alert';
                alertDiv.style = 'margin-bottom:10px;';
                alertDiv.innerHTML = msg;
                var modalBody = loginForm.querySelector('.modal-body');
                if (modalBody) modalBody.prepend(alertDiv);
            }
        })
        .catch(function(error) {
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
});
</script>
