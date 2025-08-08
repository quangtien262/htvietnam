<!DOCTYPE html>
<html lang="vi">

<head>
    @include('common.meta')

    <link href="/css/font02.css?ver={{ config('app.version') }}" rel="stylesheet" />

    <link href="/css/libs.css?ver={{ config('app.version') }}" rel="stylesheet" />
    <link href="/css/font.css?ver={{ config('app.version') }}" rel="stylesheet" />
    <link href="/css/mobile-style.css?ver={{ config('app.version') }}" rel="stylesheet" />
    <link href="/css/site.css?ver={{ config('app.version') }}" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">

    <script async type="application/javascript" src="/js/ats.js?ver={{ config('app.version') }}"></script>
    <script src="/js/20nama957.js?ver={{ config('app.version') }}"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>


<body class="theme-4">
    @include('layouts.layout01.elements.layout.topbar')

    {{-- include('layouts.layout01.auth.login') --}}

    <div class="searching_area">
        <div class="container">
            <div class="row">
                <div class="col-lg-10 m-auto text-center">
                    <div class="search_form4">
                        <form action="#">
                            <input type="search" placeholder="Search Here">
                            <input type="submit" value="Search">
                        </form>
                        <div class="search4_close">
                            <i class="far fa-times"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    @include('layouts.layout01.elements.layout.headerMobie.header')

    @include('layouts.layout01.elements.layout.header')

    @include('layouts.layout01.elements.layout.headerMobie.menu')
    <div class="fixcroll"></div>
    <div class="bg-event lr-banner-pos">
        <div class="adv-full-banner">
        </div>
        <div class="bg-full">

            @yield('content')

            @include('layouts.layout01.elements.layout.footer')
            {{-- <div class="scroll-group">
                <div class="page-scroll p-phone">
                    <i class="fa fa-phone-plus"></i>
                    <div class="info-phone">
                        <span>Hotline: <b>{{$config->phone}}</b></span>
                    </div>
                </div>
                <div class="page-scroll p-up">
                    <i class="fa fa-angle-up"></i>
                </div>
                <div class="page-scroll p-down">
                    <i class="fa fa-angle-down"></i>
                </div>
            </div> --}}
        </div>
    </div>

    <script src="/js/index0ea4.js?ver={{ config('app.version') }}"></script>

    @include('layouts.layout01.pages.search')


    <script src="/js/jquery-3.3.1.min.js"></script>
    <script src="/js/script.js?ver={{ config('app.version') }}"></script>

</body>


</html>
