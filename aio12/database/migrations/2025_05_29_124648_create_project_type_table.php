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
        Schema::create('project_type', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('description')->nullable();
            $table->string('color')->nullable();
            $table->string('icon')->nullable();
            $table->string('parent_name')->nullable();
            $table->integer('is_active')->default(1)->nullable();
            $table->integer('is_default')->default(1)->nullable();

            MigrateService::createBaseColumn($table);


            $order_col = 1;
            $tbl = MigrateService::createTable02('project_type', 'Loại dự án', ['is_edit' => 1]);

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

            MigrateService::baseColumn($tbl);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_type');
    }
};
