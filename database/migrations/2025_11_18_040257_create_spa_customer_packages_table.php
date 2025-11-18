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
        Schema::create('spa_customer_packages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('khach_hang_id'); // Customer ID
            $table->unsignedBigInteger('goi_dich_vu_id'); // Service Package ID
            $table->string('ten_goi'); // Package name (snapshot)
            $table->decimal('gia_mua', 15, 2); // Purchase price
            $table->integer('so_luong_tong'); // Total uses (VD: 3 lần)
            $table->integer('so_luong_da_dung')->default(0); // Used times
            $table->json('dich_vu_ids')->nullable(); // Service IDs allowed in package [1,2,3]
            $table->date('ngay_mua'); // Purchase date
            $table->date('ngay_het_han')->nullable(); // Expiry date
            $table->enum('trang_thai', ['dang_dung', 'da_het', 'het_han'])->default('dang_dung');
            $table->unsignedBigInteger('hoa_don_id')->nullable(); // Invoice ID when purchased
            $table->text('ghi_chu')->nullable();
            $table->timestamps();

            $table->index('khach_hang_id');
            $table->index('goi_dich_vu_id');
            $table->index('trang_thai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spa_customer_packages');
    }
};
