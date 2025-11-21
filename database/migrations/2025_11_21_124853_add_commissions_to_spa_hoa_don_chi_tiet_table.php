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
            $table->json('sale_commissions')->nullable()->after('ghi_chu')->comment('Danh sách nhân viên tư vấn và chiết khấu');
            $table->json('service_commissions')->nullable()->after('sale_commissions')->comment('Danh sách nhân viên làm dịch vụ và chiết khấu');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spa_hoa_don_chi_tiet', function (Blueprint $table) {
            $table->dropColumn(['sale_commissions', 'service_commissions']);
        });
    }
};
