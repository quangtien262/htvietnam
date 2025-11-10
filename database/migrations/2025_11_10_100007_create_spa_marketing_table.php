<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spa_chuong_trinh_km', function (Blueprint $table) {
            $table->id();
            $table->string('ten_chuong_trinh', 255);
            $table->enum('loai', ['giam_gia', 'tang_diem', 'tang_qua', 'mua_1_tang_1'])->default('giam_gia');
            $table->dateTime('ngay_bat_dau');
            $table->dateTime('ngay_ket_thuc');
            $table->json('dieu_kien')->nullable()->comment('min_value, membership_tier, new_customer...');
            $table->decimal('gia_tri_giam', 15, 2)->default(0)->comment('Amount or percentage');
            $table->boolean('la_phan_tram')->default(false);
            $table->decimal('giam_toi_da', 15, 2)->default(0);
            $table->json('ap_dung_cho')->nullable()->comment('dich_vu_ids, san_pham_ids or all');
            $table->integer('so_luong_voucher')->default(0);
            $table->integer('da_su_dung')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('spa_voucher', function (Blueprint $table) {
            $table->id();
            $table->string('ma_voucher', 50)->unique();
            $table->unsignedBigInteger('chuong_trinh_km_id')->nullable();
            $table->unsignedBigInteger('khach_hang_id')->nullable()->comment('Specific customer or null for public');
            $table->decimal('gia_tri_giam', 15, 2)->default(0);
            $table->boolean('la_phan_tram')->default(false);
            $table->decimal('giam_toi_da', 15, 2)->default(0);
            $table->json('dieu_kien_su_dung')->nullable();
            $table->dateTime('ngay_het_han');
            $table->enum('trang_thai', ['chua_su_dung', 'da_su_dung', 'het_han'])->default('chua_su_dung');
            $table->dateTime('ngay_su_dung')->nullable();
            $table->timestamps();

            $table->index('ma_voucher');
        });

        Schema::create('spa_email_campaign', function (Blueprint $table) {
            $table->id();
            $table->string('ten_campaign', 255);
            $table->string('muc_dich', 255)->nullable();
            $table->string('subject', 255);
            $table->text('noi_dung_html');
            $table->json('danh_sach_gui')->nullable()->comment('Customer IDs array');
            $table->json('segment_filter')->nullable()->comment('tier, rfm_segment filters');
            $table->dateTime('ngay_gui')->nullable();
            $table->time('gio_gui')->nullable();
            $table->integer('da_gui')->default(0);
            $table->integer('thanh_cong')->default(0);
            $table->integer('that_bai')->default(0);
            $table->decimal('ty_le_mo', 5, 2)->default(0)->comment('Open rate %');
            $table->decimal('ty_le_click', 5, 2)->default(0)->comment('Click rate %');
            $table->enum('trang_thai', ['draft', 'scheduled', 'sending', 'sent'])->default('draft');
            $table->timestamps();
        });

        Schema::create('spa_sms_campaign', function (Blueprint $table) {
            $table->id();
            $table->string('ten_campaign', 255);
            $table->text('noi_dung');
            $table->json('danh_sach_gui')->nullable();
            $table->dateTime('ngay_gui')->nullable();
            $table->integer('da_gui')->default(0);
            $table->integer('thanh_cong')->default(0);
            $table->integer('that_bai')->default(0);
            $table->enum('trang_thai', ['draft', 'scheduled', 'sending', 'sent'])->default('draft');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spa_sms_campaign');
        Schema::dropIfExists('spa_email_campaign');
        Schema::dropIfExists('spa_voucher');
        Schema::dropIfExists('spa_chuong_trinh_km');
    }
};
