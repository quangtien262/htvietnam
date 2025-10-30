<?php
namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class TaskChecklist extends Model
{
    protected $table = 'task_checklist';

    static function baseQuery()
    {
        return self::select([
            'task_checklist.*',
            'task_checklist.id as key',
            'admin_users.name as nguoi_thuc_hien_name'
        ])
            ->leftJoin('admin_users', 'admin_users.id', 'task_checklist.nguoi_thuc_hien')
            ->where('task_checklist.is_recycle_bin', 0);
    }
}
