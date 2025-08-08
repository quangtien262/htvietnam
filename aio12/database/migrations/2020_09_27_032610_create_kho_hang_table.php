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
        Schema::create('kho_hang', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->integer('chi_nhanh_id')->nullable();
            $table->text('address')->nullable();
            MigrateService::createBaseColumn($table);
        });
        Table::create([
            'name' => 'kho_hang',
            'display_name' => 'Kho hàng',
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 1,
            'form_data_type' => 2, //1: new page, 2: popup
            'expandable' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,
            'parent_id' => 0,
            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
        ]);
        $tbl = Table::where('name', 'kho_hang')->first();
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
        
        MigrateService::createColumn02($tableId, 'code', 'Mã kho', 'VARCHAR', 'text', $order_col++,
        ['show_in_list' => 1,'add2search' => 1, 'auto_generate_code' => '{"edit":0, "prefix":"KHO", "length":5}']);
        
        MigrateService::createColumn02($tableId, 'name', 'Tên kho hàng', 'VARCHAR', 'text', $order_col++, ['require' => 1,'show_in_list' => 1,'is_view_detail' => 1]);

        $chiNhanh = Table::where('name', 'chi_nhanh')->first();
        MigrateService::createColumn02($tableId, 'chi_nhanh_id', 'Chi nhánh', 'INT', 'select', $order_col++, 
        ['select_table_id' =>  $chiNhanh->id, 'require' => 0,'show_in_list' => 1,'add2search' => 1,'add_express' => 1]);

        MigrateService::createColumn02($tableId, 'address', 'Địa chỉ', 'TEXT', 'textarea', $order_col++, 
        ['require' => 0, 'add_express' => 1,'is_view_detail' => 1, 'show_in_list' => 1]);
        
        MigrateService::baseColumn($tbl);

    }
 
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kho_hang');
    }
};
