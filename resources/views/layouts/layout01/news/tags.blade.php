@extends('layouts.layout01.index')

@section('content')
    <div class="bg-event lr-banner-pos">
        <div class="bg-full">
            <div class="archives post post1 bg4">
                <div class="container">
                    <div class="row">
                        <div class="col-12">
                            <div class="bridcrumb" itemscope="" itemtype="http://schema.org/BreadcrumbList">
                                <span itemprop="itemListElement" itemscope="" itemtype="http://schema.org/ListItem">
                                    <a href="{{ route('home') }}" itemprop="item" title="">
                                        <span itemprop="name">{{__('home')}}</span>
                                    </a>
                                    <meta itemprop="position" content="1" />
                                    <span>/</span>
                                </span>
                                <span itemprop="itemListElement" itemscope="" itemtype="http://schema.org/ListItem">
                                    <a href="{{ app('Helper')->getLinkTags($tags) }}" itemprop="item" title="{{ $tags->name }}" class="bcrumbs-item">
                                        <span itemprop="name">{{ $tags->name }}</span>
                                    </a>
                                    <meta itemprop="position" content="2" />
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12 col-lg-8 scroll-content">
                            <div class="row">
                                <div class="col-12">
                                    <h1 class="widget-title1 channel-group fontbold">{{ $tags->name }}</h1>
                                </div>
                            </div>
                            <div class="business padding20 border-radious5" id="channel-container">
                                @foreach ($news as $item)
                                    @include('layouts.layout01.news.news_item')
                                @endforeach
                                <hr class="horizontal-dotb dkt-horizontal" />
                            </div>
                            <hr class="horizontal-dottb ipd-horizontal" />
                        </div>

                        {{-- Cổ phiếu mới lên sàn --}}
                        <div class="col-lg-4 col-md-12">

                            {{-- TOP VIEW --}}
                            <div class="last-scroll-3">
                                <div class="widget mb10 rightdetail">
                                    <h2 class="widget-title fontbold">{{__('user.latest')}}</h2>
                                    @include('layouts.layout01.news.newsMost')
                                </div>
                                <hr class="horizontal-dottb dkt-horizontal horizontal-option" />
                            </div>
                            <div class="last-scroll-4">
                                <div class="vst-ads-right">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
