<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Domain TLDs
        Schema::create('whmcs_domain_tlds', function (Blueprint $table) {
            $table->id();
            $table->string('tld')->unique()->comment('.com, .vn, .net, etc');

            // Pricing per year
            $table->decimal('price_register', 15, 2);
            $table->decimal('price_transfer', 15, 2);
            $table->decimal('price_renew', 15, 2);

            $table->string('currency_code')->default('VND');

            // Auto registration settings
            $table->boolean('auto_register')->default(false);
            $table->string('registrar')->nullable()->comment('Name.com, GoDaddy, etc');

            // EPP Code required for transfer
            $table->boolean('epp_code_required')->default(true);

            // Grace/Redemption periods (days)
            $table->integer('grace_period')->default(0);
            $table->integer('redemption_period')->default(30);

            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });

        // Domains
        Schema::create('whmcs_domains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('whmcs_clients');
            $table->foreignId('order_id')->nullable()->constrained('whmcs_orders');

            $table->string('domain')->unique();
            $table->foreignId('tld_id')->constrained('whmcs_domain_tlds');

            // Type
            $table->enum('type', [
                'register',     // Đăng ký mới
                'transfer',     // Chuyển về
                'other'         // Khác
            ])->default('register');

            // Dates
            $table->date('registration_date');
            $table->date('expiry_date');
            $table->date('next_due_date')->nullable();
            $table->date('next_invoice_date')->nullable();

            // Pricing
            $table->enum('billing_cycle', ['annually', 'biennially', 'triennially'])->default('annually');
            $table->decimal('recurring_amount', 15, 2);

            // Status
            $table->enum('status', [
                'pending',          // Chờ xử lý
                'pending_transfer', // Chờ transfer
                'active',          // Đang hoạt động
                'expired',         // Đã hết hạn
                'transferred_away',// Đã chuyển đi
                'cancelled',       // Đã hủy
                'fraud',           // Gian lận
                'grace',           // Grace period
                'redemption'       // Redemption period
            ])->default('pending');

            // Domain Contact Info (WHOIS)
            $table->json('registrant_contact')->nullable();
            $table->json('admin_contact')->nullable();
            $table->json('technical_contact')->nullable();
            $table->json('billing_contact')->nullable();

            // Nameservers
            $table->string('nameserver1')->nullable();
            $table->string('nameserver2')->nullable();
            $table->string('nameserver3')->nullable();
            $table->string('nameserver4')->nullable();
            $table->string('nameserver5')->nullable();

            // Transfer
            $table->string('transfer_secret')->nullable()->comment('EPP Code');

            // Privacy Protection
            $table->boolean('id_protection')->default(false);
            $table->decimal('id_protection_price', 15, 2)->default(0);

            // Auto Renew
            $table->boolean('auto_renew')->default(true);

            // Registrar Info
            $table->string('registrar')->nullable();
            $table->string('registrar_lock')->nullable();

            // Notes
            $table->text('admin_notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('client_id');
            $table->index('domain');
            $table->index('status');
            $table->index('expiry_date');
        });

        // Domain Addons (Email, Privacy, etc)
        Schema::create('whmcs_domain_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('domain_id')->constrained('whmcs_domains')->cascadeOnDelete();

            $table->string('addon_name');
            $table->enum('addon_type', ['email', 'privacy', 'dns', 'other']);

            $table->decimal('price', 15, 2)->default(0);
            $table->enum('billing_cycle', ['monthly', 'annually']);

            $table->date('next_due_date')->nullable();
            $table->enum('status', ['active', 'cancelled', 'expired'])->default('active');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_domain_addons');
        Schema::dropIfExists('whmcs_domains');
        Schema::dropIfExists('whmcs_domain_tlds');
    }
};
