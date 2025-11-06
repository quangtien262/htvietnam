<?php

namespace App\Models\Admin;


use Illuminate\Database\Eloquent\Model;

class TaskComment extends Model
{
    protected $table = 'task_comment';

    static function getByTask($taskId)
    {
        return self::select(
                'task_comment.*',
                'admin_users.name as admin_users_name',
                'users.name as users_name'
            )
            ->leftJoin('admin_users', 'admin_users.id', 'task_comment.admin_user_id')
            ->leftJoin('users', 'users.id', 'task_comment.user_id')
            ->where('task_comment.is_recycle_bin', 0)
            ->where('task_comment.task_id', $taskId)
            ->orderBy('task_comment.id', 'desc')
            ->get()
            ->toArray();
    }
    static function getByProject($projectId)
    {
        return self::select(
                'task_comment.*',
                'admin_users.name as admin_users_name',
                'users.name as users_name'
            )
            ->leftJoin('admin_users', 'admin_users.id', 'task_comment.create_by')
            ->leftJoin('users', 'users.id', 'task_comment.user_id')
            ->where('task_comment.is_recycle_bin', 0)
            ->where('task_comment.project_id', $projectId)
            ->orderBy('task_comment.id', 'desc')
            ->get()
            ->toArray();
    }
}
