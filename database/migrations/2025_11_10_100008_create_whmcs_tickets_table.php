<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whmcs_tickets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreignId('service_id')->nullable()->constrained('whmcs_services')->nullOnDelete();
            $table->string('ticket_number', 20)->unique();
            $table->string('subject');
            $table->enum('department', ['support', 'billing', 'technical', 'sales'])->default('support');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['open', 'awaiting_reply', 'in_progress', 'answered', 'closed'])->default('open');
            $table->foreignId('assigned_to')->nullable()->constrained('admin_users')->nullOnDelete();
            $table->timestamp('last_reply_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index('ticket_number');
            $table->index(['department', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_tickets');
    }
};
