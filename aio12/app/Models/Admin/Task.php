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
        'tags' => Json::class,
    ];

    static function baseQuery()
    {
        return self::select([
            'tasks.*',
            'tasks.id as key',
            'task_status.name as task_status_name',
            'task_status.color as task_status_color',
            'task_status.background as task_status_background',
            'task_status.icon as task_status_icon',
            'task_priority.name as task_priority_name',
            'task_priority.color as task_priority_color',
            'task_priority.sort_order as task_priority_sort_order',
            'admin_users.name as assignee_name',
        ])
            ->leftJoin('task_status', 'task_status.id', 'tasks.task_status_id')
            ->leftJoin('task_priority', 'task_priority.id', 'tasks.task_priority_id')
            ->leftJoin('admin_users', 'admin_users.id', 'tasks.nguoi_thuc_hien')
            ->where('tasks.is_recycle_bin', 0)
            ->orderBy('tasks.sort_order', 'asc');
    }

    static function getTaskByStatus($request = [], $parentName)
    {
        // get list tasks
        $datas = [];
        $status_db = DB::table('task_status')
            ->where('parent_name', $parentName)
            ->where('is_recycle_bin', 0)
            ->orderBy('sort_order', 'asc')
            ->get(['name', 'id', 'sort_order', 'color', 'background', 'icon']);
        foreach ($status_db as $st) {
            $tasks = Task::where('tasks.task_status_id', operator: $st->id)
                ->where('tasks.parent_name', $parentName)
                ->leftJoin('admin_users', 'admin_users.id', 'tasks.nguoi_thuc_hien')
                ->where('tasks.is_recycle_bin', 0)
                ->orderBy('tasks.sort_order', 'asc');
            if (!empty($request['pid'])) {
                $tasks = $tasks->where('tasks.project_id', $request['pid']);
            }
            if (!empty($request['keyword'])) {
                $tasks = $tasks->where('tasks.name', 'like', '%' . $request['keyword'] . '%');
            }
            if (!empty($request['pic'])) {
                $tasks = $tasks->where('tasks.nguoi_thuc_hien', $request['pic']);
            }
            if (!empty($request['support'])) {
                $tasks = $tasks->where('tasks.nguoi_theo_doi', $request['support']);
            }
            if (!empty($request['priority'])) {
                $tasks = $tasks->where('tasks.task_priority_id', $request['priority']);
            }

            $tasks = $tasks->get(['tasks.*']);
            $datas[] = [
                'status' => $st,
                'datas' => $tasks
            ];
        }
        return $datas;
    }

    static function getTaskByProject($projectId)
    {
        $datas = self::select(
            'tasks.*',
            'task_status.name as task_status_name',
            'task_status.color as task_status_color',
            'task_status.background as task_status_background',
            'task_status.icon as task_status_icon',
            'task_priority.name as task_priority_name',
            'task_priority.color as task_priority_color',
            'task_priority.sort_order as task_priority_sort_order',
            'admin_users.name as assignee_name',

        )
            ->where('tasks.project_id', $projectId)
            ->leftJoin('task_status', 'task_status.id', 'tasks.task_status_id')
            ->leftJoin('task_priority', 'task_priority.id', 'tasks.task_priority_id')
            ->leftJoin('admin_users', 'admin_users.id', 'tasks.nguoi_thuc_hien')
            ->where('tasks.is_recycle_bin', 0)
            ->orderBy('task_priority.sort_order', 'asc')
            ->orderBy('tasks.id', 'desc')
            ->get()
            ->toArray();
        return $datas;
    }

    static function getDatas($parentName, $searchData = []) {
        $dataSource = self::baseQuery()
            ->where('tasks.parent_name', $parentName);
        if (!empty($searchData['keyword'])) {
            $dataSource = $dataSource->where('tasks.name', 'like', '%' . $searchData['keyword'] . '%');
        }

        if (!empty($searchData['status'])) {
            $dataSource = $dataSource->whereIn('tasks.task_status_id', $searchData['status']);
        }

        if (!empty($searchData['manager'])) {
            $dataSource = $dataSource->where('tasks.task_manager', $searchData['manager']);
        }

        if (!empty($searchData['support'])) {
            // search nguoi_theo_doi json
            $dataSource = $dataSource->where('tasks.nguoi_theo_doi', 'like', '%"' . $searchData['support'] . '"%');
        }

        $dataSource = $dataSource->paginate(30)->toArray();
        return $dataSource;
    }
}
