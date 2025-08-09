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
        Schema::create('colors', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->text('code')->nullable();

            $table->integer('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->integer('create_by')->default(0)->nullable();
            $table->timestamps();
        });

        $order = 1;
        $color =  MigrateService::createTable02('colors', 'Màu sắc', 
        ['parent_id' => 0, 'is_edit' => 0, 'is_multiple_language' => 1, 'type_show' => 1, 'table_data' => 'colors_data']);

        MigrateService::createColumn02($color->id, 'name', 'Tên màu', 'TEXT', 'text', $order++,['show_in_list' => 1, 'edit' => 0]);
        MigrateService::createColumn02($color->id, 'code', 'Mã màu', 'TEXT', 'color', $order++,['show_in_list' => 1, 'edit' => 1]);

        $user = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($color->id, 'create_by', 'Tạo bởi', 'INT', config('constant.config_table.type_edit.select'), $order++, ['select_table_id' => $user->id, 'edit' => 0]);
        MigrateService::createColumn02($color->id, 'sort_order', 'sort_order', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($color->id, 'created_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
        MigrateService::createColumn02($color->id, 'updated_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('colors');
    }
};
