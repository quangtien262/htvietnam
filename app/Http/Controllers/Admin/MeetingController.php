<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\ChiNhanh;
use App\Models\Admin\Column;
use App\Models\Admin\HoaDon;
use App\Models\Admin\Meeting;
use App\Models\Admin\NhanVienThucHien;
use App\Models\Admin\NhanVienTuVan;
use App\Models\Admin\Table;
use App\Models\Admin\Task;
use App\Models\AdminUser;
use App\Models\User;
use App\Services\Admin\TblService;
use Illuminate\Support\Facades\Auth;

class MeetingController extends Controller
{

    public function search(Request $request)
    {
        $datas = Meeting::getMeeting($request->all());
        $result = [
            'datas' => $datas['data'],
            'pageConfig' => [
                'currentPage' => $datas['current_page'],
                'perPage' => $datas['per_page'],
                'total' => $datas['total'],
                'lastPage' => $datas['last_page'],
                'count' => count($datas['data']),
            ],
        ];

        return $this->sendSuccessResponse($result);
    }
    public function fetchIndexData(Request $request)
    {
        $table = Table::where('name', 'meeting')->first();
        $columns = Column::where('table_id', $table->id)->orderBy('sort_order', 'asc')->get()->toArray();

        $userPermission = TblService::getPermission();

        $searchData = $request->all();
        if (empty($request->meeting)) {
            $searchData['meeting'] = ['daily'];
        }
        if (empty($request->result)) {
            $searchData['result'] = ['1'];
        }

        $datas = Meeting::getMeeting($searchData);

        $pageConfig = [
            'currentPage' => $datas['current_page'],
            'perPage' => $datas['per_page'],
            'total' => $datas['total'],
            'lastPage' => $datas['last_page'],
            'count' => count($datas['data']),
        ];
        $pageConfig['count'] = count($datas['data']);
        // end phân trang

        $props = [
            'table' => $table,
            'columns' => $columns,
            'datas' => $datas['data'],
            'userPermission' => $userPermission,
            'searchData' => $searchData,
            'pageConfig' => $pageConfig,
        ];


        $props['meetingStatus'] = TblService::formatData('meeting_status');
        $props['meetingStatus_select'] = TblService::getDataSelect02('meeting_status');
        $props['users'] = TblService::formatData('admin_users');

        // $props['taskStatus'] = TblService::formatData('task_status');
        // $taskStatusDefault = [];
        // foreach ($props['taskStatus'] as $ts) {
        //     if ($ts->is_default == 1) {
        //         $taskStatusDefault[] = $ts->id;
        //     }
        // }
        // $props['tasks'] = Task::where('is_recycle_bin', 0)
        //     ->whereIn('tasks.task_status_id', $taskStatusDefault)
        //     ->get();

        return $this->sendSuccessResponse($props);
    }

    public function addExpress(Request $request)
    {
        if (empty($request->datas)) {
            return $this->sendErrorResponse('empty');
        }

        $admin = Auth::guard('admin_users')->user();

        // save
        foreach ($request->datas as $data) {
            if (empty($data['name'])) {
                continue;
            }
            // check exist
            $checkMeeting = Meeting::where('data_type', 'tasks')->where('data_id', $data['task_id'])->first();
            if (!empty($checkMeeting)) {
                $meeting = $checkMeeting;
            } else {
                $meeting = new Meeting();
            }
            $meeting->name = $data['name'];
            $meeting->meeting_status_id = $data['meeting_status_id'];
            $meeting->task_id = $data['task_id'];
            $meeting->create_by = $admin->id;

            if ($data['meeting_type'] == 'is_daily') {
                $meeting->is_daily = 1;
            }
            if ($data['meeting_type'] == 'is_weekly') {
                $meeting->is_weekly = 1;
            }
            if ($data['meeting_type'] == 'is_monthly') {
                $meeting->is_monthly = 1;
            }
            if ($data['meeting_type'] == 'is_yearly') {
                $meeting->is_yearly = 1;
            }

            $meeting->save();
        }

        // get all
        $datas = Meeting::getMeeting($request->searchData);

        $result = [
            'datas' => $datas['data'],
            'pageConfig' => [
                'currentPage' => $datas['current_page'],
                'perPage' => $datas['per_page'],
                'total' => $datas['total'],
                'lastPage' => $datas['last_page'],
                'count' => count($datas['data']),
            ],
        ];

        return $this->sendSuccessResponse($result);
    }

    public function updateMeeting(Request $request)
    {
        if (empty($request->id)) {
            return $this->sendErrorResponse('empty1');
        }
        $meeting = Meeting::find($request->id);
        if (empty($meeting)) {
            return $this->sendErrorResponse('empty2');
        }

        $meeting->name = $request->name;
        $meeting->meeting_status_id = $request->meeting_status_id;
        $meeting->description = $request->description;
        $meeting->is_daily = in_array('is_daily', $request->meeting_type) ? 1 : 0;
        $meeting->is_weekly = in_array('is_weekly', $request->meeting_type) ? 1 : 0;
        $meeting->is_monthly = in_array('is_monthly', $request->meeting_type) ? 1 : 0;
        $meeting->is_yearly = in_array('is_yearly', $request->meeting_type) ? 1 : 0;
        $meeting->save();

        $datas = Meeting::getMeeting($request->searchData);


        $result = [
            'datas' => $datas['data'],
            'pageConfig' => [
                'currentPage' => $datas['current_page'],
                'perPage' => $datas['per_page'],
                'total' => $datas['total'],
                'lastPage' => $datas['last_page'],
                'count' => count($datas['data']),
            ],
        ];

        return $this->sendSuccessResponse($result);
    }

    public function deleteMeeting(Request $request) {
        if (empty($request->ids)) {
            return $this->sendErrorResponse('empty');
        }

        // update is_recycle_bin
        Meeting::whereIn('id', $request->ids)->update(['is_recycle_bin' => 1]);

        $datas = Meeting::getMeeting($request->searchData);

        $result = [
            'datas' => $datas['data'],
            'pageConfig' => [
                'currentPage' => $datas['current_page'],
                'perPage' => $datas['per_page'],
                'total' => $datas['total'],
                'lastPage' => $datas['last_page'],
                'count' => count($datas['data']),
            ],
        ];

        return $this->sendSuccessResponse($result);
    }
}
