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
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('purchase_order_id')->comment('ID đơn hàng');
            $table->string('product_name', 255)->comment('Tên sản phẩm');
            $table->string('product_code', 50)->nullable()->comment('Mã sản phẩm');
            $table->string('unit', 50)->default('Cái')->comment('Đơn vị tính');
            $table->integer('quantity')->default(0)->comment('Số lượng đặt');
            $table->integer('received_quantity')->default(0)->comment('Số lượng đã nhận');
            $table->decimal('unit_price', 15, 2)->default(0)->comment('Đơn giá');
            $table->decimal('tax_rate', 5, 2)->default(0)->comment('% Thuế');
            $table->decimal('discount_rate', 5, 2)->default(0)->comment('% Giảm giá');
            $table->decimal('amount', 15, 2)->default(0)->comment('Thành tiền');
            $table->text('note')->nullable()->comment('Ghi chú');
            $table->timestamps();

            $table->foreign('purchase_order_id')->references('id')->on('purchase_orders')->onDelete('cascade');
            $table->index('purchase_order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
    }
};
