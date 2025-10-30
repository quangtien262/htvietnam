<?php

use App\Models\Admin\Table;
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
        Schema::create('task_milestones', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('description')->nullable();
            $table->string('color')->default('todo')->nullable();
            $table->string('parent_name')->nullable();
            $table->integer('is_active')->default(1)->nullable();
            $table->integer('is_default')->default(1)->nullable();

            MigrateService::createBaseColumn($table);

            $order_col = 1;
            $tbl = MigrateService::createTable02('task_milestones', 'Milestones', ['is_edit' => 1]);

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

            $confirm = Table::where('name', 'confirm')->first();
            MigrateService::createColumn02($tbl->id, 'is_active', 'Active', 'select', 'icon', $order_col++, 
            ['show_in_list' => 1, 'edit' => 1, 'select_table_id' => $confirm->id]);
            MigrateService::createColumn02($tbl->id, 'is_default', 'Tìm kiếm mặc định', 'select', 'icon', $order_col++, 
            ['show_in_list' => 1, 'edit' => 1, 'select_table_id' => $confirm->id]);

            MigrateService::baseColumn($tbl);


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_milestones');
    }
};
