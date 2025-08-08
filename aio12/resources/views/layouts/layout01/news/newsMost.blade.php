<div id="divTinDocNhieu">
    @foreach ($news as $key => $item)

        @php
            if ($key > 4) {
                continue;
            }
        @endphp
        <div class="single_post widgets_small widgets_type4 widgets_small_share">
            <div class="post_img number">
                <h2>{{ $key }}</h2>
            </div>
            <div class="single_post_text">
                <h4><a class="fontbold" href="{{ app('Helper')->getLinkNews($item) }}"
                        title="{{ $item->name }}">{{ $item->name }}</a></h4>
                <div class="meta4"> <a href="{{ app('Helper')->getLinkNews($item) }}"
                        title="{{ $item->created_at }}">{{ empty($item->created_at) ? '' : $item->created_at->format('d/m/Y') }}</a> </div>
            </div>
        </div>
        <div class="space-15"></div>
        <div class="border4"></div>
        <div class="space-15"></div>
    @endforeach


</div>
