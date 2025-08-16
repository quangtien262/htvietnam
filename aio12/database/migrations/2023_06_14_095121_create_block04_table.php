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
        Schema::create('block04', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('icon')->nullable();
            $table->integer('page_setting_id')->default(0)->nullable();
            $table->string('note')->nullable();
            $table->integer('menu_id')->default(0)->nullable();
            $table->string('block_type_id')->nullable();
            $table->longText('images')->nullable();

            MigrateService::createBaseColumn($table);
        });

        $order = 1;
        $data = MigrateService::createTable02(
            'block04',
            'block04',
            ['is_multiple_language' => 1, 'table_data' => 'block_data', 'parent_id' => 0, 'type_show' => 0]
        );

        MigrateService::createColumn02(
            $data->id,
            'image',
            'Hình ảnh',
            'TEXT',
            'image_crop',
            $order++,
            ['show_in_list' => 1, 'ratio_crop' => 1, 'conditions' => 1]
        );

        MigrateService::createColumn02(
            $data->id,
            'images',
            'Hình ảnh',
            'TEXT',
            'image_crop',
            $order++,
            ['show_in_list' => 0, 'ratio_crop' => 1, 'edit' => 1]
        );

        MigrateService::createColumn02(
            $data->id,
            'name',
            'Tiêu đề',
            'VARCHAR',
            'text',
            $order++,
            ['show_in_list' => 1, 'edit' => 1]
        );

        MigrateService::createColumn02($data->id, 'id', 'id', 'INT', 'number', $order++, ['edit' => 0]);
        $blockInfo = Table::where('name', 'block_info')->first();
        MigrateService::createColumn02($data->id, 'block_info_id', 'block_info_id', 'INT', 'select', $order++, 
        ['edit' => 0, 'select_table_id' => $blockInfo->id]);
        MigrateService::createColumn02($data->id, 'sort_order', 'sort_order', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'create_by', 'Tạo bởi', 'INT', 'select', $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'created_at', 'Ngày tạo', 'INT', 'datetime', $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'updated_at', 'Ngày cập nhật', 'INT', 'datetime', $order++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('block04');
    }
};
