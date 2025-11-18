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
        Schema::table('spa_hoa_don_chi_tiet', function (Blueprint $table) {
            $table->unsignedBigInteger('su_dung_goi')->nullable()->after('ghi_chu')->comment('ID gói dịch vụ nếu sử dụng từ gói');
            $table->index('su_dung_goi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spa_hoa_don_chi_tiet', function (Blueprint $table) {
            $table->dropColumn('su_dung_goi');
        });
    }
};
