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
        // Drop foreign keys that might cause issues, keep only essential ones
        
        // Keep file -> folder FK (important)
        // Keep version -> file FK (important)
        // Keep comments -> file/folder FK (important)
        
        // Drop permission -> user FK (use soft checking instead)
        Schema::table('tai_lieu_phan_quyen', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['nguoi_chia_se_id']);
        });
        
        // Drop activity -> user FK (nullable anyway)
        Schema::table('tai_lieu_hoat_dong', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        
        // Drop quota -> user FK (use soft checking)
        Schema::table('tai_lieu_quota', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        
        // Drop share link -> user FK
        Schema::table('tai_lieu_chia_se_link', function (Blueprint $table) {
            $table->dropForeign(['nguoi_tao_id']);
        });
        
        // Drop comments -> user FK
        Schema::table('tai_lieu_binh_luan', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore foreign keys if needed
        
        Schema::table('tai_lieu_phan_quyen', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('admin_users')->onDelete('cascade');
            $table->foreign('nguoi_chia_se_id')->references('id')->on('admin_users')->onDelete('cascade');
        });
        
        Schema::table('tai_lieu_hoat_dong', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('admin_users')->onDelete('set null');
        });
        
        Schema::table('tai_lieu_quota', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('admin_users')->onDelete('cascade');
        });
        
        Schema::table('tai_lieu_chia_se_link', function (Blueprint $table) {
            $table->foreign('nguoi_tao_id')->references('id')->on('admin_users')->onDelete('cascade');
        });
        
        Schema::table('tai_lieu_binh_luan', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('admin_users')->onDelete('cascade');
        });
    }
};
