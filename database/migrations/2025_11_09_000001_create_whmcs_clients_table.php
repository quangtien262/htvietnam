<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whmcs_clients', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->comment('Mã khách hàng');
            $table->string('company_name')->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('mobile')->nullable();

            // Address
            $table->text('address1')->nullable();
            $table->text('address2')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postcode')->nullable();
            $table->string('country')->default('VN');

            // Tax & Business
            $table->string('tax_id')->nullable()->comment('Mã số thuế');
            $table->boolean('tax_exempt')->default(false);

            // Account Status
            $table->enum('status', ['active', 'inactive', 'closed'])->default('active');
            $table->string('password');
            $table->datetime('email_verified_at')->nullable();

            // Credit & Balance
            $table->decimal('credit', 15, 2)->default(0)->comment('Tín dụng tài khoản');
            $table->decimal('balance', 15, 2)->default(0)->comment('Số dư nợ');

            // Billing Info
            $table->string('currency_code')->default('VND');
            $table->enum('billing_cycle_day', range(1, 28))->default(1);

            // Notes & Custom
            $table->text('notes')->nullable();
            $table->json('custom_fields')->nullable();

            // Admin
            $table->foreignId('created_by')->nullable()->constrained('admin_users');
            $table->foreignId('assigned_to')->nullable()->constrained('admin_users')->comment('Nhân viên phụ trách');

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('status');
            $table->index('email');
            $table->index('company_name');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_clients');
    }
};
