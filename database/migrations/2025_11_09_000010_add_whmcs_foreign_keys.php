<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Migration này thêm các foreign key constraints cho invoice_items
     * SAU KHI các bảng services và domains đã được tạo.
     */
    public function up(): void
    {
        // Add foreign keys to invoice_items
        Schema::table('whmcs_invoice_items', function (Blueprint $table) {
            $table->foreign('service_id')->references('id')->on('whmcs_services')->nullOnDelete();
            $table->foreign('domain_id')->references('id')->on('whmcs_domains')->nullOnDelete();
        });

        // Add foreign key to order_items
        Schema::table('whmcs_order_items', function (Blueprint $table) {
            $table->foreign('service_id')->references('id')->on('whmcs_services')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whmcs_order_items', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
        });

        Schema::table('whmcs_invoice_items', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->dropForeign(['domain_id']);
        });
    }
};
