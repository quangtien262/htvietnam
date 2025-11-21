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
        Schema::create('project_setting_add_task_express', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable(); // Tên mẫu task
            $table->text('tasks')->nullable(); // JSON array chứa các task [{name: '', description: ''}]
            $table->integer('is_active')->default(1)->nullable(); // 1: active, 0: inactive
            $table->integer('updated_by')->nullable();
            MigrateService::createBaseColumn($table);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_setting_add_task_express');
    }
};
