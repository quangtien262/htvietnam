@php $menuTmp = app('Helper')->getMenuByIds($item->menu_id); @endphp
<div class="single_post post_type12 type20 mb20 channelContent row">
    <div class="post_img  col-sm-12 col-md-6 col-lg-6">
        <div class="img_wrap  border-radious5">
            <a href="{{app('Helper')->getLinkNews($item)}}"
                title="{{$item->image}}">
                <img class="lazy" src="{{$item->image}}"  alt="{{$item->name_meta}}" />
            </a>
        </div>
    </div>
    <div class="single_post_text col-sm-12 col-md-6 col-lg-6">
        <div class="row">
            <div class="col-12 align-self-cnter">
                <div class="meta3">
                    @foreach($menuTmp as $k => $m)
                        @php
                            if($k >2) {
                                continue;
                            }
                        @endphp
                        <a href="{{ app('Helper')->getLinkMenu($m) }}" title="{{ $m->name }}">
                            {{ $m->name }}
                        </a>
                        <i class="space03"> | </i>
                    @endforeach
                    <a title="{{ $item->name }}">{{ empty($item->created_at) ? '' : $item->created_at->format('d/m/Y') }}</a>
                </div>
            </div>
        </div>
        <h4><a class="fontbold"
                href="{{app('Helper')->getLinkNews($item)}}"
                title="{{ $item->name }}">{{ $item->name }}</a>
        </h4>
        <div class="space-20"></div>
        <p class="post-p">{!!$item->description!!}
        </p>
    </div>
</div>
<div class="border4"></div>
<div class="space-20"></div>
