<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lich_hen_goi_lai', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('data_khach_hang_id');
            $table->unsignedBigInteger('cuoc_goi_id')->nullable();
            $table->unsignedBigInteger('nhan_vien_telesale_id');
            $table->datetime('thoi_gian_hen');
            $table->boolean('da_goi')->default(false);
            $table->text('noi_dung_can_hoi')->nullable();
            $table->enum('uu_tien', ['cao', 'trung_binh', 'thap'])->default('trung_binh');
            $table->enum('trang_thai', ['pending', 'completed', 'cancelled'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lich_hen_goi_lai');
    }
};
