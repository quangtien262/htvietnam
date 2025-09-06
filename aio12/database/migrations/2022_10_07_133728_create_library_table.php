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
        Schema::create('library', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('type')->nullable(); // slide, banner, ,,,,
            $table->text('images')->nullable();
            $table->text('link')->nullable();
            $table->text('note')->nullable();
            $table->text('icon')->nullable();
            $table->integer('page_setting_id')->default(0)->nullable();
            $table->integer('menu_id')->default(0)->nullable();
            $table->integer('active')->default(0)->nullable();

            MigrateService::createBaseColumn($table);
        });

        $order = 0;
        $user = Table::where('name', 'admin_users')->first();

        $lib =  MigrateService::createTable02(
            'library',
            'Thư viện ảnh',
            ['parent_id' => 0, 'is_edit' => 1, 'is_multiple_language' => 1, 'type_show' => 0, 'table_data' => 'library_data']
        );



        MigrateService::createColumn02($lib->id, 'id', 'id', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($lib->id, 'name', 'Tiêu đề', 'TEXT', 'text', $order++, ['show_in_list' => 1, 'edit' => 0]);

        $menu = Table::where('name', 'menus')->first();
        $conditions = ['display_type' => 'libs'];
        MigrateService::createColumn02(
            $lib->id,
            'menu_id',
            'Menu',
            'INT',
            'select',
            $order++,
            ['select_table_id' => $menu->id, 'add_express' => 0, 'show_in_list' => 1, 'add2search' => 1, 'conditions' => json_encode($conditions)]
        );
        
        MigrateService::createColumn02(
            $lib->id,
            'images',
            'Hình ảnh',
            'TEXT',
            'images_crop',
            $order++,
            ['show_in_list' => 0, 'ratio_crop' => 1, 'edit' => 1]
        );

        MigrateService::createColumn02($lib->id, 'sort_order', 'Thứ tự', 'INT', 'number', $order++, 
        ['edit' => 0, 'show_in_list' => 0]);
        
        MigrateService::createColumn02(
            $lib->id,
            'create_by',
            'Tạo bởi',
            'INT',
            'select',
            $order++,
            ['select_table_id' => $user->id, 'edit' => 0]
        );

        MigrateService::createColumn02(
            $lib->id,
            'created_at',
            'Ngày tạo',
            'DATETIME',
            'datetime',
            $order++,
            ['edit' => 0]
        );
        MigrateService::createColumn02(
            $lib->id,
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
        Schema::dropIfExists('library');
    }
};
