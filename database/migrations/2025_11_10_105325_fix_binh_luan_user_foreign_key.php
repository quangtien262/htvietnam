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
        Schema::table('tai_lieu_binh_luan', function (Blueprint $table) {
            // Drop old foreign key
            $table->dropForeign(['user_id']);
            
            // Add new foreign key to admin_users
            $table->foreign('user_id')->references('id')->on('admin_users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tai_lieu_binh_luan', function (Blueprint $table) {
            // Drop new foreign key
            $table->dropForeign(['user_id']);
            
            // Restore old foreign key to users
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
