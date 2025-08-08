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
        Schema::create('bed', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->integer('so_giuong')->nullable();
            $table->text('note')->nullable();

            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
            $table->string('lucky_id')->nullable();
        });

        Table::create([
            'name' => 'bed',
            'display_name' => 'Phòng/Giường',
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
        ]);
        $tbl = Table::where('name', 'bed')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        MigrateService::createColumn02($tableId, 'name', 'Tên Phòng/Giường', 'VARCHAR', 'text', $order_col++, 
        ['require' => 1, 'is_view_detail' => 1, 'add2search' => 1, 'show_in_list' => 1, 'col'=>12]);


        MigrateService::createColumn02($tableId, 'sort_order', 'Số thứ tự giường', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'col'=>12]);
        MigrateService::createColumn02($tableId, 'so_giuong', 'Số giường trong phòng', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'col'=>12]);
        MigrateService::createColumn02($tableId, 'note', 'Ghi chú', 'TEXT', 'textarea', $order_col++, 
        ['show_in_list' => 1, 'col'=>24]);

        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($tableId, 'create_by', 'Tạo bởi', 'INT', config('constant.config_table.type_edit.select'), $order_col++, ['edit' => 0]);
        
        MigrateService::createColumn02($tableId, 'created_at', 'Ngày tạo', 'INT', config('constant.config_table.type_edit.date'), $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($tableId, 'updated_at', 'Ngày tạo', 'INT', config('constant.config_table.type_edit.date'), $order_col++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bed');
    }
};
