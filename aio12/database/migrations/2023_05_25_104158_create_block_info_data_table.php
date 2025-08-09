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
        Schema::create('block_info_data', function (Blueprint $table) {
            $table->id();
            $table->string('name_data')->nullable();
            $table->string('data_id')->nullable();
            $table->string('languages_id')->nullable();
            $table->longtext('description')->nullable();
            $table->longtext('content')->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->timestamps();
        });

        // Setting
        $order = 1;
        $data = MigrateService::createTable02(
            'block_info_data',
            'block_info_data',
            ['is_edit' => 0]
        );

        MigrateService::createColumn02(
            $data->id,
            'name_data',
            'Tiêu đề',
            'VARCHAR',
            'text',
            $order++,
            ['show_in_list' => 1, 'edit' => 0]
        );

        MigrateService::createColumn02(
            $data->id,
            'description',
            'Mô tả ngắn',
            'TEXT',
            'textarea',
            $order++,
            ['show_in_list' => 1, 'col' => 24]
        );
        MigrateService::createColumn02(
            $data->id,
            'content',
            'Nội dung',
            'LONGTEXT',
            'tiny',
            $order++,
            ['show_in_list' => 0, 'col' => 24]
        );

        MigrateService::createColumn02($data->id, 'id', 'id', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'languages_id', 'languages_id', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'data_id', 'data_id', 'INT', 'number', $order++, ['edit' => 0]);
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
        Schema::dropIfExists('block_info_data');
    }
};
