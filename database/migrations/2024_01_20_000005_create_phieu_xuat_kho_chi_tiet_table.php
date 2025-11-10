<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phieu_xuat_kho_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('phieu_xuat_kho_id');
            $table->unsignedBigInteger('hang_hoa_id');
            $table->integer('so_luong');
            $table->decimal('don_gia', 15, 2)->default(0)->comment('Giá vốn');
            $table->decimal('thanh_tien', 15, 2)->default(0);
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phieu_xuat_kho_chi_tiet');
    }
};
