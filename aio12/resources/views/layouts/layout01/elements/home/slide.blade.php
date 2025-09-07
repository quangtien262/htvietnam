@if ($page->block_type == 'images')

    @php
        $images = app('Helper')->getDataLang('images', ['images.page_setting_id' => $page->data_id], ['images.sort_order' => 'asc']);
    @endphp
    <div class="slider-wrapper relative slider-section" id="slider-1086543072">
            {!! app('Helper')->editContent($page, 'images', true) !!}

        <div class="slider slider-nav-dots-simple slider-nav-simple slider-nav-normal slider-nav-light slider-style-normal"
            data-flickity-options='{
                     "cellAlign": "center",
                     "imagesLoaded": true,
                     "lazyLoad": 1,
                     "freeScroll": false,
                     "wrapAround": true,
                     "autoPlay": 6000,
                     "pauseAutoPlayOnHover" : true,
                     "prevNextButtons": false,
                     "contain" : true,
                     "adaptiveHeight" : true,
                     "dragThreshold" : 10,
                     "percentPosition": true,
                     "pageDots": true,
                     "rightToLeft": false,
                     "draggable": true,
                     "selectedAttraction": 0.1,
                     "parallax" : 0,
                     "friction": 0.6}'>
            @foreach ($images as $img)
                <div class="banner has-hover" id="banner-922867367" style="padding-top: 860px;">
                    <div class="banner-inner fill">
                        <div class="banner-bg fill">
                            <div class="bg fill bg-fill" style="background-image: url({{ $img->image }});"></div>
                            <div class="overlay" style="background-color: rgba(0, 0, 0, 0.366)"></div>
                        </div>
                        <div class="banner-layers container">
                            <div class="fill banner-link"></div>
                            <div id="text-box-984854320"
                                class="text-box banner-layer x50 md-x50 lg-x50 y50 md-y50 lg-y50 res-text">
                                <div data-animate="blurIn">
                                    <div class="text-box-content text dark">
                                        <div class="text-inner text-center">
                                            <p style="text-align: center;"><span
                                                    style="font-size: 120%;">{{ $img->description }}</span></p>
                                            <h2 style="text-align: center;"><span
                                                    style="font-size: 130%;">{{ $img->name_data }}</span></h2>
                                            <p style="text-align: center;">{!! $img->content !!}</p>
                                            @if (!empty($img->link))
                                                <a href="{{ $img->link }}" target="_self"
                                                    class="button primary lowercase nut-xem-them">
                                                    <span>{{__('user.view_details')}}</span>
                                                </a>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                                <style>
                                    #text-box-984854320 .text-inner {
                                        padding: 30px 30px 30px 30px;
                                    }

                                    #text-box-984854320 {
                                        width: 75%;
                                    }

                                    #text-box-984854320 .text-box-content {
                                        font-size: 100%;
                                    }
                                </style>
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach

        </div>
        <div class="loading-spin dark large centered"></div>
    </div>
@endif
