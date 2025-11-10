<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phieu_tra_hang', function (Blueprint $table) {
            $table->id();
            $table->string('ma_phieu_tra', 50)->unique()->comment('Mã phiếu: PTH001');
            $table->unsignedBigInteger('don_hang_id');
            $table->unsignedBigInteger('user_id')->comment('Khách hàng');
            $table->date('ngay_tra');
            $table->enum('ly_do_tra', ['loi', 'sai_hang', 'khong_vua_y', 'khac'])->default('khac');
            $table->text('mo_ta_ly_do')->nullable();
            $table->decimal('tong_tien_hoan', 15, 2)->default(0);
            $table->enum('hinh_thuc_xu_ly', ['hoan_tien', 'doi_hang'])->default('hoan_tien');
            $table->enum('trang_thai', ['pending', 'approved', 'rejected', 'completed'])->default('pending');
            $table->unsignedBigInteger('nguoi_duyet_id')->nullable();
            $table->timestamp('ngay_duyet')->nullable();
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phieu_tra_hang');
    }
};
