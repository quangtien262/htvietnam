<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Seeding Initial Stock Data ===\n\n";

// Get all products
$products = DB::table('spa_san_pham')->get();
echo "Found " . $products->count() . " products\n";

// Get first branch
$branch = DB::table('spa_chi_nhanh')->where('trang_thai', 'active')->first();
if (!$branch) {
    echo "No active branch found! Creating default branch...\n";
    $branchId = DB::table('spa_chi_nhanh')->insertGetId([
        'ma_chi_nhanh' => 'CN001',
        'ten_chi_nhanh' => 'Chi nhánh chính',
        'dia_chi' => 'Hà Nội',
        'so_dien_thoai' => '0123456789',
        'trang_thai' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
} else {
    $branchId = $branch->id;
}

echo "Using branch ID: $branchId\n\n";

// Create stock for each product
foreach ($products as $product) {
    echo "Creating stock for: {$product->ten_san_pham}\n";

    $existing = DB::table('spa_ton_kho_chi_nhanh')
        ->where('chi_nhanh_id', $branchId)
        ->where('san_pham_id', $product->id)
        ->first();

    if (!$existing) {
        DB::table('spa_ton_kho_chi_nhanh')->insert([
            'chi_nhanh_id' => $branchId,
            'san_pham_id' => $product->id,
            'so_luong_ton' => 100, // Initial stock: 100 units
            'so_luong_dat_truoc' => 0,
            'gia_von_binh_quan' => $product->gia_nhap ?? 0,
            'ngay_cap_nhat_cuoi' => now(),
            'nguoi_cap_nhat_cuoi' => 'System Seed',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "  ✓ Created stock: 100 units\n";
    } else {
        echo "  - Stock already exists\n";
    }
}

echo "\n=== Seeding completed ===\n";
echo "Total stock records: " . DB::table('spa_ton_kho_chi_nhanh')->count() . "\n";
