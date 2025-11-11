<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whmcs_client_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('admin_user_id')->constrained('admin_users')->cascadeOnDelete();
            $table->text('note');
            $table->boolean('is_sticky')->default(false); // Pin to top
            $table->timestamps();

            $table->index(['client_id', 'is_sticky']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_client_notes');
    }
};
