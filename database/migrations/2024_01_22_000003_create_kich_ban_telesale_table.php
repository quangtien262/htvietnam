<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kich_ban_telesale', function (Blueprint $table) {
            $table->id();
            $table->string('ten_kich_ban');
            $table->text('mo_ta')->nullable();
            $table->string('loai_san_pham')->nullable();
            $table->string('loai_khach_hang')->nullable();
            $table->text('noi_dung_kich_ban')->nullable()->comment('Nội dung kịch bản HTML/Text');
            $table->json('cau_hoi_mo_dau')->nullable()->comment('Câu hỏi mở đầu cuộc gọi');
            $table->json('xu_ly_tu_choi')->nullable()->comment('Xử lý từ chối, objection handling');
            $table->json('closing_techniques')->nullable()->comment('Kỹ thuật chốt sale');
            $table->enum('trang_thai', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kich_ban_telesale');
    }
};
