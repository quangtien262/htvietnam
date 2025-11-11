<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

$customers = [
    [
        'name' => 'Nguyễn Văn A',
        'ho_ten' => 'Nguyễn Văn A',
        'phone' => '0901234567',
        'sdt' => '0901234567',
        'email' => 'nguyenvana@spa.com',
        'password' => bcrypt('123456'),
        'dia_chi' => '123 Nguyễn Huệ, Quận 1, TP.HCM',
        'address' => '123 Nguyễn Huệ, Quận 1, TP.HCM',
        'nguon_khach' => 'Facebook',
        'loai_khach' => 'VIP',
        'trang_thai' => 'active',
        'tong_chi_tieu' => 5000000,
        'diem_tich_luy' => 500,
        'points' => 500,
        'lan_mua_cuoi' => now()->subDays(2),
        'ghi_chu' => 'Khách hàng VIP, thích dịch vụ massage',
        'note' => 'Khách hàng VIP, thích dịch vụ massage',
        'gioi_tinh_id' => 1,
        'ngay_sinh' => '1985-05-15',
    ],
    [
        'name' => 'Trần Thị B',
        'ho_ten' => 'Trần Thị B',
        'phone' => '0909876543',
        'sdt' => '0909876543',
        'email' => 'tranthib@spa.com',
        'password' => bcrypt('123456'),
        'dia_chi' => '456 Lê Văn Việt, Quận 9, TP.HCM',
        'address' => '456 Lê Văn Việt, Quận 9, TP.HCM',
        'nguon_khach' => 'Zalo',
        'loai_khach' => 'Thuong',
        'trang_thai' => 'active',
        'tong_chi_tieu' => 2000000,
        'diem_tich_luy' => 200,
        'points' => 200,
        'lan_mua_cuoi' => now()->subDays(7),
        'ghi_chu' => 'Khách hàng thường xuyên, hay sử dụng dịch vụ chăm sóc da',
        'note' => 'Khách hàng thường xuyên, hay sử dụng dịch vụ chăm sóc da',
        'gioi_tinh_id' => 2,
        'ngay_sinh' => '1990-08-20',
    ],
    [
        'name' => 'Lê Văn C',
        'ho_ten' => 'Lê Văn C',
        'phone' => '0912345678',
        'sdt' => '0912345678',
        'email' => 'levanc@spa.com',
        'password' => bcrypt('123456'),
        'dia_chi' => '789 Trần Hưng Đạo, Quận 5, TP.HCM',
        'address' => '789 Trần Hưng Đạo, Quận 5, TP.HCM',
        'nguon_khach' => 'Giới thiệu',
        'loai_khach' => 'Thuong',
        'trang_thai' => 'active',
        'tong_chi_tieu' => 1500000,
        'diem_tich_luy' => 150,
        'points' => 150,
        'lan_mua_cuoi' => now()->subDays(15),
        'ghi_chu' => 'Được bạn giới thiệu, thích các gói combo',
        'note' => 'Được bạn giới thiệu, thích các gói combo',
        'gioi_tinh_id' => 1,
        'ngay_sinh' => '1992-12-10',
    ],
    [
        'name' => 'Phạm Thị D',
        'ho_ten' => 'Phạm Thị D',
        'phone' => '0898765432',
        'sdt' => '0898765432',
        'email' => 'phamthid@spa.com',
        'password' => bcrypt('123456'),
        'dia_chi' => '321 Võ Văn Tần, Quận 3, TP.HCM',
        'address' => '321 Võ Văn Tần, Quận 3, TP.HCM',
        'nguon_khach' => 'Website',
        'loai_khach' => 'Moi',
        'trang_thai' => 'active',
        'tong_chi_tieu' => 500000,
        'diem_tich_luy' => 50,
        'points' => 50,
        'lan_mua_cuoi' => now()->subDays(30),
        'ghi_chu' => 'Khách hàng mới, lần đầu sử dụng dịch vụ',
        'note' => 'Khách hàng mới, lần đầu sử dụng dịch vụ',
        'gioi_tinh_id' => 2,
        'ngay_sinh' => '1995-03-25',
    ],
    [
        'name' => 'Hoàng Văn E',
        'ho_ten' => 'Hoàng Văn E',
        'phone' => '0987654321',
        'sdt' => '0987654321',
        'email' => 'hoangvane@spa.com',
        'password' => bcrypt('123456'),
        'dia_chi' => '654 Hai Bà Trưng, Quận 1, TP.HCM',
        'address' => '654 Hai Bà Trưng, Quận 1, TP.HCM',
        'nguon_khach' => 'Facebook',
        'loai_khach' => 'VIP',
        'trang_thai' => 'active',
        'tong_chi_tieu' => 8000000,
        'diem_tich_luy' => 800,
        'points' => 800,
        'lan_mua_cuoi' => now()->subDays(1),
        'ghi_chu' => 'Khách VIP, sử dụng nhiều dịch vụ cao cấp',
        'note' => 'Khách VIP, sử dụng nhiều dịch vụ cao cấp',
        'gioi_tinh_id' => 1,
        'ngay_sinh' => '1980-07-08',
    ],
];

foreach ($customers as $customer) {
    try {
        User::create($customer);
        echo "✅ Đã tạo: {$customer['name']}\n";
    } catch (\Exception $e) {
        echo "❌ Lỗi tạo {$customer['name']}: {$e->getMessage()}\n";
    }
}

echo "\n✨ Hoàn thành!\n";
