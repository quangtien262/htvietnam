<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cuoc_goi_telesale', function (Blueprint $table) {
            $table->id();
            $table->string('ma_cuoc_goi', 50)->unique()->comment('Mã cuộc gọi: CG00001');
            $table->unsignedBigInteger('data_khach_hang_id');
            $table->unsignedBigInteger('nhan_vien_telesale_id');
            $table->datetime('thoi_gian_bat_dau');
            $table->datetime('thoi_gian_ket_thuc')->nullable();
            $table->integer('thoi_luong')->default(0)->comment('Thời lượng gọi (giây)');
            $table->enum('ket_qua', ['thanh_cong', 'khong_nghe_may', 'tu_choi', 'hen_goi_lai', 'sai_so', 'other'])->default('khong_nghe_may');
            $table->text('ghi_chu')->nullable();
            $table->text('noi_dung_cuoc_goi')->nullable();
            $table->string('file_ghi_am')->nullable()->comment('Link file ghi âm');
            $table->datetime('ngay_hen_goi_lai')->nullable();
            $table->boolean('da_tao_don_hang')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cuoc_goi_telesale');
    }
};
