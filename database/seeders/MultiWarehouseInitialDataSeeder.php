<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MultiWarehouseInitialDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        // 1. Tạo một số sản phẩm mẫu (nếu chưa có)
        $products = [
            [
                'ma_san_pham' => 'SP00001',
                'ten_san_pham' => 'Kem duong da Vitamin C',
                'don_vi_tinh' => 'chai',
                'gia_ban' => 350000,
                'gia_nhap' => 200000,
                'ton_kho' => 0, // Sẽ được cập nhật từ tồn kho chi nhánh
                'ton_kho_canh_bao' => 10,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'ma_san_pham' => 'SP00002',
                'ten_san_pham' => 'Serum chong lao hoa',
                'don_vi_tinh' => 'lo',
                'gia_ban' => 450000,
                'gia_nhap' => 280000,
                'ton_kho' => 0,
                'ton_kho_canh_bao' => 10,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'ma_san_pham' => 'SP00003',
                'ten_san_pham' => 'Mat na collagen',
                'don_vi_tinh' => 'hop',
                'gia_ban' => 250000,
                'gia_nhap' => 150000,
                'ton_kho' => 0,
                'ton_kho_canh_bao' => 10,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'ma_san_pham' => 'SP00004',
                'ten_san_pham' => 'Tinh dau massage',
                'don_vi_tinh' => 'chai',
                'gia_ban' => 180000,
                'gia_nhap' => 100000,
                'ton_kho' => 0,
                'ton_kho_canh_bao' => 10,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'ma_san_pham' => 'SP00005',
                'ten_san_pham' => 'Khan spa cao cap',
                'don_vi_tinh' => 'cai',
                'gia_ban' => 50000,
                'gia_nhap' => 30000,
                'ton_kho' => 0,
                'ton_kho_canh_bao' => 10,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($products as $product) {
            // Kiểm tra xem sản phẩm đã tồn tại chưa
            $exists = DB::table('spa_san_pham')
                ->where('ma_san_pham', $product['ma_san_pham'])
                ->exists();

            if (!$exists) {
                DB::table('spa_san_pham')->insert($product);
            }
        }

        $this->command->info('✓ Đã kiểm tra/tạo ' . count($products) . ' sản phẩm mẫu');

        // 2. Lấy danh sách chi nhánh hiện có
        $chiNhanhs = DB::table('chi_nhanh')
            ->limit(3) // Chỉ lấy 3 chi nhánh đầu tiên
            ->get();

        if ($chiNhanhs->isEmpty()) {
            $this->command->warn('⚠ Không tìm thấy chi nhánh nào. Vui lòng tạo chi nhánh trước.');
            return;
        }

        $this->command->info('✓ Tìm thấy ' . $chiNhanhs->count() . ' chi nhánh');

        // 3. Lấy ID sản phẩm
        $sanPhamIds = DB::table('spa_san_pham')
            ->whereIn('ma_san_pham', array_column($products, 'ma_san_pham'))
            ->pluck('id', 'ma_san_pham');

        // 4. Tạo tồn kho ban đầu cho từng chi nhánh
        $tonKhoData = [];
        foreach ($chiNhanhs as $index => $chiNhanh) {
            foreach ($sanPhamIds as $maSp => $sanPhamId) {
                // Tạo số lượng ngẫu nhiên khác nhau cho mỗi chi nhánh
                $soLuong = [50, 80, 120, 150, 200][$index % 5];
                $giaVon = $products[array_search($maSp, array_column($products, 'ma_san_pham'))]['gia_nhap'];

                $tonKhoData[] = [
                    'chi_nhanh_id' => $chiNhanh->id,
                    'san_pham_id' => $sanPhamId,
                    'so_luong_ton' => $soLuong,
                    'so_luong_dat_truoc' => 0,
                    'gia_von_binh_quan' => $giaVon,
                    'ngay_cap_nhat_cuoi' => $now,
                    'nguoi_cap_nhat_cuoi' => 1, // Admin user ID
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // Insert tồn kho chi nhánh
        foreach ($tonKhoData as $data) {
            $exists = DB::table('spa_ton_kho_chi_nhanh')
                ->where('chi_nhanh_id', $data['chi_nhanh_id'])
                ->where('san_pham_id', $data['san_pham_id'])
                ->exists();

            if (!$exists) {
                DB::table('spa_ton_kho_chi_nhanh')->insert($data);
            }
        }

        $this->command->info('✓ Đã tạo ' . count($tonKhoData) . ' bản ghi tồn kho chi nhánh');

        // 5. Cập nhật tổng tồn kho cho sản phẩm
        foreach ($sanPhamIds as $sanPhamId) {
            $tongTon = DB::table('spa_ton_kho_chi_nhanh')
                ->where('san_pham_id', $sanPhamId)
                ->sum('so_luong_ton');

            DB::table('spa_san_pham')
                ->where('id', $sanPhamId)
                ->update([
                    'ton_kho' => $tongTon,
                    'updated_at' => $now,
                ]);
        }

        $this->command->info('✓ Đã cập nhật tổng tồn kho cho sản phẩm');

        // 6. Tạo một phiếu chuyển kho mẫu (nếu có >= 2 chi nhánh và có user)
        $hasUser = DB::table('users')->where('id', 1)->exists();

        // 6. Tạo một phiếu chuyển kho mẫu (nếu có ít nhất 2 chi nhánh và user)
        if ($chiNhanhs->count() >= 2 && $hasUser) {
            // Kiểm tra xem đã tồn tại chưa
            $existingChuyenKho = DB::table('spa_chuyen_kho')->where('ma_phieu', 'CK00001')->exists();

            if (!$existingChuyenKho) {
                $chiNhanhXuat = $chiNhanhs[0];
                $chiNhanhNhap = $chiNhanhs[1];

                $chuyenKho = [
                    'ma_phieu' => 'CK00001',
                    'chi_nhanh_xuat_id' => $chiNhanhXuat->id,
                    'chi_nhanh_nhap_id' => $chiNhanhNhap->id,
                    'ngay_xuat' => $now,
                    'nguoi_xuat_id' => 1,
                    'trang_thai' => 'cho_duyet',
                    'ghi_chu' => 'Phieu chuyen kho mau - can bang ton kho giua cac chi nhanh',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                $chuyenKhoId = DB::table('spa_chuyen_kho')->insertGetId($chuyenKho);

            // Chi tiết chuyển kho
            $chiTiets = [
                [
                    'phieu_chuyen_id' => $chuyenKhoId,
                    'san_pham_id' => $sanPhamIds['SP00001'],
                    'so_luong_xuat' => 20,
                    'gia_von' => 200000,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'phieu_chuyen_id' => $chuyenKhoId,
                    'san_pham_id' => $sanPhamIds['SP00002'],
                    'so_luong_xuat' => 15,
                    'gia_von' => 280000,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ];

            DB::table('spa_chuyen_kho_chi_tiet')->insert($chiTiets);

            $this->command->info('✓ Đã tạo 1 phiếu chuyển kho mẫu với ' . count($chiTiets) . ' sản phẩm');
            } else {
                $this->command->info('⚠ Phiếu chuyển kho CK00001 đã tồn tại - bỏ qua');
            }
        } else {
            if (!$hasUser) {
                $this->command->warn('⚠ Bỏ qua tạo phiếu chuyển kho - Chưa có user trong hệ thống');
            }
        }

        // 7. Tạo một phiếu kiểm kho mẫu (nếu có chi nhánh và user)
        if ($chiNhanhs->count() >= 1 && $hasUser) {
            $existingKiemKho = DB::table('spa_kiem_kho')->where('ma_phieu', 'KK00001')->exists();

            if (!$existingKiemKho) {
                $kiemKho = [
                    'ma_phieu' => 'KK00001',
                    'chi_nhanh_id' => $chiNhanhs[0]->id,
                    'ngay_kiem' => $now,
                    'loai_kiem_kho' => 'dot_xuat',
                    'nguoi_kiem_id' => 1,
                    'trang_thai' => 'dang_kiem',
                    'ghi_chu' => 'Kiem kho dot xuat - mau',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

            $kiemKhoId = DB::table('spa_kiem_kho')->insertGetId($kiemKho);

            // Chi tiết kiểm kho
            $kiemKhoChiTiets = [
                [
                    'phieu_kiem_id' => $kiemKhoId,
                    'san_pham_id' => $sanPhamIds['SP00001'],
                    'so_luong_he_thong' => 50,
                    'so_luong_thuc_te' => 48, // Thiếu 2
                    'gia_von' => 200000,
                    'ghi_chu' => 'Hao hut tu nhien',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'phieu_kiem_id' => $kiemKhoId,
                    'san_pham_id' => $sanPhamIds['SP00003'],
                    'so_luong_he_thong' => 120,
                    'so_luong_thuc_te' => 121, // Thừa 1
                    'gia_von' => 150000,
                    'ghi_chu' => 'Phat hien san pham chua nhap he thong',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ];

            DB::table('spa_kiem_kho_chi_tiet')->insert($kiemKhoChiTiets);

            $this->command->info('✓ Đã tạo 1 phiếu kiểm kho mẫu với ' . count($kiemKhoChiTiets) . ' sản phẩm');
            } else {
                $this->command->info('⚠ Phiếu kiểm kho KK00001 đã tồn tại - bỏ qua');
            }
        } else {
            if (!$hasUser) {
                $this->command->warn('⚠ Bỏ qua tạo phiếu kiểm kho - Chưa có user trong hệ thống');
            }
        }

        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('Hoan thanh khoi tao du lieu mau!');
        $this->command->info('========================================');
        $this->command->info('- Nha cung cap: Chay NhaCungCapSeeder rieng');
        $this->command->info('- San pham: ' . count($products) . ' san pham');
        $this->command->info('- Ton kho chi nhanh: ' . count($tonKhoData) . ' ban ghi');
        $this->command->info('- Phieu chuyen kho: 1 phieu (cho duyet)');
        $this->command->info('- Phieu kiem kho: 1 phieu (dang kiem)');
        $this->command->info('========================================');
    }
}
