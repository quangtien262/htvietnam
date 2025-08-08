
        @foreach ($menuHome as $item)
            @php
                $newsByMenu = app('DataService')->getNewsByMenu($item, 6);
            @endphp
            <div class="col-md-6 row-1">
                <div class="sports_wrap border-radious5 ArticleGroupLeft pd-b-10">
                    <div class="finance">
                        <div class="heading categori-title">
                            <div class="tab-menuLS">
                                <h3 class="widget-title fontbold title-menu-new">
                                    <a href="{{ app('Helper')->getLinkmenu($item) }}" title="{{ $item->name }}">{{ $item->name }}</a>
                                </h3>
                            </div>
                        </div>

                        <div class="single_post type18">
                            @if (!empty($newsByMenu[0]))
                                <div class="post_img">
                                    <div class="img_wrap">
                                        <a href="{{ app('Helper')->getLinkNews($newsByMenu[0]) }}"
                                            title="{{ $newsByMenu[0]->name }}">
                                            <img class="lazy" src="{{ $newsByMenu[0]->image }}"
                                                alt="{{ $newsByMenu[0]->name_meta }}">
                                        </a>
                                    </div>
                                    <span class="batch3 date">
                                        {{ empty($newsByMenu[0]->created_at) ? '' : $newsByMenu[0]->created_at->format('d/m/Y') }}
                                    </span>
                                </div>
                                <div class="single_post_text py0 head-h">
                                    <h4><a class="fontbold" href="{{ app('Helper')->getLinkNews($newsByMenu[0]) }}"
                                            title="{{ $newsByMenu[0]->name }}">{{ $newsByMenu[0]->name }}</a></h4>
                                    <div class="space-5"></div>
                                    <p class="post-p">{{ $newsByMenu[0]->name }}</p>
                                </div>
                            @endif
                        </div>
                        <div class="space-15"></div>
                        <div class="border4"></div>
                        <div class="space-15"></div>
                    </div>
                    <div class="sport_buttom">
                        @foreach ($newsByMenu as $key => $item)
                            @php
                                if ($key == 0) {
                                    continue;
                                }
                            @endphp
                            <div class="single_post type10 type16 widgets_small mb15">
                                <div class="post_img">
                                    <div class="img_wrap">
                                        <a href="{{ app('Helper')->getLinkNews($item) }}" title="{{ $item->name }}">
                                            <img class="lazy" src="{{ $item->image }}" alt="{{ $item->name_meta }}">

                                        </a>
                                    </div>
                                </div>
                                <div class="single_post_text">
                                    <a class="title fontbold" href="{{ app('Helper')->getLinkNews($item) }}"
                                        title="{{ $item->name }}">{{ $item->name }}</a>
                                </div>
                            </div>
                            <div class="space-15"></div>
                            <div class="border4"></div>
                            <div class="space-15"></div>
                        @endforeach


                    </div>
                    <hr class="br-dot" />
                    <hr class="b-b-dot" />
                </div>
            </div>
        @endforeach


