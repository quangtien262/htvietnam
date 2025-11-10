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
        Schema::create('hoa_don', function (Blueprint $table) {
            $table->id();
            $table->string('ma_hoa_don')->unique(); // HD001, HD002...
            $table->date('ngay_hoa_don'); // Ngày lập hóa đơn
            $table->date('ngay_het_han')->nullable(); // Hạn thanh toán

            // Khách hàng
            $table->unsignedBigInteger('khach_hang_id')->nullable(); // FK
            $table->string('ten_khach_hang'); // Tên khách hàng
            $table->string('dia_chi')->nullable();
            $table->string('so_dien_thoai')->nullable();
            $table->string('ma_so_thue')->nullable();

            // Tài chính
            $table->decimal('tong_tien_hang', 15, 2)->default(0); // Tổng tiền hàng
            $table->decimal('tien_giam_gia', 15, 2)->default(0); // Giảm giá
            $table->decimal('tien_thue', 15, 2)->default(0); // Thuế VAT
            $table->decimal('tong_tien', 15, 2)->default(0); // Tổng cộng
            $table->decimal('da_thanh_toan', 15, 2)->default(0); // Đã thanh toán
            $table->decimal('con_lai', 15, 2)->default(0); // Còn lại

            // Trạng thái
            $table->string('trang_thai')->default('chua_thanh_toan'); // chua_thanh_toan, da_thanh_toan, qua_han
            $table->text('ghi_chu')->nullable();

            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index('ma_hoa_don');
            $table->index('khach_hang_id');
            $table->index('ngay_hoa_don');
            $table->index('trang_thai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hoa_don');
    }
};
