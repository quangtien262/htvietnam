@if ($page->block_type == 'news')

    @php
        $news = app('DataService')->getNewsByConditions([], [], 4);
    @endphp
    @if (count($news) > 0)
        <section class="section section6" id="section_1636241001">

            {!! app('Helper')->editTitle($page, true) !!}

            <div class="bg section-bg fill bg-fill  bg-loaded"></div>
            <div class="section-content relative">
                <div class="row" id="row-61848502">
                    <div id="col-826062738" class="col small-12 large-12">
                        <div class="col-inner">
                            <div class="tieu-de">
                                <h2 style="text-align: center;">{{ $page->name_data }}</h2>
                                <p style="text-align: center;">{{ $page->description }}</p>
                            </div>
                            <p style="text-align: center;">
                                <span style="color: #808080; font-size: 95%;">
                                    <em>{!! $page->content !!}</em>
                                </span>
                            </p>
                        </div>
                    </div>
                    <div id="col-433392242" class="col cot1 medium-6 small-12 large-6">
                        <div class="col-inner">
                            <div class="row list-post large-columns-1 medium-columns-1 small-columns-1">
                                <div class="col post-item">
                                    <div class="col-inner">
                                        <a href="" class="plain">
                                            <div class="box box-overlay dark box-text-bottom box-blog-post has-hover">
                                                <div class="box-image">
                                                    <div class="image-zoom image-cover" style="padding-top:70%;">
                                                        <img loading="lazy" decoding="async" width="1170"
                                                            height="780" src="{{ $news[0]->image }}"
                                                            class="attachment-original size-original wp-post-image"
                                                            alt=""
                                                            srcset="{{ $news[0]->image }} 1170w, {{ $news[0]->image }} 300w, {{ $news[0]->image }} 1024w, {{ $news[0]->image }} 768w, {{ $news[0]->image }} 600w"
                                                            sizes="auto, (max-width: 1170px) 100vw, 1170px" />
                                                        <div class="overlay" style="background-color: rgba(0,0,0,.25)">
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="box-text text-left">
                                                    <div class="box-text-inner blog-post-inner">
                                                        <h5 class="post-title is-large ">{{ $news[0]->name }}</h5>
                                                        <div class="is-divider"></div>
                                                    </div>
                                                </div>
                                                <div class="badge absolute top post-date badge-square">
                                                    <div class="badge-inner">
                                                        <span
                                                            class="post-date-day">{{ $news[0]->created_at->format('d/m') }}</span><br>
                                                        <span
                                                            class="post-date-month is-xsmall">{{ $news[0]->created_at->format('Y') }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div id="col-795761696" class="col cot3 medium-6 small-12 large-6">
                        <div class="col-inner">
                            <div class="row list-post2 large-columns-1 medium-columns-1 small-columns-1">
                                @foreach ($news as $idx => $item)
                                    @php
                                        if ($idx == 0) {
                                            continue;
                                        } // Skip the first item as it's already displayed above
if ($idx > 3) {
    continue;
} // Skip the first item as it's already displayed above
                                        $link = app('Helper')->getLinkNews($item);
                                    @endphp
                                    <div class="col post-item">
                                        <div class="col-inner">
                                            <a href="{{ $link }}" class="plain">
                                                <div class="box box-vertical box-text-bottom box-blog-post has-hover">
                                                    <div class="box-image" style="width:27%;">
                                                        <div class="image-zoom image-cover" style="padding-top:78%;">
                                                            <img loading="lazy" decoding="async" width="1170"
                                                                height="780" src="{{ $item->image }}"
                                                                class="attachment-original size-original wp-post-image"
                                                                alt=""
                                                                srcset="{{ $item->image }} 1170w, {{ $item->image }} 300w, {{ $item->image }} 1024w, {{ $item->image }} 768w, {{ $item->image }} 600w"
                                                                sizes="auto, (max-width: 1170px) 100vw, 1170px" />
                                                        </div>
                                                    </div>
                                                    <div class="box-text text-left">
                                                        <div class="box-text-inner blog-post-inner">
                                                            <h5 class="post-title is-large ">{{ $item->name }}</h5>
                                                            <div class="is-divider"></div>
                                                            <p class="from_the_blog_excerpt ">{{ $item->description }}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div class="badge absolute top post-date badge-square">
                                                        <div class="badge-inner">
                                                            <span
                                                                class="post-date-day">{{ $item->created_at->format('d/m') }}</span><br>
                                                            <span
                                                                class="post-date-month is-xsmall">{{ $item->created_at->format('Y') }}</span>
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
            </div>
            <style>
                #section_1636241001 {
                    padding-top: 80px;
                    padding-bottom: 80px;
                }

                #section_1636241001 .ux-shape-divider--top svg {
                    height: 150px;
                    --divider-top-width: 100%;
                }

                #section_1636241001 .ux-shape-divider--bottom svg {
                    height: 150px;
                    --divider-width: 100%;
                }
            </style>
        </section>
    @endif

@endif
