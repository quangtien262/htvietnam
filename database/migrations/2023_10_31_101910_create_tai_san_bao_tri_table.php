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
        Schema::create('tai_san_bao_tri', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('tai_san_id')->nullable();
            $table->date('ngay_bao_tri')->nullable();
            $table->string('note')->nullable(); // kết quả bảo trì

            MigrateService::createBaseColumn($table);
        });


        Table::create([
            //require
            'name' => 'tai_san_bao_tri',
            'display_name' => 'Bảo trì tài sản',
            'parent_id' => 0,
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 0, // 1 hiển thị ở menu; 0 không hiển thị
            'form_data_type' => 2,
            'have_delete' => 1,
            'have_add_new' => 1,

            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
        ]);
        $tbl = Table::where('name', 'tai_san_bao_tri')->first();
        $order_col = 1;
        MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        
        MigrateService::createColumn02(
            $tbl->id,
            'name',
            'Tiêu đề',
            'VARCHAR',
            'text',
            $order_col++,
            ['show_in_list' => 1]
        );


        $ts = Table::where('name', 'tai_san')->first();
        MigrateService::createColumn02(
            $tbl->id,
            'tai_san_id',
            'Tài sản',
            'INT',
            'select',
            $order_col++,
            ['select_table_id' => $ts->id, 'show_in_list' => 1, 'add2search' => 1, 'edit' => 1,'require' => 1]
        );

        MigrateService::createColumn02(
            $tbl->id,
            'ngay_bao_tri',
            'Ngày bảo trì',
            'DATE',
            'date',
            $order_col++,
            ['require' => 1, 'show_in_list' => 1]
        );

        MigrateService::createColumn02(
            $tbl->id,
            'note',
            'Ghi chú',
            'text',
            'textarea',
            $order_col++,
            ['show_in_list' => 1]
        );


        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tai_san_bao_tri');
    }
};
