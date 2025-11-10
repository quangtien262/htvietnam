<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whmcs_api_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('api_key_id')->constrained('whmcs_api_keys')->cascadeOnDelete();
            $table->string('endpoint');
            $table->string('method', 10); // GET, POST, PUT, DELETE
            $table->text('request_data')->nullable(); // JSON request payload
            $table->text('response_data')->nullable(); // JSON response
            $table->integer('response_code'); // HTTP status code
            $table->ipAddress('ip_address');
            $table->string('user_agent')->nullable();
            $table->float('execution_time')->nullable(); // Milliseconds
            $table->timestamps();

            $table->index(['api_key_id', 'created_at']);
            $table->index('endpoint');
            $table->index('response_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_api_logs');
    }
};
