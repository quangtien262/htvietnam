<?php

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
        Schema::create('news_data', function (Blueprint $table) {
            $table->id();
            $table->string('name_data')->nullable();
            $table->integer('languages_id')->nullable();
            $table->integer('data_id')->nullable();
            $table->text('description')->nullable();
            $table->longtext('content')->nullable();
            $table->text('meta_title')->nullable();
            $table->text('meta_keyword')->nullable();
            $table->text('meta_description')->nullable();

            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });

        $order = 1;
        $newsData = MigrateService::createTable02('news_data', 'news_data', ['is_edit' => 0]);
        MigrateService::createColumn02($newsData->id, 'id', 'id', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($newsData->id, 'data_id', 'data_id', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($newsData->id, 'description', 'Mô tả ngắn', 'longtext', 'textarea', $order++);
        MigrateService::createColumn02($newsData->id, 'content', 'Nội dung', 'LONGTEXT', 'tiny', $order++);
        MigrateService::createColumn02($newsData->id, 'name_data', 'Tiêu đề', 'VARCHAR', 'text', $order++);
        MigrateService::createColumn02($newsData->id, 'meta_keyword', 'meta_keyword', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($newsData->id, 'meta_description', 'meta_description', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($newsData->id, 'created_at', 'Ngày tạo', 'DATETIME', 'date', $order++, ['edit' => 0]);
        MigrateService::createColumn02($newsData->id, 'updated_at', 'Ngày tạo', 'DATETIME', 'date', $order++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news_data');
    }
};
