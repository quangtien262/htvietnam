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
        Schema::create('menus_data', function (Blueprint $table) {
            $table->id();

            $table->string('name_data')->nullable();
            // trong 1 vài trường hợp, có mô tả cho tên menu
            $table->string('name_data_description')->nullable(); 
            // là id của menu trong bảng menus
            $table->integer('data_id')->nullable();
            // là id của languages
            $table->integer('languages_id')->nullable();

            // Mô tả ngắn
            $table->text('description')->nullable();
            // Nội dung
            $table->longText('content')->nullable();

            // SEO fields
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keyword')->nullable();

            MigrateService::createBaseColumn($table);
        });

        $order_col = 1;
        $adminUser = Table::where('name', 'admin_users')->first();
        $menuData = MigrateService::createTable02('menus_data','menus_data',['is_edit'=>0] );
         MigrateService::createColumn02($menuData->id, 'id', 'id', 'INT', 'number', $order_col++,['edit'=>0]);
         MigrateService::createColumn02($menuData->id, 'data_id', 'data_id', 'INT', 'number', $order_col++,['edit'=>0]);
         MigrateService::createColumn02($menuData->id, 'name_data', 'Tên menu', 'VARCHAR', 'text', $order_col++);
         MigrateService::createColumn02($menuData->id, 'name_data_description', 'Mô tả cho tiêu đề', 'TEXT', 'textarea', $order_col++, 
         ['edit' => 0, 'show_in_list' => 0]);
         MigrateService::createColumn02($menuData->id, 'description', 'Mô tả ngắn', 'TEXT', 'textarea', $order_col++);
         MigrateService::createColumn02($menuData->id, 'meta_title', '[SEO] Title', 'TEXT', 'textarea', $order_col++);
         MigrateService::createColumn02($menuData->id, 'meta_keyword', '[SEO] Keyword', 'TEXT', 'textarea', $order_col++);
         MigrateService::createColumn02($menuData->id, 'meta_description', '[SEO] Description', 'TEXT', 'textarea', $order_col++);
         MigrateService::createColumn02($menuData->id, 'content', 'Nội dung', 'LONGTEXT', 'tiny', $order_col++);
         MigrateService::createColumn02($menuData->id, 'create_by', 'Người tạo', 'INT', 'number',$order_col++, ['select_table_id'=>$adminUser->id, 'edit'=>0]);
         MigrateService::createColumn02($menuData->id, 'created_at', 'Ngày tạo', 'DATETIME', 'date', $order_col++ ,['edit'=>0]);
         MigrateService::createColumn02($menuData->id, 'updated_at', 'Ngày sửa', 'DATETIME', 'date', $order_col++,['edit'=>0]);

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menus_data');
    }
};
