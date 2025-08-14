
     <!-- Vendor styles-->
    <!-- build:css(../app) css/vendor.css?ver={{ env('APP_VERSION') }}-->
    <!-- Datepicker-->
    <link rel="stylesheet" href="/vendor/bootstrap-datepicker/dist/css/bootstrap-datepicker3.css?ver={{ env('APP_VERSION') }}">
    <!-- Select2-->
    {{-- <link rel="stylesheet" href="/vendor/select2/dist/css/select2.css?ver={{ env('APP_VERSION') }}"> --}}
    <!-- ColorPicker-->
    {{-- <link rel="stylesheet" href="/vendor/mjolnic-bootstrap-colorpicker/dist/css/bootstrap-colorpicker.css?ver={{ env('APP_VERSION') }}"> --}}
    <!-- Summernote-->
    <link rel="stylesheet" href="/vendor/summernote/dist/summernote.css?ver={{ env('APP_VERSION') }}">
    <!-- endbuild-->
    <!-- Application styles-->
    <link rel="stylesheet" href="/admin/css/app.css?ver={{ env('APP_VERSION') }}">
    <!-- Current styles-->
    <link rel="stylesheet" href="/admin/css/styles.css?ver={{ env('APP_VERSION') }}">
</head>

<body class="theme-1">
    <div class="layout-container">
        {{-- <main class="container"> --}}
            @yield('content')
        {{-- </main> --}}
    </div>

    {{-- start build --}}

     <!-- jQuery-->
     <script src="/vendor/jquery/dist/jquery.js?ver={{ env('APP_VERSION') }}"></script>
     <!-- Bootstrap-->
     <script src="/vendor/bootstrap/dist/js/bootstrap.js?ver={{ env('APP_VERSION') }}"></script>
     <!-- Datepicker-->
     {{-- <script src="/vendor/bootstrap-datepicker/js/bootstrap-datepicker.js"></script> --}}
     <!-- jQuery Form Validation-->
     <script src="/vendor/jquery-validation/dist/jquery.validate.js?ver={{ env('APP_VERSION') }}"></script>
     <script src="/vendor/jquery-validation/dist/additional-methods.js?ver={{ env('APP_VERSION') }}"></script>
     <script src="/vendor/jquery-validation/dist/additional-methods.js?ver={{ env('APP_VERSION') }}"></script>
     <!-- Select2-->
     <script src="/vendor/select2/dist/js/select2.js?ver={{ env('APP_VERSION') }}"></script>
     <!-- ColorPicker-->
     {{-- <script src="/vendor/mjolnic-bootstrap-colorpicker/dist/js/bootstrap-colorpicker.js"></script> --}}
     <!-- Summernote-->
     <script src="/vendor/summernote/dist/summernote.js?ver={{ env('APP_VERSION') }}"></script>
     <!-- Dropzone-->
     {{-- <script src="/vendor/dropzone/dist/dropzone.js"></script> --}}
     <!-- Xeditable-->
     <script src="/vendor/x-editable/dist/bootstrap3-editable/js/bootstrap-editable.js?ver={{ env('APP_VERSION') }}"></script>
     <!-- Nestable-->
     <script src="/vendor/nestable/jquery.nestable.js?ver={{ env('APP_VERSION') }}"></script>
     <!-- Ionicons-->
     <link rel="stylesheet" href="/vendor/ionicons/css/ionicons.css?ver={{ env('APP_VERSION') }}">
     <!-- file manager-->
     <script src="{{ asset('vendor/file-manager/js/file-manager.js') }}"></script>

     {{-- <script src="/vendor/loaders.css?ver={{ env('APP_VERSION') }}/loaders.css?ver={{ env('APP_VERSION') }}.js"></script> --}}
     <!-- endbuild-->

     <!-- App script-->
     <script src="/admin/js/app.js?ver={{ env('APP_VERSION') }}"></script>
     <!-- Common script-->
     <script src="/admin/js/common.js?ver={{ env('APP_VERSION') }}"></script>
    <!-- Common script-->
    <script src="/admin/js/common.js?ver={{ env('APP_VERSION') }}"></script>

    @yield('script')
