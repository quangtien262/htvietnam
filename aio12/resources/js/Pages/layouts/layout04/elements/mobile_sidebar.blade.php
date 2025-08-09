@php
    $menutop = app('Helper')->getMenuByParentId(0);
@endphp
<div id="main-menu" class="mobile-sidebar no-scrollbar mfp-hide">
    <div class="sidebar-menu no-scrollbar ">
        <ul class="nav nav-sidebar  nav-vertical nav-uppercase">

            @foreach ($menutop as $key => $value)
                @php
                    $subMenu = app('Helper')->getMenuByParentId($value->id);
                @endphp
                <li id="menu-item-34"
                    class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-34 menu-item-design-default has-dropdown">
                    @if (count($subMenu) > 0)
                        <a href="{{ app('Helper')->getLinkMenu($value) }}" class="nav-top-link">{{ $value->name }}</a>
                        <i class="fas fa-chevron-down submenu-toggle"></i>

                        <ul class="submenu2">
                            @foreach ($subMenu as $submenu)
                                @php
                                    $subSubMenu = app('Helper')->getMenuByParentId($submenu->id);
                                @endphp
                                <style>

                                </style>
                                @if (count($subSubMenu) > 0)
                                    <li style="padding-left: 25px">
                                        <div class="menu-item-wrapper">
                                            <a class="nav-top-link"
                                                href="{{ app('Helper')->getLinkMenu($submenu) }}">{{ $submenu->name }}</a>
                                            <i class="fas fa-chevron-down toggle-submenus4"></i>
                                        </div>

                                        <ul class="third-level-submenu4">
                                            @foreach ($subSubMenu as $subSub)
                                                @php
                                                    $subSubMenu2 = app('Helper')->getMenuByParentId($subSub->id);
                                                @endphp

                                                @if (count($subSubMenu2) > 0)
                                                    <li>
                                                        <div style="display: flex;align-items:center">
                                                            <a class="lfer"
                                                                href="{{ app('Helper')->getLinkMenu($subSub) }}"
                                                                class="">{{ $subSub->name }}</a>
                                                            <i class="fas fa-chevron-down toggle-submenus5"></i>
                                                        </div>

                                                        <ul class="third-level-submenu5">
                                                            @foreach ($subSubMenu2 as $item)
                                                                <li>
                                                                    <a
                                                                        href="{{ app('Helper')->getLinkMenu($item) }}">{{ $item->name }}</a>
                                                                </li>
                                                            @endforeach
                                                        </ul>
                                                    </li>
                                                    <style>
                                                        .toggle-submenus5 {
                                                            float: right;
                                                            cursor: pointer;
                                                            font-size: 14px;
                                                            padding-right: 13px
                                                        }
                                                    </style>
                                                @else
                                                    <li>
                                                        <a class="lfer"
                                                            href="{{ app('Helper')->getLinkMenu($subSub) }}"
                                                            class="">{{ $subSub->name }}</a>
                                                    </li>
                                                @endif
                                            @endforeach
                                        </ul>
                                    </li>
                                @else
                                    <li>
                                        <a href="{{ app('Helper')->getLinkMenu($submenu) }}">{{ $submenu->name }}</a>
                                    </li>
                                @endif
                            @endforeach

                        </ul>
                    @else
                        <a href="{{ app('Helper')->getLinkMenu($value) }}"
                            class="nav-top-link">{{ $value->name }}</a>
                    @endif
                </li>
            @endforeach
            @php
                $cart_qty = \Cart::count();
            @endphp
            <li
                class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home current-menu-item page_item page-item-24 current_page_item menu-item-26">
                <a href="{{ route('cart') }}" aria-current="page">Giỏ hàng ({{ $cart_qty }})</a>
            </li>
            <li class="header-search-form search-form html relative has-icon">
                <div class="header-search-form-wrapper">
                    <div class="searchform-wrapper ux-search-box relative is-normal">
                        <form role="search" method="get" class="searchform" action="{{ route('search') }}">
                            <div class="flex-row relative">
                                {{-- <div class="flex-col search-form-categories">
                                    <select class="search_categories resize-select mb-0" name="product_cat">
                                        <option value="" selected='selected'>All</option>
                                        <option value="cong-thuc-sua-chua-tien-tien">Công Thức Sửa Chữa Tiên Tiến
                                        </option>
                                        <option value="gach-men">Gạch Men</option>
                                        <option value="giai-phap-op-lat-gach-hoan-hao">Giải Pháp Ốp Lát Gạch Hoàn
                                            Hảo</option>
                                        <option value="son-beger">Sơn beger</option>
                                    </select>
                                </div> --}}
                                <div class="flex-col flex-grow">
                                    <label class="screen-reader-text" for="woocommerce-product-search-field-1">Tìm
                                        kiếm:</label>
                                    <input type="search" id="woocommerce-product-search-field-1"
                                        class="search-field mb-0" placeholder="Tìm kiếm&hellip;"
                                        value="{{ $_GET['keyword'] ?? '' }}" name="keyword" />
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
            </li>



            <style>
                .third-level-submenu4 {
                    display: none;
                }

                .third-level-submenu5 {
                    display: none;
                }

                .lfer {
                    padding-left: 0px !important;
                }
            </style>



            @if (\Auth::guard('web')->check())
                @php
                    $user = \Auth::guard('web')->user();
                @endphp

                <li class="account-item has-icon">
                    <a class="nav-top-link nav-top-not-logged-in is-small">
                        <span> {{ $user->name }}</span>
                    </a>
                </li>
                <li>
                    <a href="{{ route('logout') }}" class="nav-top-link nav-top-not-logged-in is-small">
                        Đăng xuất
                    </a>
                </li>
            @else
                <li class="account-item has-icon menu-item">
                    <a href="{{ route('login') }}" class="nav-top-link nav-top-not-logged-in">
                        <span class="header-account-title"> Đăng nhập </span>
                    </a>

                </li>
            @endif

            <li class="html header-social-icons ml-0">
                <div class="social-icons follow-icons">
                    @if (!empty($config->facebook_id))
                        <a href="https://www.facebook.com/{{ $config->facebook_id }}" target="_blank"
                            data-label="Facebook" rel="noopener noreferrer nofollow" class="icon plain facebook tooltip"
                            title="Follow on Facebook"><i style="color: black" class="icon-facebook"></i>
                    @endif
                    @if (!empty($config->instagram))
                        </a><a href="{{ $config->instagram }}" target="_blank" rel="noopener noreferrer nofollow"
                            data-label="Instagram" class="icon plain  instagram tooltip" title="Follow on Instagram"><i
                                class="icon-instagram" style="color: black"></i></a>
                    @endif
                    @if (!empty($config->twitter))
                        <a href="{{ $config->twitter }}" target="_blank" data-label="Twitter"
                            rel="noopener noreferrer nofollow" class="icon plain  twitter tooltip"
                            title="Follow on Twitter"><i style="color: black" class="icon-twitter"></i></a>
                    @endif
                    @if (!empty($config->gmail))
                        <a href="mailto:{{ $config->gmail }}" data-label="E-mail" rel="nofollow"
                            class="icon plain  email tooltip" title="Send us an email"><i class="icon-envelop"
                                style="color: black"></i></a>
                    @endif
                </div>
            </li>
            <li class="html custom html_topbar_right">Thời gian làm việc: 8:00 - 17:00</li>
        </ul>
    </div>
</div>
