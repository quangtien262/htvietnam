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
        Schema::create('user_source', function (Blueprint $table) { // trạng thái phiếu dặt hàng
            $table->id();
            $table->string('name')->nullable();

            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });

        $order_col = 1;
        Table::create([
            'name' => 'user_source',
            'display_name' => 'Nguồn khách hàng',
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 1,
            'show_in_menu' => 1,
            'form_data_type' => 2,
            'have_delete' => 1,
            'have_add_new' => 1,
            'parent_id' => 0,
            'is_show_btn_edit' => 1,
            'is_show_btn_detail' => 0,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
            'expandable' => 0
        ]);

        $tbl = Table::where('name', 'user_source')->first();

         MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($tbl->id, 'name', 'Trạng thái', 'VARCHAR', 'text', $order_col++, 
        ['require' => 1,'is_view_detail' => 1]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_source');
    }
};
