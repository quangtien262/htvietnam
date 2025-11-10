<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spa_ktv', function (Blueprint $table) {
            $table->id();
            $table->string('ma_ktv', 20)->unique();
            $table->unsignedBigInteger('admin_user_id');
            $table->json('chuyen_mon_ids')->nullable()->comment('Specialty service category IDs');
            $table->enum('trinh_do', ['junior', 'senior', 'expert', 'master'])->default('junior');
            $table->json('chung_chi_ids')->nullable()->comment('Certificate IDs');
            $table->integer('so_nam_kinh_nghiem')->default(0);
            $table->decimal('rating_tb', 3, 2)->default(0);
            $table->integer('so_luot_danh_gia')->default(0);
            $table->decimal('luong_co_ban', 15, 2)->default(0);
            $table->decimal('phan_tram_hoa_hong', 5, 2)->default(20);
            $table->decimal('target_doanh_thu_thang', 15, 2)->default(0);
            $table->string('avatar_url', 500)->nullable();
            $table->text('mo_ta_ngan')->nullable();
            $table->boolean('is_active')->default(true);
            $table->date('ngay_vao_lam')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('spa_ktv_lich_lam_viec', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ktv_id');
            $table->integer('thu')->comment('2-8 for Mon-Sun');
            $table->time('ca_sang_bat_dau')->nullable();
            $table->time('ca_sang_ket_thuc')->nullable();
            $table->time('ca_chieu_bat_dau')->nullable();
            $table->time('ca_chieu_ket_thuc')->nullable();
            $table->boolean('is_nghi_phep')->default(false);
            $table->timestamps();

            $table->unique(['ktv_id', 'thu']);
        });

        Schema::create('spa_ktv_nghi_phep', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ktv_id');
            $table->date('ngay_bat_dau');
            $table->date('ngay_ket_thuc');
            $table->enum('loai_nghi', ['phep', 'om', 'khac'])->default('phep');
            $table->text('ly_do')->nullable();
            $table->enum('trang_thai', ['cho_duyet', 'da_duyet', 'tu_choi'])->default('cho_duyet');
            $table->unsignedBigInteger('nguoi_duyet_id')->nullable();
            $table->dateTime('ngay_duyet')->nullable();
            $table->timestamps();
        });

        Schema::create('spa_ktv_hoa_hong', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ktv_id');
            $table->unsignedBigInteger('hoa_don_id');
            $table->enum('loai', ['dich_vu', 'san_pham', 'tip'])->default('dich_vu');
            $table->decimal('gia_tri_goc', 15, 2)->default(0);
            $table->decimal('phan_tram', 5, 2)->default(0);
            $table->decimal('tien_hoa_hong', 15, 2)->default(0);
            $table->date('thang')->comment('YYYY-MM-DD format, day always 01');
            $table->timestamps();

            $table->index(['ktv_id', 'thang']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spa_ktv_hoa_hong');
        Schema::dropIfExists('spa_ktv_nghi_phep');
        Schema::dropIfExists('spa_ktv_lich_lam_viec');
        Schema::dropIfExists('spa_ktv');
    }
};
