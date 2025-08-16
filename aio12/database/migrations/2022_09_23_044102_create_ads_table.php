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
        Schema::create('ads', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('note')->nullable();
            $table->string('icon')->nullable();
            $table->text('images')->nullable();
            $table->string('menus_id')->default(0)->nullable();
            $table->integer('page_setting_id')->default(0)->nullable();
            $table->string('is_front')->default(0)->nullable();
            $table->integer('is_active')->default(1)->nullable();

            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });

        $order = 1;
        $data = MigrateService::createTable02('ads', 'Ảnh quảng cáo', 
        ['is_multiple_language' => 0, 'table_data' => 'menus_data', 'parent_id' => 0, 'type_show' => 0]);

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
            'menus_id',
            'Menu',
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
            ['show_in_list' => 1, 'edit' => 1]
        );


        MigrateService::createColumn02($data->id, 'is_front', 'Hiển thị trang chủ', 'INT', 'select', $order++, 
        ['edit' => 0]);

        MigrateService::createColumn02($data->id, 'is_active', 'Active', 'TEXT', 'select', $order++, 
        ['edit' => 0]);

        MigrateService::createColumn02($data->id, 'image', 'Ảnh đại diện', 'TEXT', 'image_crop', $order++, 
        ['edit' => 1,'show_in_list' => 1]);

        MigrateService::baseColumn($data);

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('ads');
    }
};
