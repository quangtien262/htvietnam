<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Models\Admin\TaskChecklist;
use App\Models\Admin\Column;
use App\Models\Admin\Meeting;
use App\Models\Admin\Project;
use App\Models\Admin\Task;
use App\Models\Admin\TaskComment;
use App\Models\Admin\TaskLog;
use App\Models\AdminUser;
use App\Services\Admin\TblModel;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{

    public function getTaskInfo(Request $request)
    {
        if (empty($request->id)) {
            return $this->sendSuccessResponse([]);
        }
        $taskId = $request->id;
        $task = Task::baseQuery()->find($taskId);
        $checklist = TaskChecklist::baseQuery()->where('task_checklist.task_id', $taskId)->orderBy('id', 'desc')->get()->toArray();
        $comments = TaskComment::getByTask($taskId);
        $percent = TblService::getChecklistPercent($checklist);
        $priority = TblService::formatData('task_priority', ['parent_name' => $task->parent_name]);
        $taskLog = TaskLog::where('data_id', $taskId)->orderBy('id', 'desc')->limit(30)->get()->toArray();
        return $this->sendSuccessResponse([
            'checklist' => $checklist,
            'comments' => $comments,
            'percent' => $percent,
            'priority' => $priority,
            'task' => $task,
            'taskLog' => $taskLog,
        ]);
    }


    /**
     * get all data
     *
     * @return \Illuminate\Http\Response
     */
    public function listApi(Request $request)
    {
        $parentName = $request->parentName;

        $status = TblService::formatData('task_status', ['parent_name' => $parentName]);
        $taskStatus = TblService::getDataSelect02('task_status', ['parent_name' => $parentName]);
        $type = TblService::getDataSelect02('task_type', ['parent_name' => $parentName]);
        $priority = TblService::getDataSelect02('task_priority', ['parent_name' => $parentName]);
        $users = TblService::getDataSelect02('admin_users');
        $admin = Auth::guard('admin_users')->user();

        $project = Project::find($request->pid);

        // đê settting sort order
        $statusTable = Table::where('name', 'task_status')->first();

        $statusData = DB::table('task_status')
            ->select('sort_order as sort', 'id as key'  , 'task_status.*')
            ->where('is_recycle_bin', 0)
            ->where('parent_name', $parentName)
            ->orderBy('sort_order', 'asc')
            ->get()
            ->toArray();

        $props = [
            'taskStatus' => $taskStatus,
            'users' => $users,
            'priority' => $priority,
            'type' => $type,
            'admin' => $admin,
            'statusData' => $statusData,
            'statusTable' => $statusTable,
            'parentName' => $parentName,
            'project' => $project,
        ];

        if ($request->display == 'list') {
            $props['searchData'] = $this->getSearchData($request, $status);
            $props['dataSource'] = Task::getDatas($parentName, $props['searchData']);
            return $this->sendSuccessResponse($props);
        }

        $props['datas'] = Task::getTaskByStatus($request->all(), $parentName);
        return $this->sendSuccessResponse($props);
    }

    /**
     * get all data
     *
     * @return \Illuminate\Http\Response
     */
    public function searchTaskKanban(Request $request)
    {
        $tasks = Task::getTaskByStatus($request->all(), $request->parentName);
        return $this->sendSuccessResponse($tasks);
    }

    public function searchTaskList(Request $request)
    {
        $datas = Task::getDatas($request->parentName, $request->all());
        return $this->sendSuccessResponse($datas);
    }



    private function getSearchData($request, $status)
    {
        $searchData = $request->all();
        if (empty($request->status)) {
            $statusDefault = [];
            foreach ($status as $val) {
                if ($val->is_default == 1) {
                    $statusDefault[] = (string)$val->id;
                }
            }
            $searchData['status'] = $statusDefault;
        }

        if (empty($request->display)) {
            $searchData['display'] = 'kanban'; // kanban, list
        }

        return $searchData;
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
        $task->start = $request->start ? $request->start : null;
        $task->end = $request->end ? $request->end : null;
        $task->create_by = $admin->id;
        $task->parent_name = $request->parentName;
        $task->project_id = $request->pid;
        $task->save();

        TaskLog::logAdd('tasks', 'Đã thêm mới "' . $task->name . '"', $task->id);

        $datas = Task::getTaskByStatus($request->all(), $request->parentName);

        return $this->sendSuccessResponse($datas);
    }

    public function updateSortOrder(Request $request)
    {
        // update lai status
        $task = Task::find($request->id);
        $task->task_status_id = $request->task_status_id;
        $task->save();

        // loop tất cả các task và sắp xếp lại thứ tự
        foreach ($request->ids as $idx => $taskId) {
            $t = Task::find($taskId);
            $t->sort_order = $idx;
            $t->save();
        }

        return $this->sendSuccessResponse([], 'Update successfully', 200);
    }

    public function destroy(Request $request)
    {
        $task = Task::find($request->id);
        if (empty($task)) {
            return $this->sendErrorResponse('Task not found');
        }

        TaskLog::logDelete('tasks', 'Đã xóa "' . $task->name . '"', $task->id);

        $task->is_recycle_bin = 1;
        $task->save();
        // xóa checklist
        TaskChecklist::where('task_id', $request->id)->update(['is_recycle_bin' => 1]);
        // xóa comment
        TaskComment::where('task_id', $request->id)->update(['is_recycle_bin' => 1]);

        $columns = Task::getTaskByStatus($request->searchData, $request->parentName);

        return $this->sendSuccessResponse($columns, 'Update successfully', 200);
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
            $checklist = new TaskChecklist();
            if (!empty($request->checklist_id)) {
                $checklist = $checklist->find($request->checklist_id);
            }
            $checklist->name = $data['name'];
            $checklist->content = $data['content'];
            $checklist->nguoi_thuc_hien = $data['admin_user_id'];
            $checklist->task_id = $request->task_id;
            $checklist->create_by = $admin->id;
            $checklist->is_checked = 0;
            $checklist->save();

            // log
            TaskLog::logChecklist_addOrEdit('checklists', $checklist, $request);
        }

        // get all
        $checklist = TaskChecklist::baseQuery()->where('task_checklist.task_id', $request->task_id)->orderBy('id', 'desc')->get()->toArray();
        $percent = TblService::getChecklistPercent($checklist);

        return $this->sendSuccessResponse(['checklist' => $checklist, 'percent' => $percent]);
    }

    public function changeStatusChecklist(Request $request)
    {
        if (empty($request->id)) {
            return $this->sendErrorResponse('empty');
        }

        $checklist = TaskChecklist::find($request->id);
        if (empty($checklist)) {
            return $this->sendErrorResponse('Checklist not found');
        }

        $checklist->is_checked = $request->value;
        $checklist->save();

        // log
        TaskLog::logChecklist_checked('checklists', $checklist, $request);

        $checklist = TaskChecklist::baseQuery()->where('task_checklist.task_id', $request->task_id)->orderBy('id', 'desc')->get()->toArray();
        $percent = TblService::getChecklistPercent($checklist);
        return $this->sendSuccessResponse([
            'checklist' => $checklist,
            'percent' => $percent,
        ]);
    }

    public function deleteChecklist(Request $request)
    {
        if (empty($request->id)) {
            return $this->sendErrorResponse('empty');
        }

        $checklist = TaskChecklist::find($request->id);
        if (empty($checklist)) {
            return $this->sendErrorResponse('Checklist not found');
        }
        $checklist->is_recycle_bin = 1;
        $checklist->save();

        // log
        TaskLog::logChecklist_delete('checklists', $checklist, $request);

        $checklist = TaskChecklist::baseQuery()->where('task_checklist.task_id', $request->task_id)->orderBy('id', 'desc')->get()->toArray();
        $percent = TblService::getChecklistPercent($checklist);
        return $this->sendSuccessResponse([
            'checklist' => $checklist,
            'percent' => $percent,
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
        if (!empty($request->id)) {
            $comment = $comment->find($request->id);
        }
        $comment->content = $request->content;
        $comment->task_id = $request->task_id;
        $comment->create_by = $admin->id;
        $comment->save();

        // log
        TaskLog::logAdd('tasks', 'Đã thêm mới bình luận "' . $comment->content . '"', $request->task_id);

        // get all
        $comments = TaskComment::getByTask($request->task_id);

        return $this->sendSuccessResponse($comments);
    }

    public function deleteComment(Request $request)
    {
        if (empty($request->id)) {
            return $this->sendErrorResponse('empty');
        }

        $comment = TaskComment::find($request->id);
        if (empty($comment)) {
            return $this->sendErrorResponse('Comment not found');
        }

        // log
        // TaskLog::logDelete('tasks', 'Đã xóa bình luận "' . $comment->content . '"', $comment->task_id);

        $comment->is_recycle_bin = 1;
        $comment->save();

        // get all
        $comments = TaskComment::getByTask($comment->task_id);

        return $this->sendSuccessResponse($comments);
    }

    /**
     * Update first item the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function fastEditTaskColumn(Request $request)
    {
        $data = Task::find($request->id);

        TaskLog::logEdit('tasks', $data, $request);

        $data->{$request->column_name} = $request->value;
        $data->save();

        $dataUpdated = Task::baseQuery()->find($request->id);

        if (in_array($request->column_name, ['is_daily', 'is_weekly', 'is_monthly'])) {
            Meeting::saveMeeting($data, $request, 'tasks');
        }


        if ($request->display == 'kanban') {
            $datas = Task::getTaskByStatus($request->all(), $request->parentName);
            return $this->sendSuccessResponse(['datas' => $datas, 'data' => $dataUpdated], 'Update successfully', 200);
        }

        $dataSource =  Task::getDatas($request->parentName, $request->searchData);
        return $this->sendSuccessResponse(['dataSource' => $dataSource, 'data' => $dataUpdated], 'Update successfully', 200);
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
        $tasks = Task::getTaskByStatus($request->all(), $request->parent_name);

        return $this->sendSuccessResponse($tasks);
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
            $task = new Task();
            $task->name = $data['name'];
            $task->description = $data['description'];
            $task->nguoi_thuc_hien = $data['nguoi_thuc_hien'];
            $task->task_status_id = $data['task_status_id'];
            $task->task_priority_id = $data['task_priority_id'];
            $task->create_by = $admin->id;
            $task->parent_name = $request->parentName;
            $task->project_id = $request->pid;
            $task->save();
            TaskLog::logAdd('tasks', 'Đã thêm nhanh "' . $task->name . '"', $task->id);
        }

        // get all
        $tasks = Task::getTaskByStatus($request->all(), $request->parentName);



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

    public function editTableConfig(Request $request)
    {
        if (empty($request->parentName) || empty($request->currentTable)) {
            return $this->sendErrorResponse('empty');
        }

        $admin = Auth::guard('admin_users')->user();
        // dd($request->all());
        // save
        $data = TblModel::model($request->currentTable);
        if ($request->id) {
            $data = $data->find($request->id);
        } else {
            $data->sort_order = 0;
        }
        $data->parent_name = $request->parentName;
        $data->name = $request->name;
        $data->description = $request->description;
        if (isset($request->icon)) {
            $data->icon = $request->icon;
        }
        if (isset($request->color)) {
            $data->color = $request->color;
        }
        if (isset($request->background)) {
            $data->background = $request->background;
        }
        if (isset($request->is_default)) {
            $data->is_default = $request->is_default;
        }
        $data->create_by = $admin->id;
        $data->save();
        $datas = DB::table($request->currentTable)
            ->select('sort_order as sort', 'id as key', $request->currentTable . '.*')
            ->where('is_recycle_bin', 0)
            ->where('parent_name', $request->parentName)
            ->orderBy('sort_order', 'asc')
            ->get()
            ->toArray();
        return $this->sendSuccessResponse([], 'Save successfully');
    }

    public function deleteTableConfig(Request $request, $parentTable, $currentTable)
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
        $columns = Task::getTaskByStatus($request->all(), $parentTable);
        return $this->sendSuccessResponse(['data' => $datas, 'columns' => $columns]);
    }

    public function updateSortOrder_config(Request $request)
    {
        if (empty($request->order)) {
            return $this->sendErrorResponse('empty');
        }
        foreach ($request->order as $i => $id) {
            $dataUpdate = [
                'sort_order' => $i + 1,
            ];
            TblService::updateData($request->currentName, $id, $dataUpdate);
        }
        $columns = Task::getTaskByStatus($request->searchData, $request->parentName);
        $status = TblService::formatData('task_status', ['parent_name' => $request->parentName, 'project_id' => $request->pid]);
        return $this->sendSuccessResponse(['columns' => $columns, 'status' => $status]);
    }



    public function addTaskStatus(Request $request)
    {
        if (empty($request->order)) {
            return $this->sendErrorResponse('empty');
        }
        foreach ($request->order as $i => $id) {
            $dataUpdate = [
                'sort_order' => $i + 1,
            ];
            TblService::updateData($request->currentName, $id, $dataUpdate);
        }
        $columns = Task::getTaskByStatus($request->searchData, $request->parentName);
        $status = TblService::formatData('task_status', ['parent_name' => $request->parentName, 'project_id' => $request->pid]);
        return $this->sendSuccessResponse(['columns' => $columns, 'status' => $status]);
    }
}
