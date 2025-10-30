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
        Schema::create('colors_data', function (Blueprint $table) {
            $table->id();            
            $table->text('name_data')->nullable();
            $table->text('data_id')->nullable();
            $table->text('languages_id')->nullable();
            
            $table->integer('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->integer('create_by')->default(1)->nullable();
            $table->timestamps();
        });

        $table = MigrateService::createTable02(
            'colors_data',
            'colors_data',
            ['parent_id' => 0,'is_edit' => 0]
        );
        MigrateService::createColumn02($table->id, 'name_data', 'Tên màu', 'TEXT', 'text', 1,['show_in_list' => 1, 'edit' => 1]);

        MigrateService::baseColumn($table);


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('colors_data');
    }
};
