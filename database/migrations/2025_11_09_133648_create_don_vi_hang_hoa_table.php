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
        Schema::create('don_vi_hang_hoa', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('Tên đơn vị: Cái, Hộp, Kg...');
            $table->integer('sort_order')->default(0)->comment('Thứ tự sắp xếp');
            $table->string('color')->default(0)->comment('Mã màu');
            $table->string('icon')->default(0)->comment('');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('don_vi_hang_hoa');
    }
};
