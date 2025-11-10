<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_khach_hang_telesale', function (Blueprint $table) {
            $table->id();
            $table->string('ma_data', 50)->unique()->comment('Mã data: DT0001');
            $table->string('ten_khach_hang');
            $table->string('sdt', 20);
            $table->string('email')->nullable();
            $table->text('dia_chi')->nullable();
            $table->enum('nguon_data', ['mua_data', 'website', 'facebook', 'landing_page', 'gioi_thieu', 'other'])->default('other');
            $table->enum('phan_loai', ['nong', 'am', 'lanh'])->default('lanh');
            $table->unsignedBigInteger('nhan_vien_telesale_id')->nullable()->comment('Assigned to');
            $table->enum('trang_thai', ['moi', 'dang_goi', 'da_goi', 'thanh_cong', 'that_bai', 'trung'])->default('moi');
            $table->json('tags')->nullable()->comment('Gắn nhãn: ["quan_tam_san_pham_A", "gia_cao"]');
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_khach_hang_telesale');
    }
};
