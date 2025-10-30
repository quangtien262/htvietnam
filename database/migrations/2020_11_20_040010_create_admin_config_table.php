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
        Schema::create('admin_config', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('phone01')->nullable();
            $table->string('phone02')->nullable();
            
            MigrateService::createBaseColumn($table);
        });
        Table::create([
            //require
            'name' => 'admin_config',
            'display_name' => 'Cài đặt phần mềm',
            'parent_id' => 0,
            'sort_order' => 0,
            'type_show' => config('constant.type_show.drag_drop'),
            'count_item_of_page' => 30,
            'is_edit' => 0, // 1 hiển thị ở menu; 0 không hiển thị
            'form_data_type' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,

            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
        ]);
        $tbl = Table::where('name', 'admin_config')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        
        MigrateService::createColumn02($tableId, 'name', 'Tên công ty', 'VARCHAR', 'text', $order_col++, 
        ['require' => 1, 'show_in_list', 'is_view_detail' => 1]);
        MigrateService::createColumn02($tableId, 'phone01', 'Hotline 01', 'VARCHAR', 'text', $order_col++);
        MigrateService::createColumn02($tableId, 'phone02', 'Hotline 02', 'VARCHAR', 'text', $order_col++);

        MigrateService::baseColumn($tbl);

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_config');
    }
};
