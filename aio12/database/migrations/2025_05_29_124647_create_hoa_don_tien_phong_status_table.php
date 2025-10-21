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
        Schema::create('hoa_don_tien_phong_status', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('description')->nullable();
            $table->string('color')->default('#ffffff')->nullable();
            $table->string('parent_name')->nullable();
            $table->string('project_id')->nullable();
            $table->string('background')->default('#64748b')->nullable();
            $table->string('icon')->default('CaretRightOutlined')->nullable();
            $table->integer('is_active')->default(1)->nullable();
            $table->integer('is_default')->default(1)->nullable();
            MigrateService::createBaseColumn($table);

            Table::create([
                //require
                'name' => 'hoa_don_tien_phong_status',
                'display_name' => 'Trạng thái hóa đơn',
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
            $tbl = Table::where('name', 'hoa_don_tien_phong_status')->first();
            $tableId = $tbl->id;
            $order_col = 1;
            MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++,
            ['edit' => 0]);
            MigrateService::createColumn02($tableId, 'name', 'Tên', 'VARCHAR', 'text', $order_col++,
            ['show_in_list' => 1, 'edit => 1']);
            MigrateService::createColumn02($tableId, 'color', 'Màu chữ', 'VARCHAR', 'color', $order_col++,
            ['show_in_list' => 1, 'edit => 1']);
            MigrateService::createColumn02($tableId, 'background', 'Màu nền', 'VARCHAR', 'color', $order_col++,
            ['show_in_list' => 1, 'edit => 1']);
            MigrateService::createColumn02($tableId, 'icon', 'Icon', 'VARCHAR', 'icon', $order_col++,
            ['show_in_list' => 1, 'edit => 1']);

            $confirm = Table::where('name', 'confirm')->first();
            MigrateService::createColumn02($tableId, 'is_active', 'Active', 'select', 'icon', $order_col++,
            ['show_in_list' => 1, 'edit => 1', 'select_table_id' => $confirm->id]);
            MigrateService::createColumn02($tableId, 'is_default', 'Tìm kiếm mặc định', 'select', 'icon', $order_col++,
            ['show_in_list' => 1, 'edit => 1', 'select_table_id' => $confirm->id]);
            MigrateService::baseColumn($tbl);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hoa_don_tien_phong_status');
    }
};
