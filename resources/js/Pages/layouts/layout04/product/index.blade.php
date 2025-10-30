@extends('layouts.layout04.index')
@section('content')
    <div class="shop-page-title category-page-title page-title ">
        <div class="page-title-inner flex-row  medium-flex-wrap container">
            <div class="flex-col flex-grow medium-text-center">
                <div class="is-small">
                    <nav class="woocommerce-breadcrumb breadcrumbs uppercase"><a href="{{ route('home') }}">Trang chủ</a>
                        @if (!empty($menu['parent']))
                            <span class="divider">&#47;</span> <a href="{{ app('Helper')->getLinkMenu( $menu['parent']) }}">{{ $menu['parent']->name }}</a>
                        @endif
                        <span class="divider">&#47;</span> <a>{{ $menu['menu']->name }}</a>
                    </nav>
                </div>
                <div class="category-filtering category-filter-row show-for-medium">
                    <a href="#" data-open="#shop-sidebar" data-visible-after="true" data-pos="left"
                        class="filter-button uppercase plain">
                        <i class="icon-menu"></i>
                        <strong>Lọc</strong>
                    </a>
                    <div class="inline-block">
                    </div>
                </div>
            </div>
            <div class="flex-col medium-text-center">

                <p class="woocommerce-result-count hide-for-medium">Có tất cả {{ $products->total() }} sản phẩm</p>
            </div>
        </div>
    </div>
    <div class="row category-page-row">

        <div class="col large-3 hide-for-medium ">
            <div id="shop-sidebar" class="sidebar-inner col-inner">
                <aside id="woocommerce_product_categories-2" class="widget woocommerce widget_product_categories">
                    @php
                        $menutop = app('Helper')->getMenuByParentId(0);
                    @endphp

                    @foreach ($menutop as $menu0)
                        @php
                            if ($menu0->display_type != 'product') {
                                continue;
                            }
                            $subMenu = app('Helper')->getMenuByParentId($menu0->id);
                        @endphp

                        @if (count($subMenu) > 0)
                            <span class="widget-title shop-sidebar ">{{ $menu0->name }}</span>
                            <div class="is-divider small"></div>
                        @endif
                        <ul class="product-categories">
                            @php
                                $menutop1 = app('Helper')->getMenuByParentId($menu0->id);
                            @endphp

                            @foreach ($menutop1 as $mn1)
                                @php
                                    $subMenu1 = app('Helper')->getMenuByParentId($mn1->id);
                                @endphp

                                @if (count($subMenu1) > 0)
                                    <li class="cat-item cat-item-21 cat-parent">

                                        <a class="{{ optional($menu['parent'])->id == $mn1->id ? 'actives' : '' }} 
                                        {{ $menu['menu']->id == $mn1->id ? 'actives' : '' }} 
                                        "
                                            href="{{ app('Helper')->getLinkMenu($mn1) }}">{{ $mn1->name }}</a>
                                        <ul class='children {{ optional($menu['parent'])->id == $mn1->id ? 'dbl' : '' }} '>
                                            @foreach ($subMenu1 as $sub)
                                                @php
                                                    $subs03 = app('Helper')->getMenuByParentId($sub->id);
                                                @endphp
                                                <li class="cat-item cat-item-23">
                                                    <a class="{{ $menu['menu']->id == $sub->id ? 'actives' : '' }} {{ $menu['menu']->parent_id == $sub->id ? 'actives' : '' }} "
                                                        href="{{ app('Helper')->getLinkMenu($sub) }}">{{ $sub->name }}</a>
                                                    @if (count($subs03) > 0)
                                                        <button class="toggle"
                                                            onclick="showMenu('sub-{{ $sub->id }}')"><i
                                                                class="icon-angle-down"></i></button>
                                                        <ul id="sub-{{ $sub->id }}"
                                                            class="childrent {{ optional($menu['parent'])->id == $sub->id ? 'dbl' : '' }}">
                                                            @foreach ($subs03 as $sub03)
                                                                <li>
                                                                    <a class="{{ $menu['menu']->id == $sub03->id ? 'actives' : '' }}"
                                                                        href="{{ app('Helper')->getLinkMenu($sub03) }}">{{ $sub03->name }}</a>
                                                                </li>
                                                            @endforeach
                                                        </ul>
                                                    @endif
                                                </li>
                                            @endforeach
                                        </ul>
                                    </li>
                                @else
                                    <li class="cat-item cat-item-29">
                                        <a class="{{ $menu['menu']->id == $mn1->id ? 'actives' : '' }}"
                                            href="{{ app('Helper')->getLinkMenu($mn1) }}">{{ $mn1->name }}</a>
                                    </li>
                                @endif
                            @endforeach
                        </ul>
                    @endforeach

                </aside>
                <aside id="flatsome_recent_posts-2" class="widget flatsome_recent_posts"> <span
                        class="widget-title shop-sidebar">Tin Tức Mới Nhất</span>
                    <div class="is-divider small"></div>
                    <ul>
                        @foreach ($news as $new)
                            <li class="recent-blog-posts-li">
                                <div class="flex-row recent-blog-posts align-top pt-half pb-half">
                                    <div class="flex-col mr-half">
                                        <div class="badge post-date  badge-outline">
                                            <div class="badge-inner bg-fill"
                                                style="background: url({{ $new->image }}); border:0;">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex-col flex-grow name-news">
                                        <a href="{{ app('Helper')->getLinkNews($new) }}"
                                            title="{{ $new->name }}">{{ $new->name }}</a>
                                        <span class="post_comments op-7 block is-xsmall"><a
                                                href="{{ app('Helper')->getLinkNews($new) }}#respond"></a></span>
                                    </div>
                                </div>
                            </li>
                        @endforeach


                    </ul>
                </aside>
            </div>
        </div>

        <div class="col large-9">
            <div class="shop-container">

                <div class="woocommerce-notices-wrapper"></div>
                <div
                    class="products row row-small large-columns-4 medium-columns-3 small-columns-2 has-shadow row-box-shadow-1 row-box-shadow-2-hover">

                    @foreach ($products as $product)
                        @include('layouts.layout04.elements.item_product')
                    @endforeach

                </div><!-- row -->


            </div><!-- shop container -->
            <div class="center">
                {{ $products->appends(request()->query()) }}
            </div>
        </div>
    </div>

    <script>
        function showMenu(id) {
            var element = document.getElementById(id);
            if ((element.className).indexOf('_block') === -1) {
                element.classList.add("_block");
            } else {
                element.classList.remove("_block");
            }

            // $(id).addClass('block');
            // if($(id).hasClass('_hidden')) {
            //     $(id).removeClass('_hidden');
            // }
        }
    </script>
@endsection
