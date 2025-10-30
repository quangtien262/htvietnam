@extends('layouts.layout01.lay01')

@section('content')
    <div id="content" class="blog-wrapper blog-archive page-wrapper">
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
                                <h1 class="page-title is-large uppercase">
                                    <span>{{ $menu['menu']->name }}</span>
                                </h1>
                            </div>
                        </div>
                    </div>
                    <div id="col-526786999" class="col medium-6 small-12 large-6">
                        <div class="col-inner text-right">
                            <nav aria-label="breadcrumbs" class="rank-math-breadcrumb">
                                <p><a href="/">Trang chủ</a><span class="separator"> - </span><span class="last">{{ $menu['menu']->name }}</span></p>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                #section_320154646 {
                    padding-top: 60px;
                    padding-bottom: 60px;
                }

                #section_320154646 .section-bg-overlay {
                    background-color: rgba(0, 0, 0, 0.924);
                }

                #section_320154646 .section-bg.bg-loaded {
                    background-image: url(/wp-content/uploads/2023/01/img3.jpg);
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
        </section>
        <div class="row align-center">
            <div class="large-12 col">
                <div class="row large-columns-3 medium-columns- small-columns-1">
                    @foreach ($libs as $n)
                        @php
                            $link = app('Helper')->getLinkLibs($n);
                            $image = '';
                            if(empty($n->images) || empty($n->images['avatar'])){
                                $image = '';
                            } else {
                                $image = $n->images['avatar'];
                            }
                        @endphp
                        <div class="col post-item">
                            <div class="col-inner">
                                <a href="{{ $link }}" class="plain">
                                    <div class="box box-text-bottom box-blog-post has-hover">
                                        <div class="box-image">
                                            <div class="image-cover" style="padding-top:56%;">
                                                <img width="300" height="200"
                                                    src="{{$image}}"
                                                    class="attachment-medium size-medium wp-post-image" alt="" decoding="async"
                                                    loading="lazy"
                                                    srcset="{{$image}} 300w, {{$image}} 1024w, {{$image}} 768w, {{$image}} 600w, {{$image}} 1170w"
                                                    sizes="auto, (max-width: 300px) 100vw, 300px">
                                            </div>
                                        </div>
                                        <div class="box-text text-left">
                                        <div class="box-text-inner blog-post-inner">
                                                <h5 class="post-title is-large ">{{$n->name_data}}</h5>
                                                <div class="is-divider"></div>
                                                <p class="from_the_blog_excerpt">{{ $n->description }}</p>
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