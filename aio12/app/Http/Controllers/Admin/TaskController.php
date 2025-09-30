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

class TaskController extends Controller
{

    public function dashboard(Request $request)
    {
        $viewData = [

        ];
        return Inertia::render('Admin/Dashboard/task', $viewData);
    }

    /**
     * Summary of index
     * @param \Illuminate\Http\Request $request
     * @param mixed $tblName
     * @return \Inertia\Response
     */
    public function index(Request $request, $tblName)
    {
        $table = Table::where('name', $tblName)->first();

        $prority = TblService::formatData('task_prority', ['parent_name' => $tblName]);
        $type = TblService::formatData('task_type', ['parent_name' => $tblName]);
        $status = TblService::formatData('task_status', ['parent_name' => $tblName]);
        $admin = Auth::guard('admin_users')->user();

        $datas = Task::getTaskByStatus($request, $tblName);

        $statusTable = Table::where('name', 'task_status')->first();
        // $statusData_DragDrop = TblService::getDataDragDrop($statusTable->id, 0, ['parent_name' => $tblName]);
        $statusData = DB::table('task_status')
            ->select('sort_order as sort', 'id as key', 'task_status.*')
            ->where('is_recycle_bin', 0)
            ->where('parent_name', $tblName)
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
            'tblName' => $tblName,
        ]);
    }
    public function getList()
    {
        return Task::all();
    }
    public function store(Request $request)
    {
        $admin = Auth::guard('admin_users')->user();

        $task = new Task();
        $task->name = $request->name;
        $task->description = $request->description;
        $task->task_status_id = empty($request->task_status_id) ? 1 : $request->task_status_id;
        $task->nguoi_thuc_hien = $request->nguoi_thuc_hien;
        $task->nguoi_theo_doi = $request->nguoi_theo_doi;
        $task->sort_order = 1;
        $task->nguoi_tạo = $request->nguoi_tạo;
        $task->start = $request->start ? $request->start : null;
        $task->end = $request->end ? $request->end : null;
        $task->create_by = $admin->id;
        $task->save();

        $datas = Task::getTaskByStatus($request);

        return $this->sendSuccessResponse($datas);
    }

    public function updateSortOrder(Request $request, $id)
    {
        // update lai status
        $task = Task::find($id);
        $task->task_status_id = $request->task_status_id;
        $task->save();

        // loop tất cả các task và sắp xếp lại thứ tự
        foreach ($request->ids as $idx => $taskId) {
            $t = Task::find($taskId);
            $t->sort_order = $idx;
            $t->save();
        }

        return response()->json($task, 200);
    }

    public function destroy($id)
    {
        Task::destroy($id);
        return response()->json(null, 204);
    }

    public function addChecklist(Request $request)
    {
        if (empty($request->data)) {
            return $this->sendErrorResponse('empty');
        }

        $admin = Auth::guard('admin_users')->user();

        // save
        foreach ($request->data as $data) {
            if (empty($data['name'])) {
                continue;
            }
            $checklist = new Checklist();
            $checklist->name = $data['name'];
            $checklist->content = $data['content'];
            $checklist->nguoi_thuc_hien = $data['admin_user_id'];
            $checklist->task_id = $request->task_id;
            $checklist->create_by = $admin->id;
            $checklist->is_checked = 0;
            $checklist->save();
        }

        // get all
        $checklists = Checklist::where('task_id', $request->task_id)->orderBy('id', 'desc')->get()->toArray();

        return $this->sendSuccessResponse($checklists);
    }

    public function getTaskInfo(Request $request, $taskId = 0)
    {
        if (empty($taskId)) {
            return $this->sendSuccessResponse([]);
        }


        $checklist = Checklist::where('task_id', $taskId)->where('is_recycle_bin', 0)->get()->toArray();
        $comments = TaskComment::getByTask($taskId);
        return $this->sendSuccessResponse([
            'checklist' => $checklist,
            'comments' => $comments,
            // 'datas' => $datas
        ]);
    }

    public function addComment(Request $request)
    {
        if (empty($request->content) || empty($request->task_id)) {
            return $this->sendErrorResponse('empty');
        }

        $admin = Auth::guard('admin_users')->user();

        // save
        $comment = new TaskComment();
        $comment->content = $request->content;
        $comment->task_id = $request->task_id;
        $comment->create_by = $admin->id;
        $comment->save();

        // get all
        $comments = TaskComment::getByTask($request->task_id);

        return $this->sendSuccessResponse($comments);
    }

    /**
     * Update first item the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function fastEditTask(Request $request)
    {
        $data = Task::find($request->id);
        $data->{$request->column_name} = $request->value;
        $data->save();

        $datas = Task::getTaskByStatus($request);

        return $this->sendSuccessResponse($datas, 'Update successfully', 200);
    }

    public function sortOrder(Request $request)
    {
        if (empty($request->data)) {
            return false;
        }
        // update sort order
        $dataSort = json_decode($request->data, true);
        $this->updateSortOrderSetting($dataSort, $request->table_name);

        // get tasks
        $tasks = Task::getTaskByStatus($request);

        return $this->sendSuccessResponse($tasks);
    }

    public function addTaskExpress(Request $request, $tblName)
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
            $task = new Task();
            $task->name = $data['name'];
            $task->description = $data['description'];
            $task->nguoi_thuc_hien = $data['nguoi_thuc_hien'];
            $task->task_status_id = $data['task_status_id'];
            $task->create_by = $admin->id;
            $task->parent_name = $tblName;
            $task->save();
        }

        // get all
        $tasks = Task::getTaskByStatus($request, $tblName);

        return $this->sendSuccessResponse($tasks);
    }

    private function updateSortOrderSetting($dataSort, $tableName, $indexStart = 100, $parentId = 0)
    {
        // $table = Table::where('name', 'tasks')->first();
        foreach ($dataSort as $data) {
            $dataUpdate = [
                'sort_order' => $indexStart++,
                'parent_id' => 0
            ];
            TblService::updateData($tableName, $data['key'], $dataUpdate);

            if (!empty($data['children'])) {
                $indexStart = $this->updateSortOrderSetting($data['children'], 0, $indexStart++);
            }
        }
        return ++$indexStart;
    }

    public function addConfig(Request $request, $parentTable, $currentTable)
    {
        $table = Table::where('name', $currentTable)->first();
        $admin = Auth::guard('admin_users')->user();

        // save
        $data = TblModel::model($currentTable);
        $data->parent_name = $parentTable;
        foreach ($request->all() as $k => $v) {
            $data->{$k} = $v;
        }
        $data->create_by = $admin->id;
        $data->sort_order = 0;
        $data->save();
        $datas = DB::table($currentTable)
            ->select('sort_order as sort', 'id as key', $currentTable . '.*')
            ->where('is_recycle_bin', 0)
            ->where('parent_name', $parentTable)
            ->orderBy('sort_order', 'asc')
            ->get()
            ->toArray();
        $columns = Task::getTaskByStatus([], $parentTable);
        return $this->sendSuccessResponse(['data' => $datas, 'columns' => $columns]);
    }

    public function deleteConfig(Request $request, $parentTable, $currentTable)
    {
        $table = Table::where('name', $currentTable)->first();
        if (empty($table)) {
            return $this->sendErrorResponse('Table not found');
        }
        // delete
        TblService::deleteDatas($table->id, ['id' => $request->id]);

        // get all
        $datas = DB::table($currentTable)
            ->select('sort_order as sort', 'id as key', $currentTable . '.*')
            ->where('is_recycle_bin', 0)
            ->where('parent_name', $parentTable)
            ->orderBy('sort_order', 'asc')
            ->get()
            ->toArray();
        $columns = Task::getTaskByStatus([], $parentTable);
        return $this->sendSuccessResponse(['data' => $datas, 'columns' => $columns]);
    }
}
