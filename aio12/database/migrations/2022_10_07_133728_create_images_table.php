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
     *
     * @return void
     */
    public function up()
    {
        Schema::create('images', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('type')->nullable(); // slide, banner, ,,,,
            $table->text('image')->nullable();
            $table->text('link')->nullable();

            MigrateService::createBaseColumn($table);
        });

        $order = 0;
        $user = Table::where('name', 'admin_users')->first();

        $images =  MigrateService::createTable02(
            'images',
            'Hình ảnh banner',
            ['parent_id' => 0, 'is_edit' => 0, 'is_multiple_language' => 1, 'type_show' => 0, 'table_data' => 'images_data']
        );



        MigrateService::createColumn02($images->id, 'id', 'id', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($images->id, 'name', 'Tiêu đề', 'TEXT', 'text', $order++, ['show_in_list' => 1, 'edit' => 0]);
        MigrateService::createColumn02($images->id, 'image', 'Hình Ảnh', 'TEXT', 'image_crop', $order++, ['conditions' => 1, 'edit' => 1]);

        MigrateService::createColumn02(
            $images->id,
            'images',
            'Hình ảnh',
            'TEXT',
            'images_crop',
            $order++,
            ['show_in_list' => 0, 'ratio_crop' => 1, 'edit' => 0]
        );
        MigrateService::createColumn02($images->id, 'link', 'Đường dẫn', 'TEXT', 'text', $order++);

        MigrateService::createColumn02($images->id, 'sort_order', 'Thứ tự', 'INT', 'number', $order++, 
        ['edit' => 0, 'show_in_list' => 0]);
        MigrateService::createColumn02($images->id, 'parent_id', 'parent_id', 'INT', 'number', $order++);
        MigrateService::createColumn02(
            $images->id,
            'create_by',
            'Tạo bởi',
            'INT',
            'select',
            $order++,
            ['select_table_id' => $user->id, 'edit' => 0]
        );
        MigrateService::createColumn02(
            $images->id,
            'created_at',
            'Ngày tạo',
            'DATETIME',
            'datetime',
            $order++,
            ['edit' => 0]
        );
        MigrateService::createColumn02(
            $images->id,
            'updated_at',
            'Ngày tạo',
            'DATETIME',
            'datetime',
            $order++,
            ['edit' => 0]
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('images');
    }
};
