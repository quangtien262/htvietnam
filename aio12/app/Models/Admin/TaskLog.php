<?php

namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class TaskLog extends Model
{

    const PARENT = [
        'task' => 'Công việc',
        'projects' => 'Dự án',
        'cskh' => 'Dự án',
    ];

    protected $table = 'task_logs';
    protected $casts = [
        'task_type_ids' => Json::class,
        'nguoi_theo_doi' => Json::class,
        'tags' => Json::class,
    ];


    static function logAdd($table, $name,  $dataId = 0)
    {
        $user = auth()->user();
        $log = new self();
        $log->name = $name;
        $log->table = $table;
        $log->user_name = $user->name;
        $log->created_by = $user->id;
        $log->data_id = $dataId;
        $log->type = 'add';
        $log->save();
    }

    static function logEdit($table, $name, $dataId, $column = '')
    {
        $user = auth()->user();
        $log = new self();
        $log->name = $name;
        $log->table = $table;
        $log->column_name = $column;
        $log->user_name = $user->name;
        $log->data_id = $dataId;
        $log->created_by = $user->id;
        $log->type = 'edit';
        $log->save();
    }

    static function logDelete($table, $name, $dataId)
    {
        $user = auth()->user();
        $log = new self();
        $log->name = $name;
        $log->table = $table;
        $log->data_id = $dataId;
        $log->user_name = $user->name;
        $log->created_by = $user->id;
        $log->type = 'delete';
        $log->save();
    }
}
