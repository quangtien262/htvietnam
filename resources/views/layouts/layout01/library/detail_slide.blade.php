@extends('layouts.layout01.lay01')

@section('content')
    <style>
        #section_320154646 {
            padding-top: 60px;
            padding-bottom: 60px;
        }

        #section_320154646 .section-bg-overlay {
            background-color: rgba(0, 0, 0, 0.924);
        }

        #section_320154646 .section-bg.bg-loaded {
            background-image: url('');
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
    <div id="content" class="blog-wrapper blog-single page-wrapper">
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
                                <h2>{{ !empty($menu['menu']) && !empty($menu['menu']['name']) ? $menu['menu']['name'] : '' }}
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div id="col-526786999" class="col medium-6 small-12 large-6">
                        <div class="col-inner text-right">
                            <nav aria-label="breadcrumbs" class="rank-math-breadcrumb">
                                <p>
                                    <a href="/">Trang chủ</a>
                                    <span class="separator"> / </span>
                                    <a href="">{!! !empty($menu['menu']) && !empty($menu['menu']['name']) ? $menu['menu']['name'] : '' !!}</a>
                                </p>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <div class="row row-large row-divided ">
            <div class="large-12 col-12">
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
                                            title="{{ $image }}" data-caption="" data-large_image_width="800"
                                            data-large_image_height="800" decoding="async" loading="lazy"
                                            srcset="{{ $image }}" sizes="auto, (max-width: 600px) 100vw, 600px" />
                                    </a>
                                </div>
                            @endforeach

                        </figure>

                        {{-- popup image --}}
                        <div class="image-tools absolute bottom left z-3">
                            <a href="#product-zoom" class="zoom-button button is-outline circle icon tooltip hide-for-small"
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
                            <div class="col" style="">
                                <a class="woocommerce-product-gallery__image">
                                    <img width="100" height="100" src="{{ $image }}"
                                        class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail"
                                        alt="{{ $image }}" decoding="async" loading="lazy"
                                        srcset="{{ $image }} 300w, {{ $image }} 600w, {{ $image }} 150w, {{ $image }} 768w, {{ $image }} 800w"
                                        sizes="(max-width: 300px) 100vw, 300px" />
                                </a>
                            </div>
                        @endforeach


                    </div>

                {{-- comment --}}

            </div>


        </div>
    </div>
@endsection
