<!DOCTYPE html>

<html lang="vi-VN" prefix="og: http://ogp.me/ns#" class="loading-site no-js">


<head>
    @include('common.meta')
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous">
    </script>
    <link rel='stylesheet' id='wp-block-library-css'
        href='/layouts/layout04/css/style.min8217.css?ver={{ config('app.version') }}' type='text/css' media='all' />
    <link rel='stylesheet' id='wp-block-library-css'
        href='/layouts/layout04/css/devvn-localstorece14.css?ver={{ config('app.version') }}' type='text/css'
        media='all' />
    <link rel='stylesheet' id='wc-block-style-css'
        href='/layouts/layout04/css/stylef4e1.css?ver={{ config('app.version') }}' type='text/css' media='all' />
    <link rel='stylesheet' id='photoswipe-default-skin-css'
        href='/layouts/layout04/css/default-skinf4e1.css?ver={{ config('app.version') }}' type='text/css'
        media='all' />
    <link rel='stylesheet' id='photoswipe-css'
        href='/layouts/layout04/css/photoswipef4e1.css?ver={{ config('app.version') }}' type='text/css'
        media='all' />
    <link rel='stylesheet' id='contact-form-7-css'
        href='/layouts/layout04/css/styles3c21.css?ver={{ config('app.version') }}' type='text/css' media='all' />
    <link rel='stylesheet' id='flatsome-icons-css'
        href='/layouts/layout04/css/fl-iconsa237.css?ver={{ config('app.version') }}' type='text/css' media='all' />
    <link rel='stylesheet' id='flatsome-main-css'
        href='/layouts/layout04/css/flatsomea5bd.css?ver={{ config('app.version') }}' type='text/css' media='all' />
    <link rel='stylesheet' id='flatsome-shop-css'
        href='/layouts/layout04/css/flatsome-shopa5bd.css?ver={{ config('app.version') }}' type='text/css'
        media='all' />
    <link rel='stylesheet' id='flatsome-style-css'
        href='/layouts/layout04/css/style5152.css?ver={{ config('app.version') }}' type='text/css' media='all' />
    <link rel='stylesheet' id='custom-css' href='/layouts/layout04/css/custom-css.css?ver={{ config('app.version') }}'
        type='text/css' media='all' />
    <link rel='stylesheet'
        href='http://fonts.googleapis.com/css?family=Roboto%3Aregular%2C500%2Cregular%2C500%7CDancing+Script%3Aregular%2C400&amp;display=swap&amp;ver=3.9'
        type='text/css' media='all' />

    <script type='text/javascript' src='/layouts/layout04/js/jquery4a5f.js?ver={{ config('app.version') }}'></script>
    <script type='text/javascript' src='/layouts/layout04/js/jquery-migrate.min330a.js?ver={{ config('app.version') }}'>
    </script>
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css?ver={{ config('app.version') }}">
</head>

<body
    class="home page-template page-template-page-blank page-template-page-blank-php page page-id-24 woocommerce-no-js lightbox nav-dropdown-has-arrow catalog-mode no-prices">

    <div id="wrapper">
        @include('layouts.layout04.elements.header')
        <main id="main" class="">
            <div id="content" role="main" class="content-area">
                @yield('content')
            </div>
        </main>
        @include('layouts.layout04.elements.footer')
    </div>
    <!-- #wrapper -->
    <!-- Mobile Sidebar -->
    @include('layouts.layout04.elements.mobile_sidebar')


    <div class="float-contact">
        @if (!empty($config->zalo))
            <button class="chat-zalo">
                <a href="https://zalo.me/{{ $config->zalo }}">Chat Zalo</a>
            </button>
        @endif
        <button class="hotline">
            <a href="tel:{{ $config->phone }}">Hotline: {{ $config->phone }}</a>
        </button>
    </div>
    <script src="https://code.jquery.com/jquery-3.6.4.min.js?ver={{ config('app.version') }}"></script>
    <script>
        $(document).ready(function() {
            $('.toggle-submenus1').click(function() {
                $('.sss').not($(this).siblings('.sss')).hide();
                $(this).siblings('.sss').toggle();
            });

            $('.toggle-submenus2').click(function() {
                $('.third-level-submenu').not($(this).siblings('.third-level-submenu')).hide();
                $(this).siblings('.third-level-submenu').toggle();
            });
            $('.toggle-submenus3').click(function() {
                $('.third-level-submenu3').not($(this).siblings('.third-level-submenu3')).hide();
                $(this).siblings('.third-level-submenu3').toggle();
            });

            $(document).on('click', function(event) {
                var target = $(event.target);
                if (!target.closest('.toggle-submenus1, .toggle-submenus2, .sss, .third-level-submenu')
                    .length) {
                    $('.sss, .third-level-submenu').hide();
                }
            });
        });
    </script>
    <script>
        $(document).ready(function() {
            $('.submenu-toggle').click(function() {
                $(this).siblings('.submenu2').toggle();
                $(this).closest('li').toggleClass('submenu-open');
            });

            $('.toggle-submenus4').click(function() {
                var parentLi = $(this).closest('li');
                parentLi.toggleClass('third-submenu-open');
                var thirdSubmenu = parentLi.find('.third-level-submenu4');
                thirdSubmenu.toggle();
                $('.third-level-submenu4').not(thirdSubmenu).hide();
            })

            $('.toggle-submenus5').click(function() {
                var parentLi = $(this).closest('li');
                parentLi.toggleClass('third-submenu-open');
                var thirdSubmenu = parentLi.find('.third-level-submenu5');
                thirdSubmenu.toggle();
                $('.third-level-submenu5').not(thirdSubmenu).hide();
            })

        });
    </script>

    <script type='text/javascript' src='/layouts/layout04/js/scripts3c21.js?ver={{ config('app.version') }}'></script>

    <script type='text/javascript'
        src='/layouts/layout04/js/jquery-blockui/jquery.blockUI.min44fd.js?ver={{ config('app.version') }}'></script>

    <script type='text/javascript'
        src='/layouts/layout04/js/frontend/add-to-cart.minf4e1.js?ver={{ config('app.version') }}'></script>
    <script type='text/javascript'
        src='/layouts/layout04/js/js-cookie/js.cookie.min6b25.js?ver={{ config('app.version') }}'></script>
    <script type='text/javascript'>
        /* <![CDATA[ */
        var woocommerce_params = {
            "ajax_url": "\/wp-admin\/admin-ajax.php",
            "wc_ajax_url": "\/?wc-ajax=%%endpoint%%"
        };
        /* ]]> */
    </script>
    <script type='text/javascript'
        src='/layouts/layout04/js/frontend/woocommerce.minf4e1.js?ver={{ config('app.version') }}'></script>
    <script type='text/javascript'>
        /* <![CDATA[ */
        var wc_cart_fragments_params = {
            "ajax_url": "\/wp-admin\/admin-ajax.php",
            "wc_ajax_url": "\/?wc-ajax=%%endpoint%%",
            "cart_hash_key": "wc_cart_hash_068fd2c4a45d515b306334d2c7fa6b1b",
            "fragment_name": "wc_fragments_068fd2c4a45d515b306334d2c7fa6b1b",
            "request_timeout": "5000"
        };
        /* ]]> */
    </script>
    <script type='text/javascript'
        src='/layouts/layout04/js/frontend/cart-fragments.minf4e1.js?ver={{ config('app.version') }}'></script>
    <script type='text/javascript' src='/layouts/layout04/js/flatsome-live-searcha5bd.js?ver={{ config('app.version') }}'>
    </script>
    <script type='text/javascript' src='/layouts/layout04/js/hoverIntent.minc245.js?ver={{ config('app.version') }}'>
    </script>
    <script type='text/javascript'>
        var flatsomeVars = {
            "ajaxurl": "",
            "rtl": "",
            "sticky_height": "70",
            "lightbox": {
                "close_markup": "<button title=\"%title%\" type=\"button\" class=\"mfp-close\"><svg xmlns=\"http:\/\/www.w3.org\/2000\/svg\" width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-x\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"><\/line><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"><\/line><\/svg><\/button>",
                "close_btn_inside": false
            },
            "user": {
                "can_edit_pages": false
            }
        };
    </script>

    <script type='text/javascript' src='/layouts/layout04/js/flatsomea5bd.js?ver={{ config('app.version') }}'></script>
    <script type='text/javascript' src='/layouts/layout04/js/woocommercea5bd.js?ver={{ config('app.version') }}'></script>
    <script type='text/javascript' src='/layouts/layout04/js/wp-embed.min8217.js?ver={{ config('app.version') }}'></script>

</body>

</html>
