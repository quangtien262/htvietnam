<?php

namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    protected $table = 'meeting';

    protected $casts = [
        'task_nguoi_theo_doi' => Json::class,
        'project_nguoi_theo_doi' => Json::class,
    ];

    static function baseQuery($isRecycleBin = 0)
    {
        return self::select([
            'meeting.*',
            'meeting.id as key',

            'projects.name as project_name',
            'projects.id as project_id',
            'projects.description as project_description',
            'projects.project_manager as project_manager',
            'projects.nguoi_theo_doi as project_nguoi_theo_doi',
            'projects.project_status_id as project_status_id',
            'projects.start as project_start',
            'projects.end as project_end',
            'projects.actual as project_actual',

            'tasks.name as task_name',
            'tasks.description as task_description',
            'tasks.task_status_id as task_status_id',
            'tasks.nguoi_thuc_hien as task_nguoi_thuc_hien',
            'tasks.nguoi_theo_doi as task_nguoi_theo_doi',
            'tasks.start as task_start',
            'tasks.end as task_end',
            'tasks.actual as task_actual',

            'meeting_status.name as meeting_status_name',
            'meeting_status.color as meeting_status_color',
            'meeting_status.background as meeting_status_background',
            'meeting_status.icon as meeting_status_icon',
        ])
            ->leftJoin('projects', 'projects.id', 'meeting.project_id')
            ->leftJoin('tasks', 'tasks.id', 'meeting.task_id')
            ->leftJoin('meeting_status', 'meeting_status.id', 'meeting.meeting_status_id');
    }

    static function saveMeeting($data, $request, $tableName)
    {
        $checkMeeting = Meeting::where('data_type', $tableName)->where('data_id', $data->id)->first();
        if (!empty($checkMeeting)) {
            $meeting = $checkMeeting;
        } else {
            $meeting = new Meeting();
        }

        $meeting->data_id = $data->id;
        if ($tableName == 'projects') {
            $meeting->project_id = $data->id;
        }
        if ($tableName == 'tasks') {
            $meeting->task_id = $data->id;
        }

        $meeting->admin_menu_parent_id = $request->p;
        $meeting->name = $data->name;
        $meeting->description = $data->description;

        $meeting->parent_name = $data->parent_name;
        $meeting->data_type = $tableName;

        $meeting->is_daily = $request->column_name == 'is_daily' ? $request->value : $data->is_daily;
        $meeting->is_weekly = $request->column_name == 'is_weekly' ? $request->value : $data->is_weekly;
        $meeting->is_monthly = $request->column_name == 'is_monthly' ? $request->value : $data->is_monthly;

        if (empty($data->is_daily) && empty($data->is_weekly) && empty($data->is_monthly)) {
            $meeting->is_recycle_bin = 1; // đóng nếu không có lịch họp
        } else {
            $meeting->is_recycle_bin = 0; // mở nếu có lịch họp
        }

        $meeting->save();
    }

    static function getMeeting($searchData)
    {
        $meeting = self::baseQuery();
        // filters

        // is_recycle_bin
        if (!empty($searchData['is_recycle_bin'])) {
            $meeting = $meeting->where('meeting.is_recycle_bin', 1);
        } else {
            $meeting = $meeting->where('meeting.is_recycle_bin', 0);
        }

        // keyword
        if (!empty($searchData['keyword'])) {
            $meeting = $meeting->where(function ($q) use ($searchData) {
                $q->orWhere('meeting.name', 'like', '%' . $searchData['keyword'] . '%');
                $q->orWhere('meeting.description', 'like', '%' . $searchData['keyword'] . '%');
            });
        }

        // meeting type
        if (!empty($searchData['meeting'])) {
            $meeting = $meeting->where(function ($q) use ($searchData) {
                if (in_array('daily', $searchData['meeting'])) {
                    $q->orWhere('meeting.is_daily', 1);
                }
                if (in_array('weekly', $searchData['meeting'])) {
                    $q->orWhere('meeting.is_weekly', 1);
                }
                if (in_array('monthly', $searchData['meeting'])) {
                    $q->orWhere('meeting.is_monthly', 1);
                }
            });
        }
        if (!empty($searchData['status'])) {
            // dd($searchData['status']);
            $meeting = $meeting->whereIn('meeting.meeting_status_id', $searchData['status']);
        }
        $meeting = $meeting->orderBy('meeting.id', 'desc')->paginate(30)->toArray();
        return $meeting;
    }
}
