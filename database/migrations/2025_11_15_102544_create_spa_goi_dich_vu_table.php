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
        Schema::create('spa_goi_dich_vu', function (Blueprint $table) {
            $table->id();
            $table->string('ma_goi')->unique(); // Mã gói - GOI000<ID>
            $table->unsignedBigInteger('nhom_hang_id')->nullable(); // Nhóm hàng
            $table->decimal('gia_ban', 15, 2)->default(0); // Giá bán
            $table->decimal('price_member', 15, 2)->nullable()->comment('Giá dành cho thành viên');
            $table->integer('so_luong')->default(0); // Số lượng
            $table->integer('han_su_dung')->default(0)->comment('Hạn sử dụng (số ngày từ ngày mua)'); // Hạn sử dụng
            $table->unsignedBigInteger('lich_trinh_su_dung_id')->nullable(); // Lịch trình sử dụng
            $table->text('mo_ta')->nullable(); // Mô tả
            $table->string('hinh_anh')->nullable(); // Hình ảnh
            $table->boolean('is_active')->default(true); // Trạng thái
            $table->timestamps();

            $table->index('nhom_hang_id');
            $table->index('lich_trinh_su_dung_id');
            $table->foreign('lich_trinh_su_dung_id')
                  ->references('id')
                  ->on('spa_lich_trinh_su_dung')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spa_goi_dich_vu');
    }
};
