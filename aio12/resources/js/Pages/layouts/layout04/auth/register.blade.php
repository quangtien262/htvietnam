@extends('layouts.layout04.index')
@section('content')
    <div id="content" class="blog-wrapper blog-single page-wrapper">
        <div class="row row-large">
            <div class="large-12 col">
                <article id="post-980"
                    class="post-980 post type-post status-publish format-standard has-post-thumbnail hentry category-tin-tuc">
                    <div class="article-inner">
                        <header class="entry-header">
                            <div class="entry-header-text entry-header-text-bottom text-left">
                                <h6 class="entry-category is-xsmall">
                                    <a href="" rel="category tag">Đăng ký tài khoản</a>
                                </h6>

                                <h1 class="entry-title"></h1>
                                <div class="entry-divider is-divider small"></div>
                            </div>
                        </header>
                        <div class="entry-content single-page">

                            <div class="row center-block" id="row-568880864">

                                <div id="col-1264372998" class="col medium-12 small-12 large-6">
                                    <div class="col-inner">
                                        <div class="container section-title-container">
                                            <h3 class="section-title section-title-normal">
                                                <b></b>
                                                <span class="section-title-main" style="font-size:undefined%;">Đăng ký nhanh</span>
                                                <b></b>
                                            </h3>
                                        </div>
                                        <div role="form"  id="wpcf7-f7041-p7025-o2" lang="en-US" dir="ltr">

                                            @include('components.alert')

                                            <form action="{{ route('register') }}" method="post">
                                                @csrf
                                                <div class="form-group">
                                                    <label for="name">Họ tên<span class="required">*</span></label>
                                                    <input name="name" id="name" value="{{ old('name') }}" type="text" maxlength="100" class="form-control">
                                                    @error('name')
                                                        <span class="invalid-feedback" role="alert">
                                                            <label class="error" id="name_error" for="name">{{ $message }}</label>
                                                        </span>
                                                    @enderror
                                                </div>
                                                <div class="form-group">
                                                    <label for="email">Email (Tên đăng nhập)<span class="required">*</span></label>
                                                    <input name="email" id="email" value="{{ old('email') }}" type="text" maxlength="100" class="form-control">
                                                    @error('email')
                                                        <span class="invalid-feedback" role="alert">
                                                            <label class="error" id="email_error" for="email">{{ $message }}</label>
                                                        </span>
                                                    @enderror
                                                </div>
                                                <div class="form-group">
                                                    <label for="phone">Số điện thoại<span class="required">*</span></label>
                                                    <input name="phone" id="phone" value="{{ old('phone') }}" type="text" maxlength="100" class="form-control">
                                                    @error('phone')
                                                        <span class="invalid-feedback" role="alert">
                                                            <label class="error" id="phone_error" for="phone">{{ $message }}</label>
                                                        </span>
                                                    @enderror
                                                </div>
                                                <div class="form-group">
                                                    <label for="password">Mật khẩu<span class="required">*</span></label>
                                                    <input name="password" id="password" value="" type="password" maxlength="100" class="form-control">
                                                    @error('password')
                                                        <span class="invalid-feedback" role="alert">
                                                            <label class="error" id="password_error" for="password">{{ $message }}</label>
                                                        </span>
                                                    @enderror
                                                </div>
                                                <div class="form-group">
                                                    <label for="password_confirm">Xác nhận lại mật khẩu<span class="required">*</span></label>
                                                    <input name="password_confirm" id="password_confirm" value="" type="password" maxlength="100" class="form-control">
                                                    @error('password_confirm')
                                                        <span class="invalid-feedback" role="alert">
                                                            <label class="error" id="password_confirm_error" for="password_confirm">{{ $message }}</label>
                                                        </span>
                                                    @enderror
                                                </div>
                                                <div class="form-group">
                                                    <button type="submit" class="btn btn-submit">Đăng kí</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>



                            </div>

                        </div>
                    </div>
                </article>
            </div>
        </div>
    </div>
@endsection
