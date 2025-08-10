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
        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->integer('menu_id')->nullable();
            $table->text('tags_id')->nullable();
            $table->integer('sort_order')->nullable();
            $table->text('image')->nullable();
            $table->integer('is_active')->default(1)->nullable();
            $table->dateTime('create_date')->nullable();
            $table->integer('is_translate')->default(0)->nullable();
            $table->integer('is_front')->default(0)->nullable();
            $table->integer('views')->default(1)->nullable();
            $table->text('tags')->nullable();

            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });

        $order_col = 1;
        $user = Table::where('name', 'admin_users')->first();
        
        $news = MigrateService::createTable02('news', 'Tin tức', ['is_multiple_language' => 1, 'table_data' => 'news_data', 'parent_id' => 0]);
        MigrateService::createColumn02($news->id, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($news->id, 'image', 'Ảnh đại diện', 'TEXT', 'image_crop', $order_col++, ['conditions' => 1]);
        MigrateService::createColumn02($news->id, 'name', 'Tiêu đề', 'VARCHAR', 'text', $order_col++, ['show_in_list' => 1, 'is_view_detail' => 1, 'edit' => 0]);

        $menus = Table::where('name', 'menus')->first();
        MigrateService::createColumn02($news->id, 'menu_id', 'Menu', 'TEXT', 'select', $order_col++, 
        ['select_table_id' => $menus->id, 'show_in_list' => 1]);
        
        MigrateService::createColumn02($news->id, 'tags_id', 'Tags', 'TEXT', 'tags', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($news->id, 'is_active', 'Active', 'INT', 'select', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($news->id, 'create_by', 'Tạo bởi', 'INT', config('constant.config_table.type_edit.select'), $order_col++, 
        ['select_table_id' => $user->id, 'edit' => 0]);
        MigrateService::createColumn02($news->id, 'created_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($news->id, 'updated_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order_col++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('news');
    }
};
