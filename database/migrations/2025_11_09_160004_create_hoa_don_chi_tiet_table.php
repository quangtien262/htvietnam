<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hoa_don_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hoa_don_id'); // FK
            $table->unsignedBigInteger('hang_hoa_id')->nullable(); // FK - Hàng hóa
            $table->string('ten_hang_hoa'); // Tên hàng hóa/dịch vụ
            $table->string('don_vi')->nullable(); // Đơn vị tính
            $table->decimal('so_luong', 10, 2)->default(1); // Số lượng
            $table->decimal('don_gia', 15, 2)->default(0); // Đơn giá
            $table->decimal('thanh_tien', 15, 2)->default(0); // Thành tiền = số lượng * đơn giá
            $table->decimal('tien_giam_gia', 15, 2)->default(0); // Giảm giá
            $table->decimal('tien_thue', 15, 2)->default(0); // Thuế
            $table->decimal('tong_tien', 15, 2)->default(0); // Tổng = thành tiền - giảm giá + thuế
            $table->text('ghi_chu')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('hoa_don_id');
            $table->index('hang_hoa_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hoa_don_chi_tiet');
    }
};
