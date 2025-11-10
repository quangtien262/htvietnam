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
        Schema::create('whmcs_currencies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3)->unique(); // USD, VND, EUR, etc.
            $table->string('name'); // US Dollar, Vietnamese Dong, etc.
            $table->string('symbol', 10); // $, ₫, €, etc.
            $table->string('format')->default('{symbol}{amount}'); // {symbol}{amount}, {amount} {symbol}, etc.
            $table->decimal('exchange_rate', 16, 6)->default(1.000000); // Rate to base currency
            $table->boolean('is_base')->default(false); // Only one base currency
            $table->boolean('is_active')->default(true);
            $table->integer('decimal_places')->default(2);
            $table->string('position')->default('before'); // before or after (symbol position)
            $table->timestamps();

            $table->index('code');
            $table->index('is_base');
            $table->index('is_active');
        });

        // Add currency_id to invoices
        Schema::table('whmcs_invoices', function (Blueprint $table) {
            $table->foreignId('currency_id')->nullable()->after('client_id')->constrained('whmcs_currencies')->nullOnDelete();
        });

        // Add currency_id to services
        Schema::table('whmcs_services', function (Blueprint $table) {
            $table->foreignId('currency_id')->nullable()->after('product_id')->constrained('whmcs_currencies')->nullOnDelete();
        });

        // Add currency_id to transactions
        Schema::table('whmcs_transactions', function (Blueprint $table) {
            $table->foreignId('currency_id')->nullable()->after('invoice_id')->constrained('whmcs_currencies')->nullOnDelete();
        });

        // Insert default currencies
        DB::table('whmcs_currencies')->insert([
            [
                'code' => 'USD',
                'name' => 'US Dollar',
                'symbol' => '$',
                'format' => '{symbol}{amount}',
                'exchange_rate' => 1.000000,
                'is_base' => true,
                'is_active' => true,
                'decimal_places' => 2,
                'position' => 'before',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'VND',
                'name' => 'Vietnamese Dong',
                'symbol' => '₫',
                'format' => '{amount} {symbol}',
                'exchange_rate' => 24000.000000,
                'is_base' => false,
                'is_active' => true,
                'decimal_places' => 0,
                'position' => 'after',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'EUR',
                'name' => 'Euro',
                'symbol' => '€',
                'format' => '{symbol}{amount}',
                'exchange_rate' => 0.920000,
                'is_base' => false,
                'is_active' => true,
                'decimal_places' => 2,
                'position' => 'before',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'GBP',
                'name' => 'British Pound',
                'symbol' => '£',
                'format' => '{symbol}{amount}',
                'exchange_rate' => 0.790000,
                'is_base' => false,
                'is_active' => true,
                'decimal_places' => 2,
                'position' => 'before',
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
        Schema::table('whmcs_invoices', function (Blueprint $table) {
            $table->dropForeign(['currency_id']);
            $table->dropColumn('currency_id');
        });

        Schema::table('whmcs_services', function (Blueprint $table) {
            $table->dropForeign(['currency_id']);
            $table->dropColumn('currency_id');
        });

        Schema::table('whmcs_transactions', function (Blueprint $table) {
            $table->dropForeign(['currency_id']);
            $table->dropColumn('currency_id');
        });

        Schema::dropIfExists('whmcs_currencies');
    }
};
