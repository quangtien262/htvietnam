@extends('layouts.layout01.index')

@section('content')
    <div class="bg4">
        <!--::::: TOTAL AREA START :::::::-->
        <div class="total3">
            <div class="container">
                {{-- include('layouts.layout01.elements.home.block01') --}}

                @include('layouts.layout01.elements.home.block03')

                <div class="row hidden-xs device-show">
                    <div class="col-md-12 col-xl-8">
                        <div class="row">
                            <div class="col-lg-8">
                                <hr class="br-dot-b">
                            </div>
                            <div class="col-lg-4">
                                <hr class="br-dot-b">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-xl-4">

                    </div>
                </div>

                {{-- include('layouts.layout01.elements.home.block02') --}}

            </div>
            @include('layouts.layout01.elements.home.featured_news')
        </div>

        <div class="block05 inernational4 mb20">

            <div class="container">
                <div class="row hidden-sm hidden-xs device-show">
                    <div class="col-md-12 col-xl-8">
                        <hr class="br-dot">
                    </div>
                    <div class="col-md-6 col-xl-4">
                        <hr class="br-dot">
                    </div>
                </div>
                <div class="row">
                    {{-- analysis --}}
                    <div class="col-md-12 col-xl-8 td1">
                        @include('layouts.layout01.elements.home.analysis')
                    </div>

                    {{-- trending --}}
                    <div class="col-md-12 col-xl-4">
                        <div class="row">
                            <div class="col-lg-12 col-xl-12 col-md-12 social_shares mb8 mb-0 fix-main-hottrend">
                                <div class="last-scroll-sub-0">
                                    <h2 class="widget-title fontbold m-b-5 ">{{__('user.trending')}}</h2>
                                    <div id="render_loading">

                                    </div>
                                    <div id="trending-index" class="row channel-right w-100 fix-trending01">
                                        {{-- loading trending --}}
                                    </div>
                                </div>
                                <hr class="br-dot hide-dot" />
                                <hr class="b-b-dot" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container">
            <div class="row">

                {{-- news_by_menu --}}
                <div class="col-md-12 col-xl-8 fix-new-By-menu">
                    <div class="row scroll-content pt-2">
                        @include('layouts.layout01.elements.home.news_by_menu')
                    </div>
                </div>
                <div class="col-md-12 col-xl-4">
                    <div class="row">
                        <div class="col-xl-12">
                            <div class="row">
                                <div class="col-lg-6 col-xl-12 col-md-6 hidden-sm hidden-md hidden-xs economic_calendar" style="padding-right: 16px">

                                    <h2 class="widget-title fontbold m-b-5 ">{{__('user.economic_calendar')}}</h2>

                                    {!! $config->economic_calendar ?? '' !!}

                                </div>
                            </div>
                            <div class="row news_by_menu_right">
                                @include('layouts.layout01.elements.home.news_by_menu_right')
                            </div>

                            <div class="row news_by_menu_right">
                                @include('layouts.layout01.elements.home.images_ads')
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>

@endsection
