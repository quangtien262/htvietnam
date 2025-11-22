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
        Schema::create('task_priority', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('description')->nullable();
            $table->string('color')->default('#000000')->nullable();
            $table->string('parent_name')->nullable();
            $table->string('icon')->nullable();
            $table->integer('is_active')->default(1)->nullable();
            $table->integer('is_default')->default(1)->nullable();

            MigrateService::createBaseColumn($table);



        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_priority');
    }
};
