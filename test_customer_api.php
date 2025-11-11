<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\Spa\KhachHangService;

$service = new KhachHangService();

echo "Testing KhachHangService::getList()\n";
echo str_repeat('=', 70) . "\n\n";

$result = $service->getList(['per_page' => 10]);

echo "Total customers: " . $result->total() . "\n";
echo "Per page: " . $result->perPage() . "\n";
echo "Current page: " . $result->currentPage() . "\n\n";

echo "Customers:\n";
foreach ($result->items() as $customer) {
    echo sprintf(
        "ID: %d | Name: %s | Phone: %s | Email: %s | Loại: %s\n",
        $customer->id,
        $customer->name ?? $customer->ho_ten ?? 'N/A',
        $customer->phone ?? $customer->sdt ?? 'N/A',
        $customer->email ?? 'N/A',
        $customer->loai_khach ?? 'N/A'
    );
}

echo "\n" . str_repeat('=', 70) . "\n";
echo "JSON structure:\n";

$items = collect($result->items())->map(function($customer) {
    return [
        'id' => $customer->id,
        'name' => $customer->name,
        'ho_ten' => $customer->ho_ten,
        'phone' => $customer->phone,
        'sdt' => $customer->sdt,
        'email' => $customer->email,
        'loai_khach' => $customer->loai_khach,
    ];
})->toArray();

echo json_encode([
    'success' => true,
    'data' => [
        'current_page' => $result->currentPage(),
        'data' => $items,
        'total' => $result->total(),
    ]
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
