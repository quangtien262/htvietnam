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
    public function index(Request $request)
    {
        $table = Table::where('name', 'meeting')->first();
        $columns = Column::where('table_id', $table->id)->orderBy('sort_order', 'asc')->get()->toArray();

        $userPermission = TblService::getPermission();

        $searchData = $request->all();
        if (!empty($request->meeting)) {
            $searchData['meeting'] = ['daily'];
        }

        $datas = Meeting::getMeeting($searchData);

        // phân trang
        $pageConfig = [
            'currentPage' => $datas->currentPage(),
            'perPage' => $datas->perPage(),
            'total' => $datas->total(),
            'lastPage' => $datas->lastPage(),
        ];
        $datas = $datas->toArray();
        $pageConfig['count'] = count($datas['data']);
        // end phân trang

        $props = [
            'table' => $table,
            'columns' => $columns,
            'dataSource' => $datas['data'],
            'userPermission' => $userPermission,
            'searchData' => $searchData,
            'pageConfig' => $pageConfig,
        ];

        $props['taskStatus'] = TblService::formatData('task_status');
        $props['projectStatus'] = TblService::formatData('project_status');
        $props['meetingStatus'] = TblService::formatData('meeting_status');
        $props['users'] = TblService::formatData('admin_users');

        $taskStatusDefault = [];
        foreach ($props['taskStatus'] as $ts) {
            if ($ts->is_default == 1) {
                $taskStatusDefault[] = $ts->id;
            }
        }
        $props['tasks'] = Task::where('is_recycle_bin', 0)
            ->whereIn('tasks.task_status_id', $taskStatusDefault)
            ->get();

        $props['p'] = $request->p ? $request->p : 0;

        return Inertia::render('Admin/Meeting/index', $props);
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
            $meeting->save();
        }

        // get all
        $datas = Meeting::getMeeting($request->searchData)->toArray();

        return $this->sendSuccessResponse($datas['data']);
    }
}
