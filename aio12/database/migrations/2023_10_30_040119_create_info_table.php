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
        Schema::create('info', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('lucky_id')->nullable();
            $table->text('address')->nullable();
            $table->string('email')->nullable();
            $table->text('phone')->nullable();
            $table->text('website')->nullable();
            $table->text('logo')->nullable();
            $table->text('description')->nullable();
            MigrateService::createBaseColumn($table);
        });
        Table::create([
            //require
            'name' => 'info',
            'display_name' => 'Công ty',
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
        $tbl = Table::where('name', 'info')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($tableId, 'name', 'Tên công ty', 'VARCHAR', 'text', $order_col++, ['require' => 1,'show_in_list' => 1,'is_view_detail' => 1]);
        MigrateService::createColumn02($tableId, 'address', 'Địa chỉ', 'TEXT', 'textarea', $order_col++);
        MigrateService::createColumn02($tableId, 'phone', 'Số điện thoại', 'VARCHAR', 'text', $order_col++);
        MigrateService::createColumn02($tableId, 'email', 'Email', 'VARCHAR', 'text', $order_col++);
        MigrateService::createColumn02($tableId, 'website', 'Website', 'TEXT', 'textarea', $order_col++);
        MigrateService::createColumn02($tableId, 'logo', 'Logo', 'TEXT', 'image', $order_col++);
        MigrateService::createColumn02($tableId, 'description', 'Ghi chú', 'TEXT', 'textarea', $order_col++);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('info');
    }
};
