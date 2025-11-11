<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whmcs_services', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('client_id')->nullable();
            $table->foreign('client_id')->references('id')->on('users')->nullOnDelete();
            $table->foreignId('product_id')->constrained('whmcs_products')->restrictOnDelete();
            $table->foreignId('server_id')->nullable()->constrained('whmcs_servers')->nullOnDelete();
            $table->string('domain')->nullable();
            $table->string('username')->nullable();
            $table->text('password')->nullable(); // encrypted
            $table->string('status')->default('pending'); // pending, active, suspended, terminated, cancelled
            $table->string('payment_cycle'); // monthly, annually, etc.
            $table->decimal('recurring_amount', 15, 2)->default(0);
            $table->date('registration_date')->nullable();
            $table->date('next_due_date')->nullable();
            $table->date('termination_date')->nullable();
            $table->json('config_options')->nullable(); // Chosen configurable options
            $table->json('disk_usage')->nullable(); // {used: 500, quota: 5120}
            $table->json('bandwidth_usage')->nullable(); // {used: 2000, quota: 10000}
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_services');
    }
};
