@foreach ($menuRight as $key => $right)
    @php
        $newsByMenu = app('DataService')->getNewsByMenu($right, 6);
    @endphp
    <div class="col-xl-12 col-md-6">
        <div class="finance mb20 border-radious5 ArticleGroup">
            {{-- menu --}}
            <div class="heading">
                <h3 class="widget-title fontbold">
                    <a href="{{ app('Helper')->getLinkmenu($right) }}" title="{{ $right->name }}">{{ $right->name }}</a>
                </h3>
            </div>

            {{-- loop news --}}
            @foreach ($newsByMenu as $n)
                @php
                    $link = app('Helper')->getLinkNews($n);
                @endphp
                <div class="single_post type18 d-xl-block">
                    <div class="post_img">
                        <div class="img_wrap">
                            <a href="{{ $link }}" title="{{ $n->name }}">
                                <img class="lazy" src="{{ $n->image }}" alt="{{ $n->name_meta }}">
                            </a>
                        </div>
                        <span class="batch3 date">
                            {{ empty($n->created_at) ? '' : $n->created_at->format('d/m/Y') }}
                        </span>
                    </div>
                    <div class="single_post_text py0">
                        <h4>
                            <a class="fontbold" href="{{ $link }}"
                                title="{{ $n->name }}">{{ $n->name }}</a>
                        </h4>
                        <div class="space-10"></div>
                        <p class="post-p">{{ $n->description }}</p>
                    </div>
                </div>
                <div class="space-15"></div>
                <div class="border4"></div>
                <div class="space-15"></div>
            @endforeach
        </div>
        {{-- <hr class="br-dot-b" /> --}}
    </div>
@endforeach
