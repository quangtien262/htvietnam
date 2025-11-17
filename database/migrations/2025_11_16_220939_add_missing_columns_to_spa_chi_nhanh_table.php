<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('spa_chi_nhanh', function (Blueprint $table) {
            // Add deleted_at for soft deletes
            $table->softDeletes()->after('updated_at');

            // Add trang_thai column (map from is_active)
            $table->enum('trang_thai', ['active', 'inactive'])->default('active')->after('is_active');

            // Add index
            $table->index('trang_thai');
        });

        // Migrate data from is_active to trang_thai
        DB::statement("UPDATE spa_chi_nhanh SET trang_thai = IF(is_active = 1, 'active', 'inactive')");
    }

    public function down(): void
    {
        Schema::table('spa_chi_nhanh', function (Blueprint $table) {
            $table->dropColumn(['deleted_at', 'trang_thai']);
            $table->dropIndex(['trang_thai']);
        });
    }
};
