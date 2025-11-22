<?php

use App\Services\MigrateService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('task_logs', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->string('description')->nullable();
            $table->integer('data_id')->default(0)->nullable();
            $table->integer('project_id')->default(0)->nullable();
            $table->integer('task_id')->default(0)->nullable();
            $table->string('table')->nullable();
            $table->string('parent_name')->nullable();
            $table->string('user_name')->nullable();
            $table->string('column_name')->nullable();
            $table->string('type')->nullable(); // edit, add, delete

            MigrateService::createBaseColumn($table);



        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_logs');
    }
};
