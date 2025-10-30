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
        Schema::create('meeting', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->text('description')->nullable();

            $table->string('admin_menu_parent_id')->nullable();
            $table->string('parent_name')->nullable();
            $table->string('data_type')->nullable(); //table: task, project
            $table->integer('data_id')->default(0)->nullable();

            $table->integer('project_id')->default(0)->nullable();
            $table->integer('task_id')->default(0)->nullable();

            $table->integer('is_daily')->default(0)->nullable();
            $table->integer('is_weekly')->default(0)->nullable();
            $table->integer('is_monthly')->default(0)->nullable();
            $table->integer('is_yearly')->default(0)->nullable();

            $table->integer('meeting_status_id')->default(1)->nullable();

            MigrateService::createBaseColumn($table);

            Table::create([
                //require
                'name' => 'meeting',
                'display_name' => 'Quản lý công việc',
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
            $tbl = Table::where('name', 'meeting')->first();
            $tableId = $tbl->id;
            $order_col = 1;
            MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
            MigrateService::createColumn02($tableId, 'name', 'Tiêu đề', 'VARCHAR', 'text', $order_col++, ['show_in_list' => 1]);
            MigrateService::createColumn02($tableId, 'description', 'Mô tả', 'VARCHAR', 'text', $order_col++, ['show_in_list' => 1]);

            MigrateService::createColumn02($tableId, 'is_daily', 'Daily', 'INT', 'select', $order_col++, ['show_in_list' => 1, 'select_table_id' => Table::where('name', 'confirm')->first()->id]);
            MigrateService::createColumn02($tableId, 'is_weekly', 'Weekly', 'INT', 'select', $order_col++, ['show_in_list' => 1, 'select_table_id' => Table::where('name', 'confirm')->first()->id]);
            MigrateService::createColumn02($tableId, 'is_monthly', 'Monthly', 'INT', 'select', $order_col++, ['show_in_list' => 1, 'select_table_id' => Table::where('name', 'confirm')->first()->id]);

            // status
            $status = Table::where('name', 'meeting_status')->first();
            MigrateService::createColumn02($tableId, 'meeting_status_id', 'Trạng thái', 'INT', 'select', $order_col++,
            ['show_in_list' => 1, 'select_table_id' => $status->id]);

            MigrateService::baseColumn($tbl);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meeting');
    }
};
