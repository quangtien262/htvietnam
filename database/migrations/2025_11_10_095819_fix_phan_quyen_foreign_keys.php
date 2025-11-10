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
        Schema::table('tai_lieu_phan_quyen', function (Blueprint $table) {
            // Drop old foreign keys
            $table->dropForeign(['user_id']);
            $table->dropForeign(['nguoi_chia_se_id']);
            
            // Add new foreign keys to admin_users
            $table->foreign('user_id')->references('id')->on('admin_users')->onDelete('cascade');
            $table->foreign('nguoi_chia_se_id')->references('id')->on('admin_users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tai_lieu_phan_quyen', function (Blueprint $table) {
            // Drop admin_users foreign keys
            $table->dropForeign(['user_id']);
            $table->dropForeign(['nguoi_chia_se_id']);
            
            // Restore users foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('nguoi_chia_se_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
