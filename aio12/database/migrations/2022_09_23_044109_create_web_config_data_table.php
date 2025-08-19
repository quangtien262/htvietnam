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
            $table->text('company_name')->nullable();
            $table->text('meta_title')->nullable();
            $table->text('meta_keyword')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('slogan')->nullable();
            $table->text('footer')->nullable();
            $table->text('address')->nullable();
            $table->text('office')->nullable();
            $table->text('factory')->nullable(); // nhà máy
            $table->text('phone_language')->nullable();
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            MigrateService::createBaseColumn($table);
        });

        $order = 1;
        $data =  MigrateService::createTable02('web_config_data', 'web_config_data', 
        ['parent_id' => 0, 'type_show' => 0, 'is_edit' => 0]);
        MigrateService::baseColumn($data);

        // MigrateService::createColumn02($data->id, 'name_data', 'Tiêu đề web', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'title', 'Tiêu đề web', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'slogan', 'Slogan', 'TEXT', 'textarea', $order++);

        MigrateService::createColumn02($data->id, 'company_name', 'Tên công ty', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'office', 'Địa chỉ văn phòng', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'factory', 'Nhà máy', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'phone_language', 'Số điện thoại theo ngôn ngữ', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'address', 'Địa chỉ', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'footer', 'Nội dung footer', 'TEXT', 'textarea', $order++, ['edit', 0]);

        // SEO
        MigrateService::createColumn02($data->id, 'meta_title', '[SEO] Tiêu đề', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'meta_keyword', '[SEO] Từ khóa', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'meta_description', '[SEO] Mô tả', 'TEXT', 'textarea', $order++);
        
        
        
        

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
