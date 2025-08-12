@extends('layouts.layout01.lay01')

@section('content')

    {{-- slide --}}
    @include('layouts.layout01.elements.home.slide');

    {{-- about --}}
    @include('layouts.layout01.elements.home.block01');

    {{-- include('layouts.layout01.elements.home.block02'); --}}

    {{-- MỘT SỐ DỰ ÁN --}}
    @include('layouts.layout01.elements.home.block03');

    {{-- LÝ DO CHỌN CHÚNG TÔI --}}
    @include('layouts.layout01.elements.home.block04');

    {{-- con số thống kê --}}
    @include('layouts.layout01.elements.home.block05');

    {{-- TỪ Ý TƯỞNG ĐẾN HIỆN THỰC --}}
    @include('layouts.layout01.elements.home.block06');

    {{-- news --}}
    @include('layouts.layout01.elements.home.news');

    {{-- KHÁCH HÀNG NÓI VỀ CHÚNG TÔI --}}
    {{-- include('layouts.layout01.elements.home.block07'); --}}

    {{-- LIÊN HỆ NGAY --}}
    @include('layouts.layout01.elements.home.contact');

    @include('layouts.layout01.elements.home.doi_tac');
@endsection
