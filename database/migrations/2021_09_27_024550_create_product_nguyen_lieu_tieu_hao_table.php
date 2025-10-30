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
        Schema::create('product_nguyen_lieu_tieu_hao', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->integer('product_id')->nullable(); // product maping
            $table->string('product_code')->nullable();

            $table->integer(column: 'nguyen_lieu_id')->nullable(); //product_id
            $table->integer('so_luong')->nullable();
            $table->integer(column: 'don_vi_id')->nullable(); //product_id
            $table->integer(column: 'gia_theo_don_vi_quy_doi')->nullable(); //product_id
            $table->integer(column: 'gia_theo_don_vi_chinh')->nullable(); //product_id

            MigrateService::createBaseColumn($table);

        });

        $order_col = 1;
        $config = ['search_position' => 1];
        $tbl = MigrateService::createTable02( 'product_nguyen_lieu_tieu_hao', 'Nhóm hàng hóa',  $config);
        
        MigrateService::createColumn02($tbl->id, 'name', 'Nhóm hàng hóa', 'VARCHAR', 'text', $order_col++,
            ['require' => 1,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 1]);

        MigrateService::createColumn02($tbl->id, 'product_id', 'Sản phẩm', 'INT', 'number', $order_col++,[]);
        MigrateService::createColumn02($tbl->id, 'so_luong', 'Số lượng', 'INT', 'number', $order_col++,[]);
        MigrateService::createColumn02($tbl->id, 'nguyen_lieu_id', 'Nguyên liệu', 'INT', 'number', $order_col++,[]);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_nguyen_lieu_tieu_hao');
    }
};
