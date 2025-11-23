<div id="masthead" class="header-main hide-for-sticky nav-dark">
    <div class="header-inner flex-row container logo-left medium-logo-center" role="navigation">
        <!-- Logo -->
        <div id="logo" class="flex-col logo">
            <!-- Header logo -->
            <a href="{{route('home')}}" title="{{$seo['title']}}" rel="home">
                <img width="176" height="43" src="{{$config->logo}}" class="header_logo header-logo"
                    alt="{{$seo['title']}}" />
                <img width="176" height="43" src="{{$config->logo}}" class="header-logo-dark"
                    alt="{{$seo['title']}}" /></a>
        </div>
        <!-- Mobile Left Elements -->
        <div class="flex-col show-for-medium flex-left">
            <ul class="mobile-nav nav nav-left ">
                <li class="nav-icon has-icon">
                    <a href="#" data-open="#main-menu" data-pos="left" data-bg="main-menu-overlay" data-color="dark"
                        class="is-small" aria-label="Menu" aria-controls="main-menu" aria-expanded="false">
                        <i class="icon-menu"></i>
                    </a>
                </li>
            </ul>
        </div>

        <!-- Mobile right Elements -->
        <div class="flex-col show-for-medium flex-right">
            @if (auth()->guard('web')->check())
            <p class="tai-khoan02 btn-login01">
                <a class="btn-user btn-profile">Trang cá nhân</a>
            </p>
            @else
            <p class="tai-khoan02 btn-login01">
                <a class="btn-user btn-login02" data-toggle="modal" data-target="#modalLogin">{{ __('user.login') }}</a>
            </p>
            <p class="tai-khoan02">
                <a class="btn-user" data-toggle="modal" data-target="#modalRegister">{{ __('user.register') }}</a>
            </p>
            @endif
        </div>
        <!-- Left Elements -->

        <!-- Right Elements -->
        <div class="flex-col hide-for-medium flex-right header02-right">
            <ul class="header-nav header-nav-main nav nav-right  nav-size-large nav-spacing-large nav-uppercase">
                <li class="header-block">
                    <div class="header-block-block-1">
                        <div class="row header-block" id="row-1201412152">
                            <div id="col-914611949" class="col medium-6 small-12 large-6">
                                <div class="col-inner">
                                    <div class="icon-box featured-box icon-box-left text-left">
                                        <div class="icon-box-img" style="width: 50px">
                                            <div class="icon">
                                                <div class="icon-inner">
                                                    @include('icons.send')
                                                </div>
                                            </div>
                                        </div>
                                        <div class="icon-box-text last-reset">
                                            <h3>{{$config->phone}}</h3>
                                            <p>
                                                <a href="mailto:{{$config->email}}"
                                                    class="__cf_email__">{{$config->email}}</a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="col-4020001" class="col medium-6 small-12 large-6">
                                <div class="col-inner">
                                    <div class="icon-box featured-box icon-box-left text-left">
                                        <div class="icon-box-img" style="width: 50px">
                                            <div class="icon">
                                                <div class="icon-inner">
                                                    {{-- icon localtion --}}
                                                    @include('icons.location')
                                                </div>
                                            </div>
                                        </div>
                                        <div class="icon-box-text last-reset">
                                            @if (auth()->guard('web')->check())

                                            <p class="hi">
                                                <i class="fa-solid fa-heart"></i>
                                                Chào {{ auth()->guard('web')->user()->name }}
                                            </p>
                                            <p>
                                                <a href="/user/" class="tai-khoan logout">
                                                    <i class="fa-solid fa-address-card"></i>
                                                    Trang cá nhân
                                                </a>
                                            </p>

                                            @else

                                            <a class="tai-khoan login" data-toggle="modal" data-target="#modalLogin">
                                                <i class="fa-solid fa-user-lock"></i> Đăng nhập
                                            </a>
                                            <br />
                                            <a class="tai-khoan register" data-toggle="modal"
                                                data-target="#modalRegister">
                                                <i class="fa-solid fa-user-plus"></i> Đăng ký
                                            </a>

                                            @endif
                                            {{-- <h3>{{ $config->address_header }}</h3>
                                            <p>{{ $config->address_header_description }}</p> --}}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <!-- Mobile Right Elements -->
        <div class="flex-col show-for-medium flex-right">
            {{-- <ul class="mobile-nav nav nav-right ">
                <li class="cart-item has-icon">
                    <a href="https://solar3.maugiaodien.com/gio-hang/"
                        class="header-cart-link off-canvas-toggle nav-top-link is-small" data-open="#cart-popup"
                        data-class="off-canvas-cart" title="Cart" data-pos="right">
                        <i class="icon-shopping-cart" data-icon-label="0">
                        </i>
                    </a>
                </li>
            </ul> --}}
        </div>
    </div>
</div>
