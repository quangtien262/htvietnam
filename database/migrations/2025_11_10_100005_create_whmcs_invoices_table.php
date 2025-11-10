<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whmcs_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->foreignId('client_id')->constrained('whmcs_clients')->cascadeOnDelete();
            $table->string('status')->default('unpaid'); // unpaid, paid, cancelled, refunded
            $table->string('currency', 3)->default('VND');
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_total', 15, 2)->default(0);
            $table->decimal('credit_applied', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->date('due_date')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('whmcs_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('whmcs_invoices')->cascadeOnDelete();
            $table->string('type'); // product, domain, addon, setup
            $table->foreignId('service_id')->nullable()->constrained('whmcs_services')->nullOnDelete();
            $table->text('description');
            $table->integer('qty')->default(1);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_invoice_items');
        Schema::dropIfExists('whmcs_invoices');
    }
};
