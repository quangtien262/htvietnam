<?php

use App\Models\Admin\Column;
use App\Models\Admin\Table;
use App\Services\MigrateService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */

    public function up(): void
    {
        Schema::create('ly_do_xuat_huy', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('color')->nullable();

            MigrateService::createBaseColumn($table);

        });



        Table::create([
            'name' => 'ly_do_xuat_huy',
            'display_name' => 'Lý do xuất kho',
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 1,
            'show_in_menu' => 0,
            'form_data_type' => 2,
            'have_delete' => 1,
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

        $tbl = Table::where('name', 'ly_do_xuat_huy')->first();
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

        MigrateService::createColumn02($tableId, 'name', 'Tên', 'VARCHAR', 'text', $order_col++, 
        ['show_in_list' => 1, 'edit' => 0]);
        MigrateService::createColumn02($tableId, 'Color', 'Màu đánh dấu', 'VARCHAR', 'color', $order_col++, 
        ['show_in_list' => 1, 'edit' => 1]);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ly_do_xuat_huy');
    }
};
