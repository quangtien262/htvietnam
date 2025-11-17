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
        Schema::create('spa_the_gia_tri', function (Blueprint $table) {
            $table->id();
            $table->string('ma_the', 50)->unique()->comment('Mã thẻ: GT0001, GT0002...');
            $table->string('ten_the', 255)->comment('Tên thẻ giá trị');
            $table->decimal('menh_gia', 15, 2)->comment('Mệnh giá thẻ (số tiền nạp vào ví)');
            $table->decimal('gia_ban', 15, 2)->comment('Giá bán thẻ');
            $table->decimal('ti_le_thuong', 5, 2)->default(0)->comment('Tỷ lệ thưởng % (VD: 10 = +10%)');
            $table->date('ngay_het_han')->nullable()->comment('Ngày hết hạn thẻ');
            $table->enum('trang_thai', ['active', 'inactive'])->default('active')->comment('Trạng thái thẻ');
            $table->text('mo_ta')->nullable()->comment('Mô tả thẻ');

            // Promo code feature
            $table->string('ma_code', 50)->nullable()->unique()->comment('Mã code để nhập (promo/gift code)');
            $table->integer('so_luong_code')->default(0)->comment('Số lượng code có thể sử dụng (0 = unlimited)');
            $table->integer('so_luong_da_dung')->default(0)->comment('Số lượng code đã được sử dụng');
            $table->date('code_het_han')->nullable()->comment('Hạn sử dụng code');

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('trang_thai');
            $table->index('ma_code');
            $table->index('ngay_het_han');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spa_the_gia_tri');
    }
};
