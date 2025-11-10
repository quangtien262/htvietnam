<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spa_khach_hang', function (Blueprint $table) {
            $table->id();
            $table->string('ma_khach_hang', 20)->unique();
            $table->string('ho_ten', 255);
            $table->string('sdt', 20)->index();
            $table->string('email', 255)->nullable();
            $table->date('ngay_sinh')->nullable();
            $table->enum('gioi_tinh', ['nam', 'nu', 'khac'])->nullable();
            $table->text('dia_chi')->nullable();
            $table->unsignedBigInteger('thanh_pho_id')->nullable();
            $table->unsignedBigInteger('quan_huyen_id')->nullable();
            $table->string('nguon_khach', 100)->nullable()->comment('Facebook, Google, Referral, Walk-in');
            $table->dateTime('ngay_tao')->nullable();
            $table->dateTime('lan_den_cuoi')->nullable();
            $table->decimal('tong_chi_tieu', 15, 2)->default(0);
            $table->integer('so_lan_den')->default(0);
            $table->integer('diem_tich_luy')->default(0);
            $table->enum('loai_khach', ['VIP', 'Thuong', 'Moi'])->default('Moi');
            $table->string('avatar_url', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('spa_ho_so_suc_khoe', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('khach_hang_id');
            $table->json('tien_su_benh')->nullable()->comment('tim mạch, tiểu đường, huyết áp...');
            $table->json('di_ung')->nullable()->comment('thuốc, mỹ phẩm, thực phẩm...');
            $table->json('thuoc_dang_dung')->nullable();
            $table->boolean('mang_thai')->default(false);
            $table->boolean('cho_con_bu')->default(false);
            $table->text('ghi_chu_suc_khoe')->nullable();
            $table->timestamps();
        });

        Schema::create('spa_ho_so_da', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('khach_hang_id');
            $table->dateTime('ngay_cap_nhat');
            $table->enum('loai_da', ['kho', 'dau', 'hon_hop', 'nhay_cam', 'thuong'])->nullable();
            $table->json('van_de_da')->nullable()->comment('mụn, nám, nhăn, lỗ chân lông...');
            $table->integer('muc_do_nghiem_trong')->default(1)->comment('1-10');
            $table->json('san_pham_dang_dung')->nullable();
            $table->unsignedBigInteger('lieu_trinh_de_xuat_id')->nullable();
            $table->text('ghi_chu_tu_van')->nullable();
            $table->json('anh_truoc_ids')->nullable();
            $table->json('anh_sau_ids')->nullable();
            $table->timestamps();
        });

        Schema::create('spa_progress_photos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('khach_hang_id');
            $table->dateTime('ngay_chup');
            $table->enum('loai_anh', ['truoc_dieu_tri', 'sau_dieu_tri', 'theo_doi'])->default('truoc_dieu_tri');
            $table->unsignedBigInteger('lieu_trinh_id')->nullable();
            $table->unsignedBigInteger('dich_vu_id')->nullable();
            $table->string('image_url', 500);
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spa_progress_photos');
        Schema::dropIfExists('spa_ho_so_da');
        Schema::dropIfExists('spa_ho_so_suc_khoe');
        Schema::dropIfExists('spa_khach_hang');
    }
};
