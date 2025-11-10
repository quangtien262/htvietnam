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
        Schema::create('doi_soat_ngan_hang', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tai_khoan_ngan_hang_id');
            $table->date('ngay_doi_soat'); // Ngày đối soát
            $table->decimal('so_du_dau_ky', 15, 2)->default(0); // Số dư đầu kỳ
            $table->decimal('so_du_cuoi_ky', 15, 2)->default(0); // Số dư cuối kỳ
            $table->decimal('so_du_sao_ke', 15, 2)->default(0); // Số dư theo sao kê ngân hàng
            $table->decimal('chenh_lech', 15, 2)->default(0); // Chênh lệch
            $table->text('ghi_chu')->nullable();
            $table->string('trang_thai')->default('dang_doi_soat'); // dang_doi_soat, hoan_thanh
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index('tai_khoan_ngan_hang_id');
            $table->index('ngay_doi_soat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doi_soat_ngan_hang');
    }
};
