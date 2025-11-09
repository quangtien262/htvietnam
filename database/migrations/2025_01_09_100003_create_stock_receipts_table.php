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
        Schema::create('stock_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->comment('Mã phiếu nhập');
            $table->unsignedBigInteger('purchase_order_id')->comment('ID đơn hàng');
            $table->date('receipt_date')->comment('Ngày nhập kho');
            $table->string('warehouse', 255)->nullable()->comment('Kho nhập');
            $table->string('status', 20)->default('pending')->comment('pending, completed, cancelled');
            $table->text('notes')->nullable()->comment('Ghi chú');
            $table->unsignedBigInteger('received_by')->nullable()->comment('Người nhận hàng');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->tinyInteger('is_recycle_bin')->default(0);
            $table->timestamps();

            $table->foreign('purchase_order_id')->references('id')->on('purchase_orders')->onDelete('cascade');
            $table->index('code');
            $table->index('receipt_date');
            $table->index('status');
            $table->index('is_recycle_bin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_receipts');
    }
};
