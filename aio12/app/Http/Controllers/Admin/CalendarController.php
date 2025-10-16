<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\Calendar;
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

class CalendarController extends Controller
{
    public function index(Request $request)
    {


        return Inertia::render('Admin/Meeting/index', $props);
    }

    public function addExpress(Request $request)
    {
        if (empty($request->datas)) {
            return $this->sendErrorResponse('empty');
        }

        $admin = Auth::guard('admin_users')->user();

        $table = Table::where('name', 'calendar')->first();
        $columns = Column::where('table_id', $table->id)->get();
        // save
        foreach ($request->datas as $data) {
            if (empty($data['name']) || empty($data['calendar'])) {
                continue;
            }

            $calendar = new Calendar();
            foreach($columns as $col) {
                if ($col->require == 1) {
                    $calendar->{$col->name} = $data[$col->name] ?? null;
                }
            }
            $calendar->save();
        }

        // get all

        return $this->sendSuccessResponse([]);
    }

    public function updateMeeting(Request $request) {
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

        $datas = Meeting::getMeeting($request->searchData)->toArray();

        return $this->sendSuccessResponse($datas['data']);
    }
}
