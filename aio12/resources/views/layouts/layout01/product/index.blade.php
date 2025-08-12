@extends('layouts.layout01.lay01')

@section('content')

    <main id="main" class="">
        <section class="section dau-trang-section dark has-parallax" id="section_320154646">
            <div class="bg section-bg fill bg-fill parallax-active bg-loaded" data-parallax-container=".section"
                data-parallax-background="" data-parallax="-7"
                style="height: 760.462px; transform: translate3d(0px, -131.69px, 0px); backface-visibility: hidden;">
                <div class="section-bg-overlay absolute fill"></div>
            </div>
            <div class="section-content relative">
                <div class="row align-middle" id="row-1345272763">
                    <div id="col-914956584" class="col medium-6 small-12 large-6">
                        <div class="col-inner">
                            <div class="tieu-de">
                                <h1 class="entry-title is-larger uppercase pb-0 pt-0 mb-0">Sản phẩm</h1>
                            </div>
                        </div>
                    </div>
                    <div id="col-526786999" class="col medium-6 small-12 large-6">
                        <div class="col-inner text-right">
                            <nav aria-label="breadcrumbs" class="rank-math-breadcrumb">
                                <p><a href="/">Trang chủ</a><span class="separator">
                                        - </span><span class="last">Sản phẩm</span></p>
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
                    background-image: url(/wp-content/uploads/2023/01/img3.jpg);
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
        <div class="row category-page-row">
            <div class="col large-8">
                <div class="shop-container">
                    <div class="woocommerce-notices-wrapper"></div>
                    <div
                        class="products row row-small large-columns-2 medium-columns-3 small-columns-2 has-equal-box-heights equalize-box">
                        @foreach ($products as $product)
                            @php
                                $link = app('Helper')->getLinkProduct($product);
                                $avatar = app('Helper')->getAvatarProduct($product);
                            @endphp
                            <div
                                class="product-small col has-hover product type-product post-808 status-publish first instock product_cat-chua-phan-loai has-post-thumbnail shipping-taxable purchasable product-type-simple">
                                <div class="col-inner">
                                    <div class="badge-container absolute left top z-1">
                                    </div>
                                    <div class="product-small box ">
                                        <div class="box-image">
                                            <div class="image-none">
                                                <a href="{{$link}}" aria-label="Lorem stet clita kasd">
                                                    <img width="300" height="300" src="{{$avatar}}"
                                                        class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail"
                                                        alt="" decoding="async"
                                                        srcset="{{$avatar}} 300w, {{$avatar}} 150w, {{$avatar}} 768w, {{$avatar}} 600w, {{$avatar}} 100w, {{$avatar}} 800w"
                                                        sizes="(max-width: 300px) 100vw, 300px"> </a>
                                            </div>
                                            <div class="image-tools is-small top right show-on-hover">
                                            </div>
                                            <div class="image-tools is-small hide-for-small bottom left show-on-hover">
                                            </div>
                                            <div
                                                class="image-tools grid-tools text-center hide-for-small bottom hover-slide-in show-on-hover">
                                            </div>
                                        </div>
                                        <div class="box-text box-text-products" style="height: 125.438px;">
                                            <div class="title-wrapper">
                                                <p class="name product-title woocommerce-loop-product__title"
                                                    style="height: 56px;">
                                                    <a href="{{$link}}"
                                                        class="product-name">{{$product->name_data}}</a>
                                                </p>
                                            </div>
                                            <div class="price-wrapper" style="height: 18px;">
                                                <span class="price">
                                                    <span class="woocommerce-Price-amount amount">
                                                        <bdi>
                                                            {{number_format($product->gia_ban)}}
                                                        </bdi>
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                    <!-- row -->
                </div>
                <!-- shop container -->
            </div>
            <div class="large-4 col hide-for-medium ">
                <div id="shop-sidebar" class="sidebar-inner">
                    <aside id="search-2" class="widget widget_search">
                        <span class="widget-title shop-sidebar">Tìm kiếm sản phẩm</span>
                        <div class="is-divider small"></div>
                        <form method="get" class="searchform" action="https://solar3.maugiaodien.com/" role="search">
                            <div class="flex-row relative">
                                <div class="flex-col flex-grow">
                                    <input type="search" class="search-field mb-0" name="s" value="" id="s"
                                        placeholder="Search…">
                                </div>
                                <div class="flex-col">
                                    <button type="submit" class="ux-search-submit submit-button secondary button icon mb-0"
                                        aria-label="Submit">
                                        <i class="icon-search"></i> </button>
                                </div>
                            </div>
                            <div class="live-search-results text-left z-top"></div>
                        </form>
                    </aside>
                    <aside id="woocommerce_layered_nav-2"
                        class="widget woocommerce widget_layered_nav woocommerce-widget-layered-nav">
                        <span class="widget-title shop-sidebar">Công suất</span>
                        <div class="is-divider small"></div>
                        <ul class="woocommerce-widget-layered-nav-list">
                            <li class="woocommerce-widget-layered-nav-list__item wc-layered-nav-term "><a rel="nofollow"
                                    href="https://solar3.maugiaodien.com/cua-hang/?filter_cong-suat=1000w">1000W</a> <span
                                    class="count">(4)</span></li>
                        </ul>
                    </aside>
                    <aside id="woocommerce_layered_nav-3"
                        class="widget woocommerce widget_layered_nav woocommerce-widget-layered-nav">
                        <span class="widget-title shop-sidebar">Động cơ</span>
                        <div class="is-divider small"></div>
                        <ul class="woocommerce-widget-layered-nav-list">
                            <li class="woocommerce-widget-layered-nav-list__item wc-layered-nav-term "><a rel="nofollow"
                                    href="https://solar3.maugiaodien.com/cua-hang/?filter_dong-co=2-4l-turbo">2.4L Turbo</a>
                                <span class="count">(1)</span>
                            </li>
                            <li class="woocommerce-widget-layered-nav-list__item wc-layered-nav-term "><a rel="nofollow"
                                    href="https://solar3.maugiaodien.com/cua-hang/?filter_dong-co=2l">2L</a> <span
                                    class="count">(3)</span></li>
                        </ul>
                    </aside>

                    {{-- sản phẩm mới --}}
                    <aside id="woocommerce_products-2" class="widget woocommerce widget_products">
                        <span class="widget-title shop-sidebar">Sản phẩm mới</span>
                        <div class="is-divider small"></div>
                        <ul class="product_list_widget">
                            @foreach ($products as $product)
                                @include('layouts.layout01.elements.product.item_product', ['product' => $product])
                            @endforeach
                        </ul>
                    </aside>
                </div>
            </div>
        </div>
    </main>

@endsection