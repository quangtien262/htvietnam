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
        Schema::create('qa', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('menu_id')->nullable();
            $table->string('images')->nullable();

            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->timestamps();
        });

        $order = 1;
        $data = MigrateService::createTable02(
            'qa',
            'Hỏi đáp',
            ['is_multiple_language' => 1, 'table_data' => 'qa_data', 'parent_id' => 0, 'type_show' => 0]
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
            'images',
            'Hình ảnh',
            'TEXT',
            'image_crop',
            $order++,
            ['show_in_list' => 1, 'ratio_crop' => 1]
        );

        $menu = Table::where('name', 'menus')->first();
        MigrateService::createColumn02(
            $data->id,
            'menu_id',
            'Menu',
            'INT',
            'select',
            $order++,
            ['show_in_list' => 1, 'select_table_id' => $menu->id, 'require' => 1]
        );

        MigrateService::baseColumn($data);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qa');
    }
};
