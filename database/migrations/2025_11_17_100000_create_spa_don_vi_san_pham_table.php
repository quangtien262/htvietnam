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
        Schema::create('spa_don_vi_san_pham', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->comment('Tên đơn vị');
            $table->string('color', 20)->nullable()->comment('Màu đánh dấu');
            $table->integer('sort_order')->default(0)->comment('Thứ tự sắp xếp');
            $table->text('note')->nullable()->comment('Ghi chú');
            $table->unsignedBigInteger('created_by')->nullable()->comment('Người tạo');
            $table->timestamps();

            // Indexes
            $table->index('sort_order');
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spa_don_vi_san_pham');
    }
};
