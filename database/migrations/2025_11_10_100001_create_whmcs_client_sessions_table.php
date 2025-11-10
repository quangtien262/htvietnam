<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whmcs_client_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('whmcs_clients')->cascadeOnDelete();
            $table->string('token', 64)->unique();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('last_activity')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['client_id', 'token']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_client_sessions');
    }
};
