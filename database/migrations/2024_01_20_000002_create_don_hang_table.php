<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('don_hang', function (Blueprint $table) {
            $table->id();
            $table->string('ma_don_hang', 50)->unique()->comment('Mã đơn hàng: DH001');
            $table->unsignedBigInteger('user_id')->comment('Khách hàng');
            $table->unsignedBigInteger('nhan_vien_ban_hang_id')->nullable();
            $table->date('ngay_dat_hang');
            $table->date('ngay_giao_du_kien')->nullable();
            $table->date('ngay_giao_thuc_te')->nullable();
            $table->enum('trang_thai', ['draft', 'pending', 'confirmed', 'processing', 'shipping', 'delivered', 'completed', 'cancelled'])->default('draft');
            $table->decimal('tong_tien_hang', 15, 2)->default(0)->comment('Tổng tiền hàng trước VAT');
            $table->decimal('tien_giam_gia', 15, 2)->default(0)->comment('Tiền giảm giá');
            $table->decimal('tien_vat', 15, 2)->default(0)->comment('Tiền VAT');
            $table->decimal('phi_van_chuyen', 15, 2)->default(0)->comment('Phí vận chuyển');
            $table->decimal('tong_cong', 15, 2)->default(0)->comment('Tổng cộng');
            $table->decimal('da_thanh_toan', 15, 2)->default(0)->comment('Đã thanh toán');
            $table->decimal('con_no', 15, 2)->default(0)->comment('Còn nợ');
            $table->string('dia_chi_giao_hang')->nullable();
            $table->string('nguoi_nhan', 100)->nullable();
            $table->string('sdt_nguoi_nhan', 20)->nullable();
            $table->unsignedBigInteger('chuong_trinh_khuyen_mai_id')->nullable();
            $table->string('ma_giam_gia', 50)->nullable()->comment('Mã voucher');
            $table->text('ghi_chu')->nullable();
            $table->string('ly_do_huy')->nullable();
            $table->timestamp('ngay_huy')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('don_hang');
    }
};
