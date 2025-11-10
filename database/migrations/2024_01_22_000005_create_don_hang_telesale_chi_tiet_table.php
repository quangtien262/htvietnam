<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('don_hang_telesale_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('don_hang_telesale_id');
            $table->unsignedBigInteger('san_pham_id')->nullable();
            $table->string('ten_san_pham');
            $table->integer('so_luong')->default(1);
            $table->decimal('don_gia', 15, 2)->default(0);
            $table->decimal('thanh_tien', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('don_hang_telesale_chi_tiet');
    }
};
