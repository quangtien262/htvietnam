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
        Schema::create('giao_dich_ngan_hang', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tai_khoan_ngan_hang_id'); // FK
            $table->date('ngay_giao_dich'); // Ngày giao dịch
            $table->string('loai_giao_dich'); // 'thu', 'chi', 'chuyen_khoan'
            $table->decimal('so_tien', 15, 2); // Số tiền
            $table->unsignedBigInteger('doi_tac_id')->nullable(); // FK - Khách hàng/NCC
            $table->string('doi_tac_type')->nullable(); // Polymorphic: KhachHang, NhaCungCap
            $table->unsignedBigInteger('loai_thu_id')->nullable(); // FK
            $table->unsignedBigInteger('loai_chi_id')->nullable(); // FK
            $table->string('ma_giao_dich')->nullable(); // Mã giao dịch từ ngân hàng
            $table->text('noi_dung'); // Nội dung chuyển khoản
            $table->text('ghi_chu')->nullable();
            $table->string('trang_thai')->default('hoan_thanh'); // hoan_thanh, cho_xac_nhan
            $table->boolean('is_doi_soat')->default(false); // Đã đối soát chưa
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index('tai_khoan_ngan_hang_id');
            $table->index('ngay_giao_dich');
            $table->index(['doi_tac_id', 'doi_tac_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('giao_dich_ngan_hang');
    }
};
