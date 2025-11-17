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
        Schema::create('spa_giao_dich_vi', function (Blueprint $table) {
            $table->id();
            $table->string('ma_giao_dich', 50)->unique()->comment('Mã giao dịch: VD_YYYYMMDD_NNN');
            $table->unsignedBigInteger('khach_hang_id')->comment('ID khách hàng');
            $table->enum('loai_giao_dich', ['nap', 'tieu', 'hoan', 'code'])->comment('Loại: nạp/tiêu/hoàn/code');
            $table->decimal('so_tien', 15, 2)->comment('Số tiền giao dịch');
            $table->decimal('so_du_truoc', 15, 2)->comment('Số dư trước giao dịch');
            $table->decimal('so_du_sau', 15, 2)->comment('Số dư sau giao dịch');

            // References
            $table->unsignedBigInteger('the_gia_tri_id')->nullable()->comment('ID thẻ giá trị (nếu mua thẻ)');
            $table->unsignedBigInteger('hoa_don_id')->nullable()->comment('ID hóa đơn (nếu thanh toán)');
            $table->unsignedBigInteger('nhan_vien_id')->nullable()->comment('ID nhân viên xử lý');
            $table->string('ma_code', 50)->nullable()->comment('Mã code đã sử dụng (nếu có)');

            $table->text('ghi_chu')->nullable()->comment('Ghi chú giao dịch');
            $table->timestamp('created_at')->useCurrent();

            // Foreign keys
            $table->foreign('khach_hang_id')->references('id')->on('spa_khach_hang')->onDelete('cascade');
            $table->foreign('the_gia_tri_id')->references('id')->on('spa_the_gia_tri')->onDelete('set null');
            $table->foreign('hoa_don_id')->references('id')->on('spa_hoa_don')->onDelete('set null');
            $table->foreign('nhan_vien_id')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index('khach_hang_id');
            $table->index('loai_giao_dich');
            $table->index('created_at');
            $table->index('ma_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spa_giao_dich_vi');
    }
};
