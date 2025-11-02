<?php

use App\Services\MigrateService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('task_logs', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->string('description')->nullable();
            $table->integer('data_id')->default(0)->nullable();
            $table->integer('project_id')->default(0)->nullable();
            $table->integer('task_id')->default(0)->nullable();
            $table->string('table')->nullable();
            $table->string('parent_name')->nullable();
            $table->string('user_name')->nullable();
            $table->string('column_name')->nullable();
            $table->string('type')->nullable(); // edit, add, delete

            MigrateService::createBaseColumn($table);


            $order_col = 1;
            $tbl = MigrateService::createTable02('task_logs', 'Nhật ký công việc', ['is_edit' => 1]);

            MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++);
            MigrateService::createColumn02(
                $tbl->id,
                'name',
                'Tên',
                'VARCHAR',
                'text',
                $order_col++,
                ['require' => 1, 'is_view_detail' => 1, 'add2search' => 1, 'show_in_list' => 1]
            );
            MigrateService::createColumn02(
                $tbl->id,
                'color',
                'Màu sắc',
                'VARCHAR',
                'text',
                $order_col++,
                ['require' => 0, 'is_view_detail' => 1, 'add2search' => 1, 'show_in_list' => 1]
            );

            MigrateService::createColumn02($tbl->id, 'created_at', 'Ngày tạo', 'INT', config('constant.config_table.type_edit.date'), $order_col++,
            ['edit' => 0, 'is_view_detail' => 1, 'show_in_list' => 1]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_logs');
    }
};
