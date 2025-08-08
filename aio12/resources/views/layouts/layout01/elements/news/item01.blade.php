@php $menuTmp = app('Helper')->getMenuByIds($item->menu_id); @endphp
<div class="col-12 col-sm-6 col-lg-3 col-xl-3 item-news-04">
    <div class="topic_carousel_items white_bg shadow7">
        <div class="single_post post_type3 post_type15">
            <div class="post_img">
                <div class="img_wrap">
                    <a href="{{ app('Helper')->getLinkNews($item) }}"
                        title="{{ $item->name }}">
                        <img class="lazy entered loaded" data-src="{{ $item->image }}"
                            alt="{{ $item->name_meta }}" data-ll-status="loaded"
                            src="{{ $item->image }}">
                    </a>
                </div>
            </div>
            <div class="single_post_text white_bg descript-highlight">
                <div class="meta3">
                    @foreach($menuTmp as $k => $m)
                        @php if($k > 1) {continue;} @endphp
                        <a href="{{ app('Helper')->getLinkMenu($m) }}" title="{{ $m->name }}">{{ $m->name }}</a>
                        <i class="space03"> | </i>
                    @endforeach

                    <a title="{{ $item->name }}">{{ empty($item->created_at) ? '' : $item->created_at->format('d/m/Y') }}</a>
                </div>
                <h4> <a class="fontbold"
                        href="{{ app('Helper')->getLinkNews($item) }}"
                        title="{{ $item->name }}">{{ $item->name }}</a> </h4>
                <div class="space-10"></div>
                <p class="post-p">{!!$item->description!!}</p>
                <div class="space-10"></div>
            </div>
        </div>
    </div>
</div>
