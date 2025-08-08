
     <!-- Vendor styles-->
    <!-- build:css(../app) css/vendor.css?ver={{ config('app.version') }}-->
    <!-- Datepicker-->
    <link rel="stylesheet" href="/vendor/bootstrap-datepicker/dist/css/bootstrap-datepicker3.css?ver={{ config('app.version') }}">
    <!-- Select2-->
    {{-- <link rel="stylesheet" href="/vendor/select2/dist/css/select2.css?ver={{ config('app.version') }}"> --}}
    <!-- ColorPicker-->
    {{-- <link rel="stylesheet" href="/vendor/mjolnic-bootstrap-colorpicker/dist/css/bootstrap-colorpicker.css?ver={{ config('app.version') }}"> --}}
    <!-- Summernote-->
    <link rel="stylesheet" href="/vendor/summernote/dist/summernote.css?ver={{ config('app.version') }}">
    <!-- endbuild-->
    <!-- Application styles-->
    <link rel="stylesheet" href="/admin/css/app.css?ver={{ config('app.version') }}">
    <!-- Current styles-->
    <link rel="stylesheet" href="/admin/css/styles.css?ver={{ config('app.version') }}">
</head>

<body class="theme-1">
    <div class="layout-container">
        {{-- <main class="container"> --}}
            @yield('content')
        {{-- </main> --}}
    </div>

    {{-- start build --}}

     <!-- jQuery-->
     <script src="/vendor/jquery/dist/jquery.js?ver={{ config('app.version') }}"></script>
     <!-- Bootstrap-->
     <script src="/vendor/bootstrap/dist/js/bootstrap.js?ver={{ config('app.version') }}"></script>
     <!-- Datepicker-->
     {{-- <script src="/vendor/bootstrap-datepicker/js/bootstrap-datepicker.js"></script> --}}
     <!-- jQuery Form Validation-->
     <script src="/vendor/jquery-validation/dist/jquery.validate.js?ver={{ config('app.version') }}"></script>
     <script src="/vendor/jquery-validation/dist/additional-methods.js?ver={{ config('app.version') }}"></script>
     <script src="/vendor/jquery-validation/dist/additional-methods.js?ver={{ config('app.version') }}"></script>
     <!-- Select2-->
     <script src="/vendor/select2/dist/js/select2.js?ver={{ config('app.version') }}"></script>
     <!-- ColorPicker-->
     {{-- <script src="/vendor/mjolnic-bootstrap-colorpicker/dist/js/bootstrap-colorpicker.js"></script> --}}
     <!-- Summernote-->
     <script src="/vendor/summernote/dist/summernote.js?ver={{ config('app.version') }}"></script>
     <!-- Dropzone-->
     {{-- <script src="/vendor/dropzone/dist/dropzone.js"></script> --}}
     <!-- Xeditable-->
     <script src="/vendor/x-editable/dist/bootstrap3-editable/js/bootstrap-editable.js?ver={{ config('app.version') }}"></script>
     <!-- Nestable-->
     <script src="/vendor/nestable/jquery.nestable.js?ver={{ config('app.version') }}"></script>
     <!-- Ionicons-->
     <link rel="stylesheet" href="/vendor/ionicons/css/ionicons.css?ver={{ config('app.version') }}">
     <!-- file manager-->
     <script src="{{ asset('vendor/file-manager/js/file-manager.js') }}"></script>
     <!-- Loaders.css?ver={{ config('app.version') }}-->
     <script src="/vendor/loaders.css?ver={{ config('app.version') }}/loaders.css?ver={{ config('app.version') }}.js"></script>
     <!-- endbuild-->

     <!-- App script-->
     <script src="/admin/js/app.js?ver={{ config('app.version') }}"></script>
     <!-- Common script-->
     <script src="/admin/js/common.js?ver={{ config('app.version') }}"></script>
    <!-- Common script-->
    <script src="/admin/js/common.js?ver={{ config('app.version') }}"></script>

    @yield('script')
