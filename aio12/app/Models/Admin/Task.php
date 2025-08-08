<?php

namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Task extends Model
{
    protected $table = 'tasks';
    protected $casts = [
        'task_type_ids' => Json::class,
        'nguoi_theo_doi' => Json::class,
    ];

    static function getTaskByStatus($request = [])
    {
        // get list tasks
        $datas = [];
        $status_db = DB::table('task_status')
            ->orderBy('sort_order', 'asc')
            ->get(['name', 'id', 'sort_order', 'color', 'background', 'icon']);
        foreach ($status_db as $st) {
            $tasks = Task::where('tasks.task_status_id', $st->id)
                ->leftJoin('admin_users', 'admin_users.id', 'tasks.nguoi_thuc_hien')
                ->where('tasks.is_recycle_bin', 0)
                ->orderBy('tasks.sort_order', 'asc')
                ->get(['tasks.*']);
            $datas[] = [
                'status' => $st,
                'datas' => $tasks
            ];
        }
        return $datas;
    }
}
