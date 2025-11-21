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
        Schema::create('page_setting_data', function (Blueprint $table) {
            $table->id();
            $table->text('name_data')->nullable(); //title
            $table->text('title_description')->nullable(); //title
            $table->integer('data_id')->default(0)->nullable();
            $table->integer('languages_id')->default(0)->nullable();
            $table->text('images_data')->nullable();
            $table->integer('active')->default(1)->nullable();

            $table->text('description')->nullable();
            $table->text('content')->nullable();
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_setting_data');
    }
};
