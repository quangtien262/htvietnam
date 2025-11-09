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
        Schema::create('supplier_payments', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->comment('Mã phiếu thanh toán');
            $table->unsignedBigInteger('supplier_id')->comment('ID nhà cung cấp');
            $table->unsignedBigInteger('purchase_order_id')->nullable()->comment('ID đơn hàng');
            $table->date('payment_date')->comment('Ngày thanh toán');
            $table->decimal('amount', 15, 2)->default(0)->comment('Số tiền');
            $table->string('payment_method', 50)->default('cash')->comment('cash, bank_transfer, check');
            $table->string('reference_number', 255)->nullable()->comment('Số tham chiếu');
            $table->text('notes')->nullable()->comment('Ghi chú');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->tinyInteger('is_recycle_bin')->default(0);
            $table->timestamps();

            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('cascade');
            $table->foreign('purchase_order_id')->references('id')->on('purchase_orders')->onDelete('set null');
            $table->index('code');
            $table->index('payment_date');
            $table->index('is_recycle_bin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_payments');
    }
};
