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
        Schema::create('product_xuat_huy_detail', function (Blueprint $table) {
            $table->id();
            $table->string('data_id')->nullable();
            $table->string('name')->nullable();
            $table->integer('code')->default(0)->nullable();

            $table->integer('product_id')->default(0)->nullable();
            $table->string('product_name')->nullable();
            $table->string('product_code')->nullable();

            $table->integer('so_luong_huy')->default(0)->nullable();
            $table->integer('gia_von')->default(0)->nullable();
            $table->integer('gia_tri_huy')->default(0)->nullable();

            $table->integer('ton_kho_truoc_khi_huy')->default(0)->nullable();
            $table->integer('ton_kho_sau_khi_huy')->default(0)->nullable();

           MigrateService::createBaseColumn($table);

        });



        Table::create([
            'name' => 'product_xuat_huy_detail',
            'display_name' => 'Kiểm kho chi tiet',
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 0,
            'form_data_type' => 2,
            'have_delete' => 0,
            'have_add_new' => 1,
            'parent_id' => 0,
            'is_show_btn_edit' => 0,
            'is_show_btn_detail' => 0,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
            'expandable' => 0
        ]);
        $tbl = Table::where('name', 'product_xuat_huy_detail')->first();
        $tableId = $tbl->id;
        $order_col = 1;

        MigrateService::createColumn02(
            $tableId,
            'id',
            'id',
            'INT',
            'number',
            $order_col++,
            ['edit' => 0]
        );

        MigrateService::createColumn02($tableId, 'name', 'Tiêu đề', 'VARCHAR', 'text', $order_col++, 
        ['show_in_list' => 1, 'edit' => 0]);

        MigrateService::createColumn02($tableId, 'code', 'Mã kiểm kho', 'VARCHAR', 'text', $order_col++,
            ['is_view_detail' => 1, 'show_in_list' => 1, 'auto_generate_code' => '{"edit":0, "prefix":"HD", "length":5}']);
        
        MigrateService::createColumn02($tableId, 'thuc_te', 'Thực tế', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'require' => 1]);

        // kiem kho chi tiet
        $prod = Table::where('name', 'product_xuat_huy_detail')->first();
        MigrateService::createColumn02($tableId, 'product_id', 'Hàng hóa', 'INT', 'data_detail', $order_col++, 
        [ 'show_in_list' => 1,'select_table_id' => $prod->id, 'require' => 1]);

        MigrateService::createColumn02($tableId, 'ton_kho', 'Tồn kho', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 0]);
        MigrateService::createColumn02($tableId, 'so_luong_lech', 'SL lêch', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 0]);
        MigrateService::createColumn02($tableId, 'gia_tri_lech', 'Giá trị lệch', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 0]);

        MigrateService::createColumn02($tableId, 'ton_kho_truoc_khi_huy', 'Tồn trước khi hủy', 'INT', 'number', $order_col++, 
        ['show_in_list' => 0, 'require' => 0, 'edit' => 0,'show_in_detail' => 0]);
        
        MigrateService::createColumn02($tableId, 'ton_kho_sau_khi_huy', 'Tồn sau khi hủy', 'INT', 'number', $order_col++, 
        ['show_in_list' => 0, 'require' => 0, 'edit' => 0,'show_in_detail' => 0]);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_xuat_huy_detail');
    }
};
