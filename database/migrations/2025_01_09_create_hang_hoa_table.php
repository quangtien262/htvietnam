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
        Schema::create('hang_hoa', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên hàng hóa
            $table->string('code')->unique(); // Mã hàng hóa (HH001, HH002...)
            $table->decimal('price_default', 15, 2)->default(0); // Giá mặc định
            $table->integer('so_luong_default')->default(1); // Số lượng mặc định
            $table->decimal('vat', 5, 2)->default(0); // VAT % (0-100)
            $table->string('unit')->nullable(); // Đơn vị tính
            $table->text('description')->nullable(); // Mô tả
            $table->integer('status')->default(1); // 1: Active, 0: Inactive
            $table->unsignedBigInteger('don_vi_hang_hoa_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hang_hoa');
    }
};
