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
            $table->string('ten_goi')->after('ma_goi')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spa_goi_dich_vu', function (Blueprint $table) {
            $table->dropColumn('ten_goi');
        });
    }
};
