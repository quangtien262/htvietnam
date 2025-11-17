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
            $table->unsignedBigInteger('nguoi_thu_id')->nullable()->after('nhan_vien_ban_id');
            $table->foreign('nguoi_thu_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spa_hoa_don', function (Blueprint $table) {
            $table->dropForeign(['nguoi_thu_id']);
            $table->dropColumn('nguoi_thu_id');
        });
    }
};
