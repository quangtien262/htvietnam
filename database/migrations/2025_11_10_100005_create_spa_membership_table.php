<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spa_membership_tier', function (Blueprint $table) {
            $table->id();
            $table->string('ten_cap', 50)->comment('SILVER, GOLD, PLATINUM, DIAMOND');
            $table->decimal('chi_tieu_toi_thieu', 15, 2)->default(0);
            $table->decimal('phan_tram_giam_dich_vu', 5, 2)->default(0);
            $table->decimal('phan_tram_giam_san_pham', 5, 2)->default(0);
            $table->decimal('he_so_tich_diem', 3, 2)->default(1)->comment('1x, 1.5x, 2x, 3x');
            $table->json('uu_dai_dac_biet')->nullable()->comment('Special benefits JSON');
            $table->string('mau_the', 20)->nullable();
            $table->string('icon', 100)->nullable();
            $table->integer('thu_tu')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('spa_khach_hang_the', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('khach_hang_id');
            $table->unsignedBigInteger('membership_tier_id');
            $table->string('ma_the', 50)->unique();
            $table->dateTime('ngay_kich_hoat');
            $table->dateTime('ngay_het_han');
            $table->integer('diem_hien_tai')->default(0);
            $table->integer('diem_su_dung')->default(0);
            $table->integer('diem_het_han')->default(0);
            $table->decimal('chi_tieu_nam_nay', 15, 2)->default(0);
            $table->enum('trang_thai', ['active', 'expired', 'suspended'])->default('active');
            $table->timestamps();
        });

        Schema::create('spa_diem_thuong_lich_su', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('khach_hang_id');
            $table->enum('loai', ['cong', 'tru'])->default('cong');
            $table->integer('diem_thay_doi');
            $table->integer('diem_con_lai');
            $table->string('ly_do', 255);
            $table->unsignedBigInteger('order_id')->nullable();
            $table->dateTime('ngay_giao_dich');
            $table->timestamps();

            $table->index('khach_hang_id');
        });

        Schema::create('spa_qua_tang', function (Blueprint $table) {
            $table->id();
            $table->string('ten_qua', 255);
            $table->integer('diem_can');
            $table->decimal('gia_tri', 15, 2)->default(0);
            $table->integer('so_luong_con')->default(0);
            $table->string('hinh_anh', 500)->nullable();
            $table->text('mo_ta')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('spa_doi_qua', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('khach_hang_id');
            $table->unsignedBigInteger('qua_tang_id');
            $table->integer('diem_su_dung');
            $table->dateTime('ngay_doi');
            $table->enum('trang_thai', ['cho_giao', 'da_giao', 'huy'])->default('cho_giao');
            $table->dateTime('ngay_giao')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spa_doi_qua');
        Schema::dropIfExists('spa_qua_tang');
        Schema::dropIfExists('spa_diem_thuong_lich_su');
        Schema::dropIfExists('spa_khach_hang_the');
        Schema::dropIfExists('spa_membership_tier');
    }
};
