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
        Schema::table('so_quy', function (Blueprint $table) {
            $table->integer('nguoi_nhan_id')->nullable()->after('nhan_vien_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('so_quy', function (Blueprint $table) {
            $table->dropColumn('nguoi_nhan_id');
        });
    }
};
