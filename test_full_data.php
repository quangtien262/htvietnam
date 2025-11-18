<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Spa\ChuyenKho;
use App\Models\Spa\KiemKho;

echo "=== TEST CHUYEN KHO DATA ===\n";
$chuyenKho = ChuyenKho::with(['chiNhanhXuat', 'chiNhanhNhap'])->first();
if ($chuyenKho) {
    echo "ID: " . $chuyenKho->id . "\n";
    echo "Chi nhánh xuất ID: " . $chuyenKho->chi_nhanh_xuat_id . "\n";
    echo "Chi nhánh nhập ID: " . $chuyenKho->chi_nhanh_nhap_id . "\n";

    echo "\n--- Chi nhánh xuất object ---\n";
    if ($chuyenKho->chiNhanhXuat) {
        echo "Relation name: chiNhanhXuat\n";
        echo "ID: " . $chuyenKho->chiNhanhXuat->id . "\n";
        echo "ten_chi_nhanh: " . ($chuyenKho->chiNhanhXuat->ten_chi_nhanh ?? 'NULL') . "\n";
        echo "name accessor: " . ($chuyenKho->chiNhanhXuat->name ?? 'NULL') . "\n";
        echo "JSON: " . json_encode($chuyenKho->chiNhanhXuat) . "\n";
    } else {
        echo "chiNhanhXuat: NULL\n";
    }

    echo "\n--- Chi nhánh nhập object ---\n";
    if ($chuyenKho->chiNhanhNhap) {
        echo "Relation name: chiNhanhNhap\n";
        echo "ID: " . $chuyenKho->chiNhanhNhap->id . "\n";
        echo "ten_chi_nhanh: " . ($chuyenKho->chiNhanhNhap->ten_chi_nhanh ?? 'NULL') . "\n";
        echo "name accessor: " . ($chuyenKho->chiNhanhNhap->name ?? 'NULL') . "\n";
        echo "JSON: " . json_encode($chuyenKho->chiNhanhNhap) . "\n";
    } else {
        echo "chiNhanhNhap: NULL\n";
    }

    echo "\n--- Full JSON từ API resource ---\n";
    echo json_encode($chuyenKho->toArray(), JSON_PRETTY_PRINT) . "\n";
}

echo "\n\n=== TEST KIEM KHO DATA ===\n";
$kiemKho = KiemKho::with('chiNhanh')->first();
if ($kiemKho) {
    echo "ID: " . $kiemKho->id . "\n";
    echo "Chi nhánh ID: " . $kiemKho->chi_nhanh_id . "\n";

    echo "\n--- Chi nhánh object ---\n";
    if ($kiemKho->chiNhanh) {
        echo "Relation name: chiNhanh\n";
        echo "ID: " . $kiemKho->chiNhanh->id . "\n";
        echo "ten_chi_nhanh: " . ($kiemKho->chiNhanh->ten_chi_nhanh ?? 'NULL') . "\n";
        echo "name accessor: " . ($kiemKho->chiNhanh->name ?? 'NULL') . "\n";
        echo "JSON: " . json_encode($kiemKho->chiNhanh) . "\n";
    } else {
        echo "chiNhanh: NULL\n";
    }

    echo "\n--- Full JSON từ API resource ---\n";
    echo json_encode($kiemKho->toArray(), JSON_PRETTY_PRINT) . "\n";
}
