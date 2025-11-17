<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * HỆ THỐNG QUẢN LÝ KHO ĐA CHI NHÁNH
     *
     * 1. Tồn kho theo chi nhánh (spa_ton_kho_chi_nhanh)
     * 2. Chuyển kho (spa_chuyen_kho + chi_tiet)
     * 3. Kiểm kho (spa_kiem_kho + chi_tiet)
     * 4. Trả hàng nhập (spa_tra_hang_nhap + chi_tiet)
     * 5. Xuất hủy (spa_xuat_huy + chi_tiet)
     */
    public function up(): void
    {
        // ============================================
        // 0. NHÀ CUNG CẤP (CREATE FIRST - nếu chưa có)
        // ============================================
        if (!Schema::hasTable('spa_nha_cung_cap')) {
            Schema::create('spa_nha_cung_cap', function (Blueprint $table) {
                $table->id();
                $table->string('ma_ncc', 20)->unique();
                $table->string('ten_ncc', 255);
                $table->string('dia_chi')->nullable();
                $table->string('thanh_pho', 100)->nullable();
                $table->string('sdt', 20)->nullable();
                $table->string('email')->nullable();
                $table->string('nguoi_lien_he', 100)->nullable();
                $table->string('sdt_lien_he', 20)->nullable();
                $table->string('ma_so_thue', 20)->nullable();
                $table->text('ghi_chu')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // ============================================
        // 1. TỒN KHO THEO CHI NHÁNH (CORE TABLE)
        // ============================================
        Schema::create('spa_ton_kho_chi_nhanh', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('chi_nhanh_id');
            $table->unsignedBigInteger('san_pham_id');

            // Số lượng tồn
            $table->integer('so_luong_ton')->default(0)->comment('Tồn kho thực tế');
            $table->integer('so_luong_dat_truoc')->default(0)->comment('Đã đặt trước cho booking');
            $table->integer('so_luong_kha_dung')->storedAs('so_luong_ton - so_luong_dat_truoc')->comment('Có thể bán');

            // Giá vốn (AVCO - Average Cost)
            $table->decimal('gia_von_binh_quan', 15, 2)->default(0)->comment('Weighted average cost');
            $table->decimal('gia_tri_ton_kho', 15, 2)->storedAs('so_luong_ton * gia_von_binh_quan')->comment('Inventory value');

            // Theo dõi
            $table->dateTime('ngay_cap_nhat_cuoi')->nullable()->comment('Last stock movement');
            $table->string('nguoi_cap_nhat_cuoi', 100)->nullable()->comment('Last updated by');

            $table->timestamps();

            // Indexes
            $table->unique(['chi_nhanh_id', 'san_pham_id'], 'unique_branch_product');
            $table->index('san_pham_id');
            $table->index('so_luong_ton');
        });

        // ============================================
        // 2. CHUYỂN KHO GIỮA CHI NHÁNH
        // ============================================
        Schema::create('spa_chuyen_kho', function (Blueprint $table) {
            $table->id();
            $table->string('ma_phieu', 20)->unique()->comment('CK00001');

            // Chi nhánh gửi/nhận
            $table->unsignedBigInteger('chi_nhanh_xuat_id');
            $table->unsignedBigInteger('chi_nhanh_nhap_id');

            // Người xử lý
            $table->unsignedBigInteger('nguoi_xuat_id');
            $table->unsignedBigInteger('nguoi_duyet_id')->nullable();
            $table->unsignedBigInteger('nguoi_nhap_id')->nullable();

            // Thời gian
            $table->date('ngay_xuat');
            $table->dateTime('ngay_duyet')->nullable();
            $table->date('ngay_nhap')->nullable();
            $table->date('ngay_du_kien_nhan')->nullable();

            // Trạng thái
            $table->enum('trang_thai', ['cho_duyet', 'dang_chuyen', 'da_nhan', 'huy'])
                ->default('cho_duyet')
                ->index();

            // Thông tin
            $table->string('ly_do')->nullable()->comment('Transfer reason');
            $table->text('ghi_chu')->nullable();
            $table->text('ghi_chu_nhan_hang')->nullable()->comment('Note when receiving');

            // Tài liệu đính kèm
            $table->json('hinh_anh_xuat_ids')->nullable()->comment('Photos when sending');
            $table->json('hinh_anh_nhan_ids')->nullable()->comment('Photos when receiving');

            // Tổng hợp
            $table->integer('tong_so_luong_xuat')->default(0);
            $table->integer('tong_so_luong_nhan')->default(0);
            $table->integer('tong_so_luong_hong')->default(0);
            $table->decimal('tong_gia_tri', 15, 2)->default(0);

            $table->timestamps();

            // Indexes
            $table->index(['chi_nhanh_xuat_id', 'ngay_xuat']);
            $table->index(['chi_nhanh_nhap_id', 'ngay_nhap']);
        });

        Schema::create('spa_chuyen_kho_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('phieu_chuyen_id');
            $table->unsignedBigInteger('san_pham_id');

            // Số lượng
            $table->integer('so_luong_xuat')->comment('Quantity sent');
            $table->integer('so_luong_nhan')->default(0)->comment('Quantity received');
            $table->integer('so_luong_hong')->default(0)->comment('Damaged in transit');
            $table->integer('so_luong_chenh_lech')->storedAs('so_luong_xuat - so_luong_nhan - so_luong_hong');

            // Giá trị
            $table->decimal('gia_von', 15, 2)->default(0);
            $table->decimal('thanh_tien', 15, 2)->storedAs('so_luong_xuat * gia_von');

            // Ghi chú
            $table->text('ghi_chu')->nullable();
            $table->string('ly_do_hong', 255)->nullable()->comment('Reason for damage');

            $table->timestamps();

            $table->index('san_pham_id');
        });

        // ============================================
        // 3. KIỂM KHO THEO CHI NHÁNH
        // ============================================
        Schema::create('spa_kiem_kho', function (Blueprint $table) {
            $table->id();
            $table->string('ma_phieu', 20)->unique()->comment('KK00001');
            $table->unsignedBigInteger('chi_nhanh_id');

            // Người xử lý
            $table->unsignedBigInteger('nguoi_kiem_id');
            $table->unsignedBigInteger('nguoi_duyet_id')->nullable();

            // Thời gian
            $table->date('ngay_kiem');
            $table->dateTime('ngay_duyet')->nullable();

            // Trạng thái
            $table->enum('trang_thai', ['dang_kiem', 'cho_duyet', 'da_duyet', 'huy'])
                ->default('dang_kiem')
                ->index();

            // Loại kiểm kho
            $table->enum('loai_kiem_kho', ['dinh_ky', 'dot_xuat', 'theo_danh_muc', 'toan_bo'])
                ->default('toan_bo');

            // Tổng hợp
            $table->integer('tong_so_san_pham')->default(0);
            $table->integer('tong_chenh_lech')->default(0)->comment('Total difference (+/-)');
            $table->decimal('tong_gia_tri_chenh_lech', 15, 2)->default(0);

            // Thông tin
            $table->string('ly_do')->nullable();
            $table->text('ghi_chu')->nullable();
            $table->json('hinh_anh_ids')->nullable();

            $table->timestamps();

            $table->index(['chi_nhanh_id', 'ngay_kiem']);
        });

        Schema::create('spa_kiem_kho_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('phieu_kiem_id');
            $table->unsignedBigInteger('san_pham_id');

            // Số lượng
            $table->integer('so_luong_he_thong')->comment('System stock');
            $table->integer('so_luong_thuc_te')->comment('Physical count');
            $table->integer('chenh_lech')->storedAs('so_luong_thuc_te - so_luong_he_thong');

            // Giá trị
            $table->decimal('gia_von', 15, 2)->default(0);
            $table->decimal('thanh_tien_chenh_lech', 15, 2)->storedAs('chenh_lech * gia_von');

            // Ghi chú
            $table->text('ghi_chu')->nullable();
            $table->string('nguyen_nhan_chenh_lech', 255)->nullable();

            $table->timestamps();

            $table->index('san_pham_id');
        });

        // ============================================
        // 4. TRẢ HÀNG NHẬP (PURCHASE RETURN)
        // ============================================
        Schema::create('spa_tra_hang_nhap', function (Blueprint $table) {
            $table->id();
            $table->string('ma_phieu', 20)->unique()->comment('TH00001');
            $table->unsignedBigInteger('chi_nhanh_id');
            $table->unsignedBigInteger('phieu_nhap_id');
            $table->unsignedBigInteger('nha_cung_cap_id');

            // Người xử lý
            $table->unsignedBigInteger('nguoi_tra_id');
            $table->unsignedBigInteger('nguoi_duyet_id')->nullable();

            // Thời gian
            $table->date('ngay_tra');
            $table->dateTime('ngay_duyet')->nullable();

            // Trạng thái
            $table->enum('trang_thai', ['cho_duyet', 'da_duyet', 'huy'])
                ->default('cho_duyet')
                ->index();

            // Lý do trả hàng
            $table->enum('ly_do_tra', [
                'hang_loi',
                'het_han',
                'sai_quy_cach',
                'khong_dung_don_hang',
                'khac'
            ])->comment('Return reason');

            // Thông tin
            $table->text('mo_ta_ly_do')->nullable();
            $table->text('ghi_chu')->nullable();
            $table->json('hinh_anh_ids')->nullable()->comment('Photos of defective products');

            // Tổng hợp
            $table->decimal('tong_tien_tra', 15, 2)->default(0);
            $table->decimal('tong_tien_hoan', 15, 2)->default(0)->comment('Refund amount');

            $table->timestamps();

            $table->index(['chi_nhanh_id', 'ngay_tra']);
            $table->index('nha_cung_cap_id');
        });

        Schema::create('spa_tra_hang_nhap_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('phieu_tra_id');
            $table->unsignedBigInteger('san_pham_id');
            $table->unsignedBigInteger('nhap_kho_chi_tiet_id')->nullable();

            // Số lượng
            $table->integer('so_luong_tra')->comment('Return quantity');
            $table->decimal('don_gia', 15, 2);
            $table->decimal('thanh_tien', 15, 2)->storedAs('so_luong_tra * don_gia');

            // Thông tin sản phẩm lỗi
            $table->text('mo_ta_loi')->nullable();
            $table->date('ngay_san_xuat')->nullable();
            $table->date('han_su_dung')->nullable();
            $table->string('lo_san_xuat', 100)->nullable();

            $table->timestamps();

            $table->index('san_pham_id');
        });

        // ============================================
        // 5. XUẤT HỦY (DISPOSAL/WRITE-OFF)
        // ============================================
        Schema::create('spa_xuat_huy', function (Blueprint $table) {
            $table->id();
            $table->string('ma_phieu', 20)->unique()->comment('XH00001');
            $table->unsignedBigInteger('chi_nhanh_id');

            // Người xử lý
            $table->unsignedBigInteger('nguoi_xuat_id');
            $table->unsignedBigInteger('nguoi_duyet_id')->nullable();

            // Thời gian
            $table->date('ngay_xuat');
            $table->dateTime('ngay_duyet')->nullable();

            // Trạng thái
            $table->enum('trang_thai', ['cho_duyet', 'da_duyet', 'huy'])
                ->default('cho_duyet')
                ->index();

            // Lý do xuất hủy
            $table->enum('ly_do_huy', [
                'het_han',
                'hong_hoc',
                'mat_chat_luong',
                'bi_o_nhiem',
                'khac'
            ])->comment('Disposal reason');

            // Thông tin
            $table->text('mo_ta_ly_do')->nullable();
            $table->text('ghi_chu')->nullable();
            $table->json('hinh_anh_ids')->nullable()->comment('Photos for evidence');

            // Tổng hợp
            $table->decimal('tong_gia_tri_huy', 15, 2)->default(0)->comment('Total loss value');

            $table->timestamps();

            $table->index(['chi_nhanh_id', 'ngay_xuat']);
        });

        Schema::create('spa_xuat_huy_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('phieu_huy_id');
            $table->unsignedBigInteger('san_pham_id');

            // Số lượng
            $table->integer('so_luong_huy')->comment('Disposal quantity');
            $table->decimal('gia_von', 15, 2)->default(0);
            $table->decimal('thanh_tien', 15, 2)->storedAs('so_luong_huy * gia_von');

            // Thông tin
            $table->text('ghi_chu')->nullable();
            $table->date('ngay_san_xuat')->nullable();
            $table->date('han_su_dung')->nullable();
            $table->string('lo_san_xuat', 100)->nullable();

            $table->timestamps();

            $table->index('san_pham_id');
        });

        // ============================================
        // 6. CẬP NHẬT BẢNG NHẬP KHO (ADD chi_nhanh_id)
        // ============================================
        if (!Schema::hasColumn('spa_nhap_kho', 'chi_nhanh_id')) {
            Schema::table('spa_nhap_kho', function (Blueprint $table) {
                $table->unsignedBigInteger('chi_nhanh_id')
                    ->after('id')
                    ->nullable();

                $table->index(['chi_nhanh_id', 'ngay_nhap']);
            });
        }
    }    public function down(): void
    {
        // Drop in reverse order
        Schema::dropIfExists('spa_xuat_huy_chi_tiet');
        Schema::dropIfExists('spa_xuat_huy');
        Schema::dropIfExists('spa_tra_hang_nhap_chi_tiet');
        Schema::dropIfExists('spa_tra_hang_nhap');
        Schema::dropIfExists('spa_kiem_kho_chi_tiet');
        Schema::dropIfExists('spa_kiem_kho');
        Schema::dropIfExists('spa_chuyen_kho_chi_tiet');
        Schema::dropIfExists('spa_chuyen_kho');
        Schema::dropIfExists('spa_ton_kho_chi_nhanh');

        // Remove chi_nhanh_id from spa_nhap_kho
        if (Schema::hasColumn('spa_nhap_kho', 'chi_nhanh_id')) {
            Schema::table('spa_nhap_kho', function (Blueprint $table) {
                // Try to drop foreign key if exists
                try {
                    $table->dropForeign(['chi_nhanh_id']);
                } catch (\Exception $e) {
                    // Foreign key doesn't exist, continue
                }
                $table->dropColumn('chi_nhanh_id');
            });
        }

        if (Schema::hasTable('spa_nha_cung_cap')) {
            Schema::dropIfExists('spa_nha_cung_cap');
        }
    }
};
