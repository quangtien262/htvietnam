<div class="col-xl-12 col-md-6">
    <div class="finance border-radious5 ArticleGroup articlegroup-ndpt">
        <div class="heading">
            <h3 class="widget-title fontbold"><a>{{__('user.top_view')}}</a>
            </h3>
        </div>

        @if(!empty($newsLatest[0]))
            @php
                $link =  app('Helper')->getLinkNews($newsLatest[0]);
            @endphp
            <div class="single_post mb15 type18 d-xl-block">
                <div class="post_img">
                    <div class="img_wrap">
                        <a href="{{ $link }}" title="{{ $newsLatest[0]->name_data }}">
                            <img class="lazy" src="{{ $newsLatest[0]->image }}" alt="{{ $newsLatest[0]->name_meta }}">
                        </a>
                    </div>
                </div>
                <div class="single_post_text py0 head-h">
                    <h4>
                        <a class="fontbold" href="{{ $link }}" title="{{ $newsLatest[0]->name_data }}">{{ $newsLatest[0]->name_data }}</a>
                    </h4>
                    <div class="space-5"></div>
                    <p class="post-p">{{ $newsLatest[0]->name_data }}</p>
                </div>
            </div>
        @endif

        @foreach($newsLatest as $key => $n)
            <div class="border4"></div>
            <div class="space-15"></div>
            <div class="single_post widgets_small widgets_type4">
                <div class="post_img number">
                    <h2>{{ $key + 2 }}</h2>
                </div>
                <div class="single_post_text">
                    <h4>
                        <a class="fontbold" href="{{ app('Helper')->getLinkNews($n) }}" title="Bitcoin">
                        {{ $n->name_data }}</a>
                    </h4>
                </div>
            </div>
        @endforeach

    </div>
    <hr class="br-dot-b" />
</div>
