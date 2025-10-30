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
        Schema::create('product_setting_data', function (Blueprint $table) {
            $table->id();
            $table->string('name_data')->nullable();
            $table->string('data_id')->nullable();
            $table->string('languages_id')->nullable();
            $table->longtext('description')->nullable();
            $table->longtext('content')->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->timestamps();
        });

        // Setting
        
        $parent = Table::where('name', 'product_setting')->first();
        $order = 1;
        $data = MigrateService::createTable02(
            'product_setting_data',
            'product_setting_data',
            ['is_edit' => 0, 'parent_id' => $parent->id]
        );

        MigrateService::baseColumn($data,100, true);

        MigrateService::createColumn02(
            $data->id,
            'name',
            'Tiêu đề',
            'VARCHAR',
            'text',
            $order++,
            ['show_in_list' => 1, 'edit' => 1]
        );

        MigrateService::createColumn02(
            $data->id,
            'description',
            'Mô tả ngắn',
            'TEXT',
            'textarea',
            $order++,
            ['show_in_list' => 1, 'col' => 24, 'edit' => 1]
        );
        MigrateService::createColumn02(
            $data->id,
            'content',
            'Nội dung',
            'LONGTEXT',
            'tiny',
            $order++,
            ['show_in_list' => 0, 'col' => 24, 'edit' => 1]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_setting_data');
    }
};
