@extends('layouts.layout01.lay01')

@section('content')
    <main id="main" class="">
        <div class="shop-container">
            <div class="container">
                <div class="woocommerce-notices-wrapper"></div>
            </div>
            <div id="product-808"
                class="product type-product post-808 status-publish first instock product_cat-chua-phan-loai has-post-thumbnail shipping-taxable purchasable product-type-simple">

                {{-- breadcrumbs --}}
                <section class="section dau-trang-section dark has-parallax" id="section_320154646">
                    <div class="bg section-bg fill bg-fill parallax-active bg-loaded" data-parallax-container=".section"
                        data-parallax-background="" data-parallax="-7"
                        style="height: 388.923px; transform: translate3d(0px, -95.35px, 0px); backface-visibility: hidden;">
                        <div class="section-bg-overlay absolute fill"></div>
                    </div>
                    <div class="section-content relative">
                        <div class="row align-middle" id="row-1345272763">
                            <div id="col-914956584" class="col medium-6 small-12 large-6">
                                <div class="col-inner">
                                    <div class="tieu-de">
                                        <h1 class="entry-title is-larger uppercase pb-0 pt-0 mb-0">
                                            {{ $menu['menu']->name }}
                                        </h1>
                                    </div>
                                </div>
                            </div>
                            <div id="col-526786999" class="col medium-6 small-12 large-6">
                                <div class="col-inner text-right">
                                    <nav aria-label="breadcrumbs" class="rank-math-breadcrumb">
                                        <p>
                                            <a href="/">Trang chủ</a><span class="separator"> / </span>
                                            <a href="">{{ $menu['menu']->name }}</a>
                                            <br />
                                            <span class="last">Lorem stet clita kasd</span>
                                        </p>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                    <style>
                        #section_320154646 {
                            padding-top: 60px;
                            padding-bottom: 60px;
                        }

                        #section_320154646 .section-bg-overlay {
                            background-color: rgba(0, 0, 0, 0.924);
                        }

                        #section_320154646 .section-bg.bg-loaded {
                            background-image: url(/layouts/01/images/bg/img3.jpg);
                        }

                        #section_320154646 .ux-shape-divider--top svg {
                            height: 150px;
                            --divider-top-width: 100%;
                        }

                        #section_320154646 .ux-shape-divider--bottom svg {
                            height: 150px;
                            --divider-width: 100%;
                        }
                    </style>
                </section>


                <div class="row content-row row-divided row-large row-reverse">
                    <div id="product-sidebar" class="col large-4 hide-for-medium shop-sidebar ">

                        {{-- Tìm kiếm --}}
                        <aside id="search-2" class="widget widget_search">
                            <span class="widget-title shop-sidebar">Tìm kiếm sản phẩm</span>
                            <div class="is-divider small"></div>
                            <form method="get" class="searchform" action="" role="search">
                                <div class="flex-row relative">
                                    <div class="flex-col flex-grow">
                                        <input type="search" class="search-field mb-0" name="s" value=""
                                            id="s" placeholder="Search&hellip;" />
                                    </div>
                                    <div class="flex-col">
                                        <button type="submit"
                                            class="ux-search-submit submit-button secondary button icon mb-0"
                                            aria-label="Submit">
                                            <i class="icon-search"></i> </button>
                                    </div>
                                </div>
                                <div class="live-search-results text-left z-top"></div>
                            </form>
                        </aside>

                        {{-- Sản phẩm mới --}}
                        <aside id="woocommerce_products-2" class="widget woocommerce widget_products">
                            <span class="widget-title shop-sidebar">Sản phẩm mới</span>
                            <div class="is-divider small"></div>
                            <ul class="product_list_widget">
                                @foreach ($productLatest as $pro)
                                    @include('layouts.layout01.elements.product.item_product', [
                                        'product' => $pro,
                                    ])
                                @endforeach
                            </ul>
                        </aside>

                    </div>

                    {{-- content product --}}
                    <div class="col large-8">
                        <div class="product-main">
                            <div class="row">
                                <div class="large-5 col">
                                    <div class="product-images relative mb-half has-hover woocommerce-product-gallery woocommerce-product-gallery--with-images woocommerce-product-gallery--columns-4 images"
                                        data-columns="4">
                                        <div class="badge-container is-larger absolute left top z-1"></div>
                                        <div class="image-tools absolute top show-on-hover right z-3"></div>

                                        {{-- image gallery --}}
                                        <figure
                                            class="woocommerce-product-gallery__wrapper product-gallery-slider slider slider-nav-small mb-half"
                                            data-flickity-options='{
                                        "cellAlign": "center",
                                        "wrapAround": true,
                                        "autoPlay": false,
                                        "prevNextButtons":true,
                                        "adaptiveHeight": true,
                                        "imagesLoaded": true,
                                        "lazyLoad": 1,
                                        "dragThreshold" : 15,
                                        "pageDots": false,
                                        "rightToLeft": false       }'>
                                            @foreach ($images as $image)
                                                <div data-thumb="{{ $image }}" data-thumb-alt=""
                                                    class="woocommerce-product-gallery__image slide">
                                                    <a href="{{ $image }}">
                                                        <img width="600" height="600" class="wp-post-image skip-lazy"
                                                            src="{{ $image }}" data-src="{{ $image }}"
                                                            data-large_image="{{ $image }}" alt="{{ $image }}"
                                                            title="{{ $image }}" data-caption=""
                                                            data-large_image_width="800" data-large_image_height="800"
                                                            decoding="async" loading="lazy" srcset="{{ $image }}"
                                                            sizes="auto, (max-width: 600px) 100vw, 600px" />
                                                    </a>
                                                </div>
                                            @endforeach

                                        </figure>

                                        {{-- popup image --}}
                                        <div class="image-tools absolute bottom left z-3">
                                            <a href="#product-zoom"
                                                class="zoom-button button is-outline circle icon tooltip hide-for-small"
                                                title="Zoom">
                                                <i class="icon-expand"></i>
                                            </a>
                                        </div>

                                    </div>

                                    {{-- image sub --}}
                                    <div class="product-thumbnails thumbnails slider-no-arrows slider row row-small row-slider slider-nav-small small-columns-4"
                                        data-flickity-options='{
                                    "cellAlign": "left",
                                    "wrapAround": false,
                                    "autoPlay": false,
                                    "prevNextButtons": true,
                                    "asNavFor": ".product-gallery-slider",
                                    "percentPosition": true,
                                    "imagesLoaded": true,
                                    "pageDots": false,
                                    "rightToLeft": false,
                                    "contain": true
                                    }'>

                                        @foreach ($images as $image)
                                            <div class="col">
                                                <a class="woocommerce-product-gallery__image">
                                                    <img width="300" height="300" src="{{ $image }}"
                                                        class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail"
                                                        alt="{{ $image }}" decoding="async" loading="lazy"
                                                        srcset="{{ $image }} 300w, {{ $image }} 600w, {{ $image }} 150w, {{ $image }} 768w, {{ $image }} 800w"
                                                        sizes="(max-width: 300px) 100vw, 300px" />
                                                </a>
                                            </div>
                                        @endforeach


                                    </div>
                                </div>

                                <div class="product-info summary entry-summary col col-fit product-summary">

                                    <h1 class="product-title product_title entry-title">{{ $product->name_data }}
                                    </h1>

                                    {{-- <div class="price-wrapper">
                                            <p class="price product-page-price ">
                                                <span class="woocommerce-Price-amount amount">
                                                    <bdi>
                                                        <span class="woocommerce-Price-currencySymbol">&#8363;</span>
                                                        {{ number_format($product->gia_ban) }}
                                                    </bdi>
                                                </span>
                                            </p>
                                        </div> --}}
                                    <div class="product-short-description">
                                        <p>{{ !empty($product->description) ? nl2br($product->description) : '' }}
                                        </p>
                                    </div>

                                    {{-- <form class="cart" action="" method="post"
                                            enctype='multipart/form-data'>
                                            <div class="quantity buttons_added">
                                                <input type="button" value="-" class="minus button is-form">
                                                <input type="number" class="input-text qty text" step="1"
                                                    min="1" max="100" name="quantity" value="1"
                                                    title="Qty" size="4" placeholder=""
                                                    inputmode="numeric" />
                                                <input type="button" value="+" class="plus button is-form">
                                            </div>
                                            <button type="submit" name="add-to-cart" value="808"
                                                class="single_add_to_cart_button button alt wp-element-button">Add to
                                                cart</button>
                                        </form> --}}

                                    {{-- share --}}
                                    @include('layouts.layout01.elements.common.share', [
                                        'data' => $product,
                                    ])

                                </div>
                            </div>
                        </div>
                        <div class="product-footer">
                            <div class="woocommerce-tabs wc-tabs-wrapper container tabbed-content">
                                <ul class="tabs wc-tabs product-tabs small-nav-collapse nav nav-uppercase nav-line nav-left"
                                    role="tablist">
                                    <li class="description_tab active" id="tab-title-description" role="presentation">
                                        <a href="#tab-description" role="tab" aria-selected="true"
                                            aria-controls="tab-description">
                                            {{ __('user.application') }}
                                        </a>
                                    </li>
                                    <li class="additional_information_tab " id="tab-title-additional_information"
                                        role="presentation">
                                        <a href="#tabContent02" role="tab" aria-selected="false"
                                            aria-controls="tab-additional_information" tabindex="-1">
                                            {{ __('user.product_description') }}
                                        </a>
                                    </li>
                                    <li class="ux_global_tab_tab " id="tab-title-ux_global_tab" role="presentation">
                                        <a href="#tabContent03" role="tab" aria-selected="false"
                                            aria-controls="tab-ux_global_tab" tabindex="-1">
                                            {{ __('user.technical_specifications') }}
                                        </a>
                                    </li>


                                    <li class="ux_global_tab_tab " id="tab-title-ux_global_tab" role="presentation">
                                        <a href="#tabDownloadTDS" role="tab" aria-selected="false"
                                            aria-controls="tab-ux_global_tab" tabindex="-1">
                                            Download TDS
                                        </a>
                                    </li>
                                </ul>

                                <div class="tab-panels">
                                    <div class="woocommerce-Tabs-panel woocommerce-Tabs-panel--description panel entry-content active"
                                        id="tab-description" role="tabpanel" aria-labelledby="tab-title-description">
                                        {!! $product->content !!}
                                    </div>
                                    <div class="woocommerce-Tabs-panel woocommerce-Tabs-panel--additional_information panel entry-content "
                                        id="tabContent02" role="tabpanel"
                                        aria-labelledby="tab-title-additional_information">
                                        {!! $product->content02 !!}
                                    </div>

                                    <div id="tabContent03"
                                        class="woocommerce-Tabs-panel woocommerce-Tabs-panel--ux_global_tab panel entry-content "
                                        role="tabpanel" aria-labelledby="tab-title-ux_global_tab">
                                        {!! $product->content03 !!}
                                    </div>

                                    <div id="tabDownloadTDS"
                                        class="woocommerce-Tabs-panel woocommerce-Tabs-panel--ux_global_tab panel entry-content "
                                        role="tabpanel" aria-labelledby="tab-title-ux_global_tab">
                                        @if (empty($product->file))
                                            <p>{{ __('user.file_is_updating') }}</p>
                                            {{ $product->file }}
                                        @else
                                            @include('layouts.layout01.product.form_download')
                                        @endif
                                    </div>

                                </div>
                            </div>
                            <div class="related related-products-wrapper product-section">
                                <h3
                                    class="product-section-title container-width product-section-title-related pt-half pb-half uppercase">
                                    Related products
                                </h3>
                                <div class="row has-equal-box-heights equalize-box large-columns-3 medium-columns-3 small-columns-2 row-small slider row-slider slider-nav-reveal slider-nav-push"
                                    data-flickity-options='{"imagesLoaded": true, "groupCells": "100%", "dragThreshold" : 5, "cellAlign": "left","wrapAround": true,"prevNextButtons": true,"percentPosition": true,"pageDots": false, "rightToLeft": false, "autoPlay" : false}'>

                                    @foreach ($product_lienquan as $product)
                                        @include('layouts.layout01.elements.product.item_product_slide', [
                                            'product' => $product,
                                        ])
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </main>
@endsection
