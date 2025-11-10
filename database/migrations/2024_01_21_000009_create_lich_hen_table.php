<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lich_hen', function (Blueprint $table) {
            $table->id();
            $table->string('tieu_de');
            $table->text('mo_ta')->nullable();
            $table->unsignedBigInteger('user_id')->nullable()->comment('Khách hàng');
            $table->unsignedBigInteger('co_hoi_kinh_doanh_id')->nullable();
            $table->unsignedBigInteger('nhan_vien_phu_trach_id')->nullable();
            $table->datetime('thoi_gian_bat_dau');
            $table->datetime('thoi_gian_ket_thuc')->nullable();
            $table->string('dia_diem')->nullable();
            $table->enum('loai_cuoc_hen', ['gap_mat', 'dien_thoai', 'online', 'other'])->default('gap_mat');
            $table->enum('trang_thai', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending');
            $table->text('ket_qua_cuoc_hen')->nullable();
            $table->text('next_action')->nullable()->comment('Hành động tiếp theo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lich_hen');
    }
};
