
<div id="wide-nav" class="header-bottom wide-nav hide-for-medium">
    <div class="flex-row container">
        <div class="flex-col hide-for-medium flex-left">
            {!! app('Helper')->menuLayout01() !!}
        </div>
        <div class="flex-col hide-for-medium flex-right flex-grow">
            <ul class="nav header-nav header-bottom-nav nav-right  nav-size-medium nav-spacing-xlarge nav-uppercase">
                <li class="header-search header-search-dropdown has-icon has-dropdown menu-item-has-children">
                    <a href="#" aria-label="Search" class="is-small"><i class="icon-search"></i></a>
                    <ul class="nav-dropdown nav-dropdown-simple">
                        <li class="header-search-form search-form html relative has-icon">
                            <div class="header-search-form-wrapper">
                                <div class="searchform-wrapper ux-search-box relative is-normal">
                                    <form role="search" method="get" class="searchform"
                                        action="{{ route('searchProduct') }}">
                                        <div class="flex-row relative">
                                            <div class="flex-col flex-grow">
                                                <label class="screen-reader-text"
                                                    for="woocommerce-product-search-field-0">Search for:</label>
                                                <input type="search" id="woocommerce-product-search-field-0"
                                                    class="search-field mb-0" placeholder="Search&hellip;" value=""
                                                    name="keyword"/>
                                                <input type="hidden" name="post_type" value="product" />
                                            </div>
                                            <div class="flex-col">
                                                <button type="submit" value="Search"
                                                    class="ux-search-submit submit-button secondary button wp-element-button icon mb-0"
                                                    aria-label="Submit">
                                                    <i class="icon-search"></i> </button>
                                            </div>
                                        </div>
                                        <div class="live-search-results text-left z-top"></div>
                                    </form>
                                </div>
                            </div>
                        </li>
                    </ul>
                </li>
                <li class="account-item has-icon">
                    @if (auth()->guard('admin_users')->check()) 
                        <a class="nav-top-link nav-top-not-logged-in is-small" target="new" href="/adm">
                            <i class="icon-user"></i>
                        </a>
                    @else
                        {{-- <a class="nav-top-link nav-top-logged-in is-small" data-open="#logout-form-popup">
                            <i class="icon-user"></i>
                        </a> --}}
                        <a class="nav-top-link nav-top-logged-in is-small" data-toggle="modal" data-target="#modalLogin">
                            <i class="icon-user"></i>
                        </a>
                        
                    @endif
                </li>
                <li class="cart-item has-icon">
                    {{-- <a href=""
                        class="header-cart-link off-canvas-toggle nav-top-link is-small" data-open="#cart-popup"
                        data-class="off-canvas-cart" title="Cart" data-pos="right">
                        <i class="icon-shopping-cart" data-icon-label="0">
                        </i>
                    </a> --}}
                    <!-- Cart Sidebar Popup -->
                    {{-- <div id="cart-popup" class="mfp-hide widget_shopping_cart">
                        <div class="cart-popup-inner inner-padding">
                            <div class="cart-popup-title text-center">
                                <h4 class="uppercase">Cart</h4>
                                <div class="is-divider"></div>
                            </div>
                            <div class="widget_shopping_cart_content">
                                <p class="woocommerce-mini-cart__empty-message">No products in the cart.</p>
                            </div>
                            <div class="cart-sidebar-content relative"></div>
                        </div>
                    </div> --}}
                </li>
            </ul>
        </div>
    </div>
</div>

