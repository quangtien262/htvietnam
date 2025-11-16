<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LichTrinhSuDungSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('spa_lich_trinh_su_dung')->insert([
            [
                'name' => 'Theo ngày',
                'color' => '#1890ff',
                'sort_order' => 1,
                'note' => 'Sử dụng theo lịch trình hàng ngày',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Theo tháng',
                'color' => '#52c41a',
                'sort_order' => 2,
                'note' => 'Sử dụng theo lịch trình hàng tháng',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Theo năm',
                'color' => '#faad14',
                'sort_order' => 3,
                'note' => 'Sử dụng theo lịch trình hàng năm',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Tự do',
                'color' => '#722ed1',
                'sort_order' => 4,
                'note' => 'Không giới hạn thời gian sử dụng',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
