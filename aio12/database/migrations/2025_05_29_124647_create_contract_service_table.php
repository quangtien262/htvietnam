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
        Schema::create('contract_service', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->text('hop_dong_id')->nullable();
            $table->integer('dich_vu_id')->nullable(); // nv thực hiện
            $table->integer('price')->nullable(); // json người theo dõi hoặc làm cùng
            $table->integer('price_by')->nullable();

            MigrateService::createBaseColumn($table);

            Table::create([
                //require
                'name' => 'contract_service',
                'display_name' => 'Dịch vụ',
                'parent_id' => 0,
                'sort_order' => 0,
                'type_show' => config('constant.type_show.basic'),
                'count_item_of_page' => 30,
                'is_edit' => 1, // 1 hiển thị ở menu; 0 không hiển thị
                'form_data_type' => 1,
                'have_delete' => 1,
                'have_add_new' => 1,

                'is_show_btn_edit' => 1,
                'tab_table_id' => 0,
                'tab_table_name' => '',
                'table_data' => '',
                'is_label' => 0,
            ]);
            $tbl = Table::where('name', 'contract_service')->first();
            $tableId = $tbl->id;
            $order_col = 1;
            MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
            MigrateService::createColumn02($tableId, 'name', 'Tên', 'VARCHAR', 'text', $order_col++, ['show_in_list' => 1]);
            MigrateService::createColumn02($tableId, 'hop_dong_id', 'Hợp đồng', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
            MigrateService::createColumn02($tableId, 'dich_vu_id', 'Dịch vụ', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
            MigrateService::createColumn02($tableId, 'price', 'Giá', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
            MigrateService::createColumn02($tableId, 'price_by', 'Giá theo', 'INT', 'number', $order_col++, ['show_in_list' => 1]);

            MigrateService::baseColumn($tbl);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contract_service');
    }
};
