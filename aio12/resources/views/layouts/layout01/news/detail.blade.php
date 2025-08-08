@extends('layouts.layout01.index')

@section('content')

    <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
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
                <div class="col-md-12 col-xl-8 td1">
                    <div class="row">
                        <div class="col-lg-12 col-sm-12 col-md-12">
                            <div class="bridcrumb" itemscope="" itemtype="http://schema.org/BreadcrumbList">
                                @if(!empty($menu->name))
                                    <span itemprop="itemListElement">
                                        <a href="{{ route('home') }}" itemprop="item" title="{{ __('home') }}"><span
                                                itemprop="name">{{ __('home') }}</span></a>
                                        <meta itemprop="position" content="1">
                                    </span>

                                    <span>/</span>

                                    <span itemprop="itemListElement">
                                        <a href="{{ app('Helper')->getLinkMenu($menu) }}" itemprop="item"
                                            title="{{ $menu->name }}" class="bcrumbs-item">
                                            <span itemprop="name">
                                                {{ $menu->name }}
                                            </span>
                                        </a>
                                        <meta itemprop="position" content="3">
                                    </span>
                                @endif
                            </div>
                            <div class="">
                                <div class=" scroll-content">
                                    <div class="col-lg-12 col-sm-12 col-md-12">
                                        {{-- title - des --}}
                                        <div class="row">
                                            <div class="col-lg-12 col-sm-12 col-md-12">
                                                <h1 class="article-title pt-2"
                                                    style="letter-spacing: -.6px;line-height: 1.375;}">
                                                    {{ $news->name }}</h1>
                                                <div class="row">
                                                    <div class="col-md-12 col-sm-12 col-lg-12">
                                                        <div class="blog-single-head text-left mb10">
                                                            <div class="meta">
                                                                <span
                                                                    class="date">{{ empty($news->created_at) ? '' : $news->created_at->format('d/m/Y') }}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="space-10"></div>
                                                <div>
                                                    <p>{!! $news->description !!}</p>
                                                </div>
                                                <div class="pb-3 post-image">
                                                    <img src="{{ $news->image }}" alt="{{ $news->name_meta }}">
                                                </div>


                                            </div>
                                        </div>

                                        {{-- content --}}
                                        <div class="row">
                                            <div class="col-lg-12 col-sm-12 col-md-12">
                                                <div class="single_post_heading width_medium">
                                                    <div itemprop="articleBody" id="vst_detail">
                                                        {!! $news->content !!}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {{-- tags --}}
                                        <div class="row">
                                            <div class="col-lg-12 col-sm-12 col-md-12">
                                                @if (!empty($tags))
                                                    @foreach ($tags as $t)
                                                        <a class="item-tags"
                                                            href="{{ app('Helper')->getLinkTags($t) }}">#{{ $t->name }}</a>
                                                    @endforeach
                                                    <hr class="br-dot hide-dot" />
                                                    <hr class="b-b-dot" />
                                                @endif
                                            </div>
                                        </div>

                                        {{-- latest --}}
                                        <div class="row">
                                            <div class="col-12">
                                                <br />
                                                <div class="widget rightdetail mb10 scroll-fix-firt">
                                                    <h2 class="widget-title fontbold">{{ __('user.latest') }}</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row scroll-content-sub">
                                            <div class="col-12">
                                                <div class="business border-radious5" id="TinCungChuyenMuc">
                                                    @foreach ($topViews as $item)
                                                        @include('layouts.layout01.news.item_news_content')
                                                    @endforeach

                                                </div>
                                            </div>
                                        </div>

                                        <hr class="br-dot-b-right hidden-lg hidden-md">
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
                <div class="col-md-12 col-xl-4">
                    <div class="row">
                        <div class="col-lg-12 col-sm-12 col-md-12 ">
                            <div class="row">
                                @include('layouts.layout01.elements.home.top_views')
                            </div>
                        </div>
                        <div class="col-lg-12 col-xl-12 col-md-12 social_shares mb8 mb-0 fix-main-hottrend">
                            <div class="last-scroll-sub-0">
                                <h2 class="widget-title fontbold m-b-5 ">{{ __('user.trending') }}</h2>
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
@endsection
