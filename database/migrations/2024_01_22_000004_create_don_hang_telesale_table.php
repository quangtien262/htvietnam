<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('don_hang_telesale', function (Blueprint $table) {
            $table->id();
            $table->string('ma_don_hang', 50)->unique()->comment('Mã đơn hàng: DHT00001');
            $table->unsignedBigInteger('cuoc_goi_id')->nullable();
            $table->unsignedBigInteger('data_khach_hang_id');
            $table->unsignedBigInteger('nhan_vien_telesale_id');
            $table->date('ngay_dat_hang');
            $table->date('ngay_giao_du_kien')->nullable();
            $table->string('dia_chi_giao_hang');
            $table->string('sdt_nguoi_nhan', 20);
            $table->string('ten_nguoi_nhan');
            $table->decimal('tong_tien', 15, 2)->default(0);
            $table->decimal('phi_ship', 15, 2)->default(0);
            $table->decimal('tong_thanh_toan', 15, 2)->default(0);
            $table->enum('hinh_thuc_thanh_toan', ['cod', 'chuyen_khoan', 'the'])->default('cod');
            $table->enum('trang_thai', ['moi', 'da_xac_nhan', 'dang_giao', 'thanh_cong', 'hoan', 'huy'])->default('moi');
            $table->string('ly_do_hoan_huy')->nullable();
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('don_hang_telesale');
    }
};
