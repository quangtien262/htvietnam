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
        Schema::create('page_setting', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable(); //title
            $table->text('display_name')->nullable(); //title
            $table->string('block_type')->nullable();
            $table->string('icon')->nullable();
            $table->text('image')->nullable();
            $table->text('images')->nullable();
            $table->text('link')->nullable();
            $table->integer('active')->default(1)->nullable();
            $table->integer('menu_id')->default(0)->nullable();
            $table->integer('languages_id')->default(1)->nullable();
            $table->string('table_edit')->nullable();
            $table->string('table_data')->nullable();
            $table->text('table_data_ids')->nullable();
            // $table->text('condition')->nullable();
            $table->string('link_edit')->nullable();
            $table->string('note')->nullable();

            MigrateService::createBaseColumn($table);
        });

        $order = 0;
        $landingpage = MigrateService::createTable02(
            'page_setting',
            'Cài đặt page',
            [
                'is_edit' => 1,
                'is_multiple_language' => 1,
                'table_data' => 'page_setting_data',
            ]
        );
        MigrateService::createColumn02($landingpage->id, 'id', 'id', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02(
            $landingpage->id,
            'name',
            'Tiêu đề',
            'TEXT',
            'text',
            $order++,
            ['show_in_list' => 0]
        );
        MigrateService::createColumn02(
            $landingpage->id,
            'images',
            'Hình ảnh',
            'TEXT',
            'images_crop',
            $order++,
            ['show_in_list' => 1]
        );
        MigrateService::createColumn02($landingpage->id, 'menu_id', 'Danh mục', 'TEXT', 'text', $order++);

        MigrateService::baseColumn($landingpage);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_setting');
    }
};
