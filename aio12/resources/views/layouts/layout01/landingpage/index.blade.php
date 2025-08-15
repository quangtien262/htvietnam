@extends('layouts.layout01.lay01')

@section('content')
    {!! app('Helper')->btnLandingpageSetting($menuId) !!}

    <div id="content" role="main" class="content-area">

        @include('layouts.layout01.elements.layout.header03')

        @foreach ($pageSetting as $page)
            {{-- sứ mệnh --}}
            @include('layouts.layout01.elements.home.block08')
            {{-- tầm nhìn --}}
            @include('layouts.layout01.elements.home.block09')

            {{-- slide --}}
            @include('layouts.layout01.elements.home.slide')

            {{-- product --}}
            @include('layouts.layout01.elements.home.product')

            {{-- include('layouts.layout01.elements.home.block02'); --}}

            {{-- why us --}}
            @include('layouts.layout01.elements.home.block03')

            {{-- Ứng dụng thực tế --}}
            @include('layouts.layout01.elements.home.block04')

            {{-- con số --}}
            @include('layouts.layout01.elements.home.block05')

            {{-- quy trinh --}}
            @include('layouts.layout01.elements.home.block06')

            {{-- news --}}
            @include('layouts.layout01.elements.home.news')

            {{-- KHÁCH HÀNG NÓI VỀ CHÚNG TÔI --}}
            {{-- include('layouts.layout01.elements.home.block07'); --}}

            {{-- LIÊN HỆ NGAY --}}
            @include('layouts.layout01.elements.home.contact')

            @include('layouts.layout01.elements.home.doi_tac')
        @endforeach
    </div>

    @include('common.modal_landingpage_edit')

    @include('common.modal_sort_order')
@endsection
