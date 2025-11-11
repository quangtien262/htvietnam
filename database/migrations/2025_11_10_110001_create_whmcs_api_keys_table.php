<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whmcs_api_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('admin_user_id')->nullable()->constrained('admin_users')->nullOnDelete();
            $table->string('name'); // Friendly name for the key
            $table->string('key', 64)->unique(); // API key
            $table->string('secret', 64); // API secret (hashed)
            $table->text('permissions')->nullable(); // JSON array of allowed permissions
            $table->ipAddress('allowed_ips')->nullable(); // Comma-separated IPs
            $table->enum('status', ['active', 'inactive', 'revoked'])->default('active');
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['key', 'status']);
            $table->index('user_id');
            $table->index('admin_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_api_keys');
    }
};
