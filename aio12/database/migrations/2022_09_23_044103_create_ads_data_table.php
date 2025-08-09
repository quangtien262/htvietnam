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
        Schema::create('ads_data', function (Blueprint $table) {
            $table->id();
            $table->string('name_data')->nullable();
            $table->integer('languages_id')->nullable();
            $table->integer('data_id')->nullable();
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keyword')->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });

        $order_col = 1;
        $menuData = MigrateService::createTable02('ads_data','Danh mục SP',['is_edit'=>0]);
        MigrateService::baseColumn($menuData, 101, true);
        MigrateService::createColumn02($menuData->id, 'name_data', 'Tên', 'VARCHAR', 'text', $order_col++);
        MigrateService::createColumn02($menuData->id, 'description', 'Mô tả ngắn', 'TEXT', 'textarea', $order_col++);
        MigrateService::createColumn02($menuData->id, 'meta_title', '[SEO] Title', 'TEXT', 'textarea', $order_col++);
        MigrateService::createColumn02($menuData->id, 'meta_keyword', '[SEO] Keyword', 'TEXT', 'textarea', $order_col++);
        MigrateService::createColumn02($menuData->id, 'meta_description', '[SEO] Description', 'TEXT', 'textarea', $order_col++);
        MigrateService::createColumn02($menuData->id, 'content', 'Nội dung', 'LONGTEXT', 'tiny', $order_col++);
    
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ads_data');
    }
};
