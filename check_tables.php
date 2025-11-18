<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    echo "Checking spa_ton_kho_chi_nhanh:\n";
    $count = DB::table('spa_ton_kho_chi_nhanh')->count();
    echo "Count: $count\n";

    if ($count > 0) {
        $sample = DB::table('spa_ton_kho_chi_nhanh')->first();
        echo "Sample record:\n";
        print_r($sample);
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

try {
    echo "\nChecking spa_san_pham:\n";
    $count2 = DB::table('spa_san_pham')->count();
    echo "Count: $count2\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
