@php
    $news = app('DataService')->getNewsByConditions([], [], 4);
@endphp
@if(count($news) > 0)
    <section class="section section6" id="section_1636241001">
        <div class="bg section-bg fill bg-fill  bg-loaded"></div>
        <div class="section-content relative">
            <div class="row" id="row-61848502">
                <div id="col-826062738" class="col small-12 large-12">
                    <div class="col-inner">
                        <div class="tieu-de">
                            <h2 style="text-align: center;">TIN TỨC &#8211; BÀI VIẾT</h2>
                            <p style="text-align: center;">MỚI NHẤT DÀNH CHO BẠN</p>
                        </div>
                        <p style="text-align: center;"><span style="color: #808080; font-size: 95%;"><em>Curabitur dolor
                                    metus, accumsan vel iaculis eu, venenatis a turpis. Vestibulum mollis, nulla at
                                    tristique varius, ipsum diam tempus erat, nec<br />dignissim ex lacus at velit. Etiam
                                    odio tortor, ultrices ultrices enim quis.</em></span></p>
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
                                                    <img loading="lazy" decoding="async" width="1170" height="780"
                                                        src="{{$news[0]->image}}"
                                                        class="attachment-original size-original wp-post-image" alt=""
                                                        srcset="{{$news[0]->image}} 1170w, {{$news[0]->image}} 300w, {{$news[0]->image}} 1024w, {{$news[0]->image}} 768w, {{$news[0]->image}} 600w"
                                                        sizes="auto, (max-width: 1170px) 100vw, 1170px" />
                                                    <div class="overlay" style="background-color: rgba(0,0,0,.25)"></div>
                                                </div>
                                            </div>
                                            <div class="box-text text-left">
                                                <div class="box-text-inner blog-post-inner">
                                                    <h5 class="post-title is-large ">{{$news[0]->name}}</h5>
                                                    <div class="is-divider"></div>
                                                </div>
                                            </div>
                                            <div class="badge absolute top post-date badge-square">
                                                <div class="badge-inner">
                                                    <span
                                                        class="post-date-day">{{$news[0]->created_at->format('d/m')}}</span><br>
                                                    <span
                                                        class="post-date-month is-xsmall">{{$news[0]->created_at->format('Y')}}</span>
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
                                    if ($idx == 0) continue;  // Skip the first item as it's already displayed above
                                    if ($idx > 3) continue; // Skip the first item as it's already displayed above
                                    $link = app('Helper')->getLinkNews($item);
                                @endphp
                                <div class="col post-item">
                                    <div class="col-inner">
                                        <a href="{{$link}}" class="plain">
                                            <div class="box box-vertical box-text-bottom box-blog-post has-hover">
                                                <div class="box-image" style="width:27%;">
                                                    <div class="image-zoom image-cover" style="padding-top:78%;">
                                                        <img loading="lazy" decoding="async" width="1170" height="780"
                                                            src="{{$item->image}}"
                                                            class="attachment-original size-original wp-post-image" alt=""
                                                            srcset="{{$item->image}} 1170w, {{$item->image}} 300w, {{$item->image}} 1024w, {{$item->image}} 768w, {{$item->image}} 600w"
                                                            sizes="auto, (max-width: 1170px) 100vw, 1170px" />
                                                    </div>
                                                </div>
                                                <div class="box-text text-left">
                                                    <div class="box-text-inner blog-post-inner">
                                                        <h5 class="post-title is-large ">{{$item->name}}</h5>
                                                        <div class="is-divider"></div>
                                                        <p class="from_the_blog_excerpt ">{{$item->description}}</p>
                                                    </div>
                                                </div>
                                                <div class="badge absolute top post-date badge-square">
                                                    <div class="badge-inner">
                                                        <span class="post-date-day">{{$item->created_at->format('d/m')}}</span><br>
                                                        <span class="post-date-month is-xsmall">{{$item->created_at->format('Y')}}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            @endforeach

                            {{-- <div class="col post-item">
                                <div class="col-inner">
                                    <a href="https://solar3.maugiaodien.com/2023/01/31/black-friday-starts-today-and-will-last-until-november-28th/"
                                        class="plain">
                                        <div class="box box-vertical box-text-bottom box-blog-post has-hover">
                                            <div class="box-image" style="width:27%;">
                                                <div class="image-zoom image-cover" style="padding-top:78%;">
                                                    <img loading="lazy" decoding="async" width="800" height="800"
                                                        src="/layouts/layout01/images/new1.jpg"
                                                        class="attachment-original size-original wp-post-image" alt=""
                                                        srcset="https://solar3.maugiaodien.com/wp-content/uploads/2023/01/teaser01.jpg 800w, https://solar3.maugiaodien.com/wp-content/uploads/2023/01/teaser01-300x300.jpg 300w, https://solar3.maugiaodien.com/wp-content/uploads/2023/01/teaser01-150x150.jpg 150w, https://solar3.maugiaodien.com/wp-content/uploads/2023/01/teaser01-768x768.jpg 768w, https://solar3.maugiaodien.com/wp-content/uploads/2023/01/teaser01-600x600.jpg 600w, https://solar3.maugiaodien.com/wp-content/uploads/2023/01/teaser01-100x100.jpg 100w"
                                                        sizes="auto, (max-width: 800px) 100vw, 800px" />
                                                </div>
                                            </div>
                                            <div class="box-text text-left">
                                                <div class="box-text-inner blog-post-inner">
                                                    <h5 class="post-title is-large ">Black Friday starts today and will last
                                                        until November 28th</h5>
                                                    <div class="is-divider"></div>
                                                    <p class="from_the_blog_excerpt ">his year, Black Friday will take place
                                                        on Friday, November 25th. At Ledger, we have decided... </p>
                                                </div>
                                            </div>
                                            <div class="badge absolute top post-date badge-square">
                                                <div class="badge-inner">
                                                    <span class="post-date-day">31</span><br>
                                                    <span class="post-date-month is-xsmall">Th1</span>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                            <div class="col post-item">
                                <div class="col-inner">
                                    <a href="https://solar3.maugiaodien.com/2023/01/31/we-are-bringing-our-crypto-hardware-devices-to-all-best/"
                                        class="plain">
                                        <div class="box box-vertical box-text-bottom box-blog-post has-hover">
                                            <div class="box-image" style="width:27%;">
                                                <div class="image-zoom image-cover" style="padding-top:78%;">
                                                    <img loading="lazy" decoding="async" width="973" height="780"
                                                        src="/layouts/layout01/images/new1.jpg"
                                                        class="attachment-original size-original wp-post-image" alt=""
                                                        srcset="https://solar3.maugiaodien.com/wp-content/uploads/2023/01/8.jpg 973w, https://solar3.maugiaodien.com/wp-content/uploads/2023/01/8-300x240.jpg 300w, https://solar3.maugiaodien.com/wp-content/uploads/2023/01/8-768x616.jpg 768w, https://solar3.maugiaodien.com/wp-content/uploads/2023/01/8-600x481.jpg 600w"
                                                        sizes="auto, (max-width: 973px) 100vw, 973px" />
                                                </div>
                                            </div>
                                            <div class="box-text text-left">
                                                <div class="box-text-inner blog-post-inner">
                                                    <h5 class="post-title is-large ">We are bringing our crypto-hardware
                                                        devices to all Best</h5>
                                                    <div class="is-divider"></div>
                                                    <p class="from_the_blog_excerpt ">We are bringing our crypto-hardware
                                                        devices to all Best Buy stores across the US starting today. Best
                                                        Buy... </p>
                                                </div>
                                            </div>
                                            <div class="badge absolute top post-date badge-square">
                                                <div class="badge-inner">
                                                    <span class="post-date-day">31</span><br>
                                                    <span class="post-date-month is-xsmall">Th1</span>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div> --}}
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