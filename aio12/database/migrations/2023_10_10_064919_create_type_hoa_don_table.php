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
        Schema::create('type_hoa_don', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });
        Table::create([
            //require
            'name' => 'type_hoa_don',
            'display_name' => 'Kiểu hóa đơn',
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
        $tbl = Table::where('name', 'type_hoa_don')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($tableId, 'name', 'Kiểu hóa đơn', 'VARCHAR', 'text', $order_col++, ['require' => 1, 'show_in_list', 'is_view_detail' => 1]);
      
    
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('type_hoa_don');
    }
};
