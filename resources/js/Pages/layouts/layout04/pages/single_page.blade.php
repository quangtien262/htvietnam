@extends('layouts.layout04.index')
@section('content')
    <div id="content" class="blog-wrapper blog-single page-wrapper">
        <div class="row row-large">
            <div class="large-9 col">
                <article id="post-980"
                    class="post-980 post type-post status-publish format-standard has-post-thumbnail hentry category-tin-tuc">
                    <div class="article-inner">
                        <div class="container py-3">
                            <div class="flex-col flex-grow medium-text-center">
                                <div class="is-small">
                                    <nav class="woocommerce-breadcrumb breadcrumbs uppercase"><a href="/">Trang
                                            chủ</a> <span class="divider">/</span> {{ $menu->name }}</nav>
                                </div>

                            </div>

                        </div>
                        <div class="entry-content single-page">
                            {!! $menu->content !!}
                            <div class="blog-share text-center">


                            </div>
                        </div>
                    </div>
                </article>
            </div>

        </div>
    </div>
@endsection
