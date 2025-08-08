ssss


@extends('layouts.layout01.index')

@section('content')
    <section class="vh-100">
        <div class="container-fluid h-custom">
            <div class="row d-flex justify-content-center align-items-center h-100">
                <div class="col-md-9 col-lg-6 col-xl-5">
                    <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
                        class="img-fluid" alt="Sample image">
                </div>
                <div class="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
                    <form>
                        <div class="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
                            <p class="lead fw-normal mb-0 me-3">Sign in with</p>
                            <button type="button" class="btn btn-primary btn-floating mx-1">
                                <i class="fab fa-facebook-f"></i>
                            </button>

                            <button type="button" class="btn btn-primary btn-floating mx-1">
                                <i class="fab fa-twitter"></i>
                            </button>

                            <button type="button" class="btn btn-primary btn-floating mx-1">
                                <i class="fab fa-linkedin-in"></i>
                            </button>
                        </div>

                        <div class="divider d-flex align-items-center my-4">
                            <p class="text-center fw-bold mx-3 mb-0">Or</p>
                        </div>

                        <!-- Email input -->
                        <div class="form-outline mb-4">
                            <input type="email" id="form3Example3" class="form-control form-control-lg"
                                placeholder="Enter a valid email address" />
                            <label class="form-label" for="form3Example3">Email address</label>
                        </div>

                        <!-- Password input -->
                        <div class="form-outline mb-3">
                            <input type="password" id="form3Example4" class="form-control form-control-lg"
                                placeholder="Enter password" />
                            <label class="form-label" for="form3Example4">Password</label>
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                            <!-- Checkbox -->
                            <div class="form-check mb-0">
                                <input class="form-check-input me-2" type="checkbox" value="" id="form2Example3" />
                                <label class="form-check-label" for="form2Example3">
                                    Remember me
                                </label>
                            </div>
                            <a href="#!" class="text-body">Forgot password?</a>
                        </div>

                        <div class="text-center text-lg-start mt-4 pt-2">
                            <button type="button" class="btn btn-primary btn-lg"
                                style="padding-left: 2.5rem; padding-right: 2.5rem;">Login</button>
                            <p class="small fw-bold mt-2 pt-1 mb-0">Don't have an account? <a href="#!"
                                    class="link-danger">Register</a></p>
                        </div>

                    </form>
                </div>
            </div>
        </div>
        <div
            class="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
            <!-- Copyright -->
            <div class="text-white mb-3 mb-md-0">
                Copyright © 2020. All rights reserved.
            </div>
            <!-- Copyright -->

            <!-- Right -->
            <div>
                <a href="#!" class="text-white me-4">
                    <i class="fab fa-facebook-f"></i>
                </a>
                <a href="#!" class="text-white me-4">
                    <i class="fab fa-twitter"></i>
                </a>
                <a href="#!" class="text-white me-4">
                    <i class="fab fa-google"></i>
                </a>
                <a href="#!" class="text-white">
                    <i class="fab fa-linkedin-in"></i>
                </a>
            </div>
            <!-- Right -->
        </div>
    </section>


    {{-- <div id="login-form" class="modal" role="dialog">
    <div class="vertical-alignment-helper">
        <div class="modal-dialog vertical-align-center" role="document" style="max-width: 300px;">
            <div class="modal-content" style="padding: 5px 10px;">
                <a class="close-popup-icon-x" onclick="$('#login-form').modal('hide');">×</a>
                <div class="tab-content tab6 login-tabs">
                    <ul class="nav nav-tabs">
                        <li class="login-li active">
                            <a class="active" data-toggle="tab" code="0.html" onclick="showform(0)">Đăng
                                nhập</a>
                        </li>

                    </ul>
                </div>
                <div class="tab-login">
                    <div class="text-center divtitleLogin">
                        <b class="fw900"><span class="text-login">Đăng nhập</span>
                            <span
                                class="title-vietstock-color-red">{{$config->name}}</span>
                    </div>
                    <form action="{{ route('login') }}" id="form0" method="post">
                        @csrf
                        <div id="content-login-form">
                            <div id="content-login-form-button" class="form-button-fbgg" style="padding: 5px;"></div>
                            <div id="content-login-form-input" style="padding: 5px;">
                                <div class="input-group">
                                    <span class="input-group-addon"><i class="icon-svg-inbox-open"></i></span>
                                    <input class="form-control no-border" name="username" id="username"
                                        placeholder="Tên đăng nhập" type="text" value="" />
                                </div>
                                <div class="error-message pl5">
                                    <span class="field-validation-valid" id="errorName">
                                    </span>
                                </div>
                                <hr />
                                <div class="input-group">

                                    <input class="form-control no-border" id="password" name="password"
                                        placeholder="Mật khẩu" type="password" />
                                </div>
                                <div class="error-message pl5">
                                    <span class="field-validation-valid" id="errorPass">
                                    </span>

                                    <div style="margin-top: 2px;">
                                        <button type="submit"
                                            class="btn btn-primary bg-gray-1" value="Đăng nhập"
                                            style="width: 100%;">Đăng nhập</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div class="tab-register">

                   

                


                </div>
            </div>
        </div>
    </div>
</div> --}}
@endsection
