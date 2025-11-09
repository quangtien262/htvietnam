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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->comment('Mã đơn hàng');
            $table->unsignedBigInteger('supplier_id')->comment('ID nhà cung cấp');
            $table->date('order_date')->comment('Ngày đặt hàng');
            $table->date('expected_date')->nullable()->comment('Ngày dự kiến nhận');
            $table->decimal('total_amount', 15, 2)->default(0)->comment('Tổng tiền hàng');
            $table->decimal('tax', 15, 2)->default(0)->comment('Thuế');
            $table->decimal('discount', 15, 2)->default(0)->comment('Giảm giá');
            $table->decimal('grand_total', 15, 2)->default(0)->comment('Tổng cộng');
            $table->string('status', 20)->default('draft')->comment('draft, sent, receiving, completed, cancelled');
            $table->string('payment_status', 20)->default('unpaid')->comment('unpaid, partial, paid');
            $table->decimal('paid_amount', 15, 2)->default(0)->comment('Số tiền đã thanh toán');
            $table->text('notes')->nullable()->comment('Ghi chú');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->tinyInteger('is_recycle_bin')->default(0);
            $table->timestamps();

            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('cascade');
            $table->index('code');
            $table->index('status');
            $table->index('payment_status');
            $table->index('order_date');
            $table->index('is_recycle_bin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
