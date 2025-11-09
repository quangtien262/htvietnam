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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->comment('Mã nhà cung cấp');
            $table->string('name', 255)->comment('Tên nhà cung cấp');
            $table->string('contact_person', 255)->nullable()->comment('Người liên hệ');
            $table->string('phone', 20)->nullable()->comment('Số điện thoại');
            $table->string('email', 255)->nullable()->comment('Email');
            $table->text('address')->nullable()->comment('Địa chỉ');
            $table->string('tax_code', 50)->nullable()->comment('Mã số thuế');
            $table->integer('payment_terms')->default(0)->comment('Điều khoản thanh toán (ngày)');
            $table->tinyInteger('status')->default(1)->comment('0: Inactive, 1: Active');
            $table->decimal('rating', 3, 2)->default(0)->comment('Đánh giá (0-5)');
            $table->text('notes')->nullable()->comment('Ghi chú');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->tinyInteger('is_recycle_bin')->default(0)->comment('0: Normal, 1: Deleted');
            $table->timestamps();

            $table->index('code');
            $table->index('status');
            $table->index('is_recycle_bin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
