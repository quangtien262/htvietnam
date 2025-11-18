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
        Schema::create('spa_settings', function (Blueprint $table) {
            $table->id();
            $table->json('general')->nullable()->comment('Cài đặt chung (tên, địa chỉ, logo, v.v.)');
            $table->json('business')->nullable()->comment('Cài đặt kinh doanh (giờ mở cửa, v.v.)');
            $table->json('payment')->nullable()->comment('Cài đặt thanh toán');
            $table->json('notification')->nullable()->comment('Cài đặt thông báo');
            $table->json('loyalty')->nullable()->comment('Cài đặt tích điểm, khách hàng thân thiết');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spa_settings');
    }
};
