<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spa_danh_muc_san_pham', function (Blueprint $table) {
            $table->id();
            $table->string('ten_danh_muc', 255);
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('icon', 100)->nullable();
            $table->integer('thu_tu')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('spa_thuong_hieu', function (Blueprint $table) {
            $table->id();
            $table->string('ten_thuong_hieu', 255);
            $table->string('logo', 500)->nullable();
            $table->string('xuat_xu', 100)->nullable();
            $table->text('mo_ta')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('spa_san_pham', function (Blueprint $table) {
            $table->id();
            $table->string('ma_san_pham', 20)->unique();
            $table->string('ten_san_pham', 255);
            $table->unsignedBigInteger('danh_muc_id')->nullable();
            $table->unsignedBigInteger('thuong_hieu_id')->nullable();
            $table->string('xuat_xu', 100)->nullable();
            $table->text('mo_ta_ngan')->nullable();
            $table->text('mo_ta_chi_tiet')->nullable();
            $table->decimal('gia_nhap', 15, 2)->default(0);
            $table->decimal('gia_ban', 15, 2)->default(0);
            $table->decimal('price_member', 15, 2)->nullable()->comment('Giá dành cho thành viên');
            $table->string('don_vi_tinh', 50)->default('cái');
            $table->integer('ton_kho')->default(0);
            $table->integer('ton_kho_canh_bao')->default(10)->comment('Alert when stock < x');
            $table->json('hinh_anh_ids')->nullable();
            $table->json('thanh_phan')->nullable()->comment('Ingredients');
            $table->text('huong_dan_su_dung')->nullable();
            $table->integer('bao_hanh')->default(0)->comment('months');
            $table->integer('han_su_dung')->default(0)->comment('months');
            $table->string('kich_thuoc', 100)->nullable();
            $table->string('trong_luong', 100)->nullable();
            $table->integer('diem_thuong')->default(0);
            $table->integer('luot_xem')->default(0);
            $table->integer('luot_ban')->default(0);
            $table->decimal('rating_tb', 3, 2)->default(0);
            $table->json('tags')->nullable()->comment('organic, natural, vegan...');
            $table->boolean('is_bestseller')->default(false);
            $table->boolean('is_new')->default(false);
            $table->boolean('is_sale')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('spa_combo_san_pham', function (Blueprint $table) {
            $table->id();
            $table->string('ten_combo', 255);
            $table->json('san_pham_ids')->comment('Array of product IDs');
            $table->decimal('gia_ban', 15, 2)->default(0);
            $table->decimal('gia_giam', 15, 2)->default(0);
            $table->dateTime('ngay_bat_dau')->nullable();
            $table->dateTime('ngay_ket_thuc')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('spa_nhap_kho', function (Blueprint $table) {
            $table->id();
            $table->string('ma_phieu', 20)->unique();
            $table->unsignedBigInteger('nha_cung_cap_id')->nullable();
            $table->dateTime('ngay_nhap');
            $table->unsignedBigInteger('nguoi_nhap_id');
            $table->decimal('tong_tien', 15, 2)->default(0);
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });

        Schema::create('spa_nhap_kho_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('phieu_nhap_id');
            $table->unsignedBigInteger('san_pham_id');
            $table->integer('so_luong');
            $table->decimal('don_gia', 15, 2);
            $table->decimal('thanh_tien', 15, 2);
            $table->date('ngay_san_xuat')->nullable();
            $table->date('han_su_dung')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spa_nhap_kho_chi_tiet');
        Schema::dropIfExists('spa_nhap_kho');
        Schema::dropIfExists('spa_combo_san_pham');
        Schema::dropIfExists('spa_san_pham');
        Schema::dropIfExists('spa_thuong_hieu');
        Schema::dropIfExists('spa_danh_muc_san_pham');
    }
};
