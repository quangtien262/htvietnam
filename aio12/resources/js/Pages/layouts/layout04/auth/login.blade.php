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
                                    <p >Đăng nhập </p>
                                </h6>

                                <h1 class="entry-title"></h1>
                                <div class="entry-divider is-divider small"></div>
                            </div>
                        </header>
                        <div class="entry-content single-page">

                            <div class="row center-block" id="row-568880864">

                                <div id="col-1264372998" class="col medium-6 small-10 large-6">
                                    <div class="col-inner">
                                        <div class="container section-title-container">
                                            <h3 class="section-title section-title-normal">
                                                <b></b>
                                                <span class="section-title-main">Đăng nhập</span>
                                                <b></b>
                                            </h3>
                                        </div>
                                        <div id="wpcf7-f7041-p7025-o2" lang="en-US" dir="ltr">

                                            @include('components.alert')

                                            <div class="screen-reader-response">
                                                <p role="status" aria-live="polite" aria-atomic="true"></p>
                                            </div>
                                            <form action="{{ route('login') }}" method="post">
                                                @csrf
                                                <div class="form-group">
                                                    <label for="username">Tên đăng nhập<span class="required">*</span></label>
                                                    <input name="username" id="username" type="text" maxlength="100" value="{{ old('username') }}" class="form-control">
                                                    @error('username')
                                                        <span class="invalid-feedback" role="alert">
                                                            <label class="error" id="username_error" for="username">{{ $message }}</label>
                                                        </span>
                                                    @enderror
                                                </div>
                                                <div class="form-group">
                                                    <label for="password">Mật khẩu<span class="required">*</span></label>
                                                    <input name="password" id="password" type="password" maxlength="100" class="form-control">
                                                    @error('password')
                                                        <span class="invalid-feedback" role="alert">
                                                            <label class="error" id="password_error" for="password">{{ $message }}</label>
                                                        </span>
                                                    @enderror
                                                </div>
                                                <div class="form-group">
                                                    <button type="submit" class="btn btn-submit">Đăng nhập</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                <div id="col-1264372998" class="col medium-6 small-14 large-6">
                                    <div class="col-inner">
                                        <div class="container section-title-container">
                                            <h3 class="section-title section-title-normal">
                                                <b></b>
                                                <span class="section-title-main" style="font-size:undefined%;"> &nbsp; </span>
                                                <b></b>
                                            </h3>
                                        </div>
                                        <div class="wpcf7" id="wpcf7-f7041-p7025-o2" lang="en-US" dir="ltr">
                                            <p>Bạn chưa có tài khoản? </p>
                                            {{-- <a href="{{ route('register')}}"><div style="color: red">Đăng ký tài khoản ngay</div></a> --}}
                                            <div class="continue-shopping pull-left text-left">
                                                <a class="button-continue-shopping button primary is-outline"
                                                    href="{{ route('register')}}">
                                                    &nbsp; Đăng ký tài khoản ngay -> </a>
                                            </div>
                                            <hr/>
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
