<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Invoices
        Schema::create('whmcs_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('client_id')->constrained('whmcs_clients');

            $table->date('invoice_date');
            $table->date('due_date');
            $table->date('paid_date')->nullable();

            // Status
            $table->enum('status', [
                'draft',        // Nháp
                'unpaid',       // Chưa thanh toán
                'paid',         // Đã thanh toán
                'cancelled',    // Đã hủy
                'refunded',     // Đã hoàn tiền
                'collections',  // Đang thu nợ
                'payment_pending' // Chờ xác nhận thanh toán
            ])->default('unpaid');

            // Amounts
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('tax2', 15, 2)->default(0)->comment('VAT thứ 2 nếu có');
            $table->decimal('credit', 15, 2)->default(0)->comment('Dùng credit của khách');
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->decimal('balance', 15, 2)->default(0)->comment('Số tiền còn nợ');

            $table->string('currency_code')->default('VND');

            // Tax Rates
            $table->string('tax_rate')->nullable()->comment('% thuế');
            $table->string('tax_rate2')->nullable();

            // Payment
            $table->string('payment_method')->nullable();

            // Notes
            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();

            // Email
            $table->datetime('last_reminder_sent')->nullable();
            $table->integer('reminder_count')->default(0);

            // Admin
            $table->foreignId('created_by')->nullable()->constrained('admin_users');

            $table->timestamps();
            $table->softDeletes();

            $table->index('invoice_number');
            $table->index('client_id');
            $table->index('status');
            $table->index('due_date');
            $table->index('invoice_date');
        });

        // Invoice Items
        Schema::create('whmcs_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('whmcs_invoices')->cascadeOnDelete();

            $table->enum('type', [
                'service',      // Dịch vụ
                'addon',        // Addon
                'domain',       // Domain
                'setup',        // Phí setup
                'product',      // Sản phẩm
                'other'         // Khác
            ]);

            // Related IDs (constraints sẽ thêm sau khi services và domains được tạo)
            $table->unsignedBigInteger('service_id')->nullable();
            $table->unsignedBigInteger('domain_id')->nullable();

            $table->string('description');
            $table->decimal('amount', 15, 2);
            $table->boolean('taxed')->default(true);

            $table->timestamps();

            $table->index('invoice_id');
        });

        // Invoice Payments
        Schema::create('whmcs_invoice_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('whmcs_invoices');
            $table->foreignId('client_id')->constrained('whmcs_clients');

            $table->decimal('amount', 15, 2);
            $table->string('currency_code')->default('VND');

            $table->string('payment_method');
            $table->string('transaction_id')->nullable();

            $table->datetime('payment_date');

            // Gateway Response
            $table->text('gateway_response')->nullable();
            $table->decimal('fees', 15, 2)->default(0)->comment('Phí giao dịch');

            $table->text('notes')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('admin_users');

            $table->timestamps();

            $table->index('invoice_id');
            $table->index('client_id');
            $table->index('transaction_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_invoice_payments');
        Schema::dropIfExists('whmcs_invoice_items');
        Schema::dropIfExists('whmcs_invoices');
    }
};
