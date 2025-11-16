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
        Schema::create('spa_goi_dich_vu_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('goi_dich_vu_id'); // Gói dịch vụ
            $table->unsignedBigInteger('dich_vu_id'); // Dịch vụ
            $table->decimal('gia_ban_le', 15, 2)->default(0); // Giá bán lẻ
            $table->integer('so_luong')->default(1); // Số lượng (số lần dùng dịch vụ)
            $table->text('ghi_chu')->nullable(); // Ghi chú
            $table->timestamps();

            $table->index('goi_dich_vu_id');
            $table->index('dich_vu_id');

            $table->foreign('goi_dich_vu_id')
                  ->references('id')
                  ->on('spa_goi_dich_vu')
                  ->onDelete('cascade');

            $table->foreign('dich_vu_id')
                  ->references('id')
                  ->on('spa_dich_vu')
                  ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spa_goi_dich_vu_chi_tiet');
    }
};
