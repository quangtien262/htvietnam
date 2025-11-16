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
        Schema::create('spa_ky_nang', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->comment('Tên kỹ năng');
            $table->string('color', 20)->nullable()->comment('Màu đánh dấu');
            $table->integer('sort_order')->default(0)->comment('Thứ tự sắp xếp');
            $table->text('note')->nullable()->comment('Ghi chú');
            $table->unsignedBigInteger('created_by')->nullable()->comment('Người tạo');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spa_ky_nang');
    }
};
