<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spa_hoa_don', function (Blueprint $table) {
            $table->id();
            $table->string('ma_hoa_don', 20)->unique();
            $table->unsignedBigInteger('khach_hang_id')->nullable();
            $table->unsignedBigInteger('chi_nhanh_id')->nullable();
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->dateTime('ngay_ban');
            $table->unsignedBigInteger('nhan_vien_ban_id')->nullable();
            $table->decimal('tong_tien_dich_vu', 15, 2)->default(0);
            $table->decimal('tong_tien_san_pham', 15, 2)->default(0);
            $table->decimal('tong_tien', 15, 2)->default(0)->comment('tong_tien_dich_vu + tong_tien_san_pham');
            $table->decimal('giam_gia', 15, 2)->default(0);
            $table->decimal('phi_ca_the', 15, 2)->default(0);
            $table->string('ma_voucher', 50)->nullable();
            $table->integer('diem_su_dung')->default(0);
            $table->decimal('tien_giam_tu_diem', 15, 2)->default(0)->comment('Money discount from loyalty points');
            $table->decimal('tien_tip', 15, 2)->default(0);
            $table->string('phuong_thuc_tip', 50)->nullable()->comment('tien_mat, chuyen_khoan');
            $table->decimal('thue_vat', 15, 2)->default(0);
            $table->decimal('tong_thanh_toan', 15, 2)->default(0);
            $table->string('phuong_thuc_thanh_toan', 50)->nullable()->comment('tien_mat, chuyen_khoan, the, vi');
            $table->integer('diem_tich_luy')->default(0);
            $table->string('nguoi_ban', 100)->nullable();
            $table->enum('trang_thai', ['cho_thanh_toan', 'da_thanh_toan', 'con_cong_no', 'da_huy'])->default('cho_thanh_toan');
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('ngay_ban');
            $table->index('khach_hang_id');
            $table->index('chi_nhanh_id');
        });

        Schema::create('spa_hoa_don_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hoa_don_id');
            $table->enum('loai', ['dich_vu', 'san_pham'])->default('dich_vu');
            $table->unsignedBigInteger('dich_vu_id')->nullable();
            $table->unsignedBigInteger('san_pham_id')->nullable();
            $table->integer('so_luong')->default(1);
            $table->decimal('don_gia', 15, 2)->default(0);
            $table->decimal('thanh_tien', 15, 2)->default(0);
            $table->decimal('chiet_khau_don_hang', 15, 2)->default(0)->comment('Chiết khấu sản phẩm');
            $table->unsignedBigInteger('ktv_id')->nullable()->comment('For service only');
            $table->decimal('giam_gia_dong', 15, 2)->default(0);
            $table->string('chiet_khau_don_hang_type')->nullable(false)->comment('percent, cash');

            $table->text('ghi_chu')->nullable();
            $table->timestamps();

            $table->index('hoa_don_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spa_hoa_don_chi_tiet');
        Schema::dropIfExists('spa_hoa_don');
    }
};
