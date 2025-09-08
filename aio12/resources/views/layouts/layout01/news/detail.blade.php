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
            background-image: url({{ $news->image }});
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
                                <h2>{{!empty($menu['menu']) && !empty($menu['menu']['name']) ? $menu['menu']['name'] : ''}}
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
                                    <a
                                        href="">{!! !empty($menu['menu']) && !empty($menu['menu']['name']) ? $menu['menu']['name'] : '' !!}</a>
                                    <br />
                                    <span class="last">
                                        {{ $news->name_data }}
                                    </span>
                                </p>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <div class="row row-large row-divided ">
            <div class="large-8 col">
                <article id="post-495"
                    class="post-495 post type-post status-publish format-standard has-post-thumbnail hentry category-tin-tuc">
                    <div class="article-inner ">
                        <header class="entry-header">
                            <div class="entry-image relative">
                                <img width="1020" height="680" src="{{ $news->image }}"
                                    class="attachment-large size-large wp-post-image" alt="" decoding="async"
                                    srcset="{{ $news->image }} 1024w, {{ $news->image }} 300w, {{ $news->image }} 768w, {{ $news->image }} 600w, {{ $news->image }} 1170w"
                                    sizes="(max-width: 1020px) 100vw, 1020px" />
                                <div class="badge absolute top post-date badge-square">
                                    <div class="badge-inner">
                                        @if (!empty($news->updated_at))
                                            <span class="post-date-day">{{ $news->updated_at->format('d/m') }}</span><br>
                                            <span class="post-date-month is-small">{{ $news->updated_at->format('Y') }}</span>
                                        @else
                                            <span class="post-date-day">{{ $news->created_at->format('d/m') }}</span><br>
                                            <span class="post-date-month is-small">{{ $news->created_at->format('Y') }}</span>
                                        @endif
                                    </div>
                                </div>
                            </div>
                            <div class="entry-header-text entry-header-text-top text-left">
                                <h6 class="entry-category is-xsmall">
                                    <a href="" rel="category tag">
                                        {!! !empty($menu['menu']) && !empty($menu['menu']['name']) ? $menu['menu']['name'] : '' !!}
                                    </a>
                                </h6>
                                <h1 class="entry-title">{{ $news->name_data }}</h1>
                                <div class="entry-divider is-divider small"></div>
                            </div>
                        </header>
                        <div class="entry-content single-page">
                            {{-- content --}}
                            <div class="content">
                                @if (!empty($news->embed_code))
                                    <div class="embed-responsive embed-responsive-16by9">
                                        {!! $news->embed_code !!}
                                    </div>
                                @endif
                                
                                {!! $news->content !!}
                            </div>

                            {{-- share --}}
                            <div class="blog-share text-center">
                                <br />
                                <div class="is-divider medium"></div>

                                {{-- share --}}
                                @include('layouts.layout01.elements.common.share', ['data' => $news])
                            </div>
                        </div>
                    </div>
                </article>

                {{-- comment --}}
                
            </div>

            <div class="post-sidebar large-4 col">
                <div id="secondary" class="widget-area " role="complementary">
                    <aside id="flatsome_recent_posts-2" class="widget flatsome_recent_posts">
                        <span class="widget-title "><span>{{__('user.latest_news')}}</span></span>
                        <div class="is-divider small"></div>
                        <ul>
                            @foreach ($newsLatest as $n)
                                @php
                                    $link = app('Helper')->getLinkNews($n);
                                @endphp
                                <li class="recent-blog-posts-li">
                                    <div class="flex-row recent-blog-posts align-top pt-half pb-half">
                                        <div class="flex-col mr-half">
                                            <div class="badge post-date  badge-square">
                                                <div class="badge-inner bg-fill"
                                                    style="background: url({{ $n->image }}); border:0;">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex-col flex-grow">
                                            <a href="{{ $link }}" title="{{ $n->name_data }}">
                                                {{ $n->name_data }}
                                            </a>
                                            <span class="post_comments op-7 block is-xsmall">
                                                <a href="{{ $link }}"></a>
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            @endforeach
                        </ul>
                    </aside>
                </div>
            </div>
        </div>
    </div>

@endsection