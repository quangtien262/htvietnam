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
        Schema::table('spa_san_pham', function (Blueprint $table) {
            $table->date('ngay_het_han')->nullable()->after('han_su_dung')->comment('Expiry date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spa_san_pham', function (Blueprint $table) {
            $table->dropColumn('ngay_het_han');
        });
    }
};
