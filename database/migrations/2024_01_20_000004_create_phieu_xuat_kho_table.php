<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phieu_xuat_kho', function (Blueprint $table) {
            $table->id();
            $table->string('ma_phieu_xuat', 50)->unique()->comment('Mã phiếu: PX001');
            $table->unsignedBigInteger('don_hang_id')->nullable();
            $table->date('ngay_xuat');
            $table->unsignedBigInteger('nguoi_xuat_id')->comment('Nhân viên xuất kho');
            $table->string('ly_do_xuat')->nullable();
            $table->decimal('tong_gia_tri', 15, 2)->default(0);
            $table->enum('trang_thai', ['draft', 'confirmed'])->default('draft');
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phieu_xuat_kho');
    }
};
