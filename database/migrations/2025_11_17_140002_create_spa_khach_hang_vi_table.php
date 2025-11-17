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
        Schema::create('spa_khach_hang_vi', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('khach_hang_id')->unique()->comment('ID khách hàng');
            $table->decimal('so_du', 15, 2)->default(0)->comment('Số dư hiện tại trong ví');
            $table->decimal('tong_nap', 15, 2)->default(0)->comment('Tổng tiền đã nạp');
            $table->decimal('tong_tieu', 15, 2)->default(0)->comment('Tổng tiền đã tiêu');
            $table->decimal('tong_hoan', 15, 2)->default(0)->comment('Tổng tiền đã hoàn lại');

            // Limit giao dịch
            $table->decimal('han_muc_nap_ngay', 15, 2)->nullable()->comment('Hạn mức nạp tối đa mỗi ngày (null = không giới hạn)');
            $table->decimal('han_muc_rut_ngay', 15, 2)->nullable()->comment('Hạn mức rút tối đa mỗi ngày (null = không giới hạn)');
            $table->decimal('da_nap_hom_nay', 15, 2)->default(0)->comment('Đã nạp trong ngày');
            $table->decimal('da_rut_hom_nay', 15, 2)->default(0)->comment('Đã rút trong ngày');
            $table->date('ngay_reset_han_muc')->nullable()->comment('Ngày reset hạn mức (auto reset daily)');

            $table->timestamps();

            // Foreign key
            $table->foreign('khach_hang_id')->references('id')->on('spa_khach_hang')->onDelete('cascade');

            // Indexes
            $table->index('so_du');
            $table->index('ngay_reset_han_muc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spa_khach_hang_vi');
    }
};
