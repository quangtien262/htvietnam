<?php

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
        Schema::create('pro___meeting', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->comment('Tiêu đề meeting');
            $table->unsignedBigInteger('meeting_status_id')->default(1);
            $table->text('content')->nullable()->comment('Nội dung meeting');
            $table->string('meeting_type', 50)->default('daily')->comment('daily, weekly, monthly, yearly');
            $table->dateTime('scheduled_at')->nullable()->comment('Thời gian dự kiến');
            $table->dateTime('started_at')->nullable()->comment('Thời gian bắt đầu thực tế');
            $table->dateTime('ended_at')->nullable()->comment('Thời gian kết thúc');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('meeting_status_id')->references('id')->on('pro___meeting_status')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('admin_users')->onDelete('set null');
        });

        // Bảng trung gian meeting - tasks
        Schema::create('pro___meeting_tasks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('meeting_id');
            $table->unsignedBigInteger('task_id');
            $table->text('note')->nullable()->comment('Ghi chú cho task trong meeting này');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('meeting_id')->references('id')->on('pro___meeting')->onDelete('cascade');
            $table->foreign('task_id')->references('id')->on('pro___tasks')->onDelete('cascade');
            
            $table->unique(['meeting_id', 'task_id']);
        });

        // Bảng trung gian meeting - projects
        Schema::create('pro___meeting_projects', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('meeting_id');
            $table->unsignedBigInteger('project_id');
            $table->text('note')->nullable()->comment('Ghi chú cho project trong meeting này');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('meeting_id')->references('id')->on('pro___meeting')->onDelete('cascade');
            $table->foreign('project_id')->references('id')->on('pro___projects')->onDelete('cascade');
            
            $table->unique(['meeting_id', 'project_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pro___meeting_projects');
        Schema::dropIfExists('pro___meeting_tasks');
        Schema::dropIfExists('pro___meeting');
    }
};
