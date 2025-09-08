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
        Schema::create('video_data', function (Blueprint $table) {
            $table->id();
            $table->string('name_data')->nullable();
            $table->integer('languages_id')->nullable();
            $table->integer('data_id')->nullable();
            $table->text('video_lang')->nullable();
            $table->text('content')->nullable();
            $table->text('description')->nullable();
            $table->text('meta_title')->nullable();
            $table->text('meta_keyword')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();
        });

        $order = 1;
        $videosData = MigrateService::createTable02('video_data', 'video_data', ['is_edit' => 0]);
        MigrateService::createColumn02($videosData->id, 'id', 'id', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($videosData->id, 'data_id', 'data_id', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($videosData->id, 'name_data', 'Tiêu đề', 'VARCHAR', 'text', $order++);
        MigrateService::createColumn02($videosData->id, 'name_meta', '(alt) Mô tả ảnh đại diện ', 'TEXT', 'text', $order++);
        MigrateService::createColumn02($videosData->id, 'description', 'Mô tả ngắn', 'LONGTEXT', 'textarea', $order++);
        MigrateService::createColumn02($videosData->id, 'video_lang', 'Mã nhúng video từ nguồn khác', 'TEXT', 'textarea', $order++, 
        ['col' => 24]);
        MigrateService::createColumn02($videosData->id, 'content', 'Nội dung', 'LONGTEXT', 'tiny', $order++);
        MigrateService::createColumn02($videosData->id, 'meta_keyword', 'meta_keyword', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($videosData->id, 'meta_description', 'meta_description', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($videosData->id, 'created_at', 'Ngày tạo', 'DATETIME', 'date', $order++, ['edit' => 0]);
        MigrateService::createColumn02($videosData->id, 'updated_at', 'Ngày sửa', 'DATETIME', 'date', $order++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('video_data');
    }
};
