<?php

namespace App\Models\Admin;


use Illuminate\Database\Eloquent\Model;

class TaskComment extends Model
{
    protected $table = 'task_comment';

    static function getByTask($taskId)
    {
        return self::where('task_comment.task_id', $taskId)
            ->leftJoin('admin_users', 'admin_users.id', 'task_comment.create_by')
            ->where('task_comment.is_recycle_bin', 0)
            ->orderBy('task_comment.id', 'desc')
            ->get(['task_comment.*', 'admin_users.name as admin_users_name'])
            ->toArray();
    }
}
