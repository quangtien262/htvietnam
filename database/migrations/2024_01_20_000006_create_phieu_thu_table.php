<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phieu_thu', function (Blueprint $table) {
            $table->id();
            $table->string('ma_phieu_thu', 50)->unique()->comment('Mã phiếu: PT001');
            $table->unsignedBigInteger('user_id')->comment('Khách hàng');
            $table->date('ngay_thu');
            $table->decimal('tong_tien', 15, 2)->default(0)->comment('Tổng tiền thu');
            $table->enum('hinh_thuc_thanh_toan', ['tien_mat', 'chuyen_khoan', 'the', 'cod'])->default('tien_mat');
            $table->string('so_tai_khoan', 50)->nullable()->comment('Số TK ngân hàng');
            $table->string('ngan_hang', 100)->nullable();
            $table->unsignedBigInteger('nguoi_thu_id')->nullable()->comment('Nhân viên thu tiền');
            $table->text('ghi_chu')->nullable();
            $table->enum('trang_thai', ['pending', 'confirmed', 'cancelled'])->default('pending');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phieu_thu');
    }
};
