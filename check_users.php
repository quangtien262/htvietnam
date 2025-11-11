<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

$users = User::select('id', 'name', 'loai_khach', 'tong_chi_tieu', 'diem_tich_luy')
    ->latest()
    ->take(5)
    ->get();

echo "ID | Tên | Loại KH | Tổng chi tiêu | Điểm\n";
echo str_repeat('-', 70) . "\n";

foreach ($users as $user) {
    echo sprintf(
        "%d | %s | %s | %s | %d\n",
        $user->id,
        $user->name,
        $user->loai_khach ?? 'NULL',
        number_format($user->tong_chi_tieu ?? 0),
        $user->diem_tich_luy ?? 0
    );
}
