<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('co_hoi_kinh_doanh', function (Blueprint $table) {
            $table->id();
            $table->string('ma_co_hoi', 50)->unique()->comment('Mã cơ hội: CH0001');
            $table->string('ten_co_hoi')->comment('Tên cơ hội kinh doanh');
            $table->unsignedBigInteger('user_id')->nullable()->comment('Khách hàng tiềm năng');
            $table->string('nguon_khach_hang')->nullable()->comment('Website, Facebook, Giới thiệu, Hội chợ...');
            $table->enum('giai_doan', ['lead', 'prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost'])->default('lead');
            $table->decimal('gia_tri_du_kien', 15, 2)->default(0)->comment('Giá trị dự kiến');
            $table->integer('xac_suat_thanh_cong')->default(10)->comment('% xác suất thành công');
            $table->unsignedBigInteger('nhan_vien_phu_trach_id')->nullable();
            $table->date('ngay_du_kien_chot')->nullable();
            $table->date('ngay_chot_thuc_te')->nullable();
            $table->string('ly_do_that_bai')->nullable();
            $table->text('ghi_chu')->nullable();
            $table->enum('trang_thai', ['active', 'closed'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('co_hoi_kinh_doanh');
    }
};
