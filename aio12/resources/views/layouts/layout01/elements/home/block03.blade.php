<div class="row">
    <div class="theme-slider-20 col-md-12 col-xl-8">
        <div class="row">
            {{-- slideLatest --}}
            <div id="slideLatest" class="col-lg-7">
                <div class="image_carousel nav_style4 owl-carousel">
                    @foreach ($newsLatest01 as $n)
                        @include('layouts.layout01.elements.home.item_slide')
                    @endforeach
                </div>
            </div>

            {{-- slideTopViews --}}
            <div id="slideTopViews" class="col-lg-7" style="display: none">
                <div class="image_carousel nav_style4 owl-carousel">
                    @foreach ($topViews as $n)
                        @include('layouts.layout01.elements.home.item_slide')
                    @endforeach
                </div>
            </div>

            <div class="col-lg-5 lastestnews">
                <div class="border-radious5 tab4">
                    <ul class="nav nav-tabs">
                        <li id="tabLatest" class="active">
                            <a lastestNewsId="1" class="active fontbold" data-toggle="tab"
                                href="javascript:void(0)">{{ __('user.news') }}</a>
                        </li>
                        <li id="tabViews">
                            <a lastestNewsId="2" class="read fontbold" data-toggle="tab"
                                href="javascript:void(0)">{{ __('user.view_more') }}</a>
                        </li>
                    </ul>
                    <div class="tab-content">
                        <div id="tabLastestNews" class="tab-pane tab-news-content show fade in active scroll_bar">
                            @foreach ($newsLatest01 as $item)
                                @include('layouts.layout01.elements.home.newLatest')
                            @endforeach
                        </div>

                        <div id="tabTopViews" class="tab-pane tab-news-content show fade in active scroll_bar _hidden">
                            @foreach ($topViews as $item)
                                @include('layouts.layout01.elements.home.newLatest')
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-4 col-lg-12  d-xl-block fix-ma-nhung">
        <div class="row fix-ma-nhung-02">
            <div class="col-lg-6 col-lg-6 col-lg-12 trading-view">
                <script src="https://widgets.coingecko.com/coingecko-coin-heatmap-widget.js"></script>
                <coingecko-coin-heatmap-widget class="coingecko-01" height="300" locale="en"></coingecko-coin-heatmap-widget>
            </div>
            <div class="col-lg-6 col-lg-12 trading-view-02">
                <script src="https://widgets.coingecko.com/coingecko-coin-list-widget.js"></script>
                <coingecko-coin-list-widget class="coingecko-02" coin-ids="bitcoin,ethereum,pepe" currency="usd" locale="en"></coingecko-coin-list-widget>
            </div>
        </div>

       {{--
        <div class="row">
            <script src="https://widgets.coingecko.com/coingecko-coin-list-widget.js"></script>
            <coingecko-coin-list-widget  coin-ids="bitcoin,ethereum,pepe" currency="usd" locale="en"></coingecko-coin-list-widget>
        </div>
        --}}

        {{--
        <div class="row trading-view">
            $config->trading_view
        </div>
        --}}

        {{-- <div id="trending-index03" class="row"> --}}
            {{-- load trending01 --}}
        {{-- </div> --}}

    </div>
</div>
