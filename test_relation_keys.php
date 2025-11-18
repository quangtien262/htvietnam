<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Spa\ChuyenKho;

$transfer = ChuyenKho::with(['chiNhanhXuat', 'chiNhanhNhap'])->first();

if ($transfer) {
    $json = $transfer->toArray();

    echo "=== KEYS CỦA CHUYEN KHO ===\n";
    foreach (array_keys($json) as $key) {
        if (strpos($key, 'chi_nhanh') !== false || strpos($key, 'chiNhanh') !== false) {
            echo "$key\n";
        }
    }

    echo "\n=== JSON chi nhánh xuất ===\n";
    echo isset($json['chiNhanhXuat']) ? "Key: chiNhanhXuat (camelCase)\n" : "chiNhanhXuat NOT FOUND\n";
    echo isset($json['chi_nhanh_xuat']) ? "Key: chi_nhanh_xuat (snake_case)\n" : "chi_nhanh_xuat NOT FOUND\n";

    echo "\n=== JSON chi nhánh nhập ===\n";
    echo isset($json['chiNhanhNhap']) ? "Key: chiNhanhNhap (camelCase)\n" : "chiNhanhNhap NOT FOUND\n";
    echo isset($json['chi_nhanh_nhap']) ? "Key: chi_nhanh_nhap (snake_case)\n" : "chi_nhanh_nhap NOT FOUND\n";
}
