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
        Schema::create('product_thuoc_tinh', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();

            MigrateService::createBaseColumn($table);

        });



        Table::create([
            'name' => 'product_thuoc_tinh',
            'display_name' => 'Thuộc tính',
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 1,
            'form_data_type' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,
            'parent_id' => 0,
            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
            'search_position'=>1
        ]);
        $tbl = Table::where('name', 'product_thuoc_tinh')->first();
        $tableId = $tbl->id;
        $order_col = 1;

        MigrateService::createColumn02(
            $tableId,
            'block_hh',
            'Thông tin hàng hóa',
            'INT',
            'number',
            0,
            [
                'block_type' => 'block_basic',
            ]
        );
        $hh = Column::where('table_id', $tableId)->where('name', 'block_hh')->first();

        MigrateService::createColumn02(
            $tableId,
            'block_tt_khac',
            'Thông tin khác',
            'INT',
            'number',
            3,
            [
                'block_type' => 'block_basic',
            ]
        );
        $tt_khac = Column::where('table_id', $tableId)->where('name', 'block_tt_khac')->first();


       
        MigrateService::createColumn02(
            $tableId,
            'id',
            'id',
            'INT',
            'number',
            $order_col++,
            ['edit' => 0]
        );
        MigrateService::createColumn02($tableId, 'name', 'Tên ', 'VARCHAR', 'text', $order_col++, 
        [ 'parent_id' => $hh->id, 'show_in_list' => 1,'is_view_detail' => 1]);

        MigrateService::baseColumn($tbl);
               


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_thuoc_tinh');
    }
};
