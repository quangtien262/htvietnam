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
        // dịch vụ trong gói
        Schema::create('product_dich_vu_trong_goi', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->integer('product_id')->nullable();
            $table->integer('id_dich_vu_ap_dung')->nullable(); // product_id
            $table->integer('so_luong')->nullable();
            $table->integer('price')->nullable(); // giá sản phẩm

            MigrateService::createBaseColumn($table);

        });

        $order_col = 1;
        $config = ['search_position' => 1];
        $tbl = MigrateService::createTable02( 'product_dich_vu_trong_goi', 'Dịch vụ áp dụng',  $config);
        
        MigrateService::createColumn02($tbl->id, 'name', 'Tên', 'VARCHAR', 'text', $order_col++,['require' => 1,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'product_id', 'Thẻ', 'INT', 'number', $order_col++,[]);
        MigrateService::createColumn02($tbl->id, 'id_dich_vu_ap_dung', 'DV Áp dụng', 'INT', 'number', $order_col++,[]);
        MigrateService::baseColumn($tbl);

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_dich_vu_trong_goi');
    }
};
