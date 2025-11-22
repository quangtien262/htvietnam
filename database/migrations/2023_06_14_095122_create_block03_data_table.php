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
        Schema::create('block03_data', function (Blueprint $table) {
            $table->id();
            $table->string('name_data')->nullable();
            $table->string('title_description')->nullable();
            $table->string('data_id')->nullable();
            $table->string('languages_id')->nullable();
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
        Schema::dropIfExists('block03_data');
    }
};
