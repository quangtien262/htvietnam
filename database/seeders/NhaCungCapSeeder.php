<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class NhaCungCapSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $suppliers = [
            [
                'ma_ncc' => 'NCC00001',
                'ten_ncc' => 'Cong ty TNHH My pham Thien Nhien',
                'nguoi_lien_he' => 'Nguyen Van A',
                'sdt_lien_he' => '0901234567',
                'sdt' => '0281234567',
                'email' => 'contact@thiennhien.com',
                'dia_chi' => '123 Duong ABC, Quan 1, TP.HCM',
                'thanh_pho' => 'Ho Chi Minh',
                'ma_so_thue' => '0123456789',
                'is_active' => true,
                'ghi_chu' => 'Nha cung cap uy tin, chat luong cao',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'ma_ncc' => 'NCC00002',
                'ten_ncc' => 'Cong ty CP Thiet bi Y te Viet',
                'nguoi_lien_he' => 'Tran Thi B',
                'sdt_lien_he' => '0912345678',
                'sdt' => '0282345678',
                'email' => 'info@thietbiyte.com',
                'dia_chi' => '456 Duong XYZ, Quan 3, TP.HCM',
                'thanh_pho' => 'Ho Chi Minh',
                'ma_so_thue' => '0987654321',
                'is_active' => true,
                'ghi_chu' => 'Chuyen cung cap thiet bi spa cao cap',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'ma_ncc' => 'NCC00003',
                'ten_ncc' => 'Nha phan phoi Duoc pham Dong A',
                'nguoi_lien_he' => 'Le Van C',
                'sdt_lien_he' => '0923456789',
                'sdt' => '0283456789',
                'email' => 'sales@duocpham-donga.com',
                'dia_chi' => '789 Duong DEF, Quan 10, TP.HCM',
                'thanh_pho' => 'Ho Chi Minh',
                'ma_so_thue' => '0111222333',
                'is_active' => true,
                'ghi_chu' => 'Nguon hang on dinh, gia tot',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'ma_ncc' => 'NCC00004',
                'ten_ncc' => 'Cong ty Hoa chat chuyen dung Spa',
                'nguoi_lien_he' => 'Pham Thi D',
                'sdt_lien_he' => '0934567890',
                'sdt' => '0284567890',
                'email' => 'contact@hoachat-spa.com',
                'dia_chi' => '321 Duong GHI, Quan Binh Thanh, TP.HCM',
                'thanh_pho' => 'Ho Chi Minh',
                'ma_so_thue' => '0444555666',
                'is_active' => true,
                'ghi_chu' => 'Hoa chat nhap khau chinh hang',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'ma_ncc' => 'NCC00005',
                'ten_ncc' => 'Cong ty Khan & Vai chuyen dung',
                'nguoi_lien_he' => 'Hoang Van E',
                'sdt_lien_he' => '0945678901',
                'sdt' => '0285678901',
                'email' => 'info@khan-vai.com',
                'dia_chi' => '654 Duong JKL, Quan Tan Binh, TP.HCM',
                'thanh_pho' => 'Ho Chi Minh',
                'ma_so_thue' => '0777888999',
                'is_active' => false,
                'ghi_chu' => 'Tam ngung hop tac do chat luong khong dat',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($suppliers as $supplier) {
            DB::table('spa_nha_cung_cap')->insert($supplier);
        }

        $this->command->info('✓ Đã tạo ' . count($suppliers) . ' nhà cung cấp mẫu');
    }
}
