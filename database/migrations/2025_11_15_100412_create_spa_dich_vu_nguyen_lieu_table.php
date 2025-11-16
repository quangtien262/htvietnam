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
        Schema::create('spa_dich_vu_nguyen_lieu', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('dich_vu_id'); // FK to spa_dich_vu
            $table->unsignedBigInteger('san_pham_id'); // FK to spa_san_pham
            $table->decimal('so_luong', 10, 4)->default(1); // Số lượng
            $table->string('don_vi_su_dung', 50)->nullable(); // Đơn vị sử dụng
            $table->decimal('gia_von', 15, 2)->default(0); // Giá vốn
            $table->decimal('ty_le_quy_doi', 10, 4)->default(1); // Tỷ lệ quy đổi
            $table->decimal('thanh_tien', 15, 2)->default(0); // Thành tiền
            $table->text('ghi_chu')->nullable(); // Ghi chú
            $table->timestamps();

            // Indexes
            $table->index('dich_vu_id');
            $table->index('san_pham_id');

            // Foreign keys
            $table->foreign('dich_vu_id')
                  ->references('id')
                  ->on('spa_dich_vu')
                  ->onDelete('cascade');

            $table->foreign('san_pham_id')
                  ->references('id')
                  ->on('spa_san_pham')
                  ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spa_dich_vu_nguyen_lieu');
    }
};
