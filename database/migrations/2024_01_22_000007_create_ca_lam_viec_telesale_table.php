<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ca_lam_viec_telesale', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('nhan_vien_telesale_id');
            $table->enum('ca_lam_viec', ['sang', 'chieu', 'toi'])->default('sang');
            $table->date('ngay_lam_viec');
            $table->datetime('thoi_gian_check_in')->nullable();
            $table->datetime('thoi_gian_check_out')->nullable();
            $table->integer('tong_cuoc_goi')->default(0);
            $table->integer('tong_don_hang')->default(0);
            $table->decimal('doanh_thu_ca', 15, 2)->default(0);
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ca_lam_viec_telesale');
    }
};
