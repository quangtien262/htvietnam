<div class="modal fade" id="modalLogin" data-backdrop="static" tabindex="-1" aria-labelledby="exampleModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">

            <form action="{{ route('login') }}" method="post">
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
                        <input type="text" class="woocommerce-Input woocommerce-Input--text input-text" required
                            name="username" id="username" autocomplete="username" value="" />
                    </p>
                    <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <label for="password">{{ __('user.password') }}<span class="required _red">*</span></label>
                        <input class="woocommerce-Input woocommerce-Input--text input-text" type="password" required
                            name="password" id="password" autocomplete="current-password" />
                    </p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">{{ __('user.close') }}</button>
                    <button type="submit" class="btn btn-01">{{ __('user.login') }}</button>
                </div>
            </form>
        </div>
    </div>
</div>
