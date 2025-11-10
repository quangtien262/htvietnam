<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phieu_tra_hang_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('phieu_tra_hang_id');
            $table->unsignedBigInteger('don_hang_chi_tiet_id');
            $table->unsignedBigInteger('hang_hoa_id');
            $table->integer('so_luong_tra');
            $table->decimal('don_gia', 15, 2)->default(0);
            $table->decimal('thanh_tien', 15, 2)->default(0);
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phieu_tra_hang_chi_tiet');
    }
};
