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
        Schema::create('why_us_data', function (Blueprint $table) {
            $table->id();
            $table->string('name_data')->nullable();
            $table->string('title_description')->nullable();
            $table->integer('data_id')->nullable();
            $table->integer('languages_id')->nullable();
            $table->longtext('description')->nullable();
            $table->longtext('content')->nullable();

            MigrateService::createBaseColumn($table);
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('why_us_data');
    }
};
