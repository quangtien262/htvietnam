
# cài đặt tesseract-ocr để đọc thông tin cccd
ubuntu:
sudo apt update
sudo apt install tesseract-ocr
sudo apt install tesseract-ocr-vie

Cenos:
sudo yum install epel-release
sudo yum install tesseract

window:
Tải bản cài đặt tại: https://github.com/tesseract-ocr/tesseract
Cài đặt và thêm đường dẫn thư mục chứa tesseract.exe vào biến môi trường PATH.


# xoa cache:
php artisan cache:clear; php artisan config:clear; php artisan route:clear; php artisan view:clear


#Contructor AIO

laravel_project/
├─ resources/
│  ├─ js/
│  │  ├─ app.tsx         ← file React chính (entry point)
│  │  ├─ components/
│  │  │   ├─ Layout.tsx
│  │  │   ├─ Header.tsx
│  │  │   └─ Sidebar.tsx
│  │  ├─ pages/
│  │  │   ├─ Dashboard.tsx
│  │  │   ├─ Reports.tsx
│  │  │   └─ Settings.tsx
│  │  ├─ types/
│  │  │   └─ index.d.ts
│  │  └─ hooks/
│  ├─ views/
│  │   └─ dashboard.blade.php
