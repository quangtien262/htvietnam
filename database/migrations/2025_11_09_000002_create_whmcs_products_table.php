<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Product Groups (Categories)
        Schema::create('whmcs_product_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Products
        Schema::create('whmcs_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('whmcs_product_groups')->cascadeOnDelete();

            $table->enum('type', [
                'hosting',          // Hosting
                'vps',             // VPS
                'dedicated',       // Dedicated Server
                'domain',          // Domain
                'ssl',             // SSL Certificate
                'license',         // License
                'software',        // Software/Application
                'other'            // Other
            ]);

            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('welcome_email')->nullable();

            // Stock Management
            $table->boolean('stock_control')->default(false);
            $table->integer('stock_quantity')->nullable();

            // Pricing
            $table->boolean('pay_type_free')->default(false);
            $table->boolean('pay_type_onetime')->default(false);
            $table->boolean('pay_type_recurring')->default(true);

            // Auto Setup
            $table->enum('auto_setup', ['on_payment', 'on_order', 'manual'])->default('on_payment');

            // Provisioning Module (if needed)
            $table->string('module_name')->nullable()->comment('cPanel, Plesk, DirectAdmin, etc.');
            $table->json('module_config')->nullable();

            // Status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index('type');
            $table->index('is_active');
        });

        // Product Pricing (Multi-currency support)
        Schema::create('whmcs_product_pricing', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('whmcs_products')->cascadeOnDelete();
            $table->string('currency_code')->default('VND');

            // One-time
            $table->decimal('setup_fee', 15, 2)->nullable();
            $table->decimal('price_onetime', 15, 2)->nullable();

            // Recurring Prices
            $table->decimal('price_monthly', 15, 2)->nullable();
            $table->decimal('price_quarterly', 15, 2)->nullable();
            $table->decimal('price_semiannually', 15, 2)->nullable();
            $table->decimal('price_annually', 15, 2)->nullable();
            $table->decimal('price_biennially', 15, 2)->nullable();
            $table->decimal('price_triennially', 15, 2)->nullable();

            $table->timestamps();

            $table->unique(['product_id', 'currency_code']);
        });

        // Product Custom Fields (Configurable Options)
        Schema::create('whmcs_product_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('whmcs_products')->cascadeOnDelete();

            $table->string('field_name');
            $table->enum('field_type', ['text', 'password', 'dropdown', 'textarea', 'yesno', 'tickbox']);
            $table->text('field_options')->nullable()->comment('For dropdown - JSON array');
            $table->text('description')->nullable();
            $table->boolean('is_required')->default(false);
            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });

        // Addons (Extras cho products)
        Schema::create('whmcs_product_addons', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('welcome_email')->nullable();

            // Có thể apply cho products nào
            $table->json('applicable_product_ids')->nullable();

            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });

        // Addon Pricing
        Schema::create('whmcs_addon_pricing', function (Blueprint $table) {
            $table->id();
            $table->foreignId('addon_id')->constrained('whmcs_product_addons')->cascadeOnDelete();
            $table->string('currency_code')->default('VND');

            $table->decimal('setup_fee', 15, 2)->nullable();
            $table->decimal('price_monthly', 15, 2)->nullable();
            $table->decimal('price_quarterly', 15, 2)->nullable();
            $table->decimal('price_semiannually', 15, 2)->nullable();
            $table->decimal('price_annually', 15, 2)->nullable();

            $table->timestamps();

            $table->unique(['addon_id', 'currency_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_addon_pricing');
        Schema::dropIfExists('whmcs_product_addons');
        Schema::dropIfExists('whmcs_product_fields');
        Schema::dropIfExists('whmcs_product_pricing');
        Schema::dropIfExists('whmcs_products');
        Schema::dropIfExists('whmcs_product_groups');
    }
};
