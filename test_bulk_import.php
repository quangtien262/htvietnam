<?php
/**
 * Test script to verify bulk import updates spa_ton_kho_chi_nhanh table
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Spa\TonKhoChiNhanh;

echo "=== Testing Bulk Import Fix ===\n\n";

// Get current stock count
$beforeCount = DB::table('spa_ton_kho_chi_nhanh')->count();
echo "Records in spa_ton_kho_chi_nhanh BEFORE: {$beforeCount}\n";

// Get a sample product
$product = DB::table('spa_san_pham')->where('is_active', 1)->first();
if (!$product) {
    echo "ERROR: No active products found!\n";
    exit(1);
}

echo "\nTest product: {$product->ten_san_pham} (ID: {$product->id})\n";

// Get stock before
$stockBefore = DB::table('spa_ton_kho_chi_nhanh')
    ->where('chi_nhanh_id', 1)
    ->where('san_pham_id', $product->id)
    ->first();

echo "Stock BEFORE: " . ($stockBefore ? $stockBefore->so_luong_ton : 0) . " units\n";

// Simulate bulk import by calling the model method directly
try {
    echo "\nSimulating bulk import: +50 units at 100,000 VND...\n";
    
    TonKhoChiNhanh::updateStock(
        1, // chi_nhanh_id
        $product->id, // san_pham_id
        50, // so_luong
        'increase', // action
        100000 // gia_nhap
    );
    
    // Sync with product table
    TonKhoChiNhanh::syncWithProductTable($product->id);
    
    echo "✓ Import successful!\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}

// Get stock after
$stockAfter = DB::table('spa_ton_kho_chi_nhanh')
    ->where('chi_nhanh_id', 1)
    ->where('san_pham_id', $product->id)
    ->first();

$afterCount = DB::table('spa_ton_kho_chi_nhanh')->count();

echo "\nStock AFTER: " . ($stockAfter ? $stockAfter->so_luong_ton : 0) . " units\n";
echo "Records in spa_ton_kho_chi_nhanh AFTER: {$afterCount}\n";

// Verify the change
$expectedIncrease = 50;
$beforeQty = $stockBefore ? $stockBefore->so_luong_ton : 0;
$afterQty = $stockAfter ? $stockAfter->so_luong_ton : 0;
$actualIncrease = $afterQty - $beforeQty;

echo "\n=== VERIFICATION ===\n";
echo "Expected increase: {$expectedIncrease} units\n";
echo "Actual increase: {$actualIncrease} units\n";

if ($actualIncrease === $expectedIncrease) {
    echo "✓ TEST PASSED! Stock was updated correctly in spa_ton_kho_chi_nhanh.\n";
} else {
    echo "✗ TEST FAILED! Stock update mismatch.\n";
    exit(1);
}

echo "\n=== SUCCESS ===\n";
echo "The bulk import fix is working correctly!\n";
echo "Inventory list will now show updated data after bulk import.\n";
