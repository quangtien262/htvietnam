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
        Schema::create('loai_nha_cung_cap', function (Blueprint $table) {  //Nhà cung cấp
            $table->id();
            $table->string('code')->nullable(); //mã nhà cung cấp
            $table->string('name')->nullable(); //tên nhà cung cấp
            $table->string('color')->nullable();

            MigrateService::createBaseColumn($table);
        });

        Table::create([
            //require
            'name' => 'loai_nha_cung_cap',
            'display_name' => 'Loại Nhà cung cấp ',
            'parent_id' => 0,
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 0, // 1 hiển thị ở menu; 0 không hiển thị
            'form_data_type' => 2,
            'expandable' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,
            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
        ]);
        $tbl = Table::where('name', 'loai_nha_cung_cap')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($tableId, 'name', 'Loại nhà cung cấp', 'VARCHAR', 'text', $order_col++, ['require' => 1, 'show_in_list' => 1, 'is_view_detail' => 1]);
        MigrateService::createColumn02($tableId, 'color', 'Màu đánh dấu', 'VARCHAR', 'color', $order_col++, ['require' => 1, 'show_in_list' => 1, 'is_view_detail' => 1]);
        MigrateService::baseColumn($tbl);

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loai_nha_cung_cap');
    }
};
