<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hoat_dong_kinh_doanh', function (Blueprint $table) {
            $table->id();
            $table->enum('loai_hoat_dong', ['call', 'email', 'meeting', 'note', 'task'])->default('note');
            $table->unsignedBigInteger('user_id')->nullable()->comment('Khách hàng');
            $table->unsignedBigInteger('co_hoi_kinh_doanh_id')->nullable();
            $table->unsignedBigInteger('nhan_vien_id')->comment('Người thực hiện');
            $table->text('noi_dung');
            $table->text('ket_qua')->nullable();
            $table->text('next_action')->nullable();
            $table->datetime('thoi_gian_thuc_hien')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hoat_dong_kinh_doanh');
    }
};
