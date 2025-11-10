<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('don_hang_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('don_hang_id');
            $table->unsignedBigInteger('hang_hoa_id')->comment('Liên kết tới bảng hang_hoa');
            $table->string('ten_hang_hoa')->comment('Lưu tên tại thời điểm bán');
            $table->string('dvt', 20)->nullable()->comment('Đơn vị tính');
            $table->integer('so_luong')->default(1);
            $table->decimal('don_gia', 15, 2)->default(0)->comment('Đơn giá bán');
            $table->decimal('tien_giam_gia', 15, 2)->default(0)->comment('Giảm giá từng SP');
            $table->decimal('thanh_tien', 15, 2)->default(0)->comment('Thành tiền');
            $table->integer('so_luong_da_xuat')->default(0)->comment('Số lượng đã xuất kho');
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('don_hang_chi_tiet');
    }
};
