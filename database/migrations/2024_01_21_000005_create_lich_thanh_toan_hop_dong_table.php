<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lich_thanh_toan_hop_dong', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hop_dong_id');
            $table->integer('dot_thanh_toan')->comment('Đợt 1, 2, 3...');
            $table->date('ngay_thanh_toan_du_kien');
            $table->decimal('so_tien', 15, 2)->default(0);
            $table->enum('trang_thai', ['pending', 'paid', 'overdue'])->default('pending');
            $table->date('ngay_thanh_toan_thuc_te')->nullable();
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lich_thanh_toan_hop_dong');
    }
};
