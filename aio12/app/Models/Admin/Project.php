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

    static function getProjectByStatus($request = [], $parentName)
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
            if (!empty($request->keyword)) {
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

    static function getDatas($parentName, $request = [])
    {
        $dataSource = Project::baseQuery()
            ->where('projects.parent_name', $parentName);
        if (!empty($request['keyword'])) {
            $dataSource = $dataSource->where('projects.name', 'like', '%' . $request['keyword'] . '%');
        }
        $dataSource = $dataSource->paginate(30)->toArray();
        return $dataSource;
    }
}
