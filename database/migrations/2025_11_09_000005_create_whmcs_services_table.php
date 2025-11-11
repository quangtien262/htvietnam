<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Services (Activated Products)
        Schema::create('whmcs_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('whmcs_clients');
            $table->foreignId('product_id')->constrained('whmcs_products');
            $table->foreignId('order_id')->nullable()->constrained('whmcs_orders');

            $table->string('service_name');
            $table->enum('product_type', ['hosting', 'vps', 'dedicated', 'domain', 'ssl', 'license', 'software', 'other']);

            // Domain/Username
            $table->string('domain')->nullable();
            $table->string('username')->nullable();
            $table->string('password')->nullable(); // Encrypted

            // Dedicated IP (if applicable)
            $table->string('dedicated_ip')->nullable();

            // Billing
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

            $table->decimal('recurring_amount', 15, 2)->default(0);
            $table->decimal('override_auto_suspend_date', 15, 2)->nullable();
            $table->decimal('override_suspension_reason', 15, 2)->nullable();

            // Dates
            $table->date('registration_date');
            $table->date('next_due_date')->nullable();
            $table->date('next_invoice_date')->nullable();
            $table->date('termination_date')->nullable();

            // Status
            $table->enum('status', [
                'pending',      // Chờ setup
                'active',       // Đang hoạt động
                'suspended',    // Tạm ngưng
                'terminated',   // Đã kết thúc
                'cancelled',    // Đã hủy
                'fraud'         // Gian lận
            ])->default('pending');

            // Provisioning Module
            $table->string('server_id')->nullable()->comment('ID server nếu dùng module');
            $table->json('module_params')->nullable();

            // Auto Management
            $table->boolean('auto_renew')->default(true);
            $table->boolean('override_auto_suspend')->default(false);
            $table->boolean('override_auto_terminate')->default(false);

            // Suspension
            $table->string('suspension_reason')->nullable();
            $table->datetime('suspended_at')->nullable();

            // Notes
            $table->text('admin_notes')->nullable();

            // Disk & Bandwidth Usage (for hosting)
            $table->bigInteger('disk_usage')->nullable()->comment('MB');
            $table->bigInteger('disk_limit')->nullable()->comment('MB');
            $table->bigInteger('bandwidth_usage')->nullable()->comment('MB');
            $table->bigInteger('bandwidth_limit')->nullable()->comment('MB');
            $table->datetime('last_update_usage')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('client_id');
            $table->index('status');
            $table->index('next_due_date');
            $table->index('domain');
        });

        // Service Addons
        Schema::create('whmcs_service_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('whmcs_services')->cascadeOnDelete();
            $table->foreignId('addon_id')->constrained('whmcs_product_addons');

            $table->string('addon_name');
            $table->enum('billing_cycle', ['monthly', 'quarterly', 'semiannually', 'annually']);
            $table->decimal('recurring_amount', 15, 2)->default(0);

            $table->date('registration_date');
            $table->date('next_due_date')->nullable();
            $table->date('termination_date')->nullable();

            $table->enum('status', ['pending', 'active', 'suspended', 'terminated', 'cancelled'])->default('pending');

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index('service_id');
            $table->index('status');
        });

        // Service Custom Field Values
        Schema::create('whmcs_service_field_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('whmcs_services')->cascadeOnDelete();
            $table->foreignId('field_id')->constrained('whmcs_product_fields')->cascadeOnDelete();

            $table->text('value')->nullable();

            $table->timestamps();

            $table->unique(['service_id', 'field_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_service_field_values');
        Schema::dropIfExists('whmcs_service_addons');
        Schema::dropIfExists('whmcs_services');
    }
};
