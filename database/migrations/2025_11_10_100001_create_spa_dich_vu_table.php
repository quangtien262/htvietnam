<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spa_danh_muc_dich_vu', function (Blueprint $table) {
            $table->id();
            $table->string('ten_danh_muc', 255);
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('icon', 100)->nullable();
            $table->string('mau_sac', 20)->nullable();
            $table->integer('thu_tu')->default(0);
            $table->text('mo_ta')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('spa_dich_vu', function (Blueprint $table) {
            $table->id();
            $table->string('ma_dich_vu', 20)->unique();
            $table->string('ten_dich_vu', 255);
            $table->unsignedBigInteger('danh_muc_id')->nullable();
            $table->text('mo_ta')->nullable();
            $table->text('huong_dan_thuc_hien')->nullable();
            $table->integer('thoi_gian_thuc_hien')->default(60)->comment('minutes');
            $table->decimal('gia_ban', 15, 2)->default(0);
            $table->decimal('price_member', 15, 2)->nullable()->comment('Giá dành cho thành viên');
            $table->integer('diem_thuong')->default(0);
            $table->json('hinh_anh_ids')->nullable();
            $table->json('san_pham_su_dung_ids')->nullable()->comment('Products used in service');
            $table->string('yeu_cau_ktv', 100)->nullable()->comment('junior, senior, expert, master');
            $table->string('loai_phong', 100)->nullable()->comment('vip_room, normal_room, nail_station');
            $table->boolean('is_combo')->default(false);
            $table->json('dich_vu_con_ids')->nullable()->comment('If combo service');
            $table->integer('so_lan_da_ban')->default(0);
            $table->decimal('rating_tb', 3, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('spa_lieu_trinh', function (Blueprint $table) {
            $table->id();
            $table->string('ma_lieu_trinh', 20)->unique();
            $table->string('ten_lieu_trinh', 255);
            $table->text('mo_ta')->nullable();
            $table->unsignedBigInteger('dich_vu_id');
            $table->integer('so_buoi')->default(1);
            $table->integer('thoi_han')->default(90)->comment('days');
            $table->decimal('gia_goc', 15, 2)->default(0);
            $table->decimal('gia_ban', 15, 2)->default(0);
            $table->decimal('phan_tram_giam', 5, 2)->default(0);
            $table->integer('diem_thuong')->default(0);
            $table->string('hinh_anh', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('spa_khach_hang_lieu_trinh', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('khach_hang_id');
            $table->unsignedBigInteger('lieu_trinh_id');
            $table->dateTime('ngay_mua');
            $table->dateTime('ngay_het_han');
            $table->integer('so_buoi_con_lai');
            $table->integer('so_buoi_da_dung')->default(0);
            $table->enum('trang_thai', ['active', 'expired', 'completed'])->default('active');
            $table->json('ghi_chu_tien_do')->nullable()->comment('Progress tracking JSON');
            $table->unsignedBigInteger('ktv_phu_trach_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spa_khach_hang_lieu_trinh');
        Schema::dropIfExists('spa_lieu_trinh');
        Schema::dropIfExists('spa_dich_vu');
        Schema::dropIfExists('spa_danh_muc_dich_vu');
    }
};
