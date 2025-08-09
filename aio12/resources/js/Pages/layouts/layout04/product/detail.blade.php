@extends('layouts.layout04.index')
@section('content')
    <main id="main" class="">
        <div class="shop-container">
            <div class="page-title-inner flex-row medium-flex-wrap container">
                <div class="flex-col flex-grow medium-text-center">
                    <div class="is-small">
                        <nav class="woocommerce-breadcrumb breadcrumbs uppercase"><a href="/">Trang chủ</a> <span
                                class="divider">/</span> {{ $product->name }}
                        </nav>
                    </div>

                </div>
            </div>

            <div class="container">
                <div class="woocommerce-notices-wrapper"></div>
            </div>
            <div id="product-1099"
                class="product type-product post-1099 status-publish first instock product_cat-cham-soc-da-mat has-post-thumbnail shipping-taxable purchasable product-type-simple">
                <div class="product-container">
                    <div class="product-main">
                        <div class="row content-row mb-0">
                            <div class="product-gallery col large-5">
                                <div class="product-images relative mb-half has-hover woocommerce-product-gallery woocommerce-product-gallery--with-images woocommerce-product-gallery--columns-4 images"
                                    data-columns="4">
                                    <div class="badge-container is-larger absolute left top z-1"></div>

                                    <div class="image-tools absolute top show-on-hover right z-3"></div>

                                    <figure
                                        class="woocommerce-product-gallery__wrapper product-gallery-slider slider slider-nav-small mb-half"
                                        data-flickity-options='{ "cellAlign": "center","wrapAround": true,"autoPlay": false,"prevNextButtons":true,"adaptiveHeight": true,"imagesLoaded": true,"lazyLoad": 1,"dragThreshold" : 15,"pageDots": false,"rightToLeft": false }'>
                                        @php
                                            $img_control = '';
                                        @endphp
                                        @if (!empty($product->images['images']))
                                            @foreach ($product->images['images'] as $pimg)
                                                @php
                                                    $img_control .=
                                                        '<div class="col is-nav-selected first">
                                                            <a> <img
                                                                    src="' .
                                                        $pimg .
                                                        '"
                                                                    alt=""
                                                                    width="300"
                                                                    height="300"
                                                                    class="attachment-woocommerce_thumbnail"
                                                                />
                                                            </a>
                                                        </div>';
                                                @endphp
                                                <div data-thumb="" data-thumb-alt=""
                                                    class="woocommerce-product-gallery__image slide first ">
                                                    <a>
                                                        <img width="600" height="600" src="{{ $pimg }}"
                                                            class="wp-post-image skip-lazy image " alt=""
                                                            loading="lazy"
                                                            title="collagen-cherry-thesem-han-quoc-dang-bot-hop-30-goi"
                                                            data-caption="" data-src="" data-large_image=""
                                                            data-large_image_width="600" data-large_image_height="600"
                                                            srcset="" sizes="(max-width: 600px) 100vw, 600px" />
                                                    </a>
                                                </div>
                                            @endforeach
                                        @endif
                                    </figure>


                                </div>

                                <div class="product-thumbnails thumbnails slider-no-arrows slider row row-small row-slider slider-nav-small small-columns-4"
                                    data-flickity-options='{"cellAlign": "left","wrapAround": false,"autoPlay": false,"prevNextButtons": true,"asNavFor": ".product-gallery-slider","percentPosition": true,"imagesLoaded": true,"pageDots": false,"rightToLeft": false,"contain": true}'>

                                    {!! $img_control !!}

                                </div>
                            </div>

                            <div class="product-info summary col-fit col entry-summary product-summary form-flat">
                                <h1 class="product-title product_title entry-title">
                                    {{ $product->name }}
                                </h1>

                                {{-- edit --}}
                                {!! app('Helper')->fastEdit('products', $product->id) !!}

                                <div class="price-wrapper">
                                    {!! app('Helper')->showPriceProduct($product, 'price', 'compare-price') !!}

                                </div>
                                <p class="stock in-stock">Còn hàng</p>

                                <form class="cart" action="" method="post" enctype="multipart/form-data">
                                    <div class="sticky-add-to-cart-wrapper">
                                        <div class="sticky-add-to-cart">
                                            <div class="sticky-add-to-cart__product">
                                                <img src="{{ $product->images['avatar'] ?? '' }}" alt=""
                                                    class="sticky-add-to-cart-img" />
                                                <div class="product-title-small hide-for-small">
                                                    <strong>{{ $product->name }}</strong>
                                                </div>
                                                <div><strong>{{ $product->price }}</strong></div>
                                            </div>
                                            @if ($product->price)
                                                <form action="{{ route('cart.add') }}" method="post">
                                                    @csrf
                                                    <div class="quantity buttons_added form-flat">
                                                        <input type="hidden" name="pid" value="{{ $product->id }}" />
                                                        <input
                                                            onclick="var result = document.getElementById('qtym'); var qtypro = result.value; if( !isNaN( qtypro ) &amp;&amp; qtypro > 1 ) result.value--;return false;"
                                                            type="button" value="-" class="minus button is-form" />
                                                        <label class="screen-reader-text" for="qtym"></label>
                                                        <input type="number" id="qtym" class="input-text qty text"
                                                            step="1" min="1"
                                                            onkeypress="if ( isNaN(this.value + String.fromCharCode(event.keyCode) )) return false;"
                                                            onchange="if(this.value == 0)this.value=1;" max=""
                                                            name="quantity" value="1" title="SL" size="4"
                                                            placeholder="" inputmode="numeric" />
                                                        <input
                                                            onclick="var result = document.getElementById('qtym'); var qtypro = result.value; if( !isNaN( qtypro )) result.value++;return false;"
                                                            type="button" value="+" class="plus button is-form" />
                                                    </div>

                                                    <input type="hidden" name="pid" value="{{ $product->id }}" />
                                                    <button type="submit" name="add-to-cart" value="add"
                                                        class="single_add_to_cart_button button alt">Thêm vào giỏ
                                                        hàng</button>


                                                </form>
                                            @endif
                                            {{-- <button type="button" class="button buy_now_button">
											Mua ngay
										</button> --}}
                                            <input type="hidden" name="is_buy_now" class="is_buy_now" value="0"
                                                autocomplete="off" />
                                            <script>
                                                jQuery(document).ready(function() {
                                                    jQuery('body').on('click', '.buy_now_button', function(e) {
                                                        e.preventDefault();
                                                        var thisParent = jQuery(this).parents('form.cart');
                                                        if (jQuery('.single_add_to_cart_button', thisParent).hasClass('disabled')) {
                                                            jQuery('.single_add_to_cart_button', thisParent).trigger('click');
                                                            return false;
                                                        }
                                                        thisParent.addClass('devvn-quickbuy');
                                                        jQuery('.is_buy_now', thisParent).val('1');
                                                        jQuery('.single_add_to_cart_button', thisParent).trigger('click');
                                                    });
                                                });
                                            </script>
                                        </div>
                                    </div>
                                </form>

                                {{-- product info --}}
                                @php
                                    $productInfo = app('Helper')->getProductInfo([], 0);
                                @endphp
                                <div class="row row-sp-them" id="row-259180412">
                                    <div id="col-1176051057" class="col small-12 large-12">
                                        <div class="col-inner">
                                            <div class="row" id="row-65757493">
                                                {{-- loop info --}}
                                                @foreach ($productInfo as $info)
                                                    <div id="col-" class="col medium-6 small-12 large-6">
                                                        <div class="col-inner">
                                                            <div class="icon-box featured-box icon-box-left text-left">
                                                                <div class="icon-box-img" style="width: 34px">
                                                                    <div class="icon">
                                                                        <div class="icon-inner">
                                                                            <img width="32" height="32"
                                                                                src="{{ $info->image }}"
                                                                                class="attachment-medium size-medium"
                                                                                alt="" loading="lazy"
                                                                                srcset=""
                                                                                sizes="(max-width: 32px) 100vw, 32px" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="icon-box-text last-reset">
                                                                    <h4>{{ $info->name }}</h4>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                @endforeach
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="product_meta">
                                    <b><span class="posted_in">HOTLINE: </span></b>
                                </div>
                                <div class="social-icons share-icons share-row relative">
                                    <a href="tel:{{ $config->phone }}"
                                        onclick="window.open(this.href,this.title,'width=500,height=500,top=300px,left=300px');  return false;"
                                        rel="noopener noreferrer nofollow" target="_blank"
                                        class="icon button circle is-outline tooltip linkedin" title="Share on LinkedIn"
                                        aria-label="Share on LinkedIn">
                                        <div class="" style="display: flex">
                                            <i class="icon-phone" style="padding-top: 2px; font-size: 25px"> </i>
                                            <p style="color: red; padding-left: 10px; font-size:30px">{{ $config->phone }}
                                            </p>
                                        </div>

                                    </a>
                                </div>
                            </div>

                            <div id="product-sidebar" class="col large-3 hide-for-medium product-sidebar-small">
                                <aside id="woocommerce_products-4" class="widget woocommerce widget_products">
                                    <span class="widget-title shop-sidebar">Sản Phẩm Mới Nhất</span>
                                    <div class="is-divider small"></div>
                                    <ul class="product_list_widget">
                                        @foreach ($productLatest->take(6) as $plt)
                                            <li>
                                                <a href="{{ app('Helper')->getLinkProduct($plt) }}">
                                                    <img width="100" height="100"
                                                        src="{{ $plt->images['avatar'] }}"
                                                        class="attachment-woocommerce_gallery_thumbnail size-woocommerce_gallery_thumbnail"
                                                        alt="" loading="lazy" srcset=""
                                                        sizes="(max-width: 100px) 100vw, 100px" />
                                                    <span class="product-title">{{ $plt->name }}</span>
                                                </a>

                                                <a href="{{ app('Helper')->getLinkProduct($plt) }}"
                                                    class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                                                    {!! app('Helper')->showPriceProduct($plt, 'price', 'compare-price') !!}
                                                </a>
                                            </li>
                                        @endforeach
                                    </ul>
                                </aside>
                            </div>
                        </div>
                    </div>

                    <div class="product-footer">
                        <div class="container">
                            <div class="woocommerce-tabs wc-tabs-wrapper container tabbed-content">
                                <ul class="tabs wc-tabs product-tabs small-nav-collapse nav nav-uppercase nav-left"
                                    role="tablist">
                                    <li class="description_tab active" id="tab-title-description" role="tab"
                                        aria-controls="tab-description">
                                        <h3 style=""><a style="color: #000; font-weight: bold;font-size: 30px"
                                                href="#tab-description"> Mô tả </a></h3>
                                    </li>
                                </ul>
                                <div class="tab-panels">
                                    <div class="woocommerce-Tabs-panel woocommerce-Tabs-panel--description panel entry-content active"
                                        id="tab-description" role="tabpanel" aria-labelledby="tab-title-description">

                                        {!! $product->content !!}
                                    </div>

                                </div>
                            </div>

                            <div class="related related-products-wrapper product-section">
                                <h3
                                    class="product-section-title container-width product-section-title-related pt-half pb-half uppercase">
                                    Sản phẩm tương tự
                                </h3>

                                <div class="row large-columns-5 medium-columns-3 small-columns-2 row-small slider row-slider slider-nav-reveal slider-nav-push"
                                    data-flickity-options='{"imagesLoaded": true, "groupCells": "100%", "dragThreshold" : 5, "cellAlign": "left","wrapAround": true,"prevNextButtons": true,"percentPosition": true,"pageDots": false, "rightToLeft": false, "autoPlay" : false}'>

                                    @foreach ($product_lienquan as $product)
                                        @include('layouts.layout04.elements.item_product')
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- shop container -->
    </main>
    <!-- #main -->
    <!-- #main -->
@endsection
