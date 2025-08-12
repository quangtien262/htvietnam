<!DOCTYPE html>
<html lang="vi">

<head>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css?ver={{ env('APP_VERSION') }}" rel="stylesheet">

    @include('common.meta')

    <link rel='prefetch' href='/layouts/01/js/chunk.countup.js?ver={{env('APP_VERSION')}}' />
    <link rel='prefetch' href='/layouts/01/js/chunk.sticky-sidebar.js?ver={{env('APP_VERSION')}}' />
    <link rel='prefetch' href='/layouts/01/js/chunk.tooltips.js?ver={{env('APP_VERSION')}}' />
    <link rel='prefetch' href='/layouts/01/js/chunk.vendors-popups.js?ver={{env('APP_VERSION')}}' />
    <link rel='prefetch' href='/layouts/01/js/chunk.vendors-slider.js?ver={{env('APP_VERSION')}}' />

    <link rel='stylesheet' href='/layouts/01/css/styles.css?ver={{env('APP_VERSION')}}' type='text/css' media='all' />
    {{-- <link rel='stylesheet' href='/layouts/01/css/flatsome-swatches-frontend.css?ver={{env('APP_VERSION')}}' type='text/css' media='all' /> --}}
    <link rel='stylesheet' href='/layouts/01/css/all.css' type='text/css' media='all' />
    <link rel='stylesheet' href='/layouts/01/css/flatsome.css?ver={{env('APP_VERSION')}}' type='text/css' media='all' />

    <link rel='stylesheet' href='/layouts/01/css/flatsome-shop.css?ver={{env('APP_VERSION')}}' type='text/css'
        media='all' />
    <link rel='stylesheet' href='/layouts/01/css/style.css?ver=3.0' type='text/css' media='all' />
    <link rel='stylesheet' href='/layouts/01/css/v4-shims.css' type='text/css' media='all' />
    <script src="/layouts/01/js/jquery.min.js?ver={{env('APP_VERSION')}}" id="jquery-core-js"></script>
    <script src="/layouts/01/js/jquery-migrate.min.js?ver={{env('APP_VERSION')}}" id="jquery-migrate-js"></script>

    <style id='woocommerce-inline-inline-css' type='text/css'>
        .woocommerce form .form-row .required {
            visibility: visible;
        }
    </style>

</head>

<body
    class="home page-template page-template-page-blank page-template-page-blank-php page page-id-2 theme-flatsome woocommerce-no-js lightbox">
    <a class="skip-link screen-reader-text" href="#main">Skip to content</a>
    <div id="wrapper">
        <header id="header" class="header has-sticky sticky-jump">
            <div class="header-wrapper">

                {{-- header 01 --}}
                @include('layouts.layout01.elements.layout.header01')

                {{-- header 02 --}}
                @include('layouts.layout01.elements.layout.header02')

                {{-- menu --}}
                @include('layouts.layout01.elements.layout.menu')

                <div class="header-bg-container fill">
                    <div class="header-bg-image fill"></div>
                    <div class="header-bg-color fill"></div>
                </div>
            </div>
        </header>


        <main id="main" class="">
            <div id="content" role="main" class="content-area">

                {{-- content --}}
                @yield('content')

            </div>
        </main>

        @include('layouts.layout01.elements.layout.footer');

        @include('layouts.layout01.elements.layout.menu_mobile');
    </div>



    <div id="enter-id-here" class="lightbox-by-id lightbox-content mfp-hide lightbox-white"
        style="max-width:850px ;padding:0px">
        <a href="https://themewp.vn/kho-plugin/" target="_blank">
            <img src="https://themewp.vn/wp-content/uploads/2025/03/popup-pluginwp_vn.jpg">
        </a>
    </div>

    {{--
    <script data-cfasync="false" src="/layouts/01/js/email-decode.min.js"></script> --}}

    <script>
        // Auto open lightboxes
        jQuery(document).ready(function ($) {
            /* global flatsomeVars */
            'use strict'
            var cookieId = 'lightbox_enter-id-here'
            var cookieValue = 'opened_1'
            var timer = parseInt('3000')

            // Auto open lightbox

            // Run lightbox if no cookie is set
            if (cookie(cookieId) !== cookieValue) {

                // Ensure closing off canvas
                setTimeout(function () {
                    if (jQuery.fn.magnificPopup) jQuery.magnificPopup.close()
                }, timer - 350)

                // Open lightbox
                setTimeout(function () {
                    $.loadMagnificPopup().then(function () {
                        $.magnificPopup.open({
                            midClick: true,
                            removalDelay: 300,
                            // closeBtnInside: flatsomeVars.lightbox.close_btn_inside,
                            // closeMarkup: flatsomeVars.lightbox.close_markup,
                            items: {
                                src: '#enter-id-here',
                                type: 'inline'
                            }
                        })
                    })
                }, timer)

                // Set cookie
                cookie(cookieId, cookieValue, 365)
            }
        })
    </script>

    {{-- btn bottom ở đây --}}

    {{-- login --}}
    @include('layouts.layout01.elements.layout.login');



    <script>
        // (function () {
        //     var c = document.body.className;
        //     c = c.replace(/woocommerce-no-js/, 'woocommerce-js');
        //     document.body.className = c;
        // })();
    </script>

    <script src="/layouts/01/js/index.js?ver=5.7.3" id="swv-js"></script>
    <script id="contact-form-7-js-extra">
        var wpcf7 = { "api": { "root": "https:\/\/solar3.maugiaodien.com\/wp-json\/", "namespace": "contact-form-7\/v1" } };
    </script>

    <script src="/layouts/01/js/jquery.blockUI.min.js?ver=2.7.0-wc.7.3.0" id="jquery-blockui-js"></script>
    <script id="wc-add-to-cart-js-extra">
        var wc_add_to_cart_params = { "ajax_url": "\/wp-admin\/admin-ajax.php", "wc_ajax_url": "\/?wc-ajax=%%endpoint%%", "i18n_view_cart": "View cart", "cart_url": "https:\/\/solar3.maugiaodien.com\/gio-hang\/", "is_cart": "", "cart_redirect_after_add": "no" };
    </script>
    <script src="/layouts/01/js/add-to-cart.min.js?ver=7.3.0" id="wc-add-to-cart-js"></script>
    <script src="/layouts/01/js/js.cookie.min.js?ver=2.1.4-wc.7.3.0" id="js-cookie-js"></script>

    {{--
    <script id="woocommerce-js-extra">
        var woocommerce_params = { "ajax_url": "\/wp-admin\/admin-ajax.php", "wc_ajax_url": "\/?wc-ajax=%%endpoint%%" };
    </script>
    <script src="/layouts/01/js/woocommerce.min.js?ver=7.3.0" id="woocommerce-js"></script> --}}

    {{--
    <script id="wc-cart-fragments-js-extra">
        var wc_cart_fragments_params = { "ajax_url": "\/wp-admin\/admin-ajax.php", "wc_ajax_url": "\/?wc-ajax=%%endpoint%%", "cart_hash_key": "wc_cart_hash_8531a5111c20efcca97a0648533fafcd", "fragment_name": "wc_fragments_8531a5111c20efcca97a0648533fafcd", "request_timeout": "5000" };
    </script>
    <script src="/layouts/01/js/cart-fragments.min.js?ver=7.3.0" id="wc-cart-fragments-js"></script> --}}


    <script src="/layouts/01/js/flatsome-instant-page.js?ver={{env('APP_VERSION')}}"></script>
    <script src="/layouts/01/js/wp-polyfill.min.js?ver={{env('APP_VERSION')}}"></script>
    <script src="/layouts/01/js/hoverIntent.min.js?ver={{env('APP_VERSION')}}"></script>

    <script id="flatsome-js-js-extra">
        var flatsomeVars = { "theme": { "version": "3.16.2" }, "ajaxurl": "https:\/\/solar3.maugiaodien.com\/wp-admin\/admin-ajax.php", "rtl": "", "sticky_height": "70", "assets_url": "https:\/\/solar3.maugiaodien.com\/wp-content\/themes\/flatsome\/assets\/js\/", "lightbox": { "close_markup": "<button title=\"%title%\" type=\"button\" class=\"mfp-close\"><svg xmlns=\"http:\/\/www.w3.org\/2000\/svg\" width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-x\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"><\/line><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"><\/line><\/svg><\/button>", "close_btn_inside": false }, "user": { "can_edit_pages": false }, "i18n": { "mainMenu": "Main Menu", "toggleButton": "Toggle" }, "options": { "cookie_notice_version": "1", "swatches_layout": false, "swatches_box_select_event": false, "swatches_box_behavior_selected": false, "swatches_box_update_urls": "1", "swatches_box_reset": false, "swatches_box_reset_extent": false, "swatches_box_reset_time": 300, "search_result_latency": "0" }, "is_mini_cart_reveal": "1" };
    </script>
    <script src="/layouts/01/js/flatsome.js?ver={{env('APP_VERSION')}}" id="flatsome-js-js"></script>

    {{-- <script src="/layouts/01/js/flatsome-swatches-frontend.js?ver={{env('APP_VERSION')}}"
        id="flatsome-swatches-frontend-js"></script> --}}

    <script src="/layouts/01/js/woocommerce.js?ver={{env('APP_VERSION')}}" id="flatsome-theme-woocommerce-js-js"></script>

    {{-- admin --}}
    <link rel='stylesheet' href="/common/css/common.css?ver={{ env('APP_VERSION') }}" media='all' />

    <script src="/common/js/jquery.224.min.js?ver={{ env('APP_VERSION') }}"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js?ver={{ env('APP_VERSION') }}"
        integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p?ver={{ env('APP_VERSION') }}" crossorigin="anonymous">
    </script>
    
    <script src="/common/js/common.js?ver={{ env('APP_VERSION') }}"></script>
</body>

</html>