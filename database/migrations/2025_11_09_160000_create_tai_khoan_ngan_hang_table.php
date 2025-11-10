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
        Schema::create('tai_khoan_ngan_hang', function (Blueprint $table) {
            $table->id();
            $table->string('ten_ngan_hang'); // VCB, TCB, ACB...
            $table->string('chi_nhanh')->nullable(); // Chi nhánh
            $table->string('so_tai_khoan'); // Số tài khoản
            $table->string('chu_tai_khoan'); // Chủ tài khoản
            $table->decimal('so_du_hien_tai', 15, 2)->default(0); // Số dư hiện tại
            $table->string('loai_tien', 10)->default('VND'); // VND, USD...
            $table->text('ghi_chu')->nullable();
            $table->boolean('is_active')->default(true); // Đang sử dụng
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tai_khoan_ngan_hang');
    }
};
