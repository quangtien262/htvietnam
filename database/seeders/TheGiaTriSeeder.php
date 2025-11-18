<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Spa\TheGiaTri;
use Carbon\Carbon;

class TheGiaTriSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $giftCards = [
            [
                'ten_the' => 'Thẻ Giá Trị 500K',
                'menh_gia' => 500000,
                'gia_ban' => 500000,
                'ti_le_thuong' => 0,
                'trang_thai' => 'active',
                'mo_ta' => 'Thẻ giá trị 500,000đ - Không có khuyến mãi',
            ],
            [
                'ten_the' => 'Thẻ Giá Trị 1 Triệu (Tặng 10%)',
                'menh_gia' => 1000000,
                'gia_ban' => 1000000,
                'ti_le_thuong' => 10,
                'trang_thai' => 'active',
                'mo_ta' => 'Thẻ giá trị 1,000,000đ - Tặng thêm 10% (100,000đ)',
                'ngay_het_han' => Carbon::now()->addMonths(6),
            ],
            [
                'ten_the' => 'Thẻ Giá Trị 2 Triệu (Tặng 15%)',
                'menh_gia' => 2000000,
                'gia_ban' => 2000000,
                'ti_le_thuong' => 15,
                'trang_thai' => 'active',
                'mo_ta' => 'Thẻ giá trị 2,000,000đ - Tặng thêm 15% (300,000đ)',
                'ngay_het_han' => Carbon::now()->addMonths(12),
            ],
            [
                'ten_the' => 'Thẻ Giá Trị 5 Triệu (Tặng 20%)',
                'menh_gia' => 5000000,
                'gia_ban' => 5000000,
                'ti_le_thuong' => 20,
                'trang_thai' => 'active',
                'mo_ta' => 'Thẻ giá trị 5,000,000đ - Tặng thêm 20% (1,000,000đ)',
                'ngay_het_han' => Carbon::now()->addYear(),
            ],
            [
                'ten_the' => 'Thẻ Giá Trị VIP 10 Triệu (Tặng 25%)',
                'menh_gia' => 10000000,
                'gia_ban' => 10000000,
                'ti_le_thuong' => 25,
                'trang_thai' => 'active',
                'mo_ta' => 'Thẻ giá trị VIP 10,000,000đ - Tặng thêm 25% (2,500,000đ)',
                'ngay_het_han' => Carbon::now()->addYear(),
            ],
            // Thẻ có mã code (dùng để tặng)
            [
                'ten_the' => 'Mã Tặng Khách Mới - 200K',
                'menh_gia' => 200000,
                'gia_ban' => 0, // Không bán, chỉ dùng code
                'ti_le_thuong' => 0,
                'trang_thai' => 'active',
                'mo_ta' => 'Mã tặng dành cho khách hàng mới đăng ký',
                'ma_code' => 'WELCOME200',
                'so_luong_code' => 100,
                'so_luong_da_dung' => 0,
                'code_het_han' => Carbon::now()->addMonths(3),
            ],
            [
                'ten_the' => 'Mã Khuyến Mãi Black Friday - 500K',
                'menh_gia' => 500000,
                'gia_ban' => 0,
                'ti_le_thuong' => 0,
                'trang_thai' => 'active',
                'mo_ta' => 'Mã khuyến mãi đặc biệt Black Friday',
                'ma_code' => 'BLACKFRIDAY500',
                'so_luong_code' => 50,
                'so_luong_da_dung' => 0,
                'code_het_han' => Carbon::now()->addMonth(),
            ],
            [
                'ten_the' => 'Mã Tặng VIP - 1 Triệu',
                'menh_gia' => 1000000,
                'gia_ban' => 0,
                'ti_le_thuong' => 0,
                'trang_thai' => 'active',
                'mo_ta' => 'Mã tặng đặc biệt dành cho khách hàng VIP',
                'ma_code' => 'VIP1M2024',
                'so_luong_code' => 20,
                'so_luong_da_dung' => 0,
                'code_het_han' => Carbon::now()->addMonths(6),
            ],
        ];

        foreach ($giftCards as $card) {
            TheGiaTri::create($card);
        }

        $this->command->info('✓ Đã tạo ' . count($giftCards) . ' thẻ giá trị mẫu');
    }
}
