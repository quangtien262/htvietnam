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
        Schema::table('spa_thuong_hieu', function (Blueprint $table) {
            $table->string('color', 20)->nullable()->after('ten_thuong_hieu')->comment('Brand color for UI');
            $table->integer('sort_order')->default(0)->after('color')->comment('Display order');
            $table->text('note')->nullable()->after('mo_ta')->comment('Internal note');
            $table->unsignedBigInteger('created_by')->nullable()->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spa_thuong_hieu', function (Blueprint $table) {
            $table->dropColumn(['color', 'sort_order', 'note', 'created_by']);
        });
    }
};
