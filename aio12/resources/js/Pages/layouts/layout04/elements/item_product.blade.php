@php
    $linkProduct = app('Helper')->getLinkProduct($product);
@endphp
<div
    class="product-small col has-hover product type-product post-1099 status-publish first instock product_cat-cham-soc-da-mat has-post-thumbnail shipping-taxable purchasable product-type-simple">
    <div class="col-inner">
        <div class="badge-container absolute left top z-1">
            {{--  --}}
        </div>
        <div class="product-small box">
            <div class="box-image">
                {{-- edit --}}
                {!! app('Helper')->fastEdit('products', $product->id) !!}

                <div class="image-cover">
                    <a href="{{ $linkProduct }}">
                        <img width="300" height="300" src="{{  $product->images['avatar'] ?? '' }}"
                            class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt=""
                            loading="lazy" srcset="" sizes="(max-width: 300px) 100vw, 300px" />

                    </a>
                </div>
                <div class="image-tools is-small top right show-on-hover"></div>
                <div class="image-tools is-small hide-for-small bottom left show-on-hover"></div>
                {{-- <div class="image-tools grid-tools text-center hide-for-small bottom hover-slide-in show-on-hover">
                    <a href="#" data-quantity="1"
                        class="add-to-cart-grid no-padding is-transparent product_type_simple add_to_cart_button ajax_add_to_cart"
                        data-product_id="1099" data-product_sku=""
                        aria-label="Thêm &ldquo; Collagen Cherry TheSem Hàn Quốc dạng bột (Hộp 30 gói)&rdquo; vào giỏ hàng"
                        rel="nofollow">
                        <div class="cart-icon tooltip is-small" title="Thêm vào giỏ hàng"><strong>+</strong></div>
                    </a>
                </div> --}}
            </div>

            <div class="box-text box-text-products">
                <div class="title-wrapper">
                    <p class="name product-title woocommerce-loop-product__title">
                    <h3 class="name-product" >
                        <a href="{{ $linkProduct }}"
                            class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                            {{ $product->name }}
                        </a>
                    </h3>
                    <p>
                        {!! app('Helper')->showPriceProduct($product, 'price', 'compare-price') !!}
                    </p>
                    </p>

                </div>

            </div>
        </div>
    </div>
</div>
