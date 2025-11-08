<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SoQuyMasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // So Quy Type (Loại sổ quỹ)
        DB::table('so_quy_type')->insert([
            ['id' => 1, 'name' => 'Thu', 'code' => 'thu', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Chi', 'code' => 'chi', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // So Quy Status (Trạng thái)
        DB::table('so_quy_status')->insert([
            ['id' => 1, 'name' => 'Chưa thanh toán', 'code' => 'chua_thanh_toan', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Đã thanh toán', 'code' => 'da_thanh_toan', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Đã hủy', 'code' => 'da_huy', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Loai Thu (Loại thu)
        DB::table('loai_thu')->insert([
            ['id' => 1, 'name' => 'Tiền phòng', 'code' => 'tien_phong', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Tiền điện', 'code' => 'tien_dien', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Tiền nước', 'code' => 'tien_nuoc', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Tiền dịch vụ', 'code' => 'tien_dich_vu', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Tiền cọc', 'code' => 'tien_coc', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'name' => 'Thu khác', 'code' => 'thu_khac', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Loai Chi (Loại chi)
        DB::table('loai_chi')->insert([
            ['id' => 1, 'name' => 'Sửa chữa', 'code' => 'sua_chua', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Lương nhân viên', 'code' => 'luong_nhan_vien', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Tiền điện', 'code' => 'tien_dien', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Tiền nước', 'code' => 'tien_nuoc', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Vệ sinh', 'code' => 've_sinh', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'name' => 'Bảo trì', 'code' => 'bao_tri', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'name' => 'Mua sắm', 'code' => 'mua_sam', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'name' => 'Trả cọc', 'code' => 'tra_coc', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 9, 'name' => 'Chi khác', 'code' => 'chi_khac', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Chi nhanh (nếu chưa có)
        // Kiểm tra xem bảng đã có dữ liệu chưa
        if (DB::table('chi_nhanh')->count() == 0) {
            DB::table('chi_nhanh')->insert([
                ['id' => 1, 'name' => 'Chi nhánh chính', 'code' => 'cn_chinh', 'created_at' => now(), 'updated_at' => now()],
                ['id' => 2, 'name' => 'Tòa nhà A', 'code' => 'toa_a', 'created_at' => now(), 'updated_at' => now()],
                ['id' => 3, 'name' => 'Tòa nhà B', 'code' => 'toa_b', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        $this->command->info('Master data seeded successfully!');
    }
}
