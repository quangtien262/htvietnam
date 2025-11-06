<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trang cá nhân | Quản lý tài khoản</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    {{-- CSS/JS từ Laravel Vite --}}
    @viteReactRefresh
    @vite(['resources/js/app_user.tsx'])

    {{-- Ant Design style (nếu chưa import trong React) --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/antd/dist/reset.css">
</head>
<body style="margin:0; background:#f5f5f5;">

    {{-- Đây là nơi blade con sẽ chèn nội dung --}}
    <div id="react-root"></div>

    {{-- @yield('content') --}}

</body>
</html>
