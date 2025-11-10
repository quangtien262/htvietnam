<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('muc_tieu_kinh_doanh', function (Blueprint $table) {
            $table->id();
            $table->enum('loai_muc_tieu', ['doanh_thu', 'don_hang', 'khach_hang_moi', 'co_hoi', 'other'])->default('doanh_thu');
            $table->string('ten_muc_tieu');
            $table->decimal('gia_tri_muc_tieu', 15, 2)->default(0);
            $table->decimal('gia_tri_hien_tai', 15, 2)->default(0);
            $table->decimal('ty_le_hoan_thanh', 5, 2)->default(0)->comment('% hoàn thành');
            $table->enum('thoi_gian', ['thang', 'quy', 'nam'])->default('thang');
            $table->integer('thang')->nullable();
            $table->integer('quy')->nullable();
            $table->integer('nam');
            $table->unsignedBigInteger('nhan_vien_id')->nullable()->comment('Mục tiêu cá nhân');
            $table->unsignedBigInteger('phong_ban_id')->nullable()->comment('Mục tiêu phòng ban');
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('muc_tieu_kinh_doanh');
    }
};
