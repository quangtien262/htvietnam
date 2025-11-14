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
        Schema::create('pro___notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('admin_user_id')->comment('Người nhận thông báo');
            $table->unsignedBigInteger('created_by')->nullable()->comment('Người tạo thông báo');
            $table->string('type', 50)->comment('task_comment, task_checklist, task_file, task_member, task_date, task_status, task_priority, project_checklist, project_file, project_member, project_date, project_status, project_priority');
            $table->string('notifiable_type', 100)->comment('App\\Models\\Task, App\\Models\\Project');
            $table->unsignedBigInteger('notifiable_id')->comment('ID của task hoặc project');
            $table->text('message')->comment('Nội dung thông báo');
            $table->text('data')->nullable()->comment('Dữ liệu bổ sung (JSON)');
            $table->timestamp('read_at')->nullable()->comment('Thời gian đọc');
            $table->timestamps();

            $table->foreign('admin_user_id')->references('id')->on('admin_users')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('admin_users')->onDelete('set null');

            $table->index(['admin_user_id', 'read_at']);
            $table->index(['notifiable_type', 'notifiable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pro___notifications');
    }
};
