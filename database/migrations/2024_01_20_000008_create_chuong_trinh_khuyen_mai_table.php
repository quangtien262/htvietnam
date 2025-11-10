<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chuong_trinh_khuyen_mai', function (Blueprint $table) {
            $table->id();
            $table->string('ma_chuong_trinh', 50)->unique();
            $table->string('ten_chuong_trinh');
            $table->text('mo_ta')->nullable();
            $table->enum('loai_khuyen_mai', ['giam_gia_phan_tram', 'giam_gia_tien', 'mua_x_tang_y', 'combo'])->default('giam_gia_phan_tram');
            $table->decimal('gia_tri_giam', 15, 2)->default(0)->comment('% hoặc số tiền');
            $table->decimal('gia_tri_don_hang_toi_thieu', 15, 2)->default(0)->comment('Điều kiện áp dụng');
            $table->date('ngay_bat_dau');
            $table->date('ngay_ket_thuc');
            $table->json('san_pham_ap_dung')->nullable()->comment('Danh sách ID sản phẩm');
            $table->json('nhom_khach_hang_ap_dung')->nullable()->comment('vip, thuong, moi...');
            $table->integer('gioi_han_su_dung')->nullable()->comment('Số lần sử dụng tối đa');
            $table->integer('da_su_dung')->default(0);
            $table->enum('trang_thai', ['active', 'inactive', 'expired'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chuong_trinh_khuyen_mai');
    }
};
