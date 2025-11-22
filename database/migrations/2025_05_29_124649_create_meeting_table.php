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
        Schema::create('meeting', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->text('description')->nullable();

            $table->string('admin_menu_parent_id')->nullable();
            $table->string('parent_name')->nullable();
            $table->string('data_type')->nullable(); //table: task, project
            $table->integer('data_id')->default(0)->nullable();

            $table->integer('project_id')->default(0)->nullable();
            $table->integer('task_id')->default(0)->nullable();

            $table->integer('is_daily')->default(0)->nullable();
            $table->integer('is_weekly')->default(0)->nullable();
            $table->integer('is_monthly')->default(0)->nullable();
            $table->integer('is_yearly')->default(0)->nullable();

            $table->integer('meeting_status_id')->default(1)->nullable();

            MigrateService::createBaseColumn($table);


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meeting');
    }
};
