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
            if (!$this->indexExists('pro___projects', 'pro___projects_trang_thai_id_index')) {
                $table->index('trang_thai_id');
            }
            if (!$this->indexExists('pro___projects', 'pro___projects_loai_du_an_id_index')) {
                $table->index('loai_du_an_id');
            }
            if (!$this->indexExists('pro___projects', 'pro___projects_uu_tien_id_index')) {
                $table->index('uu_tien_id');
            }
            if (!$this->indexExists('pro___projects', 'pro___projects_quan_ly_du_an_id_index')) {
                $table->index('quan_ly_du_an_id');
            }
            if (!$this->indexExists('pro___projects', 'pro___projects_ngay_bat_dau_index')) {
                $table->index('ngay_bat_dau');
            }
            if (!$this->indexExists('pro___projects', 'pro___projects_ngay_ket_thuc_du_kien_index')) {
                $table->index('ngay_ket_thuc_du_kien');
            }
            if (!$this->indexExists('pro___projects', 'pro___projects_trang_thai_id_ngay_ket_thuc_du_kien_index')) {
                $table->index(['trang_thai_id', 'ngay_ket_thuc_du_kien']);
            }
        });

        // Add indexes to pro___tasks
        Schema::table('pro___tasks', function (Blueprint $table) {
            if (!$this->indexExists('pro___tasks', 'pro___tasks_project_id_index')) {
                $table->index('project_id');
            }
            if (!$this->indexExists('pro___tasks', 'pro___tasks_parent_id_index')) {
                $table->index('parent_id');
            }
            if (!$this->indexExists('pro___tasks', 'pro___tasks_trang_thai_id_index')) {
                $table->index('trang_thai_id');
            }
            if (!$this->indexExists('pro___tasks', 'pro___tasks_uu_tien_id_index')) {
                $table->index('uu_tien_id');
            }
            if (!$this->indexExists('pro___tasks', 'pro___tasks_nguoi_thuc_hien_id_index')) {
                $table->index('nguoi_thuc_hien_id');
            }
            if (!$this->indexExists('pro___tasks', 'pro___tasks_ngay_bat_dau_index')) {
                $table->index('ngay_bat_dau');
            }
            if (!$this->indexExists('pro___tasks', 'pro___tasks_ngay_ket_thuc_du_kien_index')) {
                $table->index('ngay_ket_thuc_du_kien');
            }
            if (!$this->indexExists('pro___tasks', 'pro___tasks_kanban_order_index')) {
                $table->index('kanban_order');
            }
            if (!$this->indexExists('pro___tasks', 'pro___tasks_project_id_trang_thai_id_index')) {
                $table->index(['project_id', 'trang_thai_id']);
            }
            if (!$this->indexExists('pro___tasks', 'pro___tasks_project_id_deleted_at_index')) {
                $table->index(['project_id', 'deleted_at']);
            }
        });

        // Add indexes to pro___project_members
        Schema::table('pro___project_members', function (Blueprint $table) {
            if (!$this->indexExists('pro___project_members', 'pro___project_members_admin_user_id_index')) {
                $table->index('admin_user_id');
            }
            if (!$this->indexExists('pro___project_members', 'pro___project_members_is_active_index')) {
                $table->index('is_active');
            }
            if (!$this->indexExists('pro___project_members', 'pro___project_members_project_id_is_active_index')) {
                $table->index(['project_id', 'is_active']);
            }
        });

        // Add indexes to pro___task_checklists
        Schema::table('pro___task_checklists', function (Blueprint $table) {
            if (!$this->indexExists('pro___task_checklists', 'pro___task_checklists_task_id_index')) {
                $table->index('task_id');
            }
            if (!$this->indexExists('pro___task_checklists', 'pro___task_checklists_sort_order_index')) {
                $table->index('sort_order');
            }
        });

        // Add indexes to pro___task_comments
        Schema::table('pro___task_comments', function (Blueprint $table) {
            if (!$this->indexExists('pro___task_comments', 'pro___task_comments_task_id_index')) {
                $table->index('task_id');
            }
            if (!$this->indexExists('pro___task_comments', 'pro___task_comments_parent_id_index')) {
                $table->index('parent_id');
            }
            if (!$this->indexExists('pro___task_comments', 'pro___task_comments_admin_user_id_index')) {
                $table->index('admin_user_id');
            }
        });

        // Add indexes to pro___task_attachments
        Schema::table('pro___task_attachments', function (Blueprint $table) {
            if (!$this->indexExists('pro___task_attachments', 'pro___task_attachments_task_id_index')) {
                $table->index('task_id');
            }
            if (!$this->indexExists('pro___task_attachments', 'pro___task_attachments_uploaded_by_index')) {
                $table->index('uploaded_by');
            }
        });

        // Add index to pro___activity_logs
        Schema::table('pro___activity_logs', function (Blueprint $table) {
            if (!$this->indexExists('pro___activity_logs', 'pro___activity_logs_admin_user_id_index')) {
                $table->index('admin_user_id');
            }
            if (!$this->indexExists('pro___activity_logs', 'pro___activity_logs_created_at_index')) {
                $table->index('created_at');
            }
        });
    }

    /**
     * Check if index exists
     */
    private function indexExists($table, $index)
    {
        $conn = Schema::getConnection();
        $dbName = $conn->getDatabaseName();
        
        $indexes = $conn->select(
            "SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
             WHERE table_schema = ? 
             AND table_name = ? 
             AND index_name = ?",
            [$dbName, $table, $index]
        );
        
        return count($indexes) > 0;
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
            $table->dropIndex(['sort_order']);
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
