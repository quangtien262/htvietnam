<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Chi nhánh
        DB::table('spa_chi_nhanh')->insert([
            [
                'ma_chi_nhanh' => 'CN001',
                'ten_chi_nhanh' => 'Chi nhánh Trung tâm',
                'dia_chi' => '123 Nguyễn Huệ, Quận 1',
                'thanh_pho' => 'TP.HCM',
                'sdt' => '0901234567',
                'email' => 'trungtam@himalayaspa.vn',
                'so_phong' => 5,
                'so_ktv' => 10,
                'gio_mo_cua' => '08:00:00',
                'gio_dong_cua' => '22:00:00',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ma_chi_nhanh' => 'CN002',
                'ten_chi_nhanh' => 'Chi nhánh Quận 2',
                'dia_chi' => '456 Đường Số 9, Quận 2',
                'thanh_pho' => 'TP.HCM',
                'sdt' => '0901234568',
                'email' => 'quan2@himalayaspa.vn',
                'so_phong' => 3,
                'so_ktv' => 6,
                'gio_mo_cua' => '08:00:00',
                'gio_dong_cua' => '22:00:00',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Danh mục dịch vụ
        DB::table('spa_danh_muc_dich_vu')->insert([
            [
                'ten_danh_muc' => 'Massage',
                'mo_ta' => 'Các dịch vụ massage thư giãn',
                'thu_tu' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ten_danh_muc' => 'Chăm sóc da',
                'mo_ta' => 'Các dịch vụ chăm sóc da mặt, body',
                'thu_tu' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Dịch vụ
        DB::table('spa_dich_vu')->insert([
            [
                'ma_dich_vu' => 'DV001',
                'ten_dich_vu' => 'Massage toàn thân 90 phút',
                'danh_muc_id' => 1,
                'mo_ta' => 'Massage thư giãn toàn thân với tinh dầu thiên nhiên',
                'thoi_gian_thuc_hien' => 90,
                'gia_ban' => 500000,
                'gia_thanh_vien' => 450000,
                'diem_thuong' => 50,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ma_dich_vu' => 'DV002',
                'ten_dich_vu' => 'Chăm sóc da mặt 60 phút',
                'danh_muc_id' => 2,
                'mo_ta' => 'Chăm sóc da mặt chuyên sâu',
                'thoi_gian_thuc_hien' => 60,
                'gia_ban' => 300000,
                'gia_thanh_vien' => 270000,
                'diem_thuong' => 30,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ma_dich_vu' => 'DV003',
                'ten_dich_vu' => 'Tắm trắng toàn thân 120 phút',
                'danh_muc_id' => 2,
                'mo_ta' => 'Tắm trắng toàn thân với công nghệ hiện đại',
                'thoi_gian_thuc_hien' => 120,
                'gia_ban' => 800000,
                'gia_thanh_vien' => 720000,
                'diem_thuong' => 80,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Danh mục sản phẩm
        DB::table('spa_danh_muc_san_pham')->insert([
            [
                'ten_danh_muc' => 'Kem dưỡng',
                'thu_tu' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ten_danh_muc' => 'Serum',
                'thu_tu' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Sản phẩm
        DB::table('spa_san_pham')->insert([
            [
                'ma_san_pham' => 'SP001',
                'ten_san_pham' => 'Kem dưỡng da cao cấp',
                'danh_muc_id' => 1,
                'mo_ta_ngan' => 'Kem dưỡng da từ thiên nhiên',
                'gia_ban' => 450000,
                'gia_thanh_vien' => 400000,
                'ton_kho' => 50,
                'don_vi_tinh' => 'hộp',
                'diem_thuong' => 45,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ma_san_pham' => 'SP002',
                'ten_san_pham' => 'Serum Vitamin C',
                'danh_muc_id' => 2,
                'mo_ta_ngan' => 'Serum dưỡng sáng da',
                'gia_ban' => 350000,
                'gia_thanh_vien' => 315000,
                'ton_kho' => 30,
                'don_vi_tinh' => 'chai',
                'diem_thuong' => 35,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ma_san_pham' => 'SP003',
                'ten_san_pham' => 'Mặt nạ collagen',
                'danh_muc_id' => 1,
                'mo_ta_ngan' => 'Mặt nạ chống lão hóa',
                'gia_ban' => 250000,
                'gia_thanh_vien' => 225000,
                'ton_kho' => 100,
                'don_vi_tinh' => 'hộp',
                'diem_thuong' => 25,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        echo "✅ Đã seed dữ liệu SPA mẫu thành công!\n";
    }
}
