<h4 class="widget-title fontbold">
    <a href="{{ app('Helper')->getLinkMenuId(8) }}">{{__('user.analysis')}}</a>
</h4>
<div class="business3 border-radious5 mb8 flag-qc line-h-0" id="TieuDiem1">

    @foreach ($analysis as $key => $item)
    @php
        if ($key>= 3) {
            continue;
        }
    @endphp
        <div class="single_post post_type12 type20">
            <div class="post_img">
                <div class="img_wrap border-radious5">
                    <a href="{{ app('Helper')->getLinkNews($item) }}" title="{{ $item->name }}">
                        <img class="lazy" src="{{ $item->image }}" alt="{{ $item->name_meta }}">
                    </a>
                </div>
            </div>
            <div class="single_post_text">
                <div class="meta3"></div>
                <h4>
                    <a class="fontbold" href="{{ app('Helper')->getLinkNews($item) }}"
                        title="{{ $item->name }}">{{ $item->name }}</a>
                </h4>
                <div class="space-10"></div>
                <p class="post-p">{!! $item->description !!}</p>
                <div class="space-10"></div>
            </div>
        </div>
        <hr class="br-sol" />
    @endforeach


    <hr class="b-b-dot" />
    <hr class="horizontal-dottb ipd-horizontal" />
    <hr class="horizontal-dott dkt-horizontal" />
</div>
