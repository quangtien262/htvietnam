<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chien_dich_marketing', function (Blueprint $table) {
            $table->id();
            $table->string('ma_chien_dich', 50)->unique()->comment('Mã chiến dịch: CD0001');
            $table->string('ten_chien_dich');
            $table->enum('loai_chien_dich', ['facebook_ads', 'google_ads', 'email', 'sms', 'event', 'other'])->default('other');
            $table->decimal('ngan_sach', 15, 2)->default(0);
            $table->decimal('chi_phi_thuc_te', 15, 2)->default(0);
            $table->date('ngay_bat_dau');
            $table->date('ngay_ket_thuc')->nullable();
            $table->integer('so_leads_tao_ra')->default(0);
            $table->integer('so_khach_hang_chuyen_doi')->default(0);
            $table->decimal('doanh_thu', 15, 2)->default(0)->comment('Doanh thu từ chiến dịch');
            $table->decimal('roi', 10, 2)->default(0)->comment('Return on Investment %');
            $table->text('mo_ta')->nullable();
            $table->enum('trang_thai', ['planning', 'running', 'paused', 'completed', 'cancelled'])->default('planning');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chien_dich_marketing');
    }
};
