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
        Schema::table('whmcs_services', function (Blueprint $table) {
            // Drop old foreign key constraint
            $table->dropForeign(['client_id']);
            
            // Add new foreign key pointing to users table
            $table->foreign('client_id')
                  ->references('id')
                  ->on('users')
                  ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whmcs_services', function (Blueprint $table) {
            // Drop foreign key to users
            $table->dropForeign(['client_id']);
            
            // Restore original foreign key to whmcs_clients
            $table->foreign('client_id')
                  ->references('id')
                  ->on('whmcs_clients')
                  ->cascadeOnDelete();
        });
    }
};
