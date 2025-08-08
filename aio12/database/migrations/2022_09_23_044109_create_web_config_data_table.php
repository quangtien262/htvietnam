<?php

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
        Schema::create('web_config_data', function (Blueprint $table) {
            $table->id();
            $table->text('name_data')->nullable();
            $table->text('data_id')->nullable();
            $table->text('languages_id')->nullable();
            $table->text('title')->nullable();
            $table->text('meta_title')->nullable();
            $table->text('meta_keyword')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('slogan')->nullable();
            $table->text('footer')->nullable();
            $table->text('address')->nullable();
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->integer('create_by')->default(1)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });

        $order = 1;
        $data =  MigrateService::createTable02('web_config_data', 'web_config_data', 
        ['parent_id' => 0, 'type_show' => 0, 'is_edit' => 0]);
        MigrateService::baseColumn($data);

        MigrateService::createColumn02($data->id, 'name_data', 'Tên công ty', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'title', 'Tiêu đề', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'meta_title', '[SEO] Tiêu đề', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'meta_keyword', '[SEO] Từ khóa', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'meta_description', '[SEO] Mô tả', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'slogan', 'Slogan', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'address', 'Địa chỉ', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'footer', 'Nội dung footer', 'TEXT', 'textarea', $order++, ['edit', 0]);

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('web_config_data');
    }
};
