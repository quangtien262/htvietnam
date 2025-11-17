<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpaDonViSanPhamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            // Đơn vị đóng gói
            ['name' => 'Chai', 'color' => '#1890ff', 'sort_order' => 1, 'note' => 'Đơn vị đóng gói - Chai'],
            ['name' => 'Hộp', 'color' => '#52c41a', 'sort_order' => 2, 'note' => 'Đơn vị đóng gói - Hộp'],
            ['name' => 'Tuýp', 'color' => '#faad14', 'sort_order' => 3, 'note' => 'Đơn vị đóng gói - Tuýp'],
            ['name' => 'Lọ', 'color' => '#13c2c2', 'sort_order' => 4, 'note' => 'Đơn vị đóng gói - Lọ'],
            ['name' => 'Cái', 'color' => '#722ed1', 'sort_order' => 5, 'note' => 'Đơn vị đóng gói - Cái'],
            ['name' => 'Gói', 'color' => '#eb2f96', 'sort_order' => 6, 'note' => 'Đơn vị đóng gói - Gói'],

            // Đơn vị thể tích
            ['name' => 'ml', 'color' => '#2f54eb', 'sort_order' => 7, 'note' => 'Đơn vị thể tích - Mililit'],
            ['name' => 'Lít', 'color' => '#096dd9', 'sort_order' => 8, 'note' => 'Đơn vị thể tích - Lít'],

            // Đơn vị khối lượng
            ['name' => 'Gram', 'color' => '#389e0d', 'sort_order' => 9, 'note' => 'Đơn vị khối lượng - Gram'],
            ['name' => 'Kg', 'color' => '#237804', 'sort_order' => 10, 'note' => 'Đơn vị khối lượng - Kilogram'],

            // Đơn vị sử dụng
            ['name' => 'Lần', 'color' => '#d4380d', 'sort_order' => 11, 'note' => 'Đơn vị sử dụng - Lần'],
            ['name' => 'Suất', 'color' => '#cf1322', 'sort_order' => 12, 'note' => 'Đơn vị sử dụng - Suất'],
        ];

        foreach ($units as $unit) {
            $unit['created_at'] = now();
            $unit['updated_at'] = now();
            DB::table('spa_don_vi_san_pham')->insert($unit);
        }
    }
}
