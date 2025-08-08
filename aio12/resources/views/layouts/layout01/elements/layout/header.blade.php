<div class="menu4 home4menu hidden-md hidden-sm hidden-xs">
    <div class="container">
        <div class="main-menu">
            <div class="main-nav clearfix is-ts-sticky">
                <div class="row justify-content-between">
                    <div class="col-lg-11 align-self-center hidden-md hidden-sm hidden-xs">
                        <div class="newsprk_nav stellarnav">
                            <ul id="newsprk_menu">
                                <li>
                                    <a href="{{ route('home') }}"><i class="fal fa-home active"></i></a>
                                </li>
                                @php
                                    $menutop = app('Helper')->getMenuByParentId(0);
                                @endphp
                                @foreach ($menutop as $menu)

                                    @php
                                        $menu2 = app('Helper')->getMenuByParentId($menu->id);
                                    @endphp
                                    <li>
                                        @if (count($menu2) > 0)
                                            <a href="{{ app('Helper')->getLinkMenu($menu) }}">{{ $menu->name }}</a>
                                            <ul>
                                                @foreach ($menu2 as $item)
                                                    <li>
                                                        <a href="{{ app('Helper')->getLinkMenu($item) }}">{{ $item->name }}</a>
                                                    </li>
                                                @endforeach
                                            </ul>
                                        @else
                                            <a href="{{ app('Helper')->getLinkMenu($menu) }}">{{ $menu->name }}</a>
                                        @endif
                                    </li>
                                @endforeach


                            </ul>
                        </div>
                    </div>
                    <div class="col-md-1 col-sm-1 col-xs-2 hidden-lg">
                        <div class="search4 menu-bars hidden-lg" style="float:left;margin-left:-15px;">
                            <a class="menu-bar collapsed" data-toggle="collapse" data-target="#all-menu"
                                href="javascript:void(0)" aria-label="link" aria-expanded="false">
                                <i class="far fa-bars" aria-hidden="true"></i>
                            </a>
                        </div>
                    </div>
                    <div class="col-md-9 col-sm-8 col-xs-6 hidden-lg" style="text-align:center;">
                        <h1 title="{{$config->name}}">
                            <span style="display: none">{{$config->name}}</span>
                            <a href="{{ route('home') }}" class="mobile-logo" aria-label="logo">
                                <img style="width:70%;padding-top:15px;" class="lazy"
                                    src="{{ $config->logo }}" alt="{{$config->name}}" />
                            </a>
                        </h1>
                    </div>
                    <div class=" align-self-center col-md-2 col-sm-3 col-xs-4 col-lg-1" style="padding:0;">
                        <div class="search4 searchroleName" data-page="home">
                            <i class="fa fa-search"></i>
                        </div>

                        {{-- menu --}}
                        {{-- <div class="search4 menu-bars hidden-md hidden-sm hidden-xs">
                            <a class="menu-bar collapsed" data-toggle="collapse" data-target="#all-menu"
                                href="javascript:void(0)" aria-label="link" aria-expanded="false">
                                <i class="fas fa-bars" aria-hidden="true"></i>
                            </a>
                        </div> --}}
                    </div>
                </div>
                <fieldset id="all-menu" class="all-menu content-scrollbar collapse" aria-expanded="false"
                    style="height: 33px;">

                    @php
                        $menupo = app('Helper')->getMenuByParentId(0);
                    @endphp

                    @foreach($menupo as $m)

                        @php
                            $subMenu = app('Helper')->getMenuByParentId($m->id);
                        @endphp

                        @if(count($subMenu) > 0)

                            <div class="col-sm-3 col-md-3 pull-left">
                                <div class="menu-group">
                                    <div class="group-head">
                                        <a class="title-group" href="{{ app('Helper')->getLinkMenu($m) }}">{{ $m->name }}</a>
                                    </div>
                                    <div class="row">
                                        <div class="col-6">
                                            @foreach($subMenu as $sub)
                                                <a href="{{ app('Helper')->getLinkMenu($sub) }}" aria-label="link">{{ $sub->name }}</a>
                                            @endforeach
                                        </div>
                                    </div>
                                </div>
                            </div>

                        @else

                            <div class="col-sm-3 col-md-3 pull-left">
                                <div class="menu-group">
                                        <a class="title-group" href="{{ app('Helper')->getLinkMenu($m) }}">{{ $m->name }}</a>
                                </div>
                            </div>

                        @endif

                    @endforeach
                </fieldset>
            </div>
        </div>

        <div class="sub-menu hidden-md">
            <div class="row justify-content-between">
                <div class="col-12 col-lg-12 align-self-center">
                    <div id="marketOverview01" class="newsprk_nav stellarnav"></div>
                </div>
            </div>
        </div>
    </div>
</div>
