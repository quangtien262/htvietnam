# Hướng dẫn Copilot cho AI Coding Agents

## Tổng quan dự án
Đây là monorepo PHP (dựa trên Laravel), sử dụng TypeScript và Vite cho frontend. Kiến trúc chia module rõ ràng: logic ứng dụng, dịch vụ, model, route, resource. Thư mục chính:
- `app/`: Logic PHP cốt lõi, gồm Models, Services, Controllers, Middleware, Providers.
- `resources/`: Tài nguyên frontend (CSS, JS) và view Blade.
- `routes/`: Định nghĩa route cho web, API, admin, console.
- `config/`: Cấu hình dịch vụ, database, mail, v.v.
- `public/`: Web root, tài nguyên tĩnh, entry point.
- `tests/`: Test PHPUnit (Feature, Unit).

## Quy trình phát triển
- **Build Frontend**: Dùng Vite (`vite.config.ts`). Chạy `npm install` rồi `npm run build` để build production.
- **Backend**: Dùng lệnh artisan của Laravel (`php artisan ...`).
- **Test**: Chạy `vendor/bin/phpunit` hoặc `php artisan test` cho backend.
- **Tích hợp OCR**: Cần Tesseract OCR để đọc CCCD. Xem hướng dẫn cài đặt trong `readme.txt` (Windows, Ubuntu, CentOS).

## Quy ước & Pattern
- **Service Layer**: Logic nghiệp vụ nằm ở `app/Services/`. Tạo class dịch vụ để tái sử dụng.
- **Tổ chức Model**: Model chia theo domain trong `app/Models/` (ví dụ: `Admin/`, `User/`, `Web/`).
- **Route**: Nhiều file route cho từng ngữ cảnh (`routes/web.php`, `routes/api.php`, ...).
- **Cấu hình**: Tất cả config nằm ở `config/`, có file custom như `constant.php`.
- **Frontend**: Dùng TypeScript và Vite. Entry point ở `resources/js/`.
- **Test**: Test ở `tests/Feature/` và `tests/Unit/`, theo chuẩn Laravel.

## Tích hợp
- **Tesseract OCR**: Bắt buộc cho đọc CCCD. Cài đặt và cấu hình theo `readme.txt`.
- **Inertia.js**: Tích hợp frontend-backend (xem `vendor/inertiajs/`).
- **Mail, Queue, Media**: Cấu hình qua các file trong `config/`.

## Ví dụ
- Thêm service: Tạo class trong `app/Services/`, đăng ký nếu cần ở `app/Providers/`.
- Thêm route: Sửa file phù hợp trong `routes/`.
- Thêm trang frontend: Tạo view Blade ở `resources/views/` và JS/CSS ở `resources/js/` hoặc `resources/css/`.

## Mẹo
- Luôn kiểm tra config custom ở `config/constant.php` và các file cấu hình không chuẩn.
- Tổ chức thư mục domain riêng trong `app/Models/` và `app/Services/`.
- Với OCR, đảm bảo Tesseract đã cài và có trong PATH (Windows) hoặc hệ thống (Linux).

---
_Cập nhật lần cuối: 30/10/2025_
