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
        Schema::create('cong_no_payment_history', function (Blueprint $table) {
            $table->id();
            $table->integer('cong_no_id')->default(0);
            $table->integer('so_tien')->default(0)->comment('Số tiền thanh toán lần này');
            $table->text('ghi_chu')->nullable();
            $table->integer('nguoi_thanh_toan')->default(0)->comment('ID admin_users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cong_no_payment_history');
    }
};
