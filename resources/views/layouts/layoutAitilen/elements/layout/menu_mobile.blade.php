@php
    $menus = app('DataService')->getMenuByConditions(['menus.parent_id' => 0]);
@endphp
<div id="main-menu" class="mobile-sidebar no-scrollbar mfp-hide">
    <div class="sidebar-menu no-scrollbar ">

        <ul class="nav nav-sidebar nav-vertical nav-uppercase" data-tab="1">

            {{-- đăng nhập/đăng ký --}}
            <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home current-menu-item page_item page-item-2 current_page_item menu-item-62">
                @if (Auth::check())
                    <a href="{{ route('logout') }}">{{ __('user.logout') }}</a>
                @else
                    <a href="#"  data-toggle="modal" data-target="#modalLogin">{{ __('user.login') }}</a> /
                    <a href="#" data-toggle="modal" data-target="#modalRegister">{{ __('user.register') }}</a>
                @endif
            </li>

            {{-- search --}}
            <li class="header-search-form search-form html relative has-icon">
                <div class="header-search-form-wrapper">
                    <div class="searchform-wrapper ux-search-box relative is-normal">
                        <form role="search" method="get" class="searchform" action="">
                            <div class="flex-row relative">
                                <div class="flex-col flex-grow">
                                    <label class="screen-reader-text" for="woocommerce-product-search-field-1">Search
                                        for:</label>
                                    <input type="search" id="woocommerce-product-search-field-1"
                                        class="search-field mb-0" placeholder="Search&hellip;" value=""
                                        name="s" />
                                    <input type="hidden" name="post_type" value="product" />
                                </div>
                                <div class="flex-col">
                                    <button type="submit" value="Search"
                                        class="ux-search-submit submit-button secondary button wp-element-button icon mb-0"
                                        aria-label="Submit">
                                        <i class="icon-search"></i> </button>
                                </div>
                            </div>
                            <div class="live-search-results text-left z-top"></div>
                        </form>
                    </div>
                </div>
            </li>
            @foreach ($menus as $idx => $menu)
                @php
                    $subMenus = app('DataService')->getMenuByConditions(['menus.parent_id' => $menu->id]);
                    $link = app('Helper')->getLinkMenu($menu);
                @endphp

                <li
                    class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home current-menu-item page_item page-item-2 current_page_item menu-item-62">
                    <a href="{{ $link }}" aria-current="page">{{ $menu->name_data }}</a>
                    @if ($subMenus && count($subMenus) > 0)
                        {!! app('Helper')->subMenuLayout01_mobile($subMenus) !!}
                    @endif
                </li>
            @endforeach
        </ul>
    </div>
</div>
