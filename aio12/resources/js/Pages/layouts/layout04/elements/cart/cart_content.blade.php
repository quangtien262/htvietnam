<form class="woocommerce-cart-form" action="{{ route('cart.update') }}" method="POST">
    @csrf
    {{ method_field('PATCH') }}
    <div class="cart-wrapper sm-touch-scroll">
        <table class="shop_table shop_table_responsive cart woocommerce-cart-form__contents" cellspacing="0">
            <thead>
                <tr>
                    <th class="product-name" colspan="3">Sản phẩm</th>
                    <th>Giá </th>
                    <th class="product-quantity">Số lượng</th>
                    <th>Tạm tính</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($cart as $key => $val)
                    @php
                        $product = $val->options['product'];
                        $link = app('Helper')->getLinkProduct($product);
                    @endphp
                    <tr class="woocommerce-cart-form__cart-item cart_item">
                        <td class="product-remove">
                            <a href="{{ route('cart.delete', [$key]) }}" class="remove" aria-label="Xóa sản phẩm này"
                                data-product_id="" data-product_sku="">×</a>
                        </td>
                        <td class="product-thumbnail">
                            <a href="{{ $link }}">
                                <img width="300" height="300" src="{{ $product->images['avatar'] }}"
                                    class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt=""
                                    loading="lazy" sizes="(max-width: 300px) 100vw, 300px"></a>
                        </td>
                        <td class="product-name" data-title="Sản phẩm">
                            <a href="{{ $link }}">{{ $val->name }}</a>
                            ({{ $val->taxRate }})
                            <div class="show-for-small mobile-product-price">
                                <span class="mobile-product-price__qty">1 x </span>

                            </div>
                        </td>
                        <td>

                            {{ number_format($val->price, 0, '.', '.') }} ₫


                        </td>

                        <td class="product-quantity" data-title="Số lượng">
                            <div class="quantity buttons_added form-flat">
                                <input type="button" value="-"
                                    onClick="var result = document.getElementById('qty[{{ $key }}]'); var qtypro = result.value; if( !isNaN( qtypro ) &amp;&amp; qtypro &gt; 1 ) result.value--;return false;"
                                    class="minus button is-form">
                                <label class="screen-reader-text"
                                    for="quantity_64119adea865a">{{ $val->name }}</label>
                                <input type="number" id="qty[{{ $key }}]" class="input-text qty text"
                                    step="1" min="0" max="" name="qty[{{ $key }}]"
                                    value="{{ $val->qty }}" onchange="updateQty('{{ $val->id }}')"
                                    title="SL" size="4" placeholder="" inputmode="numeric">
                                <input type="button" value="+"
                                    onClick="var result = document.getElementById('qty[{{ $key }}]'); var qtypro = result.value; if( !isNaN( qtypro )) result.value++;return false;"
                                    class="plus button is-form" />

                            </div>
                        </td>
                        <td>
                            {{ number_format($val->price * $val->qty, 0, '.', '.') }} ₫
                        </td>
                    </tr>
                @endforeach


                <tr>
                    <td colspan="6" class="actions clear">
                        <div class="continue-shopping pull-left text-left">
                            <a class="button-continue-shopping button primary is-outline" href="{{ route('home') }}">
                                ←&nbsp;Tiếp tục xem sản phẩm </a>
                        </div>
                        <button type="submit" class="button primary mt-0 pull-left small" name="update_cart"
                            value="Cập nhật giỏ hàng">Cập nhật giỏ hàng</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</form>
