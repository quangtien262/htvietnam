<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Orders
        Schema::create('whmcs_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('client_id')->constrained('whmcs_clients');

            $table->enum('status', [
                'pending',      // Chờ xử lý
                'active',       // Đã kích hoạt
                'fraud',        // Nghi ngờ gian lận
                'cancelled',    // Đã hủy
                'refunded'      // Đã hoàn tiền
            ])->default('pending');

            // Invoice Info
            $table->foreignId('invoice_id')->nullable()->constrained('whmcs_invoices');

            // Pricing
            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->string('currency_code')->default('VND');

            // Promo Code
            $table->string('promo_code')->nullable();
            $table->decimal('promo_discount', 15, 2)->default(0);

            // Payment Info
            $table->string('payment_method')->nullable();
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');

            // IP & Fraud Detection
            $table->string('ip_address')->nullable();
            $table->text('fraud_data')->nullable();

            // Notes
            $table->text('admin_notes')->nullable();
            $table->text('client_notes')->nullable();

            // Admin
            $table->foreignId('created_by')->nullable()->constrained('admin_users');

            $table->timestamps();
            $table->softDeletes();

            $table->index('order_number');
            $table->index('client_id');
            $table->index('status');
            $table->index('created_at');
        });

        // Order Items
        Schema::create('whmcs_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('whmcs_orders')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('whmcs_products');

            $table->string('product_name');
            $table->enum('product_type', ['hosting', 'vps', 'dedicated', 'domain', 'ssl', 'license', 'software', 'other']);

            // Billing Cycle
            $table->enum('billing_cycle', [
                'free',
                'onetime',
                'monthly',
                'quarterly',
                'semiannually',
                'annually',
                'biennially',
                'triennially'
            ])->default('monthly');

            // Domain (if type = domain)
            $table->string('domain')->nullable();
            $table->integer('registration_period')->nullable()->comment('Years for domain');

            // Pricing
            $table->decimal('setup_fee', 15, 2)->default(0);
            $table->decimal('recurring_amount', 15, 2)->default(0);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);

            // Dates
            $table->date('next_due_date')->nullable();
            $table->date('next_invoice_date')->nullable();

            // Custom Fields
            $table->json('custom_field_values')->nullable();

            // Status
            $table->enum('status', ['pending', 'active', 'suspended', 'terminated', 'cancelled'])->default('pending');

            // Link to service if activated (constraint sẽ thêm sau)
            $table->unsignedBigInteger('service_id')->nullable();

            $table->timestamps();

            $table->index('order_id');
            $table->index('status');
        });

        // Order Addons (Items in order that are addons)
        Schema::create('whmcs_order_item_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained('whmcs_order_items')->cascadeOnDelete();
            $table->foreignId('addon_id')->constrained('whmcs_product_addons');

            $table->string('addon_name');
            $table->enum('billing_cycle', ['monthly', 'quarterly', 'semiannually', 'annually']);

            $table->decimal('setup_fee', 15, 2)->default(0);
            $table->decimal('recurring_amount', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);

            $table->date('next_due_date')->nullable();
            $table->enum('status', ['pending', 'active', 'suspended', 'terminated'])->default('pending');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_order_item_addons');
        Schema::dropIfExists('whmcs_order_items');
        Schema::dropIfExists('whmcs_orders');
    }
};
