<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tax Rules table
        Schema::create('whmcs_tax_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // VAT, GST, Sales Tax, etc.
            $table->decimal('rate', 5, 2); // 10.50 for 10.5%
            $table->string('type')->default('percentage'); // percentage, fixed
            $table->string('country', 2)->nullable(); // ISO country code (US, VN, etc.)
            $table->string('state')->nullable(); // State/Province
            $table->boolean('compound')->default(false); // Compound tax (tax on tax)
            $table->integer('priority')->default(0); // Order of application
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['country', 'state']);
            $table->index('is_active');
        });

        // Product Tax Configuration (link products to tax rules)
        Schema::create('whmcs_product_tax', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('whmcs_products')->cascadeOnDelete();
            $table->foreignId('tax_rule_id')->constrained('whmcs_tax_rules')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['product_id', 'tax_rule_id']);
        });

        // Add tax fields to invoices
        Schema::table('whmcs_invoices', function (Blueprint $table) {
            $table->decimal('tax_rate', 5, 2)->default(0)->after('subtotal');
            $table->decimal('tax_amount', 10, 2)->default(0)->after('tax_rate');
            $table->string('tax_name')->nullable()->after('tax_amount');
        });

        // Add tax fields to invoice items
        Schema::table('whmcs_invoice_items', function (Blueprint $table) {
            $table->decimal('tax_rate', 5, 2)->default(0)->after('total');
            $table->decimal('tax_amount', 10, 2)->default(0)->after('tax_rate');
        });

        // Insert default tax rules
        DB::table('whmcs_tax_rules')->insert([
            [
                'name' => 'VAT (Vietnam)',
                'rate' => 10.00,
                'type' => 'percentage',
                'country' => 'VN',
                'state' => null,
                'compound' => false,
                'priority' => 1,
                'is_active' => true,
                'description' => 'Vietnam Value Added Tax',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Sales Tax (US)',
                'rate' => 7.50,
                'type' => 'percentage',
                'country' => 'US',
                'state' => null,
                'compound' => false,
                'priority' => 1,
                'is_active' => true,
                'description' => 'US Sales Tax',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'GST (Singapore)',
                'rate' => 8.00,
                'type' => 'percentage',
                'country' => 'SG',
                'state' => null,
                'compound' => false,
                'priority' => 1,
                'is_active' => true,
                'description' => 'Singapore Goods and Services Tax',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whmcs_invoice_items', function (Blueprint $table) {
            $table->dropColumn(['tax_rate', 'tax_amount']);
        });

        Schema::table('whmcs_invoices', function (Blueprint $table) {
            $table->dropColumn(['tax_rate', 'tax_amount', 'tax_name']);
        });

        Schema::dropIfExists('whmcs_product_tax');
        Schema::dropIfExists('whmcs_tax_rules');
    }
};
