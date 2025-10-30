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
        Schema::create('nha_cung_cap_status', function (Blueprint $table) { //trạng thái nhà cung cấp
            $table->id();
            $table->string('name');   
            $table->string('color');   
            
            MigrateService::createBaseColumn($table);
        });
        Table::create([
            'name' => 'nha_cung_cap_status',
            'display_name' => 'Trạng thái nhà cung cấp',
            'sort_order' => 0,
            'type_show' => config('constant.type_show.drag_drop_multiple'),
            'count_item_of_page' => 30,
            'is_edit' => 0,
            'form_data_type' => 2,
            'have_delete' => 1,
            'have_add_new' => 1,
            'parent_id' => 0,
            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
        ]);
        $tbl = Table::where('name', 'nha_cung_cap_status')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++,['edit' => 0]);
        MigrateService::createColumn02($tableId, 'name', 'Trạng thái', 'VARCHAR', 'text', $order_col++, 
        ['require' => 1,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 1]);
        MigrateService::createColumn02($tableId, 'color', 'Màu sắc', 'VARCHAR', 'color', $order_col++, 
        ['require' => 0,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 1]);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nha_cung_cap_status');
    }
};
