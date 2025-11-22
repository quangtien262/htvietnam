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
        Schema::create('task_status', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('description')->nullable();
            $table->string('color')->default('#ffffff')->nullable();
            $table->string('parent_name')->nullable();
            $table->string('project_id')->nullable();
            $table->string('background')->default('#64748b')->nullable();
            $table->string('icon')->default('CaretRightOutlined')->nullable();
            $table->integer('is_active')->default(1)->nullable();
            $table->integer('width')->default(280)->nullable();
            $table->integer('sort_order')->default(280)->nullable();

            // search mặc định, khi show ở kanban thì sẽ load những task có trạng thái này  nhiều hơn
            $table->integer('is_default')->default(1)->nullable();


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_status');
    }
};
