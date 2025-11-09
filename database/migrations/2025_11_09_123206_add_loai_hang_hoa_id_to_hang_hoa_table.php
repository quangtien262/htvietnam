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
        Schema::table('hang_hoa', function (Blueprint $table) {
            $table->unsignedBigInteger('loai_hang_hoa_id')->nullable()->after('id');
            $table->foreign('loai_hang_hoa_id')->references('id')->on('loai_hang_hoa')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hang_hoa', function (Blueprint $table) {
            $table->dropForeign(['loai_hang_hoa_id']);
            $table->dropColumn('loai_hang_hoa_id');
        });
    }
};
