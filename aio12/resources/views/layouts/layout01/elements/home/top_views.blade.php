<div class="col-xl-12 col-md-12 main-topview-right">
    <div class="finance border-radious5 ArticleGroup articlegroup-ndpt">
        <div class="heading">
            <h3 class="widget-title fontbold"><a>{{__('user.top_view')}}</a>
            </h3>
        </div>

        @if(!empty($topViews[0]))
            @php
                $link =  app('Helper')->getLinkNews($topViews[0]);
            @endphp
            <div class="single_post mb15 type18 d-xl-block">
                <div class="post_img">
                    <div class="img_wrap">
                        <a href="{{ $link }}" title="{{ $topViews[0]->name }}">
                            <img class="lazy" src="{{ $topViews[0]->image }}" alt="{{ $topViews[0]->name_meta }}">
                        </a>
                    </div>
                </div>
                <div class="single_post_text py0 head-h">
                    <h4>
                        <a class="fontbold" href="{{ $link }}" title="{{ $topViews[0]->name }}">{{ $topViews[0]->name }}</a>
                    </h4>
                    <div class="space-5"></div>
                    <p class="post-p">{{ $topViews[0]->name }}</p>
                </div>
            </div>
        @endif

        @foreach($topViews as $key => $n)
            <div class="border4"></div>
            <div class="space-15"></div>
            <div class="single_post widgets_small widgets_type4">
                <div class="post_img number">
                    <h2>{{ $key + 2 }}</h2>
                </div>
                <div class="single_post_text">
                    <h4>
                        <a class="fontbold" href="{{ app('Helper')->getLinkNews($n) }}" title="Bitcoin">
                        {{ $n->name }}</a>
                    </h4>
                </div>
            </div>
        @endforeach

    </div>
    <br/>
    <hr class="br-dot-b" />
</div>
