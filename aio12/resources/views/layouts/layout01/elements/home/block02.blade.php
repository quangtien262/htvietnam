<div class="row block02">
    <div class="col-md-12 col-xl-8 device-option-2">
        <div class="theme-slider-20 device-option">
            <div class="business_carousel owl-carousel nav_style4 box-nb3" id="NoiBat3">
                @foreach ($news as $item)
                @php $menuTmp = app('Helper')->getMenuByIds($item->menu_id); @endphp
                    <div class="business_carousel_items m-b-5">
                        <div class="single_international">
                            @foreach($menuTmp as $k => $m)
                            @php
                                if($k >1) {
                                    continue;
                                }
                            @endphp
                            <a class="meta before"
                                href="{{ !empty($m->menu_id) ? app('Helper')->getLinkMenuId($m->menu_id) : '' }}">
                                {{ $m->name ?? '' }}
                            </a>
                            <i class="space03"> | </i>
                            @endforeach
                            <h4>
                                <a class="link fontbold" href="{{ app('Helper')->getLinkNews($item) }}" title="{{ $item->name }}">{{ $item->name }}</a>
                            </h4>
                            <div class="row">
                                <div class="col-xl-8 col-lg-8 col-8 col-sm-6">
                                    <p>{!! $item->description !!}</p>
                                </div>
                                <div class="col-xl-4 col-lg-4 col-4 col-sm-6">
                                    <div class="post_img">
                                        <div class="img_wrap">
                                            <a href="{{ app('Helper')->getLinkNews($item) }}" title="{{ $item->name }}">
                                                <img class="lazy" src="{{ $item->image }}" alt="{{ $item->name_meta }}">
                                            </a>
                                        </div>
                                        <span class="batch3 date hidden-lg hidden-md">
                                            {{ empty($item->created_at) ? '' : $item->created_at->format('d/m/Y') }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach

            </div>
            <hr class="b-b-dot" />
        </div>
    </div>
    <div class="col-md-6 col-xl-4 d-xl-block device-show">
        <div id="adv-261-20230809091426">
        </div>
    </div>
</div>
