<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hoa_hong_ban_hang', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('nhan_vien_id');
            $table->unsignedBigInteger('don_hang_id');
            $table->integer('thang');
            $table->integer('nam');
            $table->decimal('doanh_so', 15, 2)->default(0)->comment('Doanh số của đơn hàng');
            $table->decimal('ty_le_hoa_hong', 5, 2)->default(0)->comment('Tỷ lệ % hoa hồng');
            $table->decimal('tien_hoa_hong', 15, 2)->default(0)->comment('Tiền hoa hồng');
            $table->enum('trang_thai', ['pending', 'approved', 'paid'])->default('pending');
            $table->date('ngay_duyet')->nullable();
            $table->date('ngay_thanh_toan')->nullable();
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hoa_hong_ban_hang');
    }
};
