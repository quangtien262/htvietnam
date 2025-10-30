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
        Schema::create('library_data', function (Blueprint $table) {
            $table->id();
            $table->string('name_data')->nullable();
            $table->string('data_id')->nullable(); 
            $table->text('languages_id')->nullable();
            $table->text('description')->nullable();
            $table->text('content')->nullable();
            $table->text('meta_keyword')->nullable();
            $table->text('meta_description')->nullable();

            $table->text('sort_order')->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->timestamps();
        });

        $order = 0;
        $user = Table::where('name', 'admin_users')->first();

        $images =  MigrateService::createTable02('library_data', 'Thư viện ảnh', 
        ['parent_id' => 0, 'is_edit' => 0, 'type_show' => 1]);

        MigrateService::createColumn02($images->id, 'id', 'id', 'INT', 'number', $order++, 
        ['edit' => 0, 'col' => 24]);
        MigrateService::createColumn02($images->id, 'name_data', 'Tiêu đề', 'TEXT', 'text', $order++,
        ['show_in_list' => 1, 'edit' => 1]);
        MigrateService::createColumn02($images->id, 'description', 'Mô tả ngắn', 'TEXT', 'textarea', $order++,
        ['show_in_list' => 1, 'edit' => 1, 'col' => 24]);
        MigrateService::createColumn02($images->id, 'content', 'Nội dung', 'TEXT', 'tiny', $order++,['show_in_list' => 1, 'edit' => 0]);

        MigrateService::createColumn02($images->id, 'create_by', 'Tạo bởi', 'INT', 'select', $order++, 
        ['select_table_id' => $user->id, 'edit' => 0]);
        MigrateService::createColumn02($images->id, 'created_at', 'Ngày tạo', 'DATETIME', 'datetime', $order++, 
        ['edit' => 0]);
        MigrateService::createColumn02($images->id, 'updated_at', 'Ngày tạo', 'DATETIME', 'datetime', $order++, 
        ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('library_data');
    }
};
