<!DOCTYPE html>
<html lang="vi">

<head>
    {{-- load bootstrap --}}
    <link rel="stylesheet" href="/vendor/bootstrap4/css/bootstrap.min.css">

    @include('common.meta')

    <link rel='prefetch' href='/layouts/01/js/chunk.countup.js?ver={{ env('APP_VERSION') }}' />
    <link rel='prefetch' href='/layouts/01/js/chunk.sticky-sidebar.js?ver={{ env('APP_VERSION') }}' />
    <link rel='prefetch' href='/layouts/01/js/chunk.tooltips.js?ver={{ env('APP_VERSION') }}' />
    <link rel='prefetch' href='/layouts/01/js/chunk.vendors-popups.js?ver={{ env('APP_VERSION') }}' />
    <link rel='prefetch' href='/layouts/01/js/chunk.vendors-slider.js?ver={{ env('APP_VERSION') }}' />

    

    
    
    <link rel='stylesheet' href='/layouts/01/css/all.css' type='text/css' media='all' />
    <link rel='stylesheet' href='/layouts/01/css/flatsome.css?ver={{ env('APP_VERSION') }}' type='text/css'
        media='all' />

    <link rel='stylesheet' href='/layouts/01/css/photoswipe.min.css?ver={{ env('APP_VERSION') }}' type='text/css'
        media='all' />
    <link rel='stylesheet' href='/layouts/01/css/default-skin.min.css?ver={{ env('APP_VERSION') }}' type='text/css'
        media='all' />

    <link rel='stylesheet' href='/layouts/01/css/flatsome-shop.css?ver={{ env('APP_VERSION') }}' type='text/css'
        media='all' />
    <link rel='stylesheet' href='/layouts/01/css/style.css?ver=3.0' type='text/css' media='all' />
    <link rel='stylesheet' href='/layouts/01/css/v4-shims.css' type='text/css' media='all' />

    <script src="/layouts/01/js/jquery.min.js?ver={{ env('APP_VERSION') }}" id="jquery-core-js"></script>
    <script src="/layouts/01/js/jquery-migrate.min.js?ver={{ env('APP_VERSION') }}" id="jquery-migrate-js"></script>

    <link rel='stylesheet' href='/vendor/fontawesome-free-7.0.0-web/css/all.min.css' type='text/css' media='all' />
    <link rel='stylesheet' href='/layouts/01/css/styles.css?ver={{ env('APP_VERSION') }}' type='text/css' media='all' />
</head>

{{-- <body class="home page-template page-template-page-blank page-template-page-blank-php page page-id-2 theme-flatsome woocommerce-no-js lightbox"> --}}

<body class="product-template-default single single-product postid-808 theme-flatsome woocommerce woocommerce-page woocommerce-no-js lightbox">

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



    @include('modal.login')

    {{--
    <script data-cfasync="false" src="/layouts/01/js/email-decode.min.js"></script> --}}

    <script>
        // Auto open lightboxes
        jQuery(document).ready(function($) {
            /* global flatsomeVars */
            'use strict'
            var cookieId = 'lightbox_enter-id-here'
            var cookieValue = 'opened_1'
            var timer = parseInt('3000')

            // Auto open lightbox

            // Run lightbox if no cookie is set
            if (cookie(cookieId) !== cookieValue) {

                // Ensure closing off canvas
                setTimeout(function() {
                    if (jQuery.fn.magnificPopup) jQuery.magnificPopup.close()
                }, timer - 350)

                // Open lightbox
                setTimeout(function() {
                    $.loadMagnificPopup().then(function() {
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

    @include('layouts.layout01.elements.layout.popup_image');

    


    <script src="/layouts/01/js/index.js?ver=5.7.3" id="swv-js"></script>
        <script id="contact-form-7-js-extra">
            var wpcf7 = {
                "api": {
                    "root": "/",
                    "namespace": "contact-form-7\/v1"
                }
            };
        </script>

    <script src="/layouts/01/js/jquery.blockUI.min.js?ver=2.7.0-wc.7.3.0" id="jquery-blockui-js"></script>
    <script id="wc-add-to-cart-js-extra">
        var wc_add_to_cart_params = {
            "ajax_url": "\/wp-admin\/admin-ajax.php",
            "wc_ajax_url": "\/?wc-ajax=%%endpoint%%",
            "i18n_view_cart": "View cart",
            "cart_url": "https:\/\/solar3.maugiaodien.com\/gio-hang\/",
            "is_cart": "",
            "cart_redirect_after_add": "no"
        };
    </script>
    <script src="/layouts/01/js/add-to-cart.min.js?ver=7.3.0" id="wc-add-to-cart-js"></script>
    <script src="/layouts/01/js/js.cookie.min.js?ver=2.1.4-wc.7.3.0" id="js-cookie-js"></script>

        <script src="/layouts/01/js/photoswipe.min.js?ver={{ env('APP_VERSION') }}" id="flatsome-js-js"></script>
        <script src="/layouts/01/js/photoswipe-ui-default.min.js?ver={{ env('APP_VERSION') }}" id="flatsome-js-js"></script>

        <script id="wc-single-product-js-extra">
            /* <![CDATA[ */
            var wc_single_product_params = {
                "i18n_required_rating_text": "Please select a rating",
                "review_rating_required": "yes",
                "flexslider": {
                    "rtl": false,
                    "animation": "slide",
                    "smoothHeight": true,
                    "directionNav": false,
                    "controlNav": "thumbnails",
                    "slideshow": false,
                    "animationSpeed": 500,
                    "animationLoop": false,
                    "allowOneSlide": false
                },
                "zoom_enabled": "",
                "zoom_options": [],
                "photoswipe_enabled": "1",
                "photoswipe_options": {
                    "shareEl": false,
                    "closeOnScroll": false,
                    "history": false,
                    "hideAnimationDuration": 0,
                    "showAnimationDuration": 0
                },
                "flexslider_enabled": ""
            };
            /* ]]> */
        </script>

        <script src="/layouts/01/js/single-product.min.js?ver=7.3.0" id="wc-single-product-js"></script>

        <script src="/layouts/01/js/flatsome-instant-page.js?ver=1.2.1"></script>
        <script src="/layouts/01/js/wp-polyfill.min.js?ver=3.15.0""></script>
        <script src=" /layouts/01/js/hoverIntent.min.js?ver=1.10.2"></script>

        <script id="flatsome-js-js-extra">
            var flatsomeVars = {
                "theme": {
                    "version": "3.16.2"
                },
                "ajaxurl": "/",
                "rtl": "",
                "sticky_height": "70",
                "assets_url": "/layouts/01/js/",
                "lightbox": {
                    "close_markup": "<button title=\"%title%\" type=\"button\" class=\"mfp-close\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-x\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line></svg></button>",
                    "close_btn_inside": false
                },
                "user": {
                    "can_edit_pages": false
                },
                "i18n": {
                    "mainMenu": "Main Menu",
                    "toggleButton": "Toggle"
                },
                "options": {
                    "cookie_notice_version": "1",
                    "swatches_layout": false,
                    "swatches_box_select_event": false,
                    "swatches_box_behavior_selected": false,
                    "swatches_box_update_urls": "1",
                    "swatches_box_reset": false,
                    "swatches_box_reset_extent": false,
                    "swatches_box_reset_time": 300,
                    "search_result_latency": "0"
                },
                "is_mini_cart_reveal": "1"
            }
        </script>

        <script src="/layouts/01/js/flatsome.js?ver={{ env('APP_VERSION') }}" id="flatsome-js-js"></script>
        <script src="/layouts/01/js/woocommerce.js?ver={{ env('APP_VERSION') }}" id="flatsome-theme-woocommerce-js-js">
        </script>




    <script src="/vendor/bootstrap4/js/bootstrap.min.js?ver={{ config('app.version') }}"></script>

    <script src="/layouts/01/js/script01.js?ver={{ env('APP_VERSION') }}"></script>

    {{-- location --}}
    <script>
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    var latitude = position.coords.latitude;
                    var longitude = position.coords.longitude;
                    console.log("Latitude:", latitude, "Longitude:", longitude);

                    // Gọi API Nominatim để lấy thông tin địa lý
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.address && data.address.country) {
                                fetch(
                                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                                console.log("Quốc gia:", data.address.country);
                                // Sếp có thể hiển thị ra web hoặc xử lý tiếp ở đây
                            } else {
                                console.log("Không xác định được quốc gia.");
                            }
                        })
                        .catch(err => {
                            console.log("Lỗi khi gọi Nominatim:", err);
                        });
                },
                function(error) {
                    console.log("Lỗi lấy vị trí:", error.message);
                }
            );
        } else {
            console.log("Trình duyệt không hỗ trợ lấy vị trí.");
        }
    </script>
</body>

</html>
