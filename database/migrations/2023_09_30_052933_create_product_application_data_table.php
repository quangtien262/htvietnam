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
        Schema::create('product_application_data', function (Blueprint $table) {
            $table->id();
            $table->string('name_data')->nullable();
            
            $table->integer('data_id')->nullable();
            $table->integer('languages_id')->nullable();

            MigrateService::createBaseColumn($table);

        });



        Table::create([
            'name' => 'product_application_data',
            'display_name' => 'Ứng dụng sản phẩm',
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
        $tbl = Table::where('name', 'product_application_data')->first();
        $tableId = $tbl->id;
        $order_col = 1;

        MigrateService::createColumn02($tableId, 'name_data', 'Tên ứng dụng', 'VARCHAR', 'text', $order_col++, 
        [ 'show_in_list' => 1,'is_view_detail' => 1]);

        MigrateService::baseColumn($tbl);
               


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_application_data');
    }
};
