<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpaThuongHieuSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            [
                'ten_thuong_hieu' => 'L\'Oréal',
                'color' => '#FF6B6B',
                'sort_order' => 1,
                'xuat_xu' => 'Pháp',
                'mo_ta' => 'Thương hiệu mỹ phẩm hàng đầu thế giới',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ten_thuong_hieu' => 'Shiseido',
                'color' => '#4ECDC4',
                'sort_order' => 2,
                'xuat_xu' => 'Nhật Bản',
                'mo_ta' => 'Thương hiệu mỹ phẩm cao cấp Nhật Bản',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ten_thuong_hieu' => 'Lancôme',
                'color' => '#FFE66D',
                'sort_order' => 3,
                'xuat_xu' => 'Pháp',
                'mo_ta' => 'Thương hiệu cao cấp của Pháp',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ten_thuong_hieu' => 'Estée Lauder',
                'color' => '#95E1D3',
                'sort_order' => 4,
                'xuat_xu' => 'Mỹ',
                'mo_ta' => 'Thương hiệu mỹ phẩm sang trọng từ Mỹ',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ten_thuong_hieu' => 'Innisfree',
                'color' => '#A8E6CF',
                'sort_order' => 5,
                'xuat_xu' => 'Hàn Quốc',
                'mo_ta' => 'Mỹ phẩm thiên nhiên từ đảo Jeju',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ten_thuong_hieu' => 'La Roche-Posay',
                'color' => '#74B9FF',
                'sort_order' => 6,
                'xuat_xu' => 'Pháp',
                'mo_ta' => 'Chuyên về chăm sóc da nhạy cảm',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ten_thuong_hieu' => 'Neutrogena',
                'color' => '#FD79A8',
                'sort_order' => 7,
                'xuat_xu' => 'Mỹ',
                'mo_ta' => 'Sản phẩm chăm sóc da dược mỹ phẩm',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ten_thuong_hieu' => 'The Face Shop',
                'color' => '#FDCB6E',
                'sort_order' => 8,
                'xuat_xu' => 'Hàn Quốc',
                'mo_ta' => 'Mỹ phẩm thiên nhiên Hàn Quốc',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('spa_thuong_hieu')->insert($brands);
    }
}
