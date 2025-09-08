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
        Schema::create('link_footer_data', function (Blueprint $table) {
            $table->id();
            $table->string('name_data')->nullable();
            $table->string('title_description')->nullable();
            $table->integer('languages_id')->nullable();
            $table->integer('data_id')->nullable();
            $table->text('description')->nullable();
            $table->longtext('content')->nullable();
            $table->text('meta_title')->nullable();
            $table->text('meta_keyword')->nullable();
            $table->text('meta_description')->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });

        $order = 1;
        $data =  MigrateService::createTable02('link_footer_data', 'Liên kết Footer');

        MigrateService::baseColumn($data, 100, true);

        MigrateService::createColumn02($data->id, 'name_data', 'Tiêu đề', 'TEXT', 'text', $order++,
        ['show_in_list' => 1, 'is_view_detail' => 1]);
        MigrateService::createColumn02($data->id, 'description', 'Mô tả', 'TEXT', 'text', $order++, ['show_in_list' => 1]);
        MigrateService::createColumn02($data->id, 'content', 'Nội dung', 'TEXT', 'text', $order++, ['show_in_list' => 1]);


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('link_footer_data');
    }
};
