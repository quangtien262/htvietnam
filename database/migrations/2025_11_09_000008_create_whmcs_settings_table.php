<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Payment Gateways
        Schema::create('whmcs_payment_gateways', function (Blueprint $table) {
            $table->id();
            $table->string('gateway_name')->unique(); // VNPay, MoMo, PayPal, Stripe, Bank Transfer, etc
            $table->string('display_name');
            $table->text('description')->nullable();

            // Configuration
            $table->json('config')->nullable()->comment('API keys, merchant IDs, etc');

            // Settings
            $table->boolean('is_active')->default(true);
            $table->boolean('visible_to_clients')->default(true);
            $table->decimal('fee_percentage', 5, 2)->default(0)->comment('% phí');
            $table->decimal('fee_fixed', 15, 2)->default(0)->comment('Phí cố định');

            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });

        // Transactions
        Schema::create('whmcs_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('whmcs_clients');
            $table->foreignId('invoice_id')->nullable()->constrained('whmcs_invoices');

            $table->string('transaction_id')->unique();
            $table->string('gateway_name');

            $table->decimal('amount', 15, 2);
            $table->string('currency_code')->default('VND');

            $table->enum('type', [
                'payment',      // Thanh toán
                'refund',       // Hoàn tiền
                'credit',       // Nạp credit
                'withdraw'      // Rút tiền
            ])->default('payment');

            $table->enum('status', [
                'pending',      // Chờ xử lý
                'success',      // Thành công
                'failed',       // Thất bại
                'cancelled',    // Đã hủy
                'refunded'      // Đã hoàn
            ])->default('pending');

            // Gateway response
            $table->text('gateway_response')->nullable();
            $table->string('gateway_transaction_id')->nullable();

            $table->decimal('fees', 15, 2)->default(0);

            $table->datetime('transaction_date');

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index('client_id');
            $table->index('invoice_id');
            $table->index('transaction_id');
            $table->index('status');
        });

        // Currencies
        Schema::create('whmcs_currencies', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->comment('VND, USD, EUR');
            $table->string('prefix')->nullable()->comment('$, €');
            $table->string('suffix')->nullable()->comment('đ, VND');
            $table->string('format')->default('1'); // 1 = 1234.56, 2 = 1,234.56, etc

            $table->decimal('rate', 15, 6)->default(1)->comment('Exchange rate to base currency');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });

        // Promo Codes
        Schema::create('whmcs_promo_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();

            $table->enum('type', [
                'percentage',   // Giảm %
                'fixed',        // Giảm cố định
                'override',     // Override giá
                'free_setup'    // Miễn phí setup
            ])->default('percentage');

            $table->decimal('value', 15, 2);

            // Applicable to
            $table->boolean('recurring')->default(false)->comment('Áp dụng cho các kỳ thanh toán sau');
            $table->json('applicable_product_ids')->nullable();
            $table->json('applicable_billing_cycles')->nullable();

            // Limits
            $table->integer('max_uses')->nullable();
            $table->integer('current_uses')->default(0);
            $table->date('start_date')->nullable();
            $table->date('expiry_date')->nullable();

            // Requirements
            $table->decimal('minimum_order_amount', 15, 2)->nullable();
            $table->boolean('new_clients_only')->default(false);
            $table->boolean('existing_clients_only')->default(false);

            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index('code');
            $table->index('is_active');
        });

        // Tax Rules
        Schema::create('whmcs_tax_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('country')->nullable();
            $table->string('state')->nullable();

            $table->decimal('rate', 5, 2); // % thuế
            $table->boolean('compound')->default(false)->comment('Thuế kép');

            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });

        // Email Templates
        Schema::create('whmcs_email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('subject');
            $table->text('body');

            $table->enum('type', [
                'client',       // Gửi khách
                'admin',        // Gửi admin
                'general'       // Tổng quát
            ])->default('client');

            $table->json('attachments')->nullable();
            $table->text('variables_help')->nullable()->comment('Các biến có thể dùng');

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });

        // Email Logs
        Schema::create('whmcs_email_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->nullable()->constrained('whmcs_clients');

            $table->string('to_email');
            $table->string('to_name')->nullable();
            $table->string('subject');
            $table->text('body');

            $table->foreignId('template_id')->nullable()->constrained('whmcs_email_templates');

            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->text('error_message')->nullable();

            $table->datetime('sent_at')->nullable();

            $table->timestamps();

            $table->index('client_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_email_logs');
        Schema::dropIfExists('whmcs_email_templates');
        Schema::dropIfExists('whmcs_tax_rules');
        Schema::dropIfExists('whmcs_promo_codes');
        Schema::dropIfExists('whmcs_currencies');
        Schema::dropIfExists('whmcs_transactions');
        Schema::dropIfExists('whmcs_payment_gateways');
    }
};
