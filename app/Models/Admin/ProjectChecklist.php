<?php
namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class ProjectChecklist extends Model
{
    protected $table = 'project_checklist';

    static function baseQuery()
    {
        return self::select([
            'project_checklist.*',
            'project_checklist.id as key',
            'admin_users.name as nguoi_thuc_hien_name'
        ])
            ->leftJoin('admin_users', 'admin_users.id', 'project_checklist.nguoi_thuc_hien')
            ->where('project_checklist.is_recycle_bin', 0);
    }
}
