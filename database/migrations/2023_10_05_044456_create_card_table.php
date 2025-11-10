<?php

use App\Models\Admin\Column;
use App\Models\Admin\Table;
use App\Services\MigrateService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('card', function (Blueprint $table) {
            $table->id();
            
            $table->text('card_service_ids')->nullable();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->string('product_id')->default(0)->nullable();

            $table->integer('so_luong')->default(1)->nullable();
            $table->integer('so_luong_da_su_dung')->default(0)->nullable();
            $table->integer('so_luong_con_lai')->default(0)->nullable();

            $table->string('hoa_don_chi_tiet_id')->default(0)->nullable();
            $table->integer('card_group_id')->nullable();
            $table->date('ngay_mua')->nullable();
            $table->date('ngay_ap_dung')->nullable();
            $table->date('ngay_het_han')->nullable();
            $table->integer('users_id')->nullable(); // khach hang
            $table->integer('menh_gia_the')->default(0)->nullable();
            $table->integer('giamn_gia')->default(0)->nullable();
            $table->integer('thanh_tien')->default(0)->nullable();


            $table->integer('chi_nhanh_id')->default(1)->nullable(); // ID_DonVi
            $table->integer('phan_tram_tang_them')->nullable();
            $table->integer('tien_tang_them')->nullable();
            
            // $table->string('HuyThe')->nullable();
            // $table->integer('SoLanDuocSuDung')->nullable();
            // $table->string('ID_DacDiemKhachHang')->nullable();
            // $table->string('MaNhanVienTuVan')->nullable();
            $table->string('TenNhanVienTuVan')->nullable();

            // $table->string('quan_li_the_id')->nullable();


            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card');
    }
};
