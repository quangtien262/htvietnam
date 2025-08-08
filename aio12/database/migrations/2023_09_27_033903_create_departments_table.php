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
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->text('description')->nullable();
            $table->integer('chi_nhanh_id')->nullable();

            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });
        Table::create([
            'name' => 'departments',
            'display_name' => 'Phòng ban',
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
        $tbl = Table::where('name', 'departments')->first();
        $tableId = $tbl->id;
        $order_col = 1;
       MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++,['edit' => 0]);
        MigrateService::createColumn02($tableId, 'name', 'Phòng ban', 'VARCHAR', 'text', $order_col++,['require' => 1,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 1]);
        MigrateService::createColumn($tableId, 'description', 'Mô tả ngắn', 'TEXT', 'textarea', $order_col++, 1_0);
        MigrateService::createColumn($tableId, 'chi_nhanh_id', 'Chi nhánh', 'INT', 'select', 2, 1, 1, 1, 1, 30);
        $chiNhanh = Table::where('name', 'chi_nhanh')->first();
        MigrateService::createColumn($tableId, 'chi_nhanh_id', 'Chi nhánh trực thuộc', 'INT', 'select', $order_col++, 1, 1, 1, 1, $chiNhanh->id,'',0,1);

        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
