<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\Admin\Column;
use App\Models\Admin\Project;
use App\Models\Admin\ProjectChecklist;
use App\Models\Admin\Task;
use App\Models\Admin\TaskComment;
use App\Models\Admin\TaskLog;
use App\Models\AdminUser;
use App\Services\Admin\TblModel;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function getProjectInfo(Request $request, $projectId = 0)
    {
        if (empty($projectId)) {
            return $this->sendSuccessResponse([]);
        }
        // get project info
        $project = Project::find($projectId);
        // get all comments
        $comments = TaskComment::getByTask($projectId);
        // get all checklist
        $checklist = ProjectChecklist::baseQuery()->where('project_checklist.project_id', $projectId)->orderBy('id', 'desc')->get()->toArray();
        // phần trăm hoàn thành checklist
        $percent = TblService::getChecklistPercent($checklist);
        // tasks
        $tasks = Task::getTaskByProject($projectId);

        return $this->sendSuccessResponse([
            'checklist' => $checklist,
            'comments' => $comments,
            'percent' => $percent,
            'tasks' => $tasks,
            'project' => $project
        ]);
    }
    /**
     * Summary of index
     * @param \Illuminate\Http\Request $request
     * @param mixed $parentName
     * @return \Inertia\Response
     */
    public function index(Request $request, $parentName)
    {
        $table = Table::where('name', $parentName)->first();

        $status = TblService::formatData('project_status', ['parent_name' => $parentName]);
        $type = TblService::formatData('project_type', ['parent_name' => $parentName]);
        $users = TblService::formatData('admin_users', ['is_recycle_bin' => 0]);
        $admin = Auth::guard('admin_users')->user();

        $statusTable = Table::where('name', 'project_status')->first();
        $statusData = DB::table('project_status')
            ->select('sort_order as sort', 'id as key', 'project_status.*')
            ->where('is_recycle_bin', 0)
            ->where('parent_name', $parentName)
            ->orderBy('sort_order', 'asc')
            ->get()
            ->toArray();
        // get chi nhanh

        // áp dụng với quy trình ql dự án, cskh
        $display = 'list'; // kanban
        if ($request->display) {
            $display = $request->display;
        }

        $props = [
            'display' => $display,
            'parentName' => $parentName,
            'table' => $table,
            'admin' => $admin,
            'users' => $users,
            'status' => $status,
            'type' => $type,
            'statusData' => $statusData,
            'statusTable' => $statusTable,
            'p' => $_GET['p'] ?? 0,
            'display' => $display,
            'searchData' => $request->all(),
        ];

        if ($display == 'list') {
            $props['dataSource'] = Project::getDatas($parentName);
            return Inertia::render('Admin/Project/index_list', $props);
        }
        $datas = Project::getProjectByStatus($parentName, $request->all());
        $props['datas'] = $datas;
        return Inertia::render('Admin/Project/index_kanban', $props);
    }

    public function editConfig(Request $request, $parentTable, $currentTable)
    {
        $table = Table::where('name', $currentTable)->first();
        $admin = Auth::guard('admin_users')->user();

        // save
        $data = TblModel::model($currentTable);
        if ($request->id) {
            $data = $data->find($request->id);
        }
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

        $columns = Project::getProjectByStatus([], $parentTable);
        return $this->sendSuccessResponse(['data' => $datas, 'columns' => $columns]);
    }

    public function getList()
    {
        return Project::all();
    }
    public function store(Request $request, $parentName)
    {
        $admin = Auth::guard('admin_users')->user();

        // CRERATE PROJECT
        $project = new Project();
        $project->name = $request->name;
        $project->description = $request->description;
        $project->project_status_id = empty($request->project_status_id) ? 1 : $request->project_status_id;
        $project->project_manager = $request->project_manager;
        $project->nguoi_theo_doi = $request->nguoi_theo_doi;
        $project->sort_order = 1;
        $project->nguoi_tạo = $request->nguoi_tạo;
        $project->start = $request->start ? $request->start : null;
        $project->end = $request->end ? $request->end : null;
        $project->create_by = $admin->id;
        $project->parent_name = $parentName;
        $project->save();

        if ($request->display == 'kanban') {
            $datas = Project::getTaskByStatus($request->all(), $parentName);
            return $this->sendSuccessResponse($datas);
        }

        $table = Table::where('name', 'projects')->first();
        $columns = Column::where('table_id', $table->id)->orderBy('sort_order', 'asc')->get();

        $dataSource = Project::getDatas($parentName);

        return $this->sendSuccessResponse($dataSource['data']);
    }

    public function updateSortOrder(Request $request, $id)
    {
        // update lai status
        $project = Project::find($id);
        $project->project_status_id = $request->project_status_id;
        $project->save();

        // loop tất cả các task và sắp xếp lại thứ tự
        foreach ($request->ids as $idx => $id) {
            $t = Project::find($id);
            $t->sort_order = $idx;
            $t->save();
        }

        return response()->json($project, 200);
    }

    public function destroy($id)
    {
        Project::destroy($id);
        // xóa task liên quan
        Task::where('project_id', $id)->delete();

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
            $checklist = new ProjectChecklist();
            if (!empty($request->checklist_id)) {
                $checklist = ProjectChecklist::find($request->checklist_id);
            }
            $checklist->name = $data['name'];
            $checklist->content = $data['content'];
            $checklist->nguoi_thuc_hien = $data['admin_user_id'];
            $checklist->project_id = $request->project_id;
            $checklist->create_by = $admin->id;
            $checklist->is_checked = 0;
            $checklist->save();
        }

        // get all
        $checklists = ProjectChecklist::baseQuery()->where('project_checklist.project_id', $request->project_id)->orderBy('id', 'desc')->get()->toArray();
        $percent = TblService::getChecklistPercent($checklists);
        return $this->sendSuccessResponse(['list' => $checklists, 'percent' => $percent]);
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
        $comment->project_id = $request->project_id;
        $comment->create_by = $admin->id;
        $comment->save();

        // get all
        $comments = TaskComment::getByProject($request->project_id);

        return $this->sendSuccessResponse($comments);
    }

    /**
     * Update first item the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function fastEdit(Request $request)
    {
        $data = Project::find($request->id);
        $data->{$request->column_name} = $request->value;
        $data->save();

        $datas = Project::getProjectByStatus($request);

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
        $tasks = Project::getProjectByStatus($request, $request->parent_name);

        return $this->sendSuccessResponse($tasks);
    }

    public function addExpress(Request $request, $parentName)
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
            $project = new Project();
            $project->name = $data['name'];
            $project->description = $data['description'];
            $project->nguoi_thuc_hien = $data['nguoi_thuc_hien'];
            $project->project_status_id = $data['project_status_id'];
            $project->create_by = $admin->id;
            $project->parent_name = $parentName;
            $project->save();
        }

        // get all
        $tasks = Project::getProjectByStatus($request, $parentName);

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
        $columns = Project::getProjectByStatus([], $parentTable);
        return $this->sendSuccessResponse(['data' => $datas, 'columns' => $columns]);
    }

    protected function searchByDate($data, $mocThoiGian, $column, $khoangThoiGian = [null, null])
    {
        if (!empty($khoangThoiGian[0])) {
            $data = $data->whereBetween($column, [$khoangThoiGian[0] . ' 00:00:00', $khoangThoiGian[1] . ' 23:59:59']);
            return $data;
        }

        switch ($mocThoiGian) {
            case 'today':
                $start = Carbon::today()->startOfDay()->format('Y-m-d H:i:s');
                $end = Carbon::today()->endOfDay()->format('Y-m-d H:i:s');
                $data = $data->whereBetween($column, [$start, $end]);
                break;
            case 'yesterday':
                $data = $data->whereDate($column, Carbon::yesterday());
                break;
            case '7day':
                $data = $data->where($column, '>=', Carbon::now()->subDays(7));
                break;
            case '30day':
                $data = $data->where($column, '>=', Carbon::now()->subDays(30));
                break;

            case 'month':
                $data = $data->whereMonth($column, Carbon::now()->month)->whereYear($column, Carbon::now()->year);
                break;
            case 'year':
                $data = $data->whereYear($column, Carbon::now()->year);
                break;
            case 'lastMonth':
                $lastMonth = Carbon::now()->subMonth();
                $data = $data->whereMonth($column, $lastMonth->month)->whereYear($column, $lastMonth->year);
                break;
            case 'lastYear':
                $lastYear = Carbon::now()->subYear()->year;
                $data = $data->whereYear($column, $lastYear);
                break;
            case 'thisWeek':
                $startOfWeek = Carbon::now()->startOfWeek(); // Mặc định: Thứ 2
                $endOfWeek = Carbon::now()->endOfWeek();   // Chủ nhật
                $data = $data->whereBetween($column, [$startOfWeek, $endOfWeek]);
                break;
            case 'lastWeek':
                $startOfLastWeek = Carbon::now()->subWeek()->startOfWeek(); // Thứ 2 tuần trước
                $endOfLastWeek = Carbon::now()->subWeek()->endOfWeek();     // Chủ nhật tuần trước
                $data = $data->whereBetween($column, [$startOfLastWeek, $endOfLastWeek]);
                break;
            case 'thisQuarter':
                $currentMonth = Carbon::now()->month; //lấy tháng hiện tại.
                $currentQuarter = ceil($currentMonth / 3); // chia tháng cho 3 và làm tròn lên → ra quý hiện tại.
                $currentYear = Carbon::now()->year;
                $data = $data->whereRaw('QUARTER(' . $column . ') = ?', [$currentQuarter])
                    ->whereYear($column, $currentYear);
                break;
            case 'lastQuarter':
                $currentQuarter = ceil(Carbon::now()->month / 3);
                $currentYear = Carbon::now()->year;

                // Tính quý trước
                if ($currentQuarter == 1) {
                    $previousQuarter = 4;
                    $previousYear = $currentYear - 1;
                } else {
                    $previousQuarter = $currentQuarter - 1;
                    $previousYear = $currentYear;
                }
                $data = $data->whereRaw('QUARTER(' . $column . ') = ?', [$previousQuarter])
                    ->whereYear($column, $previousYear);
                break;

            default:
                // mặc định là all
                break;
        }
        return $data;
    }

    /**
     * Update first item the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function fastEditProject(Request $request)
    {
        // dd($request->all());
        $table = Table::where('name', 'projects')->first();
        $column = Column::where('table_id', $table->id)->where('name', $request->column_name)->first();
        $data = Project::find($request->id);

        // $logName = 'Đã sửa ' . $column->display_name . ' "' . $data->name . '": ' . $data->{$request->column_name} . ' => ' . $request->value;
        // TaskLog::logEdit('projects', $logName, $data->id, $request->column_name);

        $data->{$request->column_name} = $request->value;
        // dd($data);
        $data->save();

        $datas = [];
        if ($request->display == 'list') {
            $datas = Project::getDatas($request->parentName, $request->searchData);
            // dd($datas);
        }

        return $this->sendSuccessResponse(['dataAction' => $data, 'datas' => $datas['data']], 'Update successfully', 200);
    }


}
