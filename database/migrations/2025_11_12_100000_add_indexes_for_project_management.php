<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Add indexes to improve query performance for Project Management module
     */
    public function up(): void
    {
        // Add indexes to pro___projects
        Schema::table('pro___projects', function (Blueprint $table) {
            $table->index('trang_thai_id');
            $table->index('loai_du_an_id');
            $table->index('uu_tien_id');
            $table->index('quan_ly_du_an_id');
            $table->index('ngay_bat_dau');
            $table->index('ngay_ket_thuc_du_kien');
            $table->index(['trang_thai_id', 'ngay_ket_thuc_du_kien']); // Composite for delayed projects query
        });

        // Add indexes to pro___tasks
        Schema::table('pro___tasks', function (Blueprint $table) {
            $table->index('project_id');
            $table->index('parent_id');
            $table->index('trang_thai_id');
            $table->index('uu_tien_id');
            $table->index('nguoi_thuc_hien_id');
            $table->index('ngay_bat_dau');
            $table->index('ngay_ket_thuc_du_kien');
            $table->index('kanban_order');
            $table->index(['project_id', 'trang_thai_id']); // Composite for Kanban queries
            $table->index(['project_id', 'deleted_at']); // For soft deletes queries
        });

        // Add indexes to pro___project_members
        Schema::table('pro___project_members', function (Blueprint $table) {
            $table->index('admin_user_id');
            $table->index('is_active');
            $table->index(['project_id', 'is_active']); // Composite for active members
        });

        // Add indexes to pro___task_checklists
        Schema::table('pro___task_checklists', function (Blueprint $table) {
            $table->index('task_id');
            $table->index('thu_tu');
        });

        // Add indexes to pro___task_comments
        Schema::table('pro___task_comments', function (Blueprint $table) {
            $table->index('task_id');
            $table->index('parent_id');
            $table->index('admin_user_id');
        });

        // Add indexes to pro___task_attachments
        Schema::table('pro___task_attachments', function (Blueprint $table) {
            $table->index('task_id');
            $table->index('admin_user_id');
        });

        // Add index to pro___activity_logs
        Schema::table('pro___activity_logs', function (Blueprint $table) {
            $table->index('admin_user_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes from pro___projects
        Schema::table('pro___projects', function (Blueprint $table) {
            $table->dropIndex(['trang_thai_id']);
            $table->dropIndex(['loai_du_an_id']);
            $table->dropIndex(['uu_tien_id']);
            $table->dropIndex(['quan_ly_du_an_id']);
            $table->dropIndex(['ngay_bat_dau']);
            $table->dropIndex(['ngay_ket_thuc_du_kien']);
            $table->dropIndex(['trang_thai_id', 'ngay_ket_thuc_du_kien']);
        });

        // Drop indexes from pro___tasks
        Schema::table('pro___tasks', function (Blueprint $table) {
            $table->dropIndex(['project_id']);
            $table->dropIndex(['parent_id']);
            $table->dropIndex(['trang_thai_id']);
            $table->dropIndex(['uu_tien_id']);
            $table->dropIndex(['nguoi_thuc_hien_id']);
            $table->dropIndex(['ngay_bat_dau']);
            $table->dropIndex(['ngay_ket_thuc_du_kien']);
            $table->dropIndex(['kanban_order']);
            $table->dropIndex(['project_id', 'trang_thai_id']);
            $table->dropIndex(['project_id', 'deleted_at']);
        });

        // Drop indexes from pro___project_members
        Schema::table('pro___project_members', function (Blueprint $table) {
            $table->dropIndex(['admin_user_id']);
            $table->dropIndex(['is_active']);
            $table->dropIndex(['project_id', 'is_active']);
        });

        // Drop indexes from pro___task_checklists
        Schema::table('pro___task_checklists', function (Blueprint $table) {
            $table->dropIndex(['task_id']);
            $table->dropIndex(['thu_tu']);
        });

        // Drop indexes from pro___task_comments
        Schema::table('pro___task_comments', function (Blueprint $table) {
            $table->dropIndex(['task_id']);
            $table->dropIndex(['parent_id']);
            $table->dropIndex(['admin_user_id']);
        });

        // Drop indexes from pro___task_attachments
        Schema::table('pro___task_attachments', function (Blueprint $table) {
            $table->dropIndex(['task_id']);
            $table->dropIndex(['admin_user_id']);
        });

        // Drop indexes from pro___activity_logs
        Schema::table('pro___activity_logs', function (Blueprint $table) {
            $table->dropIndex(['admin_user_id']);
            $table->dropIndex(['created_at']);
        });
    }
};
