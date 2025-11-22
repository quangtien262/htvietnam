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
        Schema::create('task_comment', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->text('content')->nullable();
            $table->text('task_id')->nullable();
            $table->string('parent_name')->nullable();
            $table->integer('admin_user_id')->nullable();
            $table->integer('user_id')->nullable();

            MigrateService::createBaseColumn($table);


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_comment');
    }
};
