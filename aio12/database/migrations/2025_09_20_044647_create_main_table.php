<?php

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
        Schema::create('main', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('route')->nullable();
            $table->string('icon')->nullable();
            $table->string('table_id')->nullable();
            MigrateService::createBaseColumn($table);


            $order_col = 0;
            Table::create([
                'name' => 'main',
                'display_name' => 'Main',
                'sort_order' => 0,
                'type_show' => config('constant.type_show.basic'),
                'count_item_of_page' => 30,
                'is_edit' => 0,
                'form_data_type' => 2, //1: new page, 2: popup
                'expandable' => 1,
                'have_delete' => 1,
                'have_add_new' => 1,
                'parent_id' => 0,
                'is_show_btn_edit' => 1,
                'tab_table_id' => 0,
                'tab_table_name' => '',
                'table_data' => '',
                'is_label' => 0,
            ]);
            $tbl = Table::where('name', 'main')->first();
            
            MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++);
            MigrateService::createColumn02($tbl->id, 'name', 'Name', 'VARCHAR', 'text', $order_col++,
                ['require' => 1,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 1]);
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('main');
    }
};
