<style>
    .p-md-5{
        padding: 0px
    }
</style>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

<section class="h-100 gradient-form" >
    <div class=" h-100">
        <div class="row d-flex justify-content-center align-items-center h-100">
            <div class="col-xl-10">
                <div class="card rounded-3 text-black">
                    <div class="row g-0">
                        <div class="col-lg-6" style="margin:auto">
                            <div class="card-body p-md-5 mx-md-4">

                                <div class="text-center">
                                    <img src="/images/logo.png" style="width: 185px;" alt="logo">
                                    <h4 class="mt-1 mb-5 pb-1 pt-1">Đăng nhập hệ thống quản trị WEB AIO</h4>
                                </div>

                                <form action="{{ route('login') }}" method="post">
                                    @include('components.alert')
                                    @csrf
                                    <p>{{ __('user.please_sign_in') }}:</p>
                                
                                    <div class="form-outline mb-4">
                                        <label class="form-label" for="form2Example11">{{ __('user.username') }}</label>
                                        <input type="text" name="username" id="username" class="form-control"
                                            placeholder="{{ __('user.username') }}" value="{{ old('username') }}" />
                                            @error('username')
                                            <span class="red" role="alert">
                                                <label class="error" id="username_error"
                                                    for="username">{{ $message }}</label>
                                            </span>
                                        @enderror
                                    </div>
                                
                                    <div class="form-outline mb-4">
                                        <label class="form-label" for="form2Example22">{{ __('user.password') }}</label>
                                        <input type="password" id="password" name="password" class="form-control"
                                            placeholder="{{ __('user.password') }}" />
                                            @error('password')
                                            <span class="red" role="alert">
                                                <label class="error" id="password" for="password">{{ $message }}</label>
                                            </span>
                                        @enderror
                                    </div>
                                
                                    <div class="text-center pt-1 mb-5 pb-1">
                                        <button  style="background-color: #1c6cb6; color: #fff; padding-left: 30px; padding-right: 30px;;" type="submit" class="btn  btn-block fa-lg mb-3"
                                            type="button"><i class="fas fa-key"></i> {{ __('user.login') }}</button>
                                
                                    </div>
                                
                                    {{-- <div class="d-flex align-items-center justify-content-center pb-4">
                                        <p class="mb-0 me-2">{{__('user.not_account')}}</p>
                                        <button type="button" class="btn btn-outline-danger"><a href="{{ route('register') }}">{{__('user.register_here')}}</a></button>
                                    </div> --}}
                                
                                </form>

                            </div>
                        </div>
                        {{-- <div class="col-lg-7 d-flex align-items-center">
                            <div class="text-white px-3 py-4 p-md-5 mx-md-4">
                                <img style="width:100%; height: auto;" src="/images/banner-login.png"/>
                            </div>
                        </div> --}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>