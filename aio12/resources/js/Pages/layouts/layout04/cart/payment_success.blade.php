@extends('layouts.layout04.index')
@section('content')
    <div id="content" class="blog-wrapper blog-single page-wrapper">
        <div class="row row-large">
            <div class="large-9 col">
                <article id="post-980"
                    class="post-980 post type-post status-publish format-standard has-post-thumbnail hentry category-tin-tuc">
                    <div class="article-inner">
                        <header class="entry-header">
                            <div class="entry-header-text entry-header-text-bottom text-left">
                                <h6 class="entry-category is-xsmall">
                                    <a rel="category tag">Đặt hàng</a>
                                </h6>

                                <h1 class="entry-title"></h1>
                                <div class="entry-divider is-divider small"></div>
                            </div>
                        </header>
                    </div>
                </article>
            </div>
        </div>

        <div class="row row-main">
            <div class="large-12 col">
                <div class="col-inner">
                    <div class="woocommerce">
                        <div class="woocommerce-notices-wrapper"></div>
                        <div class="woocommerce row row-large row-divided">
                            <div class="alert alert-success" style="text-align: center">
                                <p>Gửi đơn hàng thành công.</p>
                                <p>Cảm ơn bạn đã tin tưởng và đặt hàng. Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.</p>
                                <p><a href="{{ route('home') }}">Tiếp tục mua hàng.</a></p>
                            </div>
                        </div>
                        <div class="cart-footer-content after-cart-content relative"></div>
                    </div>
                </div>
            </div>
        </div>

    </div>
    <style>
        .alert-success {
            background-color: #21bf60;
            color: #fff;
            line-height: 30px;
            padding-left: 10px;
            border-radius: 5px;
        }

        .alert-error {
            background-color: #ff9393;
            color: #af0101;
            line-height: 37px;
            padding-left: 10px;
            border-radius: 5px;
            margin-bottom: 10px;
        }
    </style>
@endsection
