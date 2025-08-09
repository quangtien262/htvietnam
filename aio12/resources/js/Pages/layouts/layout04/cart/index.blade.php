@extends('layouts.layout04.index')
@section('content')
    <div id="content" class="blog-wrapper blog-single page-wrapper">
        <div class="row row-large">
            <div class="large-9 col">
                <article id="post-980"
                    class="post-980 post type-post status-publish format-standard has-post-thumbnail hentry category-tin-tuc">
                    <div class="article-inner">
                        <header class="entry-header">
                            <div class="entry-header-text entry-header-text-bottom text-left">
                                <h6 class="entry-category is-xsmall">
                                    <a rel="category tag">Giỏ hàng</a>
                                </h6>

                                <h1 class="entry-title"></h1>
                                <div class="entry-divider is-divider small"></div>
                            </div>
                        </header>
                    </div>
                </article>
            </div>
        </div>

        <div class="row row-main">
            <div class="large-12 col">
                <div class="col-inner">
                    <div class="woocommerce">
                        <div class="woocommerce-notices-wrapper"></div>
                        <div class="woocommerce row row-large row-divided">
                            <div class="col large-7 pb-0 ">
                                @include('layouts.layout04.elements.cart.cart_content')
                            </div>

                            <div class="cart-collaterals large-5 col pb-0">
                                <div class="cart-sidebar col-inner ">
                                    <div class="cart_totals ">
                                        <form action="{{ route('cart.payment') }}" method="post">
                                            @csrf
                                            <table cellspacing="0">
                                                <thead>
                                                    <tr>
                                                        <th class="product-name" colspan="2">Cộng giỏ hàng</th>
                                                    </tr>
                                                </thead>
                                            </table>
                                            <table cellspacing="0" class="shop_table shop_table_responsive">
                                                <tbody>
                                                    <tr class="cart-subtotal">
                                                        <th>Tạm tính</th>
                                                        <td data-title="Tạm tính">{{ Cart::subtotal() }}₫
                                                        </td>
                                                    </tr>
                                                    <tr class="cart-subtotal">
                                                        <th>VAT </th>
                                                        <td data-title="Tạm tính">
                                                            {{ Cart::tax() }}₫
                                                        </td>
                                                    </tr>

                                                    <tr class="cart-subtotal">
                                                        <th>Phương thức thanh toán</th>
                                                        <td data-title="Tạm tính">Thanh toán sau khi nhận hàng</td>
                                                    </tr>
                                                    <tr class="order-total">
                                                        <th>Tổng</th>
                                                        <td data-title="Tổng"><strong>{{ Cart::total() }}₫</strong>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <div class="wc-proceed-to-checkout">
                                                @if (\Auth::guard('web')->check())
                                                    <button type="submit" class="checkout-button button alt wc-forward">
                                                        Gửi đơn hàng</button>
                                                @else
                                                    <div>
                                                        <div 
                                                            class="checkout-button button alt wc-forward"><a
                                                                href="{{ route('login') }}">Đăng nhập để đặt
                                                                hàng</a></div>

                                                    </div>
                                                @endif
                                            </div>
                                            <div class="coupon">
                                                <h3 class="widget-title"><i class="icon-tag"></i> Ghi chú thêm</h3>
                                                <textarea type="text" name="note" class="input-text" id="coupon_code" value="" placeholder="Ghi chú"></textarea>
                                            </div>
                                        </form>
                                    </div>
                                    <div class="cart-sidebar-content relative"></div>
                                </div>
                            </div>
                        </div>
                        <div class="cart-footer-content after-cart-content relative"></div>
                    </div>
                </div>
            </div>
        </div>

    </div>
@endsection
