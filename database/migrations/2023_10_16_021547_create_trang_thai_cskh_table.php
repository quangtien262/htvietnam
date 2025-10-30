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
        Schema::create('trang_thai_cskh', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->text('description')->nullable();
            
            MigrateService::createBaseColumn($table);
        });
        Table::create([
            //require
            'name' => 'trang_thai_cskh',
            'display_name' => 'Trạng thái CSKH',
            'parent_id' => 0,
            'sort_order' => 0,
            'type_show' => config('constant.type_show.drag_drop'),
            'count_item_of_page' => 30,
            'is_edit' => 1, // 1 hiển thị ở menu; 0 không hiển thị
            'form_data_type' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,

            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
        ]);
        $tbl = Table::where('name', 'trang_thai_cskh')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($tableId, 'name', 'Trạng thái', 'VARCHAR', 'text', $order_col++, ['require' => 1,'is_view_detail' => 1]);
        MigrateService::createColumn02($tableId, 'description', 'Mô tả', 'TEXT', 'textarea', $order_col++);

       
      
        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trang_thai_cskh');
    }
};
