<div id="login-form-popup" class="lightbox-content mfp-hide">
    <div class="woocommerce">
        <div class="woocommerce-notices-wrapper"></div>
        <div class="account-container lightbox-inner">
            <div class="account-login-inner">
                <h3 class="uppercase">Login</h3>
                <form action="{{ route('login') }}" method="post">
                    @csrf
                    <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <label for="username">{{__('user.username')}}<span class="required">*</span></label>
                        <input type="text"
                            class="woocommerce-Input woocommerce-Input--text input-text"
                            name="username"
                            id="username"
                            autocomplete="username"
                            value="" />
                    </p>
                    <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <label for="password">{{__('user.password')}}<span class="required">*</span></label>
                        <input class="woocommerce-Input woocommerce-Input--text input-text"
                            type="password"
                            name="password"
                            id="password"
                            autocomplete="current-password" />
                    </p>
                    <p class="form-row">
                        <label
                            class="woocommerce-form__label woocommerce-form__label-for-checkbox woocommerce-form-login__rememberme">
                            <input class="woocommerce-form__input woocommerce-form__input-checkbox" name="rememberme"
                                type="checkbox" id="rememberme" value="forever" /> <span>Remember me</span>
                        </label>
                        <input type="hidden" id="woocommerce-login-nonce" name="woocommerce-login-nonce"
                            value="955dc9c417" /><input type="hidden" name="_wp_http_referer" value="/" /> <button
                            type="submit"
                            class="woocommerce-button button woocommerce-form-login__submit wp-element-button"
                            name="login" value="Log in">Log in</button>
                    </p>
                </form>
            </div>
        </div>
    </div>
</div>


