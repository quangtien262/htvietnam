<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phieu_thu_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('phieu_thu_id');
            $table->unsignedBigInteger('don_hang_id');
            $table->decimal('so_tien', 15, 2)->default(0);
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phieu_thu_chi_tiet');
    }
};
