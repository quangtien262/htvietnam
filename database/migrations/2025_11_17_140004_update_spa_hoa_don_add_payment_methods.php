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
        Schema::table('spa_hoa_don', function (Blueprint $table) {
            // Thêm các cột thanh toán chi tiết
            $table->decimal('thanh_toan_vi', 15, 2)->default(0)->after('tong_thanh_toan')->comment('Thanh toán bằng ví');
            $table->decimal('thanh_toan_tien_mat', 15, 2)->default(0)->after('thanh_toan_vi')->comment('Thanh toán bằng tiền mặt');
            $table->decimal('thanh_toan_chuyen_khoan', 15, 2)->default(0)->after('thanh_toan_tien_mat')->comment('Thanh toán bằng chuyển khoản');
            $table->decimal('thanh_toan_the', 15, 2)->default(0)->after('thanh_toan_chuyen_khoan')->comment('Thanh toán bằng thẻ');

            // Index
            $table->index('thanh_toan_vi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spa_hoa_don', function (Blueprint $table) {
            $table->dropColumn(['thanh_toan_vi', 'thanh_toan_tien_mat', 'thanh_toan_chuyen_khoan', 'thanh_toan_the']);
        });
    }
};
