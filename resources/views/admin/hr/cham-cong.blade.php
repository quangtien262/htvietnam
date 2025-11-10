<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chấm công - Hệ thống HR</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/antd@5/dist/reset.css">
    @vite(['resources/css/app.css'])
</head>
<body>
    <div id="root"></div>

    <script>
        window.__INITIAL_DATA__ = {
            chamCongs: @json($chamCongs),
            tongHop: @json($tongHop),
            nhanViens: @json($nhanViens),
            thang: {{ $thang }},
            nam: {{ $nam }},
            userId: {{ $userId }}
        };
    </script>

    @vite(['resources/js/app.tsx'])
    <script type="module">
        import { createRoot } from 'react-dom/client';
        import ChamCongPage from './resources/js/Pages/Admin/ChamCong/index.tsx';

        const root = createRoot(document.getElementById('root'));
        root.render(ChamCongPage(window.__INITIAL_DATA__));
    </script>
</body>
</html>
