<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Models\Admin\Checklist;
use App\Models\Admin\Task;
use App\Models\Admin\TaskComment;
use App\Models\AdminUser;
use App\Services\Admin\TblModel;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    /**
     * Summary of index
     * @param \Illuminate\Http\Request $request
     * @param mixed $parentName
     * @return \Inertia\Response
     */
    public function index(Request $request, $parentName)
    {
        $table = Table::where('name', $parentName)->first();

        $prority = TblService::formatData('task_prority', ['parent_name' => $parentName]);
        $type = TblService::formatData('task_type', ['parent_name' => $parentName]);
        $status = TblService::formatData('task_status', ['parent_name' => $parentName]);
        $admin = Auth::guard('admin_users')->user();

        $datas = Task::getTaskByStatus($request, $parentName);

        $statusTable = Table::where('name', 'task_status')->first();
        $statusData = DB::table('task_status')
            ->select('sort_order as sort', 'id as key', 'task_status.*')
            ->where('is_recycle_bin', 0)
            ->where('parent_name', $parentName)
            ->orderBy('sort_order', 'asc')
            ->get()
            ->toArray();
        $users = AdminUser::where('is_recycle_bin', 0)->get()->toArray();
        $users_byID = [];
        foreach ($users as $u) {
            $users_byID[$u['id']] = $u;
        }
        // get chi nhanh

        // áp dụng với quy trình ql dự án, cskh

        return Inertia::render('Admin/Task/index', [
            'table' => $table,
            'status' => $status,
            'datas' => $datas,
            'users' => $users_byID,
            'prority' => $prority,
            'type' => $type,
            'admin' => $admin,
            'statusData' => $statusData,
            // 'statusData_DragDrop' => $statusData_DragDrop,
            'statusTable' => $statusTable,
            'parentName' => $parentName,
        ]);
    }
    
    
}
