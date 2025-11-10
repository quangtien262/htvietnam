<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bao_gia', function (Blueprint $table) {
            $table->id();
            $table->string('ma_bao_gia', 50)->unique()->comment('Mã báo giá: BG0001');
            $table->unsignedBigInteger('user_id')->comment('Khách hàng');
            $table->unsignedBigInteger('co_hoi_kinh_doanh_id')->nullable();
            $table->date('ngay_bao_gia');
            $table->date('hieu_luc_den')->nullable();
            $table->decimal('tong_tien', 15, 2)->default(0);
            $table->decimal('tien_giam_gia', 15, 2)->default(0);
            $table->decimal('tong_cong', 15, 2)->default(0);
            $table->enum('trang_thai', ['draft', 'sent', 'approved', 'rejected', 'expired'])->default('draft');
            $table->unsignedBigInteger('nhan_vien_tao_id')->nullable();
            $table->text('ghi_chu')->nullable();
            $table->text('dieu_khoan')->nullable()->comment('Điều khoản thanh toán, giao hàng...');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bao_gia');
    }
};
