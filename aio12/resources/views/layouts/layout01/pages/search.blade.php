<div id="popup-search">
    <div class="popup-search-header">
        <span class="btn-close-search" tabindex="0">
            <i class="fa fa-times"></i>
        </span>
    </div>
    <div class="popup-search-container">
        <div class="container">
            <div id="search-logo-swapper" class="row">
                <a href="{{ route('home') }}">
                    <img src="{{$config->logo}}" alt="{{$config->name}}" style="width:200px;" />
                </a>
            </div>


            <div class="row">
                <div class="search-input-container">
                    <span id="search-icon"><i class="fa fa-search"></i></span>
                    <input type="text" id="popup-search-txt" class="popup-search-input"
                        placeholder="Keyword" />
                    <span id="search-clear" class="hidden">
                        <i class="fa fa-times"></i>
                    </span>
                    <span class="search-split"></span>
                    <div id="btn-search" class="search4 searchroleName fix-search-popup" data-page="home">
                        <i class="fa fa-search"></i>
                    </div>
                </div>
            </div>
            <!-- Menu -->

            @php
                $menuSearch = app('Helper')->getMenuByParentId(0);
            @endphp

            <div class="row">
                <div id="search-tabs-wrapper">
                    <ul class="popup-search-tabs">
                        <li><span class="box-menu" id="0">{{ __('user.all') }}</span></li>
                        @foreach($menuSearch as $ms)
                            <li><span class="box-menu" id="{{$ms->id}}">{{$ms->name}}</span></li>
                        @endforeach
                    </ul>
                </div>
                <input id="input-menu" value="0" type="hidden"/>
            </div>
            <!-- Result Seach -->
            <div class="row">
                <div id="popup-search-result">{{ __('user.enter_keyword') }}</div>
            </div>
        </div>
    </div>
</div>
