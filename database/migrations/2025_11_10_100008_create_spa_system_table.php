<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spa_chi_nhanh', function (Blueprint $table) {
            $table->id();
            $table->string('ten_chi_nhanh', 255);
            $table->string('ma_chi_nhanh', 20)->unique();
            $table->text('dia_chi');
            $table->string('thanh_pho', 100);
            $table->string('sdt', 20);
            $table->string('email', 255)->nullable();
            $table->integer('so_phong')->default(0);
            $table->integer('so_ktv')->default(0);
            $table->time('gio_mo_cua')->nullable();
            $table->time('gio_dong_cua')->nullable();
            $table->decimal('toa_do_lat', 10, 8)->nullable();
            $table->decimal('toa_do_lng', 11, 8)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('spa_phong', function (Blueprint $table) {
            $table->id();
            $table->string('ma_phong', 20);
            $table->string('ten_phong', 255);
            $table->unsignedBigInteger('chi_nhanh_id');
            $table->enum('loai_phong', ['vip', 'standard', 'couple', 'nail_station', 'massage_room'])->default('standard');
            $table->integer('suc_chua')->default(1)->comment('Number of people');
            $table->json('tien_nghi')->nullable()->comment('Amenities: AC, TV, massage chair...');
            $table->enum('trang_thai', ['trong', 'dang_su_dung', 'bao_tri'])->default('trong');
            $table->integer('thu_tu')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['chi_nhanh_id', 'ma_phong']);
        });

        Schema::create('spa_cau_hinh', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value')->nullable();
            $table->string('nhom', 100)->nullable()->comment('Group: booking, payment, loyalty...');
            $table->string('mo_ta', 255)->nullable();
            $table->string('kieu_du_lieu', 50)->default('text')->comment('text, number, boolean, json');
            $table->timestamps();
        });

        // Rating & Reviews
        Schema::create('spa_danh_gia', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('khach_hang_id');
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->unsignedBigInteger('hoa_don_id')->nullable();
            $table->unsignedBigInteger('ktv_id')->nullable();
            $table->unsignedBigInteger('dich_vu_id')->nullable();
            $table->integer('so_sao')->comment('1-5');
            $table->text('noi_dung')->nullable();
            $table->json('hinh_anh_ids')->nullable();
            $table->boolean('is_hien_thi')->default(true);
            $table->text('phan_hoi')->nullable()->comment('Response from spa');
            $table->dateTime('ngay_phan_hoi')->nullable();
            $table->timestamps();

            $table->index('ktv_id');
            $table->index('dich_vu_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spa_danh_gia');
        Schema::dropIfExists('spa_cau_hinh');
        Schema::dropIfExists('spa_phong');
        Schema::dropIfExists('spa_chi_nhanh');
    }
};
