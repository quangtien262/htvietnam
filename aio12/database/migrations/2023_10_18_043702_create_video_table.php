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
        Schema::create('video', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->integer('menu_id')->nullable();
            $table->text('display_name')->nullable();
            $table->text('tags_id')->nullable();
            $table->text('link')->nullable();
            $table->text('image')->nullable();
            $table->dateTime('create_date')->nullable();
            $table->integer('is_active')->default(1)->nullable();
            $table->integer('is_translate')->default(0)->nullable();
            $table->integer('views')->default(1)->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });


        $order = 1;
        $user = Table::where('name', 'admin_users')->first();
        $menus = Table::where('name', 'menus')->first();
        $videos = MigrateService::createTable02('video', 'Video', ['is_multiple_language' => 1, 'table_data' => 'video_data', 'parent_id' => 0, 'is_edit' => 0]);
        MigrateService::createColumn02($videos->id, 'id', 'id', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($videos->id, 'name', 'Tiêu đề', 'VARCHAR', 'text', $order++, ['show_in_list' => 1, 'is_view_detail' => 1]);
        MigrateService::createColumn02($videos->id, 'image', 'Ảnh Video', 'text', 'images_crop', $order++, ['show_in_list' => 1]);
        MigrateService::createColumn02($videos->id, 'link', 'Đường dẫn', 'VARCHAR', 'text', $order++, ['show_in_list' => 1]);
        MigrateService::createColumn02($videos->id, 'menu_id', 'Menu', 'TEXT', 'select', 5, ['select_table_id' => $menus->id, 'show_in_list' => 1]);
        MigrateService::createColumn02($videos->id, 'create_by', 'Tạo bởi', 'INT', config('constant.config_table.type_edit.select'), $order++, ['select_table_id' => $user->id, 'edit' => 0]);
        MigrateService::createColumn02($videos->id, 'created_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
        MigrateService::createColumn02($videos->id, 'updated_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('video');
    }
};
