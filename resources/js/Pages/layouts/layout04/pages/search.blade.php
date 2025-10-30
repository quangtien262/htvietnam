@extends('layouts.layout04.index')
@section('content')
    <div class="shop-page-title category-page-title page-title ">
        <div class="page-title-inner flex-row  medium-flex-wrap container">
            <div class="flex-col flex-grow medium-text-center">
                <div class="is-small">
                    <nav class="woocommerce-breadcrumb breadcrumbs uppercase"><a href="{{ route('home') }}">Trang chủ</a>
                        <span class="divider">&#47;</span> <a>Tìm kiếm</a> <span class="divider">
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

                <p class="woocommerce-result-count hide-for-medium">
                    Có {{ $products->total() }} sản phẩm phù hợp với từ khóa "{{ $_GET['keyword'] ?? '' }}"</p>

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

                    @foreach ($menutop as $menu)
                        @php
                            $subMenu = app('Helper')->getMenuByParentId($menu->id);
                        @endphp

                        @if (count($subMenu) > 0)
                            <span class="widget-title shop-sidebar">Danh mục {{ $menu->name }}</span>
                            <div class="is-divider small"></div>
                        @endif
                        <ul class="product-categories">
                            @php
                                $menutop1 = app('Helper')->getMenuByParentId($menu->id);
                            @endphp

                            @foreach ($menutop1 as $mn1)
                                @php
                                    $subMenu1 = app('Helper')->getMenuByParentId($mn1->id);
                                @endphp
                                @if (count($subMenu1) > 0)
                                    <li class="cat-item cat-item-21 cat-parent"><a>{{ $mn1->name }}</a>
                                        <ul class='children'>
                                            @foreach ($subMenu1 as $sub)
                                                <li class="cat-item cat-item-23"><a
                                                        href="{{ app('Helper')->getLinkMenu($sub) }}">{{ $sub->name }}</a>
                                                </li>
                                            @endforeach
                                        </ul>
                                    </li>
                                @else
                                    <li class="cat-item cat-item-29"><a
                                            href="{{ app('Helper')->getLinkMenu($mn1) }}">{{ $mn1->name }}</a></li>
                                @endif
                            @endforeach
                        </ul>
                    @endforeach
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
@endsection
