@php
    $menuTmp = app('Helper')->getMenuByIds($n->menu_id);
@endphp
<div class="single_post post_type6 gradient1 border-radious7">
    <div class="post_img gradient1">
        <a class="link-hv-image" href="{{ app('Helper')->getLinkNews($n) }}"
            title="{{ $n->name }}">
            <img class="lazy" data-src="{{ $n->image }}" alt="{{ $n->name_meta }}" />
        </a>
    </div>
    <div class="single_post_text">
        <p class="meta meta_style4">
            @foreach($menuTmp as $m)
                <a class="active link-hv-image meta-time-show"
                href="{{ app('Helper')->getLinkMenuId($n->id) }}"
                title="{{ $m->name }}">{{ $m->name }}</a>
                <i class="space02"> | </i>
            @endforeach
            <span class="time-mobile meta-time-show">
                {{ empty($n->created_at) ? '' : $n->created_at->format('d/m/Y') }}
            </span>
        </p>
        <h4><a class="link-hv-image" href="{{ app('Helper')->getLinkNews($n) }}"
                title="{{ $n->name }}" class="fontbold">{{ $n->name }}</a></h4>
    </div>
</div>
