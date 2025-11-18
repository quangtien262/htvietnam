<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$cols = DB::select('SHOW COLUMNS FROM spa_nha_cung_cap');
echo "Columns in spa_nha_cung_cap:\n";
foreach($cols as $col) {
    echo "  - {$col->Field} ({$col->Type})\n";
}
