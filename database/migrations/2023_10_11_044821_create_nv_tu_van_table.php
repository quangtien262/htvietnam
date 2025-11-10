<?php

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
        // lucky: nhanvientuvan
        Schema::create('nv_tu_van', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();

            $table->integer('data_id')->nullable();

            $table->integer('admin_users_id')->nullable();
            $table->integer('loai_chung_tu')->default(12)->nullable();
            $table->integer('hoa_don_chi_tiet_id')->nullable();

            $table->integer('hinh_thuc_chiet_khau_id')->nullable();
            $table->integer('tien_chiet_khau')->nullable();
            $table->integer('phan_tram_chiet_khau')->default(0)->nullable();
            $table->integer('la_nv_chinh')->default(1)->nullable();
            $table->integer('chiet_khau_theo_thuc_thu')->default(0)->nullable();
            $table->integer('phan_tram_doanh_thu_duoc_huong')->default(0)->nullable();
            $table->integer('duoc_yeu_cau')->default(0)->nullable();
            $table->integer('chi_phi_thuc_hien')->default(0)->nullable();
            $table->integer('phan_tram_chi_phi_thuc_hien')->default(0)->nullable();
            $table->text('note')->nullable();

            $table->string('lucky_id')->default(0)->nullable();

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
        Schema::dropIfExists('nv_tu_van');
    }
};
