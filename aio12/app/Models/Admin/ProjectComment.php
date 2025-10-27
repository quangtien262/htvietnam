<?php

namespace App\Models\Admin;


use Illuminate\Database\Eloquent\Model;

class ProjectComment extends Model
{
    protected $table = 'project_comment';

    static function getByProject($projectId)
    {
        return self::where('project_comment.project_id', $projectId)
            ->leftJoin('admin_users', 'admin_users.id', 'project_comment.create_by')
            ->where('project_comment.is_recycle_bin', 0)
            ->orderBy('project_comment.id', 'desc')
            ->get(['project_comment.*', 'admin_users.name as admin_users_name'])
            ->toArray();
    }


}
