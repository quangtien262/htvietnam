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
        Schema::table('spa_goi_dich_vu', function (Blueprint $table) {
            if (!Schema::hasColumn('spa_goi_dich_vu', 'ten_goi')) {
                $table->string('ten_goi')->after('ma_goi')->nullable();
            }
            if (!Schema::hasColumn('spa_goi_dich_vu', 'han_su_dung')) {
                $table->integer('han_su_dung')->after('so_luong')->default(0)->comment('Hạn sử dụng (số ngày từ ngày mua)');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spa_goi_dich_vu', function (Blueprint $table) {
            if (Schema::hasColumn('spa_goi_dich_vu', 'ten_goi')) {
                $table->dropColumn('ten_goi');
            }
            if (Schema::hasColumn('spa_goi_dich_vu', 'han_su_dung')) {
                $table->dropColumn('han_su_dung');
            }
        });
    }
};
