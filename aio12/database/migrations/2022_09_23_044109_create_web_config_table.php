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
        Schema::create('web_config', function (Blueprint $table) {
            $table->id();
            $table->integer('data_id')->nullable();
            $table->text('name')->nullable();
            $table->string('currency')->nullable();
            $table->string('currency_name')->nullable();
            $table->text('logo')->nullable();
            $table->text('website')->nullable();
            $table->text('code')->nullable();
            $table->text('gg_map')->nullable();
            $table->text('gg_analytic')->nullable();

            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('zalo')->nullable();

            $table->text('facebook_id')->nullable();
            $table->text('pinterest')->nullable();
            $table->text('youtube')->nullable();
            $table->text('dribbble')->nullable();
            $table->text('whats_app')->nullable();
            $table->text('tiktok')->nullable();
            $table->text('telegram')->nullable();
            $table->text('google')->nullable(); 
            $table->text('twitter')->nullable();
            
            $table->text('shopee')->nullable();
            $table->text('tiki')->nullable();
            $table->text('lazada')->nullable(); 
            $table->text('sendo')->nullable();

            $table->text('instagram')->nullable();
            $table->text('reddit')->nullable();
            $table->text('linkedin')->nullable();
            $table->text('google_translate_api_key')->nullable();
            $table->string('layout')->nullable();
            $table->text('other_config')->nullable();
            $table->text('meta_title')->nullable();
            $table->text('meta_keyword')->nullable();
            $table->text('meta_description')->nullable();
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->integer('create_by')->default(1)->nullable();
            $table->timestamps();
        });

        $order = 1;
        $data =  MigrateService::createTable02('web_config', 'Cấu hình web', 
        ['parent_id' => 0, 'type_show' => 5, 'is_multiple_language' => 1,'table_data' => 'web_config_data',]);

        $tab_basic = MigrateService::createColumn02($data->id, 'tab_basic', 'Thông tin cơ bản', 'INT', 'number', 1, ['block_type' => 'tab']);
        $tab_social = MigrateService::createColumn02($data->id, 'tab_social', 'LK Mạng xã hội', 'INT', 'number', 2, ['block_type' => 'tab']);
        $tab_code = MigrateService::createColumn02($data->id, 'tab_code', 'Mã nhúng', 'INT', 'number', 3, ['block_type' => 'tab']);
        $tab_seo = MigrateService::createColumn02($data->id, 'tab_seo', 'SEO', 'INT', 'number', 3, ['block_type' => 'tab']);

        $block_basic = MigrateService::createColumn02($data->id, 'block_basic', 'Thông tin cơ bản', 'INT', 'number', 0, 
        ['block_type' => 'block', 'parent_id' => $tab_basic->id]);

        $block_social = MigrateService::createColumn02($data->id, 'block_social', 'LK Mạng xã hội', 'INT', 'number', 0, 
        ['block_type' => 'block', 'parent_id' => $tab_social->id]);

        $block_code = MigrateService::createColumn02($data->id, 'block_code', 'Mã nhúng', 'INT', 'number', 0, 
        ['block_type' => 'block', 'parent_id' => $tab_code->id]);

        $block_seo = MigrateService::createColumn02($data->id, 'block_seo', 'SEO', 'INT', 'number', 0, 
        ['block_type' => 'block', 'parent_id' => $tab_seo->id]);

        // basic
        MigrateService::createColumn02($data->id, 'name', 'Tiêu đề', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_basic->id]);

        MigrateService::createColumn02($data->id, 'currency_name', 'Tên đơn vị tiền tệ', 'TEXT', 'text', $order++);
        MigrateService::createColumn02($data->id, 'currency', 'Đơn vị tiền tệ', 'TEXT', 'text', $order++);
        MigrateService::createColumn02($data->id, 'website', 'Website', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_basic->id]);
        MigrateService::createColumn02($data->id, 'logo', 'Logo', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_basic->id]);
        MigrateService::createColumn02($data->id, 'email', 'Email', 'VARCHAR', 'text', $order++, 
        ['parent_id' => $block_basic->id]);
        MigrateService::createColumn02($data->id, 'phone', 'Hotline', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_basic->id]);

        // code
        MigrateService::createColumn02($data->id, 'code', 'Mã nhúng từ nguồn khác', 'TEXT', 'textarea', $order++, 
        ['parent_id' => $block_code->id]);
        MigrateService::createColumn02($data->id, 'gg_map', 'Mã nhúng từ Google Map', 'TEXT', 'textarea', $order++, 
        ['parent_id' => $block_code->id]);
        MigrateService::createColumn02($data->id, 'gg_analytic', 'Mã nhúng từ Google Analytic', 'TEXT', 'textarea', $order++, 
        ['parent_id' => $block_code->id]);
        
        
        //block_social
        MigrateService::createColumn02($data->id, 'zalo', 'Zalo', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_social->id]);
        MigrateService::createColumn02($data->id, 'whats_app', 'What App', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_social->id]);
        MigrateService::createColumn02($data->id, 'tiktok', 'TikTok', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_social->id]);
        MigrateService::createColumn02($data->id, 'telegram', 'Telegram', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_social->id]);
        MigrateService::createColumn02($data->id, 'dribbble', 'Dribbble', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_social->id]);
        MigrateService::createColumn02($data->id, 'facebook_id', 'Facebook ID', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_social->id]);
        MigrateService::createColumn02($data->id, 'twitter', 'Twitter', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_social->id]);
        MigrateService::createColumn02($data->id, 'instagram', 'Instagram', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_social->id]);

        // sàn TMDT
        MigrateService::createColumn02($data->id, 'tiki', 'Tiki', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_social->id]);
        MigrateService::createColumn02($data->id, 'lazada', 'Lazada', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_social->id]);
        MigrateService::createColumn02($data->id, 'shopee', 'shopee', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_social->id]);
        MigrateService::createColumn02($data->id, 'sendo', 'Sendo', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_social->id]);
        MigrateService::createColumn02($data->id, 'shopee', 'shopee', 'TEXT', 'text', $order++, 
        ['parent_id' => $block_social->id]);

        // SEO
        MigrateService::createColumn02($data->id, 'meta_title', '[SEO] Tiêu đề', 'TEXT', 'textarea', $order++, 
        ['parent_id' => $block_seo->id, 'col' =>24]);
        MigrateService::createColumn02($data->id, 'meta_keyword', '[SEO] Từ khóa', 'TEXT', 'textarea', $order++, 
        ['parent_id' => $block_seo->id, 'col' =>24]);
        MigrateService::createColumn02($data->id, 'meta_description', '[SEO] Mô tả', 'TEXT', 'textarea', $order++, 
        ['parent_id' => $block_seo->id, 'col' =>24]);
        
        MigrateService::createColumn02($data->id, 'id', 'id', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'sort_order', 'sort_order', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'create_by', 'Tạo bởi', 'INT', config('constant.config_table.type_edit.select'), $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'created_at', 'Ngày tạo', 'INT', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
        MigrateService::createColumn02($data->id, 'updated_at', 'Ngày tạo', 'INT', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('web_config');
    }
};
