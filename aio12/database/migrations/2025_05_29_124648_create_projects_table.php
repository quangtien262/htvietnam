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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->text('description')->nullable();
            $table->integer('task_status_id')->default(1)->nullable();
            $table->text('nguoi_theo_doi')->nullable(); // json người theo dõi hoặc làm cùng
            $table->integer('nguoi_thuc_hien')->nullable(); // json người thực hiện
            $table->text('project_manager')->nullable(); //admin_users_id

            $table->string('parent_name')->nullable(); // tên tính năng: sale, task, project, tms.... 

             // todo, doing, done
             // nv thực hiện
            $table->integer('nguoi_tạo')->nullable();
            $table->text('task_type_ids')->nullable();
            $table->date('start')->nullable();
            $table->date('end')->nullable();
            $table->date('actual')->nullable();
            $table->text('tags')->nullable();

            MigrateService::createBaseColumn($table);

            Table::create([
                //require
                'name' => 'projects',
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
            $tbl = Table::where('name', 'projects')->first();
            $tableId = $tbl->id;
            $order_col = 1;
            MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
            MigrateService::createColumn02($tableId, 'name', 'Tên tài sản', 'VARCHAR', 'text', $order_col++, ['show_in_list' => 1]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
