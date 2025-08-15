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
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable(); // tên menu
            $table->text('images')->nullable(); // hình ảnh (nếu có))
            $table->string('display_type')->nullable(); // kiểu hiển thị
            $table->integer('position')->default(0)->nullable(); // 1 is MenuTop 0 is MenuLeft
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->string('type_sub_menu')->default(0)->nullable();
            $table->string('is_front')->default(0)->nullable();
            $table->text('current_link')->nullable();
            $table->string('is_register')->default(0)->nullable();
            $table->string('icon')->default(0)->nullable();
            $table->integer('is_active')->default(1)->nullable();

            

            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });

        $order = 1;
        $data = MigrateService::createTable02('menus', 'Menu',
        ['is_multiple_language' => 1, 'table_data' => 'menus_data', 'parent_id' => 0, 'type_show' => 1]);
        MigrateService::createColumn02(
            $data->id,
            'id',
            'id',
            'INT',
            'number',
            $order++,
            ['edit' => 0]
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

        MigrateService::createColumn02($data->id, 'images', 'Ảnh nền', 'text', 'images_crop', $order++,
        ['edit' => 1, 'conditions' => 1, 'show_in_list' => 1]);

        $confirm = Table::where('name', 'confirm')->first();
        MigrateService::createColumn02($data->id, 'is_active', 'Hiển thị', 'INT', 'select', $order++, 
        ['edit' => 0, 'select_table_id' => $confirm->id]);

        MigrateService::createColumn02($data->id, 'position', 'Vị trí menu', 'INT', 'text', 2, ['edit' => 0]);

        $route = Table::where('name', 'route')->first();
        MigrateService::createColumn02(
            $data->id,
            'display_type',
            'Kiểu hiển thị',
            'VARCHAR',
            'select',
            0,
            ['select_table_id' => $route->id, 'data_select' => '{"value":"name", "name":{"0":"display_name"}}']
        );
        MigrateService::createColumn02($data->id, 'parent_id', 'Danh mục cha', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'sort_order', 'sort_order', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'create_by', 'Tạo bởi', 'INT', config('constant.config_table.type_edit.select'), $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'created_at', 'Ngày tạo', 'INT', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'updated_at', 'Ngày tạo', 'INT', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('menus');
    }
};
