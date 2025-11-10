<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whmcs_webhook_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('webhook_id')->constrained('whmcs_webhooks')->cascadeOnDelete();
            $table->string('event');
            $table->json('payload');
            $table->integer('http_status')->nullable();
            $table->text('response_body')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('attempt_number')->default(1);
            $table->boolean('success')->default(false);
            $table->float('duration_ms')->nullable(); // response time in milliseconds
            $table->timestamp('sent_at');
            $table->timestamps();
            
            $table->index(['webhook_id', 'event']);
            $table->index('sent_at');
            $table->index('success');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_webhook_logs');
    }
};
