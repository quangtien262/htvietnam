@extends('layouts.layoutAitilen.layAitilen')

@section('content')
    @foreach ($pageSetting as $page)
        {{-- slide --}}
        @include('layouts.layoutAitilen.elements.home.slide')

        {{-- product --}}
        @include('layouts.layoutAitilen.elements.home.product')

        {{-- include('layouts.layoutAitilen.elements.home.block02'); --}}

        {{-- why us --}}
        @include('layouts.layoutAitilen.elements.home.block03')

        {{-- Ứng dụng thực tế --}}
        @include('layouts.layoutAitilen.elements.home.block04')

        {{-- con số --}}
        @include('layouts.layoutAitilen.elements.home.block05')

        {{-- quy trinh --}}
        @include('layouts.layoutAitilen.elements.home.block06')

        {{-- news --}}
        @include('layouts.layoutAitilen.elements.home.news')

        {{-- KHÁCH HÀNG NÓI VỀ CHÚNG TÔI --}}
        {{-- include('layouts.layoutAitilen.elements.home.block07'); --}}

        {{-- LIÊN HỆ NGAY --}}
        @include('layouts.layoutAitilen.elements.home.contact')

        @include('layouts.layoutAitilen.elements.home.doi_tac')
    @endforeach

    {{-- btn admin --}}
    {!! app('Helper')->settingLandingPage(0) !!}

    {{-- modalXLContent --}}
    @include('modal.modalSetting')
    {{-- modalDefaultContent --}}
    @include('modal.modal_default')

    <link rel='stylesheet' href='/common/css/admin-control.css?ver={{ env('APP_VERSION') }}' type='text/css' />
    <script src="/common/js/common.js?ver={{ env('APP_VERSION') }}"></script>
@endsection
