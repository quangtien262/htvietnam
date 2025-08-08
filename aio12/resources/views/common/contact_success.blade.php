@extends('layouts.layout'.$config->layout.'.index')
@section('content')
    <br/><br/>

    {{-- @include('components.alert') --}}

    <div class="alert alert-success">
        <p>Gửi liên hệ thành công, Cảm ơn bạn đã gửi liên hệ, chúng tôi sẽ liên hệ lại với bạn trong vòng 24h!</p>
        <a class="btn contact-btn-back" href="{{ route('home') }}">Quay về trang chủ</a>
    </div>


    <br>
@endsection
