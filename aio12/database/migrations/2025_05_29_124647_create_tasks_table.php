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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->text('description')->nullable();

            $table->string('parent_name')->nullable();

            $table->integer('project_id')->default(0)->nullable();

            $table->integer('task_status_id')->default(1)->nullable(); // todo, doing, done
            $table->integer('nguoi_thuc_hien')->nullable(); // nv thực hiện
            $table->text('nguoi_theo_doi')->nullable(); // json người theo dõi hoặc làm cùng
            $table->integer('task_priority_id')->nullable();
            $table->text('task_type_ids')->nullable();
            $table->date('start')->nullable();
            $table->date('end')->nullable();
            $table->date('actual')->nullable();
            $table->text('tags')->nullable();
            $table->integer('status_order')->nullable();

            $table->integer('milestones_id')->nullable();

            $table->integer('is_daily')->default(0)->nullable();
            $table->integer('is_weekly')->default(0)->nullable();
            $table->integer('is_monthly')->default(0)->nullable();

            MigrateService::createBaseColumn($table);

            Table::create([
                //require
                'name' => 'tasks',
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
            $tbl = Table::where('name', 'tasks')->first();
            $tableId = $tbl->id;
            $order_col = 1;
            MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
            MigrateService::createColumn02($tableId, 'name', 'Tiêu đề', 'VARCHAR', 'text', $order_col++, ['show_in_list' => 1]);
            MigrateService::createColumn02($tableId, 'description', 'Mô tả', 'VARCHAR', 'text', $order_col++, ['show_in_list' => 1]);

            $priority = Table::where('name', 'task_priority')->first();
            MigrateService::createColumn02($tableId, 'task_priority_id', 'Độ ưu tiên', 'VARCHAR', 'text', $order_col++, ['show_in_list' => 1, 'select_table_id' => $priority->id]);

            MigrateService::createColumn02($tableId, 'project_id', 'Dự án', 'VARCHAR', 'number', $order_col++, ['show_in_list' => 1]);

            $status = Table::where('name', 'task_status')->first();
            MigrateService::createColumn02($tableId, 'task_status_id', 'Trạng thái', 'INT', 'select', $order_col++, 
            ['show_in_list' => 1, 'select_table_id' => $status->id]);

            $adminUsers = Table::where('name', 'admin_users')->first();
            MigrateService::createColumn02($tableId, 'nguoi_thuc_hien', 'Người thực hiện', 'INT', 'select', $order_col++, ['show_in_list' => 1, 'select_table_id' => $adminUsers->id]);
            MigrateService::createColumn02($tableId, 'nguoi_theo_doi', 'Người làm cùng', 'TEXT', 'selects', $order_col++, ['show_in_list' => 1, 'select_table_id' => $adminUsers->id]);

            MigrateService::createColumn02($tableId, 'start', 'Ngày bắt đầu', 'DATE', config('constant.config_table.type_edit.date'), $order_col++, 
            ['show_in_list' => 1]);
            MigrateService::createColumn02($tableId, 'end', 'Ngày kết thúc', 'DATE', config('constant.config_table.type_edit.date'), $order_col++, 
            ['show_in_list' => 1]);
            MigrateService::createColumn02($tableId, 'actual', 'Ngày hoàn thành thực tế', 'DATE', config('constant.config_table.type_edit.date'), $order_col++, 
            ['show_in_list' => 1]);
            MigrateService::createColumn02($tableId, 'tags', 'Tags', 'TEXT', 'number', $order_col++, ['show_in_list' => 1]);

            MigrateService::createColumn02($tableId, 'is_daily', 'Họp hàng ngày', 'INT', 'select', $order_col++, ['show_in_list' => 1, 'select_table_id' => Table::where('name', 'confirm')->first()->id]);
            MigrateService::createColumn02($tableId, 'is_weekly', 'Họp hàng tuần', 'INT', 'select', $order_col++, ['show_in_list' => 1, 'select_table_id' => Table::where('name', 'confirm')->first()->id]);
            MigrateService::createColumn02($tableId, 'is_monthly', 'Họp hàng tháng', 'INT', 'select', $order_col++, ['show_in_list' => 1, 'select_table_id' => Table::where('name', 'confirm')->first()->id]);


            MigrateService::baseColumn($tbl);
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
