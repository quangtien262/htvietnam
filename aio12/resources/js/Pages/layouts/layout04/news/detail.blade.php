@extends('layouts.layout04.index')
@section('content')
    <div id="content" class="blog-wrapper blog-single page-wrapper">
        <div class="row row-large">
            <div class="large-9 col">
                <article id="post-980"
                    class="post-980 post type-post status-publish format-standard has-post-thumbnail hentry category-tin-tuc">
                    <div class="article-inner">
                        <header class="entry-header">
                            <div class="entry-header-text entry-header-text-bottom text-left">
                                @if(!empty($menu['menu']))
                                    <h6 class="entry-category is-xsmall">
                                        <a href="{{ route('news', ['news', $news->menu_id]) }}" rel="category tag">{{ $menu['menu']->name }}</a>
                                    </h6>
                                @endif
                                
                                {{-- edit --}}
                                {!! app('Helper')->fastEdit('news', $news->id) !!}
                                
                                <h1 class="entry-title">{{ $news->name }}</h1>
                                

                                <div class="entry-divider is-divider small"></div>
                            </div>
                        </header>
                        <div class="entry-content single-page">
                            {!! $news->content !!}
                            <div class="blog-share text-center">
                                <div class="is-divider medium"></div>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
            <div class="post-sidebar large-3 col">
                <div id="secondary" class="widget-area" role="complementary">
                    <aside id="flatsome_recent_posts-5" class="widget flatsome_recent_posts">
                        <span class="widget-title"><span>{{ __('user.related_articles') }}</span></span>
                        <div class="is-divider small"></div>
                        <ul>
                            @foreach ($newsLatest as $nlast)
                                <li class="recent-blog-posts-li">
                                    <div class="flex-row recent-blog-posts align-top pt-half pb-half">
                                        <div class="flex-col mr-half">
                                            <div class="badge post-date badge-square">
                                                <div class="badge-inner bg-fill" style="background: url({{ $nlast->image }}); border:0;"></div>
                                            </div>
                                        </div>
                                        <div class="flex-col flex-grow ">
                                            <a href="{{ app('Helper')->getLinkNews($nlast) }}" title="">{{ $nlast->name }}</a>
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
