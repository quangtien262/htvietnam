<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ma_giam_gia', function (Blueprint $table) {
            $table->id();
            $table->string('ma_code', 50)->unique()->comment('Mã voucher: SALE2024');
            $table->string('ten_voucher');
            $table->enum('loai_giam', ['phan_tram', 'tien_mat'])->default('phan_tram');
            $table->decimal('gia_tri_giam', 15, 2)->default(0);
            $table->decimal('giam_toi_da', 15, 2)->nullable()->comment('Giảm tối đa (nếu là %)');
            $table->decimal('gia_tri_don_toi_thieu', 15, 2)->default(0);
            $table->date('ngay_bat_dau');
            $table->date('ngay_het_han');
            $table->integer('so_luong')->nullable()->comment('Số lượng voucher');
            $table->integer('da_su_dung')->default(0);
            $table->integer('gioi_han_moi_khach')->default(1)->comment('Mỗi khách dùng tối đa bao nhiêu lần');
            $table->enum('trang_thai', ['active', 'inactive', 'expired'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ma_giam_gia');
    }
};
