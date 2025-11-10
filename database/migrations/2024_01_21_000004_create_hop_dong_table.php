<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hop_dong', function (Blueprint $table) {
            $table->id();
            $table->string('ma_hop_dong', 50)->unique()->comment('Mã hợp đồng: HD0001');
            $table->unsignedBigInteger('user_id')->comment('Khách hàng');
            $table->unsignedBigInteger('bao_gia_id')->nullable();
            $table->string('loai_hop_dong')->nullable()->comment('Mua bán, Dịch vụ, Thuê...');
            $table->decimal('gia_tri_hop_dong', 15, 2)->default(0);
            $table->date('ngay_bat_dau');
            $table->date('ngay_ket_thuc')->nullable();
            $table->text('dieu_khoan')->nullable();
            $table->string('phuong_thuc_thanh_toan')->nullable();
            $table->enum('trang_thai', ['draft', 'pending', 'active', 'completed', 'terminated'])->default('draft');
            $table->text('file_hop_dong')->nullable()->comment('Link file scan');
            $table->text('ghi_chu')->nullable();
            $table->unsignedBigInteger('nhan_vien_phu_trach_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hop_dong');
    }
};
