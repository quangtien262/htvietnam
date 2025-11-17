<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spa_ca_lam_viec', function (Blueprint $table) {
            $table->id();
            $table->string('ma_ca', 20)->unique()->comment('CA_001, CA_002...');
            $table->unsignedBigInteger('chi_nhanh_id')->default(1);
            $table->unsignedBigInteger('nhan_vien_mo_ca_id')->comment('Thu ngân mở ca');
            $table->unsignedBigInteger('nhan_vien_dong_ca_id')->nullable()->comment('Thu ngân/Quản lý đóng ca');
            $table->dateTime('thoi_gian_bat_dau');
            $table->dateTime('thoi_gian_ket_thuc')->nullable();

            // Tiền mặt
            $table->decimal('tien_mat_dau_ca', 15, 2)->default(0)->comment('Tiền lẻ ban đầu');
            $table->decimal('tien_mat_cuoi_ca_ly_thuyet', 15, 2)->default(0)->comment('Tính toán tự động');
            $table->decimal('tien_mat_cuoi_ca_thuc_te', 15, 2)->nullable()->comment('Thu ngân đếm');
            $table->decimal('chenh_lech', 15, 2)->default(0)->comment('Thực tế - Lý thuyết');

            // Doanh thu
            $table->decimal('doanh_thu_tien_mat', 15, 2)->default(0);
            $table->decimal('doanh_thu_chuyen_khoan', 15, 2)->default(0);
            $table->decimal('doanh_thu_the', 15, 2)->default(0);
            $table->decimal('tong_doanh_thu', 15, 2)->default(0);
            $table->integer('so_hoa_don')->default(0);

            // Ghi chú
            $table->text('ghi_chu_mo_ca')->nullable();
            $table->text('ghi_chu_dong_ca')->nullable();
            $table->text('giai_trinh_chenh_lech')->nullable()->comment('Giải trình nếu có chênh lệch');

            // Trạng thái
            $table->enum('trang_thai', ['dang_mo', 'da_dong', 'da_ban_giao'])->default('dang_mo');

            $table->timestamps();

            $table->index('chi_nhanh_id');
            $table->index('nhan_vien_mo_ca_id');
            $table->index('trang_thai');
            $table->index('thoi_gian_bat_dau');
        });

        // Thêm cột ca_lam_viec_id vào bảng spa_hoa_don
        Schema::table('spa_hoa_don', function (Blueprint $table) {
            $table->unsignedBigInteger('ca_lam_viec_id')->nullable()->after('chi_nhanh_id');
            $table->index('ca_lam_viec_id');
        });
    }

    public function down(): void
    {
        Schema::table('spa_hoa_don', function (Blueprint $table) {
            $table->dropColumn('ca_lam_viec_id');
        });

        Schema::dropIfExists('spa_ca_lam_viec');
    }
};
