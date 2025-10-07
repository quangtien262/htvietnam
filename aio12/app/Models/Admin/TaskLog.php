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


    static function logAdd($table, $name, $dataId = 0)
    {
        $user = auth()->user();
        $data = [
            'name' => $name,
            'table' => $table,
            'user_name' => $user->name,
            'create_by' => $user->id,
            'data_id' => $dataId,
            'type' => 'add',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ];
        DB::table('task_logs')->insert($data);
    }

    static function logEdit($table, $data, $request)
    {
        $user = auth()->user();
        $table = Table::where('name', 'tasks')->first();
        $column = Column::where('table_id', $table->id)->where('name', $request->column_name)->first();
        $colName = $request->column_name;
        $title = '';
        switch ($colName) {
            case 'nguoi_theo_doi':
                $title = 'Đã cập nhật lại danh sách người theo dõi hoặc làm cùng';
                break;
            case 'task_prority_id':
            case 'task_status_id':
            case 'nguoi_thuc_hien':
                $tblSelect = Table::find($column->select_table_id);
                if ($tblSelect) {
                    $selectData = DB::table($tblSelect->name)->find($data->{$colName});
                    $oldSelectData = DB::table($tblSelect->name)->find($request->value);
                    if ($selectData && $oldSelectData) {
                        $title = 'Đã sửa ' . $column->display_name . ' "' . $data->name . '": ' . $oldSelectData->name . ' => ' . $selectData->name;
                    } elseif ($selectData) {
                        $title = 'Đã sửa ' . $column->display_name . ' "' . $data->name . '":  => ' . $selectData->name;
                    } elseif ($oldSelectData) {
                        $title = 'Đã sửa ' . $column->display_name . ' "' . $data->name . '": ' . $oldSelectData->name . ' => ';
                    }
                }
                break;
            default:
                $title = 'Đã sửa ' . $column->display_name . ' "' . $data->name . '": ' . $data->{$column} . ' => ' . $request->value;
                break;
        }

        $data = [
            'name' => $title,
            'table' => $table->name,
            'column_name' => $column->display_name,
            'user_name' => $user->name,
            'data_id' => $data->id,
            'create_by' => $user->id,
            'type' => 'edit',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ];
        DB::table('task_logs')->insert($data);

    }

    static function logDelete($table, $name, $dataId)
    {
        $user = auth()->user();
        $log = new self();
        $log->name = $name;
        $log->table = $table;
        $log->data_id = $dataId;
        $log->user_name = $user->name;
        $log->create_by = $user->id;
        $log->type = 'delete';
        $log->save();
    }
}
