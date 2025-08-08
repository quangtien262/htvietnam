<div class="row block01">
    <div class="theme-slider-20 col-md-12 col-sm-12 col-xl-8 device-option">
        <div class="tranding3 border-radious5 m-b-10">
            <div class="row">
                <div class="col-md-8 col-xs-12" id="NoiBat">
                    @foreach ($news as $key => $news2)
                        @php
                            if ($key > 0) {
                                continue;
                            }
                        @endphp
                        <div class="single_post post_type3 post_type15">
                            <div class="post_img border-radious5">
                                <div class="img_wrap">
                                    <a href="{{ app('Helper')->getLinkNews($news2) }}" title="{{ $news2->name }}">

                                        <img src="{{ $news2->image }}" alt="{{ $news2->name_meta }}">
                                    </a>
                                </div>
                            </div>
                            <div class="single_post_text">
                                <div class="meta3">
                                    <a href="{{ app('Helper')->getLinkMenuId($news2->menu_id) }}"
                                        title="">{{ $news2->menu_name }}</a>
                                    <a href="{{ app('Helper')->getLinkNews($news2) }}"
                                        title="{{ $news2->name }}">{{ empty($news2->created_at) ? '' : $news2->created_at->format('d/m/Y') }}</a>
                                </div>
                                <h4><a href="{{ app('Helper')->getLinkNews($news2) }}" title="{{ $news2->name }}"
                                        class="fontbold">{{ $news2->name }}</a>
                                </h4>
                                <div class="space-10"></div>
                                <p class="post-p">{!! $news2->description !!}</p>
                            </div>
                        </div>
                    @endforeach

                </div>
                <div class="col-md-4 col-xs-12">

                    <div class="finance border-radious5" id="NoiBat4">

                        @foreach ($news as $key => $item)
                            @php
                                if ($key == 0 || $key > 2) {
                                    continue;
                                }
                            @endphp
                            <div class="single_post  type18">
                                <div class="post_img">
                                    <div class="img_wrap">
                                        <a href="{{ app('Helper')->getLinkNews($news2) }}"
                                            title="{{ $item->name }}">

                                            <img src="{{ $item->image }}" alt="{{ $item->name_meta }}" title="{{ $item->name_meta }}">
                                        </a>
                                    </div>
                                    <span class="batch3 date">
                                        {{ $item->create_at->format('d/m/Y') }}
                                    </span>
                                </div>
                                <div class="single_post_text py0 title-3">
                                    <h4><a href="{{ app('Helper')->getLinkNews($item) }}" title="{{ $item->name }}"
                                            class="fontbold">{{ $item->name }}</a>
                                    </h4>
                                </div>
                            </div>
                        @endforeach

                    </div>
                </div>
            </div>

        </div>
    </div>
    <div class="col-md-12 col-sm-12 col-xl-4 d-xl-block device-show">

        <div class="popular_items mt0" id="hotMenu">
            @foreach ($news as $key => $item)
                @php
                    if (($key == 0 && $key == 1 && $key == 2) || $key > 5) {
                        continue;
                    }
                @endphp

                <div class="single_post type10 type16 widgets_small mb15">
                    <div class="post_img">
                        <div class="img_wrap">
                            <a href="{{ app('Helper')->getLinkNews($item) }}" title="{{ $item->name_meta }}">
                                <img src="{{ $item->image }}" alt="{{ $item->name_meta }}">
                            </a>
                        </div>
                    </div>
                    <div class="single_post_text">
                        <div class="meta3">
                            <a href="{{ app('Helper')->getLinkMenuId($item->menu_id) }}"
                                title="{{ $item->menu_name }}">{{ $item->menu_name }}</a>
                            <a class="hotnews-time" href="{{ app('Helper')->getLinkNews($item) }}"
                                title="{{ $item->name }}">{{ empty($item->created_at) ? '' : $item->created_at->format('d/m/Y') }}</a>
                        </div>
                        <h4><a href="{{ app('Helper')->getLinkNews($item) }}" title="{{ $item->name }}"
                                class="fontbold">{{ $item->name }}</a></h4>
                    </div>
                </div>
            @endforeach

        </div>
    </div>
</div>
