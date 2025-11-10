<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whmcs_webhooks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('url');
            $table->string('secret')->nullable();
            $table->json('events'); // ['invoice.created', 'invoice.paid', 'service.activated', etc.]
            $table->boolean('is_active')->default(true);
            $table->string('content_type')->default('application/json'); // json, form
            $table->json('custom_headers')->nullable();
            $table->integer('retry_attempts')->default(3);
            $table->integer('timeout')->default(30); // seconds
            $table->boolean('verify_ssl')->default(true);
            $table->timestamp('last_triggered_at')->nullable();
            $table->integer('total_triggers')->default(0);
            $table->integer('failed_triggers')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_webhooks');
    }
};
