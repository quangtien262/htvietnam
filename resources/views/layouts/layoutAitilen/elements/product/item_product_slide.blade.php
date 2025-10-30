@php
    $link = app('Helper')->getLinkProduct($product);
    $avatar = app('Helper')->getAvatarProduct($product);
@endphp
<div
    class="product-small col has-hover product type-product post-{{ $product->id }} status-publish instock product_cat-chua-phan-loai has-post-thumbnail shipping-taxable purchasable product-type-simple">
    <div class="col-inner">
        <div class="badge-container absolute left top z-1">
        </div>
        <div class="product-small box ">
            <div class="box-image">
                <div class="image-none">
                    <a href="{{ $link }}" aria-label="{{ $product->name_data }}">
                        <img width="300" height="300" src="{{ $avatar }}"
                            class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail"
                            alt="{{ $product->name_data }}" decoding="async" loading="lazy"
                            srcset="{{ $avatar }} 300w, {{ $avatar }} 150w, {{ $avatar }} 768w, {{ $avatar }} 600w, {{ $avatar }} 100w, {{ $avatar }}"
                            sizes="auto, (max-width: 300px) 100vw, 300px" />
                    </a>
                </div>
                <div class="image-tools is-small top right show-on-hover">
                </div>
                <div class="image-tools is-small hide-for-small bottom left show-on-hover">
                </div>
                <div class="image-tools grid-tools text-center hide-for-small bottom hover-slide-in show-on-hover">
                </div>
            </div>
            <div class="box-text box-text-products">
                <div class="title-wrapper">
                    <p class="name product-title woocommerce-loop-product__title">
                        <a href="{{ $link }}"
                            class="woocommerce-LoopProduct-link woocommerce-loop-product__link">{{ $product->name_data }}</a>
                    </p>
                </div>
                {{-- <div class="price-wrapper">
                    <span class="price"><span class="woocommerce-Price-amount amount">
                            <bdi>
                                <span class="woocommerce-Price-currencySymbol">
                                </span>
                                {{ number_format($product->gia_ban) }}
                            </bdi>
                        </span>
                    </span>
                </div> --}}
            </div>
        </div>
    </div>
</div>