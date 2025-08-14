@if ($page->block_type == 'block03')

    <section class="section section2 dark" id="section_1639615905">
        <div class="bg section-bg fill bg-fill  bg-loaded">
        </div>
        <div class="section-content relative">
            <div class="row row-large" id="row-2145480695">
                <div id="col-1403247314" class="col medium-6 small-12 large-6">
                    <div class="col-inner">
                        <div class="tieu-de">
                            <p>{{ $page->description }}</p>
                            <h2>{{ $page->name_data }}</h2>
                        </div>
                        <p><span style="color: #999999; font-size: 90%;">{{ $page->content }}</span></p>
                        @if (!empty($page->link))
                            <a href="{{ $page->link }}" target="_self" class="button primary lowercase nut-xem-them">
                                <span>{{ __('user.view_all') }}</span>
                            </a>
                        @endif
                    </div>
                </div>
                <div id="col-812780374" class="col medium-6 small-12 large-6">
                    <div class="col-inner">
                        <div class="slider-wrapper relative" id="slider-676913251">
                            <div class="slider slider-nav-simple slider-nav-normal slider-nav-dark slider-style-normal slider-676913251"
                                data-flickity-options='{
                                    "cellAlign": "center",
                                    "imagesLoaded": true,
                                    "lazyLoad": 1,
                                    "freeScroll": false,
                                    "wrapAround": false,
                                    "autoPlay": 6000,
                                    "pauseAutoPlayOnHover" : true,
                                    "prevNextButtons": false,
                                    "contain" : true,
                                    "adaptiveHeight" : true,
                                    "dragThreshold" : 10,
                                    "percentPosition": true,
                                    "pageDots": false,
                                    "rightToLeft": false,
                                    "draggable": true,
                                    "selectedAttraction": 0.1,
                                    "parallax" : 0,
                                    "friction": 0.6        }'>

                                @if (!empty($page->images) && !empty($page->images['images']))
                                    @foreach ($page->images['images'] as $idx => $image)
                                        <div class="img has-hover x md-x lg-x y md-y lg-y"
                                            id="image_{{ $idx }}" style="width: 100%;">
                                            <div class="img-inner image-cover dark" style="padding-top:100%;">
                                                <img decoding="async" width="1170" height="780"
                                                    src="{{ $image }}"
                                                    class="attachment-original size-original wp-post-image"
                                                    alt="{{ $page->name_data }}"
                                                    srcset="{{ $image }} 1170w, {{ $image }} 300w, {{ $image }} 1024w, {{ $image }} 768w, {{ $image }} 600w"
                                                    sizes="(max-width: 1170px) 100vw, 1170px" />
                                            </div>
                                        </div>
                                    @endforeach
                                @endif

                            </div>
                            <div class="slider-custom slider slider-nav-simple slider-nav-normal slider-nav-dark slider-style-normal"
                                style="padding: 0 50px; bottom: 120px;"
                                data-flickity-options='{
                                    "asNavFor": ".slider-676913251",
                                    "cellAlign": "center",
                                    "imagesLoaded": true,
                                    "lazyLoad": 1,
                                    "freeScroll": false,
                                    "wrapAround": false,
                                    "autoPlay": 6000,
                                    "pauseAutoPlayOnHover" : true,
                                    "prevNextButtons": false,
                                    "contain" : true,
                                    "adaptiveHeight" : true,
                                    "dragThreshold" : 10,
                                    "percentPosition": true,
                                    "pageDots": false,
                                    "rightToLeft": false,
                                    "draggable": true,
                                    "selectedAttraction": 0.1,
                                    "parallax" : 0,
                                    "friction": 0.6        }'>

                                @if (!empty($page->images) && !empty($page->images['images']))
                                    @foreach ($page->images['images'] as $idx => $image)
                                        <div class="img has-hover x md-x lg-x y md-y lg-y"
                                            id="image_{{ $idx }}" style="width: 100%;">
                                            <div class="img-inner image-cover dark" style="padding-top:100%;">
                                                <img fetchpriority="high" decoding="async" width="1170" height="780"
                                                    src="{{ $image }}" 
                                                    class="attachment-original size-original"
                                                    alt="{{ $page->name_data }}" 
                                                    srcset="{{ $image }}"
                                                    sizes="(max-width: 1170px) 100vw, 1170px" />
                                            </div>
                                        </div>
                                    @endforeach
                                @endif
                            </div>
                            <div class="loading-spin dark large centered"></div>
                        </div>
                        <!-- .ux-slider-wrapper -->
                    </div>
                </div>
            </div>
        </div>
        <style>
            #section_1639615905 {
                padding-top: 100px;
                padding-bottom: 100px;
                background-color: rgb(51, 51, 51);
            }

            #section_1639615905 .ux-shape-divider--top svg {
                height: 150px;
                --divider-top-width: 100%;
            }

            #section_1639615905 .ux-shape-divider--bottom svg {
                height: 150px;
                --divider-width: 100%;
            }

            .slider-custom .flickity-slider .img {
                max-width: 20% !important;
                margin: 5px;
                border: 2px solid #fff;
            }
        </style>
    </section>

@endif
