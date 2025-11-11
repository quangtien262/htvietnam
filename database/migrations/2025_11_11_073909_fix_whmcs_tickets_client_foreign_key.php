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
        Schema::table('whmcs_tickets', function (Blueprint $table) {
            // Drop old FK to whmcs_clients
            $table->dropForeign(['client_id']);
            
            // Add new FK to users
            $table->foreign('client_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whmcs_tickets', function (Blueprint $table) {
            // Drop FK to users
            $table->dropForeign(['client_id']);
            
            // Restore FK to whmcs_clients
            $table->foreign('client_id')
                  ->references('id')
                  ->on('whmcs_clients')
                  ->onDelete('cascade');
        });
    }
};
