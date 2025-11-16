<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('spa_lich_trinh_su_dung', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên lịch trình (Theo ngày, Theo tháng, etc.)
            $table->string('color')->nullable(); // Màu đánh dấu
            $table->integer('sort_order')->default(0); // Thứ tự sắp xếp
            $table->text('note')->nullable(); // Ghi chú
            $table->unsignedBigInteger('created_by')->nullable(); // Người tạo
            $table->timestamps();

            $table->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spa_lich_trinh_su_dung');
    }
};
