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
        Schema::create('product_nhap_hang_detail', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('data_id')->nullable();
            $table->integer('product_id')->default(0)->nullable();
            $table->string('product_name')->nullable();
            $table->string('product_code')->nullable();

            $table->integer('gia_nhap')->default(0)->nullable();
            $table->integer('giam_gia')->default(0)->nullable();
            $table->integer('so_luong')->default(0)->nullable();
            $table->integer('thanh_tien')->default(0)->nullable();

            $table->integer('phi_van_chuyen')->default(0)->nullable();

            // $table->integer('nhap_hang_status_id')->default(1)->nullable();
            $table->integer('nha_cung_cap_id')->default(0)->nullable();
            $table->integer('nhan_vien_id')->default(0)->nullable();
            $table->integer('chi_nhanh_id')->default(0)->nullable();

            MigrateService::createBaseColumn($table);

        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_nhap_hang_detail');
    }
};
