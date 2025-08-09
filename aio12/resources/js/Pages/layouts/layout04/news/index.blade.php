@extends('layouts.layout04.index')
@section('content')
    <div id="content" class="blog-wrapper blog-archive page-wrapper">

        <div class="container">
            <div class="flex-col flex-grow medium-text-center" style="padding:0 0 20px">
                <div class="is-small">
                    <nav class="woocommerce-breadcrumb breadcrumbs uppercase"><a href="/">Trang chủ</a> <span class="divider">/</span> {{ $menu['menu']->name }}</nav>
                </div>
            </div>
        </div>

        <div class="row row-large row-divided ">
            <div class="large-12 col">
                <div id="row-1991201898"
                    class="row large-columns-3 medium-columns- small-columns-1 has-shadow row-box-shadow-1 row-masonry"
                    data-packery-options='{"itemSelector": ".col", "gutter": 0, "presentageWidth" : true}'>
                    @foreach ($news as $new)
                        <div class="col post-item">
                            <div class="col-inner">
                                <a href="{{ app('Helper')->getLinkNews($new) }}" class="plain">
                                    <div class="box box-text-bottom box-blog-post has-hover">
                                        <div class="box-image">
                                            <div class="image-cover" style="padding-top:56%;">
                                                <img width="300" height="166" src="{{ $new->image }}"
                                                    class="attachment-medium size-medium wp-post-image"
                                                    alt="{{ $new->name }}" srcset="{{ $new->image }}"
                                                    sizes="(max-width: 300px) 100vw, 300px" />
                                            </div>
                                        </div>
                                        <div class="box-text text-left">
                                            <div class="box-text-inner blog-post-inner">


                                                <h5 class="post-title is-large ">{{ $new->name }}</h5>
                                                <div class="is-divider"></div>
                                                <p class="from_the_blog_excerpt ">{{ $new->description }} </p>



                                            </div>
                                        </div>

                                    </div>
                                </a>
                            </div>
                        </div>
                    @endforeach

                </div>

            </div>
        </div>

    </div>
@endsection
