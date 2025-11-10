<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whmcs_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->nullable()->constrained('whmcs_invoices')->nullOnDelete();
            $table->foreignId('client_id')->constrained('whmcs_clients')->cascadeOnDelete();
            $table->string('gateway'); // vnpay, stripe, bank_transfer
            $table->string('transaction_id')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('VND');
            $table->string('status')->default('pending'); // pending, success, failed, refunded
            $table->json('gateway_response')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_transactions');
    }
};
