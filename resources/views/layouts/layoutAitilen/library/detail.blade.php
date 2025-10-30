@extends('layouts.layoutAitilen.layAitilen')

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
                <h1>{{$lib->name_data}}</h1>
                <p>{!! $lib->content !!}</p>
                <div class=" woocommerce-product-gallery row">
                    @foreach ($images as $image)
                        <div data-thumb="{{ $image }}" data-thumb-alt=""
                            class="woocommerce-product-gallery__image slide img-thumbnail item-lib  col-3 col medium-6 small-12 large-3 col-sm-12">
                            <a href="{{ $image }}">
                                <img width="600" height="600" class="wp-post-image skip-lazy" src="{{ $image }}"
                                    data-src="{{ $image }}" data-large_image="{{ $image }}"
                                    alt="{{$lib->name_data}}" title="{{$lib->name_data}}" data-caption=""
                                    data-large_image_width="800" data-large_image_height="800" decoding="async"
                                    loading="lazy" srcset="{{ $image }}"
                                    sizes="auto, (max-width: 600px) 100vw, 600px" />
                            </a>
                        </div>
                    @endforeach
                </div>

                <br/>
            </div>


        </div>
    </div>
@endsection
