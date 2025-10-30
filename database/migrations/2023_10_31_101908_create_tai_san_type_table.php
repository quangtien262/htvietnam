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
        Schema::create('tai_san_type', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('description')->nullable();
            $table->string('color')->nullable();

            MigrateService::createBaseColumn($table);
        });


        Table::create([
            //require
            'name' => 'tai_san_type',
            'display_name' => 'Phân loại tài sản',
            'parent_id' => 0,
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
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
        $tbl = Table::where('name', 'tai_san_type')->first();
        $order_col = 1;
        MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02(
            $tbl->id,
            'name',
            'Tên loại',
            'VARCHAR',
            'text',
            $order_col++,
            ['show_in_list' => 1]
        );

        MigrateService::createColumn02(
            $tbl->id,
            'color',
            'Màu đánh dấu',
            'VARCHAR',
            'color',
            $order_col++,
            ['show_in_list' => 1, 'is_view_detail' => 1]
        );

        MigrateService::createColumn02(
            $tbl->id,
            'name',
            'Mô tả về trạng thái',
            'VARCHAR',
            'text',
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
        Schema::dropIfExists('tai_san_type');
    }
};
