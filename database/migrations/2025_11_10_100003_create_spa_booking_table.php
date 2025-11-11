<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spa_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('ma_booking', 20)->unique();
            $table->unsignedBigInteger('khach_hang_id');
            $table->unsignedBigInteger('chi_nhanh_id')->nullable();
            $table->string('nguon_booking', 100)->nullable()->comment('web, app, walk-in, phone');
            $table->date('ngay_hen');
            $table->time('gio_hen')->nullable();
            $table->integer('thoi_gian_du_kien')->nullable()->comment('Estimated duration in minutes');
            $table->time('gio_bat_dau')->nullable();
            $table->time('gio_ket_thuc')->nullable();
            $table->json('dich_vu_ids')->nullable()->comment('Array of service IDs');
            $table->unsignedBigInteger('ktv_id')->nullable()->comment('Main assigned staff');
            $table->unsignedBigInteger('phong_id')->nullable();
            $table->enum('trang_thai', [
                'cho_xac_nhan', 
                'da_xac_nhan', 
                'dang_thuc_hien', 
                'hoan_thanh', 
                'huy', 
                'khong_den'
            ])->default('cho_xac_nhan');
            $table->decimal('tien_coc', 15, 2)->default(0);
            $table->string('phuong_thuc_coc', 50)->nullable()->comment('vnpay, momo, bank_transfer');
            $table->text('ghi_chu_khach')->nullable();
            $table->text('ghi_chu_noi_bo')->nullable();
            $table->dateTime('ngay_huy')->nullable();
            $table->string('ly_do_huy', 500)->nullable();
            $table->boolean('da_gui_sms_xac_nhan')->default(false);
            $table->boolean('da_gui_sms_nhac_lich')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['ngay_hen', 'gio_bat_dau']);
            $table->index('trang_thai');
        });

        Schema::create('spa_booking_dich_vu', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('booking_id');
            $table->unsignedBigInteger('dich_vu_id');
            $table->unsignedBigInteger('ktv_id')->nullable();
            $table->unsignedBigInteger('phong_id')->nullable();
            $table->time('gio_bat_dau')->nullable();
            $table->time('gio_ket_thuc')->nullable();
            $table->decimal('gia_dich_vu', 15, 2)->default(0)->comment('Price at booking time');
            $table->enum('trang_thai', ['chua_lam', 'dang_lam', 'hoan_thanh'])->default('chua_lam');
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spa_booking_dich_vu');
        Schema::dropIfExists('spa_bookings');
    }
};
