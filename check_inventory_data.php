<?php
/**
 * Check spa_nhap_kho table and recent bulk imports
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== KIỂM TRA BẢNG SPA_NHAP_KHO ===\n\n";

// Check if table exists
$tables = DB::select("SHOW TABLES LIKE 'spa_nhap_kho'");
if (count($tables) > 0) {
    echo "✓ Bảng spa_nhap_kho TỒN TẠI\n\n";

    // Show columns
    $columns = DB::select("SHOW COLUMNS FROM spa_nhap_kho");
    echo "Cấu trúc bảng:\n";
    foreach ($columns as $col) {
        echo "  - {$col->Field} ({$col->Type})\n";
    }
    echo "\n";

    // Check total records
    $total = DB::table('spa_nhap_kho')->count();
    echo "Tổng số phiếu nhập: {$total}\n\n";

    // Show recent records
    $recent = DB::table('spa_nhap_kho')
        ->orderBy('id', 'desc')
        ->limit(5)
        ->get();

    if (count($recent) > 0) {
        echo "5 phiếu nhập gần nhất:\n";
        foreach ($recent as $r) {
            echo "  - ID: {$r->id}, Mã: {$r->ma_phieu}, Ngày: {$r->ngay_nhap}, Tổng tiền: " . number_format($r->tong_tien ?? 0) . " VND\n";

            // Check details
            $details = DB::table('spa_nhap_kho_chi_tiet')
                ->where('phieu_nhap_id', $r->id)
                ->count();
            echo "    → Chi tiết: {$details} sản phẩm\n";
        }
    } else {
        echo "⚠ CHƯA CÓ PHIẾU NHẬP NÀO\n";
        echo "→ Khi nhập kho hàng loạt, phiếu nhập sẽ được tạo vào bảng này\n";
    }

} else {
    echo "✗ BẢNG spa_nhap_kho KHÔNG TỒN TẠI\n";
    echo "→ Cần chạy migration để tạo bảng\n";
}

echo "\n=== KIỂM TRA BẢNG SPA_NHAP_KHO_CHI_TIET ===\n\n";

$tables2 = DB::select("SHOW TABLES LIKE 'spa_nhap_kho_chi_tiet'");
if (count($tables2) > 0) {
    echo "✓ Bảng spa_nhap_kho_chi_tiet TỒN TẠI\n";

    $total2 = DB::table('spa_nhap_kho_chi_tiet')->count();
    echo "Tổng số chi tiết: {$total2}\n";
} else {
    echo "✗ BẢNG spa_nhap_kho_chi_tiet KHÔNG TỒN TẠI\n";
}

