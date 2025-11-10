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
        Schema::create('product_nhap_hang', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();

            $table->integer('tong_tien_hang')->default(0)->nullable();
            $table->integer('giam_gia')->default(0)->nullable();
            $table->integer('thanh_tien')->default(0)->nullable();
            $table->integer('so_luong')->default(0)->nullable();
            $table->integer('tong_phi_van_chuyen')->default(0)->nullable();

            $table->integer('cong_no_status_id')->default(1)->nullable(); 

            // $table->integer('nhap_hang_status_id')->default(1)->nullable();
            $table->integer('nha_cung_cap_id')->default(0)->nullable();
            $table->integer('nhan_vien_id')->default(0)->nullable();
            $table->integer('kho_hang_id')->default(0)->nullable();
            
            $table->integer('hinh_thuc_thanh_toan_id')->nullable();

            $table->integer('da_thanh_toan')->default(0)->nullable();
            $table->integer('cong_no')->default(0)->nullable();
            $table->date('ngay_tat_toan')->nullable();

            $table->text('note')->nullable();

            $table->text('sub_data_ids')->nullable();

            // format array info
            //     product_id: null,
            //     product_name: '',
            //     product_code: '',
            //     so_luong: 0, // so_luong_thuc_te
            //     gia_von: 0,
            //     giam_gia: 0,
            //     thanh_tien: 0,
            //     phi_van_chuyen:0
            $table->longText('info')->nullable();

            MigrateService::createBaseColumn($table);

        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_nhap_hang');
    }
};
