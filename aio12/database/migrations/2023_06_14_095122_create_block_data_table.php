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
        Schema::create('block_data', function (Blueprint $table) {
            $table->id();
            $table->string('name_data')->nullable();
            $table->string('title_description')->nullable();
            $table->integer('data_id')->nullable();
            $table->integer('languages_id')->nullable();
            $table->longtext('description')->nullable();
            $table->longtext('content')->nullable();

            MigrateService::createBaseColumn($table);
        });

        $order = 1;
        $parent = Table::where('name', 'block')->first();
        $data = MigrateService::createTable02(
            'block_data',
            'block_data',
            ['is_edit' => 0, 'parent_id' => $parent->id ]
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
            'textarea',
            $order++,
            ['show_in_list' => 0, 'col' => 24, 'edit' => 0]
        );

        MigrateService::createColumn02($data->id, 'id', 'id', 'INT', 'number', $order++, ['edit' => 0]);
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
        Schema::dropIfExists('block_data');
    }
};
