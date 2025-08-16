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
        Schema::create('block_info', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('note')->nullable();
            $table->string('icon')->nullable();
            $table->integer('menu_id')->default(0)->nullable();
            $table->integer('page_setting_id')->default(0)->nullable();
            $table->text('image')->nullable();
           
            MigrateService::createBaseColumn($table);
        });

        // setting
        $order = 1;
        $table = MigrateService::createTable02(
            'block_info',
            'Block info',
            ['is_multiple_language' => 1, 'table_data' => 'block_info_data', 'parent_id' => 0, 'type_show' => 5]
        );

        MigrateService::createColumn02(
            $table->id,
            'name',
            'Tiêu đề',
            'VARCHAR',
            'text',
            $order++,
            ['show_in_list' => 1, 'edit' => 0]
        );

        MigrateService::createColumn02(
            $table->id,
            'image',
            'Hình ảnh',
            'TEXT',
            'image_crop',
            $order++,
            ['show_in_list' => 1, 'ratio_crop' => 1]
        );

        MigrateService::baseColumn($table);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('block_info');
    }
};
