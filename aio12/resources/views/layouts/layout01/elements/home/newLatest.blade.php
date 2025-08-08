<div class="single_post type10 type16 type22 widgets_small mb15 head-h">
    <div class="post_img">
        <div class="img_wrap"> <a href="{{ app('Helper')->getLinkNews($item) }}"
                title="{{ $item->name }}">
                <img class="lazy entered loaded" src="{{ $item->image }}"
                    alt="{{ $item->name_meta }}" data-ll-status="loaded"
                    src="{{ $item->image }}">
            </a> </div>
    </div>
    <div class="single_post_text">
        <h4><a class="fontbold" href="{{ app('Helper')->getLinkNews($item) }}"
                title="{{ $item->name }}">{{ $item->name }}</a></h4>
    </div>
</div>
<div class="space-15"></div>
<div class="border4"></div>
<div class="space-15"></div>
