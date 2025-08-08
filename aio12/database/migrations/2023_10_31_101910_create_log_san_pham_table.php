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
        Schema::create('log_san_pham', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->integer('table_id')->nullable();
            $table->integer('data_id')->nullable();
            $table->text('link')->nullable();
            $table->longText('data_old')->nullable();
            $table->longText('data_new')->nullable();
            $table->integer('admin_users_id')->default(1)->nullable();
            $table->integer('is_merge')->default(0)->nullable();
            
            MigrateService::createBaseColumn($table);
        });
        Table::create([
            //require
            'name' => 'log_san_pham',
            'display_name' => 'Lịch sử xử dụng',
            'parent_id' => 0,
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 1,
            'form_data_type' => 1,
            'have_delete' => 0,
            'have_add_new' => 0,
            'is_show_btn_edit' => 0,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
        ]);
        $tbl = Table::where('name', 'log_san_pham')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($tableId, 'name', 'Tiêu đề', 'TEXT', 'text', $order_col++, 
        ['require' => 1,'show_in_list' => 1,'is_view_detail' => 1]);
        MigrateService::createColumn02($tableId, 'link', 'Link', 'TEXT', 'text', $order_col++,
        ['show_in_list' => 1]);
        MigrateService::createColumn02($tableId, 'data_update', 'Nội dung thay đổi', 'TINY', 'tiny', $order_col++,
        ['show_in_list' => 0]);
        MigrateService::createColumn02($tableId, 'data_pre', 'Nội dung cũ', 'TINY', 'tiny', $order_col++,
        ['show_in_list' => 0]);

        MigrateService::createColumn02($tableId, 'table_id', 'data_id', 'INT', 'int', $order_col++,
        ['show_in_list' => 0,'edit' => 0]);
        MigrateService::createColumn02($tableId, 'data_id', 'Mã-Tên CN PB', 'INT', 'int', $order_col++, 
        ['show_in_list' => 0,'edit' => 0]);
        MigrateService::createColumn02($tableId, 'is_merge', 'Gộp khách hàng', 'INT', 'int', $order_col++, 
        ['show_in_list' => 1,'edit' => 0, 'add2search' => 1]);
        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_san_pham');
    }
};
