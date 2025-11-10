<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Affiliates table
        Schema::create('whmcs_affiliates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('code')->unique(); // Unique referral code
            $table->decimal('commission_rate', 5, 2)->default(10.00); // Percentage
            $table->string('commission_type')->default('percentage'); // percentage or fixed
            $table->decimal('total_earnings', 10, 2)->default(0);
            $table->decimal('pending_earnings', 10, 2)->default(0);
            $table->decimal('paid_earnings', 10, 2)->default(0);
            $table->integer('total_referrals')->default(0);
            $table->integer('successful_referrals')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_payout_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('code');
            $table->index('user_id');
            $table->index('is_active');
        });

        // Affiliate Referrals table
        Schema::create('whmcs_affiliate_referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_id')->constrained('whmcs_affiliates')->cascadeOnDelete();
            $table->foreignId('referred_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained('whmcs_invoices')->nullOnDelete();
            $table->string('status')->default('pending'); // pending, converted, cancelled
            $table->decimal('commission_amount', 10, 2)->default(0);
            $table->decimal('order_amount', 10, 2)->default(0);
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->timestamps();

            $table->index(['affiliate_id', 'status']);
            $table->index('referred_user_id');
            $table->index('created_at');
        });

        // Affiliate Payouts table
        Schema::create('whmcs_affiliate_payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_id')->constrained('whmcs_affiliates')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('pending'); // pending, paid, rejected
            $table->string('payment_method')->nullable(); // bank_transfer, paypal, etc.
            $table->text('payment_details')->nullable(); // JSON with account details
            $table->text('notes')->nullable();
            $table->timestamp('requested_at');
            $table->timestamp('processed_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['affiliate_id', 'status']);
            $table->index('status');
        });

        // Add affiliate tracking to users (who referred them)
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('referred_by')->nullable()->after('id')->constrained('whmcs_affiliates')->nullOnDelete();
        });

        // Add affiliate tracking to invoices
        Schema::table('whmcs_invoices', function (Blueprint $table) {
            $table->foreignId('affiliate_id')->nullable()->after('client_id')->constrained('whmcs_affiliates')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whmcs_invoices', function (Blueprint $table) {
            $table->dropForeign(['affiliate_id']);
            $table->dropColumn('affiliate_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['referred_by']);
            $table->dropColumn('referred_by');
        });

        Schema::dropIfExists('whmcs_affiliate_payouts');
        Schema::dropIfExists('whmcs_affiliate_referrals');
        Schema::dropIfExists('whmcs_affiliates');
    }
};
