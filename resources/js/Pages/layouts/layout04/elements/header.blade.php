<style>
    /* .nav {
   display:flex;
   flex-wrap: nowrap !important;
   } */
    .nav li a {
        color: white;
        padding: 0;
    }

    .row-small>.flickity-viewport>.flickity-slider>.col,
    .row-small>.col {
        padding: 0 17.8px 16.6px;
    }
</style>
<header id="header" class="header ">
    <div class="header-wrapper">
        <div id="top-bar" class="header-top hide-for-sticky nav-dark">
            <div class="flex-row container">
                <div class="flex-col hide-for-medium flex-left">
                    <a href="tel:{{ $config->phone }}">
                        <ul class="nav nav-left medium-nav-center nav-small  nav-divided">
                            <li class="html custom html_topbar_left"> Hotline: {{ $config->phone }}</li>
                        </ul>
                    </a>
                </div>
                <div class="flex-col hide-for-medium flex-center">
                    <ul class="nav nav-center nav-small  nav-divided">
                    </ul>
                </div>
                <div class="flex-col hide-for-medium flex-right">
                    <ul class="nav top-bar-nav nav-right nav-small  nav-divided">
                        <li class="html header-social-icons ml-0">
                            <div class="social-icons follow-icons">
                                @if (!empty($config->facebook_id))
                                    <a href="http://facebook.com/{{ $config->facebook_id }}" target="_blank"
                                        data-label="Facebook" rel="noopener noreferrer nofollow"
                                        class="icon plain facebook tooltip" title="Follow on Facebook">
                                        <i class="icon-facebook"></i>
                                    </a>
                                @endif

                                @if (!empty($config->instagram))
                                    <a href="{{ $config->instagram }}" target="_blank"
                                        rel="noopener noreferrer nofollow" data-label="Instagram"
                                        class="icon plain  instagram tooltip" title="Follow on Instagram"><i
                                            class="icon-instagram"></i>
                                    </a>
                                @endif

                                @if (!empty($config->twitter))
                                    <a href="{{ $config->twitter }}" target="_blank" data-label="Twitter"
                                        rel="noopener noreferrer nofollow" class="icon plain  twitter tooltip"
                                        title="Follow on Twitter"><i class="icon-twitter"></i>
                                    </a>
                                @endif

                                @if (!empty($config->email))
                                    <a href="mailto:{{ $config->email }}" data-label="E-mail" rel="nofollow"
                                        class="icon plain  email tooltip" title="Send us an email"><i
                                            class="icon-envelop"></i></a>
                            </div>
                            @endif
                        </li>

                    </ul>
                </div>

                <div class="flex-col show-for-medium flex-grow">
                    <ul class="nav nav-center nav-small mobile-nav nav-divided">
                        <li class="html custom html_topbar_left">{{ $config->name }} | {{ $config->address }}</li>
                    </ul>
                </div>
            </div>
        </div>
        <div id="masthead" class="header-main hide-for-sticky">
            <div class="header-inner flex-row container logo-left medium-logo-center" role="navigation">
                <!-- Logo -->
                <div id="logo" class="flex-col logo">
                    <!-- Header logo -->
                    @if (Route::currentRouteName() == 'home')
                        <h1 style="margin:0">
                            <a href="{{ route('home') }}" rel="home">
                                <img width="275" height="85" src="{{ $config->logo }}"
                                    class="header_logo header-logo" /><img width="275" height="85"
                                    src="{{ $config->logo }}" class="header-logo-dark" /></a>
                        </h1>
                    @else
                        <a href="{{ route('home') }}" rel="home">
                            <img width="275" height="85" src="{{ $config->logo }}"
                                class="header_logo header-logo" /><img width="275" height="85"
                                src="{{ $config->logo }}" class="header-logo-dark" /></a>
                    @endif
                </div>
                <!-- Mobile Left Elements -->
                <div class="flex-col show-for-medium flex-left">
                    <ul class="mobile-nav nav nav-left ">
                        <li class="nav-icon has-icon">
                            <a href="#" data-open="#main-menu" data-pos="left" data-bg="main-menu-overlay"
                                data-color="" class="is-small" aria-label="Menu" aria-controls="main-menu"
                                aria-expanded="false">
                                <i class="icon-menu"></i>
                            </a>
                        </li>
                    </ul>
                </div>
                <!-- Left Elements -->
                <div class="flex-col hide-for-medium flex-left
               flex-grow">
                    <ul class="header-nav header-nav-main nav nav-left  nav-uppercase">
                        <li class="header-block">
                            <div class="header-block-block-1">
                                <div class="row row-small" id="row-712268248">
                                    <div class="col medium-4 small-12 large-4">
                                        <div class="col-inner">
                                            <div id="gap-1739063372" class="gap-element clearfix"
                                                style="display:block; height:auto;">
                                                <style scope="scope">
                                                    #gap-1739063372 {
                                                        padding-top: 22px;
                                                    }
                                                </style>
                                            </div>
                                            <div class="searchform-wrapper ux-search-box relative is-normal">
                                                <form role="search" method="get" class="searchform"
                                                    action="{{ route('search') }}">
                                                    <div class="flex-row relative">
                                                        <div class="flex-col search-form-categories">
                                                            {{-- <select class="search_categories resize-select mb-0" name="product_cat">
                                                                <option value="" selected='selected'>All</option>
                                                            </select> --}}
                                                        </div>
                                                        <div class="flex-col flex-grow">
                                                            <label class="screen-reader-text"
                                                                for="woocommerce-product-search-field-0">Tìm
                                                                kiếm:</label>
                                                            <input type="search" required
                                                                id="woocommerce-product-search-field-0"
                                                                class="search-field mb-0" placeholder="Tìm kiếm"
                                                                value="{{ $_GET['keyword'] ?? '' }}"
                                                                name="keyword" />
                                                            <input type="hidden" name="post_type" value="product" />
                                                        </div>
                                                        <div class="flex-col">
                                                            <button type="submit" value="Tìm kiếm"
                                                                class="ux-search-submit submit-button secondary button icon mb-0">
                                                                <i class="icon-search"></i> </button>
                                                        </div>
                                                    </div>
                                                    <div class="live-search-results text-left z-top"></div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col medium-2 small-12 large-2">
                                        <div class="col-inner">
                                            <div id="gap-1993793224" class="gap-element clearfix"
                                                style="display:block; height:auto;">
                                                <style scope="scope">
                                                    #gap-1993793224 {
                                                        padding-top: 15px;
                                                    }
                                                </style>
                                            </div>
                                            <div class="icon-box featured-box icon-box-left text-left">
                                                <div class="icon-box-img" style="width: 29px; display: flex;">
                                                    {{-- icon phone --}}
                                                    <div class="icon">
                                                        <div class="icon-inner">
                                                            <img width="60" height="60"
                                                                src="/layouts/layout04/images/auricular-phone-symbol-in-a-circle.png"
                                                                class="attachment-medium size-medium"
                                                                alt="" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="icon-box-text last-reset">
                                                    <p>
                                                        <span style="color: #ffffff; font-size: 75%;">
                                                            Gọi đặt hàng
                                                        </span>
                                                        <br />
                                                        <span style="font-size: 75%;"><strong><span
                                                                    style="color: #ffffff;">{{ $config->phone }}</span></strong></span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col medium-3 small-12 large-3" style="padding-left:0px">
                                        <div class="col-inner">
                                            <div id="gap-994090815" class="gap-element clearfix"
                                                style="display:block; height:auto;">
                                                <style scope="scope">
                                                    #gap-994090815 {
                                                        padding-top: 20px;
                                                    }
                                                </style>
                                            </div>
                                            <div class="flex-col hide-for-medium flex-right">
                                                <ul class="header-nav header-nav-main nav nav-right  nav-uppercase">
                                                    @if (\Auth::guard('web')->check())
                                                        @php
                                                            $user = \Auth::guard('web')->user();
                                                        @endphp
                                                        <li class="account-item has-icon">

                                                            <a href="#"
                                                                class="nav-top-link nav-top-not-logged-in is-small">
                                                                <span>{{ $user->name }}</span>
                                                            </a>
                                                        </li>
                                                        <li class="account-item has-icon">
                                                            <a href="{{ route('logout') }}"
                                                                class="nav-top-link nav-top-not-logged-in is-small">
                                                                <span>Thoát </span>
                                                            </a>
                                                        </li>
                                                    @else
                                                        <li class="account-item has-icon">
                                                            <a href="{{ route('login') }}"
                                                                class="nav-top-link nav-top-not-logged-in is-small">
                                                                <span>Đăng nhập</span>
                                                            </a>
                                                            <span> / </span>
                                                            <a href="{{ route('register') }}"
                                                                class="nav-top-link nav-top-not-logged-in is-small">
                                                                <span>Đăng ký</span>
                                                            </a>
                                                        </li>
                                                    @endif
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col medium-2 small-12 large-2" style="padding-right:0px">
                                        <div class="col-inner cart-item has-icon has-dropdown">
                                            <div id="gap-1993793225" class="gap-element clearfix"
                                                style="display:block; height:auto;">
                                                <style scope="scope">
                                                    #gap-1993793225 {
                                                        padding-top: 20px;
                                                    }
                                                </style>
                                            </div>
                                            @php
                                                $cart_qty = \Cart::count();
                                            @endphp
                                            <a href="{{ route('cart') }}" title="Giỏ hàng"
                                                class="header-cart-link is-small">
                                                <span class="image-icon header-cart-icon"
                                                    data-icon-label="{{ $cart_qty }}"><img class="cart-img-icon"
                                                        alt="Giỏ hàng"
                                                        src="/layouts/layout04/images/cart-icon.png" /></span>
                                                <span class="header-cart-title">Giỏ hàng</span> </a>
                                        </div>
                                    </div>
                                    <style scope="scope">
                                    </style>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <!-- Right Elements -->
                <div class="flex-col hide-for-medium flex-right">
                    <ul class="header-nav header-nav-main nav nav-right  nav-uppercase">
                    </ul>
                </div>
                <!-- Mobile Right Elements -->
                <div class="flex-col show-for-medium flex-right">
                    <ul class="mobile-nav nav nav-right ">
                    </ul>
                </div>
            </div>
        </div>
        @php
            $menutop = app('Helper')->getMenuByParentId(0);
        @endphp
        <div id="wide-nav" class="header-bottom wide-nav hide-for-sticky nav-dark hide-for-medium">
            <div class="flex-row container">
                <div class="flex-col hide-for-medium flex-left">
                    <ul
                        class="nav header-nav header-bottom-nav nav-left  nav-divided nav-size-medium nav-spacing-xlarge nav-uppercase">
                        @foreach ($menutop as $menu0)
                            @php
                                $subMenu = app('Helper')->getMenuByParentId($menu0->id);
                            @endphp
                            <li
                                class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home current-menu-item page_item page-item-24 current_page_item menu-item-26 active">
                                <div class="menu-item-header">
                                    @if (count($subMenu) > 0)
                                        <a href="{{ app('Helper')->getLinkMenu($menu0) }}" aria-current="page"
                                            class="nav-top-link toggle-submenus">{{ $menu0->name }}</a>
                                        <i class="fas fa-chevron-down toggle-submenus1"></i>
                                        <ul class="sss">
                                            @foreach ($subMenu as $sub)
                                                <li>
                                                    <div class="submenu-header">
                                                        <a href="{{ app('Helper')->getLinkMenu($sub) }}"
                                                            class="">{{ $sub->name }}</a>
                                                        @php
                                                            $subSubMenu = app('Helper')->getMenuByParentId($sub->id);
                                                        @endphp
                                                        @if (count($subSubMenu) > 0)
                                                            <i class="fas fa-chevron-down toggle-submenus2"></i>
                                                            <ul class="third-level-submenu">
                                                                @foreach ($subSubMenu as $subSub)
                                                                <div class="submenu-header4">
                                                                    <li style="display: flex;
                                                                    align-items: center;">
                                                                        <a href="{{ app('Helper')->getLinkMenu($subSub) }}"
                                                                            class="">{{ $subSub->name }}</a>
                                                                        @php
                                                                            $subSubMenu3 = app('Helper')->getMenuByParentId($subSub->id);
                                                                        @endphp
                                                                        <div class="submenu-header3" style="padding-left: 11px">
                                                                            @if (count($subSubMenu3) > 0)
                                                                                <i class="fas fa-chevron-down toggle-submenus3" ></i>
                                                                                <ul class="third-level-submenu3">
                                                                                    @foreach ($subSubMenu3 as $item)
                                                                                        <li><a href="{{ app('Helper')->getLinkMenu($item) }}"
                                                                                            class="">{{ $item->name }}</a></li>
                                                                                    @endforeach
                                                                                </ul>
                                                                            @endif
                                                                        </div>
                                                                    </li>
                                                                </div>
                                                                    
                                                                @endforeach
                                                            </ul>
                                                        @endif
                                                    </div>
                                                </li>
                                            @endforeach
                                        </ul>
                                    @else
                                        <a href="{{ app('Helper')->getLinkMenu($menu0) }}" aria-current="page"
                                            class="nav-top-link">{{ $menu0->name }}</a>
                                    @endif
                                </div>
                            </li>
                        @endforeach
                        <style>
                            /* Display the submenus when hovering over the parent menu item */
                        </style>
                    </ul>
                </div>
                <div class="flex-col hide-for-medium flex-right flex-grow">
                    <ul
                        class="nav header-nav header-bottom-nav nav-right  nav-divided nav-size-medium nav-spacing-xlarge nav-uppercase">
                    </ul>
                </div>
            </div>
        </div>
        <div class="header-bg-container fill">
            <div class="header-bg-image fill"></div>
            <div class="header-bg-color fill"></div>
        </div>
    </div>
    <!-- header-wrapper-->
</header>
