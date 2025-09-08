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
        Schema::create('route', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('display_name')->nullable();

            MigrateService::createBaseColumn($table);
        });

        $order = 1;
        $route = MigrateService::createTable02(
            'route',
            'Kiểu hiển thị',
            ['is_edit' => 0, 'is_show_btn_edit' => 0, 'have_add_new' => 0, 'is_show_btn_detail' => 0, 'type_show' => 0]
        );
        MigrateService::createColumn02($route->id, 'id', 'id', 'INT', 'number', $order++, );
        MigrateService::createColumn02($route->id, 'name', 'Tên route', 'TEXT', 'text', $order++);
        MigrateService::createColumn02($route->id, 'display_name', 'Tên hiển thị', 'TEXT', 'text', $order++);
        MigrateService::createColumn02($route->id, 'parent_id', 'Danh mục cha', 'INT', 'select', $order++, );
        MigrateService::createColumn02($route->id, 'sort_order', 'sort_order', 'INT', 'number', $order++, );
        MigrateService::createColumn02($route->id, 'create_by', 'Tạo bởi', 'INT', config('constant.config_table.type_edit.select'), $order++, ['edit' => 0]);
        MigrateService::createColumn02($route->id, 'created_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
        MigrateService::createColumn02($route->id, 'updated_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('route');
    }
};
