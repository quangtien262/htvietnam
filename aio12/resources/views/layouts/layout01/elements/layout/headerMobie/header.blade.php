<div class="headMobileContainer frame_menu hidden-lg" style="width: 100%; margin: 0px auto;">
    <div class="main_menu">
        <div class="container xs-container">
            <div class="menu_nav mobile-menu">
                <a href="{{ route('home') }}" class="mobile-logo" aria-label="logo">
                    <img src="{{ $config->logo }}" alt="{{ $config->name }}" />
                </a>

                <div class="menu-bars" id="menu_mo">
                    <a class="menu-bar collapsed" data-toggle="collapse" data-target="#all-menu"
                        href="javascript:void(0)" aria-label="link" aria-expanded="false">

                        <img class="imgMenuBar" src="https://img.htvietnam.vn/vietstock/menubar.svg" width="35"
                            alt="menubar" />
                    </a>
                </div>
                <fieldset id="all-menu" class="all-menu content-scrollbar collapse menu_o" aria-expanded="false"
                    style="height: 33px;">

                    @php
                        $headerMenu = app('Helper')->getMenuByParentId(0);
                    @endphp
                    @foreach ($headerMenu as $item)
                        @php
                            $subHeaderMenu = app('Helper')->getMenuByParentId($item->id);
                        @endphp
                        @if (count($subHeaderMenu) == 0)
                            <div class="col-sm-3 col-md-3 pull-left">
                                <div class="menu-group">
                                    <a class="title-group"
                                        href="{{ app('Helper')->getLinkMenu($item) }}">{{ $item->name }}</a>
                                </div>
                            </div>
                        @else
                            <div class="col-sm-4 col-md-4 pull-left">
                                <div class="menu-group">
                                    <div class="group-head">
                                        <a class="title-group" href="{{ route('home') }}">{{ $item->name }}</a>
                                    </div>
                                    <div class="row">
                                        <div class="col-6">
                                            @foreach ($subHeaderMenu as $item02)
                                                @php
                                                    $link02 = app('Helper')->getLinkMenu($item02);
                                                @endphp
                                                <a href="{{ $link02 }}" aria-label="link">{{ $item02->name }}</a>
                                                <p></p>
                                            @endforeach
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @endif
                    @endforeach

                </fieldset>
            </div>
            <div class="mobile-search">
                @php
                    $langs = app('Helper')->getDataByConditions('languages');
                    $langId = app('Helper')->getCurrentLang();
                @endphp
                <a class="title-link btnlogin" >

                    <select id="select-option-search" class="lang-3" onchange="window.location.href = this.value;">
                        @foreach ($langs as $lang)
                            <option {{ $langId == $lang->id ? 'selected' : '' }}
                                value="{{ route('changeLang', ['lang' => $lang->code]) }}">
                                {{ $lang->name }}
                            </option>
                        @endforeach


                    </select>
                </a>



              
                    <a href="javascript:void(0)" onclick="ShowPopupSearch()" aria-label="search">
                        <img class="btSearchbymobile" src="https://img.htvietnam.vn/vietstock/search.svg" width="15"
                            alt="search" />
                    </a>
              
            </div>

        </div>


    </div>

</div>

</div>

<div id="marketOverview_mobile" class="row market_overview_mobile"></div>
