
{{-- <div class="hidden-lg" id="menuMobile">
    <div class="menuMobileContainer">
        <div class="menuMobileImg">
            <a href="{{ route('home') }}"><i class="fal fa-home active"></i></a>
        </div>
        <div class="newsprk_nav1 stellarnav1 light right desktop">
            <ul id="newsprk_menu1">
                @php
                    $menuMobie = app('Helper') ->getMenuByParentId(0)
                @endphp
                @foreach ($menuMobie as $item)
                <li>
                    <a href="{{app('Helper')->getLinkMenu($item)}}">{{$item->name}}</a>
                </li>
                @endforeach


            </ul>
        </div>
    </div>



    <div class="container topIndexsMobile">
        <div class="row top-indexs" id="top-indexsMobile">
        </div>
    </div>
</div> --}}
