<?php

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
        Schema::create('product_setting', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('image')->nullable();
            $table->text('link')->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->timestamps();
        });

        // setting
        $order = 1;
        $data = MigrateService::createTable02(
            'product_setting',
            'Thông số chung',
            ['is_multiple_language' => 1, 'table_data' => 'product_setting_data', 'parent_id' => 0, 'type_show' => 0]
        );

        MigrateService::createColumn02(
            $data->id,
            'name',
            'Tiêu đề',
            'VARCHAR',
            'text',
            $order++,
            ['show_in_list' => 1, 'edit' => 0]
        );

        MigrateService::createColumn02(
            $data->id,
            'link',
            'Link',
            'TEXT',
            'text',
            $order++,
            ['show_in_list' => 0, 'edit' => 0]
        );

        MigrateService::createColumn02(
            $data->id,
            'image',
            'Hình ảnh',
            'TEXT',
            'image_crop',
            $order++,
            ['show_in_list' => 0, 'ratio_crop' => 1]
        );

        MigrateService::createColumn02($data->id, 'id', 'id', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'sort_order', 'sort_order', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'create_by', 'Tạo bởi', 'INT', config('constant.config_table.type_edit.select'), $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'created_at', 'Ngày tạo', 'INT', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'updated_at', 'Ngày tạo', 'INT', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_setting');
    }
};
