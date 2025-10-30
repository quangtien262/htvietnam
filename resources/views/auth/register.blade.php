<style>
    @media (min-width: 992px) {
        .gradient-custom-2 {
            /* fallback for old browsers */
            padding: 30px;
            background: url('/images/banner-login.png');

            background-repeat: round;
        }
    }

    @media (min-width: 768px) {
        .gradient-form {
            height: 100vh !important;
        }
    }

    @media (min-width: 769px) {
        .gradient-custom-2 {
            display: none
        }

        .gradient-custom-2 {
            border-top-right-radius: .3rem;
            border-bottom-right-radius: .3rem;
        }
    }
    .red{
        color: red;
        font-weight: 700;
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
                        <div class="col-lg-5">
                            <div class="card-body p-md-5 mx-md-4">

                                <div class="text-center">
                                    <img src="/images/logo.png" style="width: 185px;" alt="logo">
                                    <h4 class="mt-1 mb-5 pb-1 pt-1">{{ __('user.welcome_to') }}:<br> <span
                                            class="fw-bolder" style="color: #e6ac00">HT Việt Nam</span></h4>
                                </div>

                                <form action="{{ route('register') }}" method="post">
                                    @include('components.alert')
                                    @csrf
                                    <p>{{ __('user.please_register') }}:</p>

                                    <div class="form-outline mb-2">
                                        <label class="form-label" for="form2Example11">{{ __('user.username') }}</label>
                                        <input type="text" name="username" id="username" class="form-control"
                                            placeholder="{{ __('user.username') }}" value="{{ old('username') }}" />
                                            @error('name')
                                            <span class="red" role="alert">
                                                <label class="error" id="name_error" for="name">{{ $message }}</label>
                                            </span>
                                        @enderror
                                    </div>
                                    <div class="form-outline mb-2">
                                        <label class="form-label" for="form2Example11">{{ __('user.email') }}</label>
                                        <input type="email" name="email" id="email" value="{{ old('email') }}"
                                            class="form-control" placeholder="{{ __('user.email') }}" />
                                        @error('email')
                                        <span class="red" role="alert">
                                            <label class="error" id="email_error" for="email">{{ $message }}</label>
                                        </span>
                                        @enderror
                                    </div>
                                    <div class="form-outline mb-2">
                                        <label class="form-label" for="form2Example11">{{ __('user.phone') }}</label>
                                        <input type="text" name="phone" id="phone" value="{{ old('phone') }}"
                                            class="form-control" placeholder="{{ __('user.phone') }}" />
                                        @error('phone')
                                        <span class="red" role="alert">
                                            <label class="error" id="phone_error" for="phone">{{ $message }}</label>
                                        </span>
                                        @enderror
                                    </div>

                                    <div class="form-outline mb-2">
                                        <label class="form-label" for="form2Example22">{{ __('user.password') }}</label>
                                        <input type="password" id="password" name="password" class="form-control"
                                            placeholder="{{ __('user.password') }}" />
                                        @error('password')
                                        <span class="red" role="alert">
                                            <label class="error" id="password" for="password">{{ $message }}</label>
                                        </span>
                                        @enderror
                                    </div>
                                    <div class="form-outline mb-2">
                                        <label class="form-label" for="form2Example22">{{ __('user.password_confirm') }}</label>
                                        <input type="password" name="password_confirm" id="password_confirm"
                                            class="form-control" placeholder="{{ __('user.password_confirm') }}" />
                                        @error('password_confirm')
                                        <span class="red" role="alert">
                                            <label class="error" id="password_confirm_error"
                                                for="password_confirm">{{ $message }}</label>
                                        </span>
                                        @enderror
                                    </div>

                                    <div class="text-center pt-1 mb-5 pb-1">
                                        <button
                                            style="background-image: linear-gradient(74deg,#fcd168,#cb8718 38%,#f4cd74 80%,#cd8b1d)"
                                            type="submit" class="btn  btn-block fa-lg mb-3" type="button"><i
                                                class="fas fa-key"></i> {{ __('user.register') }}
                                            </button>

                                    </div>

                                    <div class="d-flex align-items-center justify-content-center pb-4">
                                        <p class="mb-0 me-2">{{ __('user.have_account') }}</p>
                                        <button type="button" class="btn btn-outline-danger"><a
                                                href="{{ route('login') }}">{{ __('user.login') }}</a></button>
                                    </div>

                                </form>

                            </div>
                        </div>
                        <div class="col-lg-7 d-flex align-items-center gradient-custom-2">
                            <div class="text-white px-3 py-4 p-md-5 mx-md-4">
                                {{-- <h4 class="mb-2">We are more than just a company</h4>
                               <p class="small mb-0">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                                   eiusmod
                                   tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                                   nostrud
                                   exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p> --}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>