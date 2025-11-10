<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kpi_telesale', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('nhan_vien_telesale_id');
            $table->integer('thang');
            $table->integer('nam');
            $table->integer('muc_tieu_cuoc_goi')->default(0);
            $table->integer('thuc_te_cuoc_goi')->default(0);
            $table->integer('muc_tieu_don_hang')->default(0);
            $table->integer('thuc_te_don_hang')->default(0);
            $table->decimal('muc_tieu_doanh_thu', 15, 2)->default(0);
            $table->decimal('thuc_te_doanh_thu', 15, 2)->default(0);
            $table->decimal('ty_le_nghe_may', 5, 2)->default(0)->comment('% nghe máy');
            $table->decimal('ty_le_chot_don', 5, 2)->default(0)->comment('% chốt đơn');
            $table->integer('thoi_gian_goi_trung_binh')->default(0)->comment('Giây');
            $table->timestamps();
            
            $table->unique(['nhan_vien_telesale_id', 'thang', 'nam']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kpi_telesale');
    }
};
