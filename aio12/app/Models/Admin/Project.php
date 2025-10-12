<?php

namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Project extends Model
{
    protected $table = 'projects';
    protected $casts = [
        'project_type_ids' => Json::class,
        'nguoi_theo_doi' => Json::class,
        'nguoi_thuc_hien' => Json::class,
        'tags' => Json::class,
    ];

    static function baseQuery()
    {
        return self::select([
            'projects.*',
            'projects.id as key',
            'project_status.name as project_status_name',
            'project_status.color as project_status_color',
            'project_status.background as project_status_background',
            'project_status.icon as project_status_icon'
        ])
            ->leftJoin('project_status', 'project_status.id', 'projects.project_status_id')
            ->leftJoin('admin_users', 'admin_users.id', 'projects.nguoi_thuc_hien')
            ->where('projects.is_recycle_bin', 0)
            ->orderBy('projects.sort_order', 'asc');
    }

    static function projectDetail($id)
    {
        return self::select([
            'projects.*',
            'projects.id as key',
            'project_status.name as project_status_name',
            'project_status.color as project_status_color',
            'project_status.background as project_status_background',
            'project_status.icon as project_status_icon'
        ])
            ->leftJoin('project_status', 'project_status.id', 'projects.project_status_id')
            ->find($id);
    }

    static function getProjectByStatus($parentName, $request = [])
    {
        // get list tasks
        $datas = [];
        $status_db = DB::table('project_status')
            ->where('parent_name', $parentName)
            ->where('is_recycle_bin', 0)
            ->orderBy('sort_order', 'asc')
            ->get(['name', 'id', 'sort_order', 'color', 'background', 'icon']);
        foreach ($status_db as $st) {
            $projects = self::where('projects.project_status_id', $st->id)
                ->where('projects.parent_name', $parentName)
                ->where('projects.is_recycle_bin', 0)
                ->orderBy('projects.sort_order', 'asc');
            if (!empty($request['keyword'])) {
                $projects = $projects->where('projects.name', 'like', '%' . $request['keyword'] . '%');
            }

            $projects = $projects->get(['projects.*']);
            $datas[] = [
                'status' => $st,
                'datas' => $projects
            ];
        }
        return $datas;
    }

    static function getDatas($parentName, $searchData = []){
        $dataSource = self::baseQuery()
            ->where('projects.parent_name', $parentName);
        if (!empty($searchData['keyword'])) {
            $dataSource = $dataSource->where('projects.name', 'like', '%' . $searchData['keyword'] . '%');
        }

        if (!empty($searchData['status'])) {
            $dataSource = $dataSource->whereIn('projects.project_status_id', $searchData['status']);
        }

        if (!empty($searchData['manager'])) {
            $dataSource = $dataSource->where('projects.project_manager', $searchData['manager']);
        }

        if (!empty($searchData['support'])) {
            // search nguoi_theo_doi json
            $dataSource = $dataSource->where('projects.nguoi_theo_doi', 'like', '%"' . $searchData['support'] . '"%');
        }

        $dataSource = $dataSource->paginate(30)->toArray();
        return $dataSource;
    }

}
