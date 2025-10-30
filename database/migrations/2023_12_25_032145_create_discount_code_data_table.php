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
        Schema::create('discount_code_data', function (Blueprint $table) {
            $table->id();
            $table->string('name_data')->nullable();
            $table->integer('data_id')->nullable();
            $table->integer('languages_id')->nullable();

            $table->text('description')->nullable();
            $table->longText('content')->nullable();

            $table->integer('create_by')->default(1)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->timestamps();
        });
        $order = 1;

        $data = MigrateService::createTable02('discount_code_data', 'discount_code_data',['is_edit' => 0]);
        
        MigrateService::baseColumn($data);
        
        MigrateService::createColumn02($data->id, 'name_data', 'Tiêu đề', 'VARCHAR', 'text', $order++);
        MigrateService::createColumn02($data->id, 'description', 'Mô tả ngắn', 'TEXT', 'textarea', $order++);
        MigrateService::createColumn02($data->id, 'content', 'Nội dung', 'LONGTEXT', 'tiny', $order++);

       
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discount_code_data');
    }
};
