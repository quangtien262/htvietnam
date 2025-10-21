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
        Schema::create('room_dien_nuoc', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('room_id')->nullable();
            $table->string('hop_dong_id')->nullable();
            $table->string('so_dien')->nullable();
            $table->string('so_nuoc')->nullable();
            $table->string('so_may_bom')->nullable();
            $table->string('othe')->nullable();
            $table->string('note')->nullable();

            MigrateService::createBaseColumn($table);

            Table::create([
                //require
                'name' => 'room_dien_nuoc',
                'display_name' => 'Dịch vụ',
                'parent_id' => 0,
                'sort_order' => 0,
                'type_show' => config('constant.type_show.basic'),
                'count_item_of_page' => 30,
                'is_edit' => 1, // 1 hiển thị ở menu; 0 không hiển thị
                'form_data_type' => 2,
                'have_delete' => 1,
                'have_add_new' => 1,

                'is_show_btn_edit' => 1,
                'tab_table_id' => 0,
                'tab_table_name' => '',
                'table_data' => '',
                'is_label' => 0,
            ]);
            $tbl = Table::where('name', 'room_dien_nuoc')->first();
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
            MigrateService::createColumn02(
                $tableId,
                'name',
                'Tên',
                'VARCHAR',
                'text',
                $order_col++,
                ['show_in_list' => 1]
            );
            MigrateService::createColumn02(
                $tableId,
                'color',
                'Màu sắc đánh dấu',
                'INT',
                'VARCHAR',
                $order_col++,
                ['show_in_list' => 0]
            );
            MigrateService::createColumn02(
                $tableId,
                'background',
                'Màu nền đánh dấu',
                'INT',
                'VARCHAR',
                $order_col++,
                ['show_in_list' => 0]
            );

            MigrateService::baseColumn($tbl);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_dien_nuoc');
    }
};
