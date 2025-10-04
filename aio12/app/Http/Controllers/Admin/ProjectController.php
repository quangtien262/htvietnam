<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\Admin\Checklist;
use App\Models\Admin\Column;
use App\Models\Admin\Project;
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
        $status = TblService::formatData('project_status', ['parent_name' => $parentName]);
        $admin = Auth::guard('admin_users')->user();

        $datas = Project::getProjectByStatus($request, $parentName);

        $statusTable = Table::where('name', 'project_status')->first();
        $statusData = DB::table('project_status')
            ->select('sort_order as sort', 'id as key', 'project_status.*')
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
        $display = 'list'; // kanban
        if ($request->display) {
            $display = $request->display;
        }

        if ($display == 'list') {
            $props = TblService::getDataIndexDefault('projects', $request, true, true);
            $mocThoiGian = 'today';
            if (!empty($request['mocThoiGian'])) {
                $mocThoiGian = $request['mocThoiGian'];
            }

            $khoangThoiGian = [null, null];
            if (!empty($request->khoangThoiGian)) {
                $khoangThoiGian = $request->khoangThoiGian;
                $mocThoiGian = '';
            }
            $props['display'] = $display;
            $props['khoangThoiGian'] = $khoangThoiGian;
            $props['mocThoiGian'] = $mocThoiGian;
            $props['parentName'] = $parentName;
            $props['table'] = $table;
            $props['prority'] = $prority;
            $props['type'] = $type;
            $props['admin'] = $admin;
            $props['users'] = $users_byID;
            $props['status'] = $status;
            $props['statusData'] = $statusData;
            $props['statusTable'] = $statusTable;
            $props['p'] = $_GET['p'] ?? 0;
            // dd($props['selectData']['project_manager']);
            return Inertia::render('Admin/Project/index_list', $props);
        }

        return Inertia::render('Admin/Project/index_kanban', [
            'table' => $table,
            'status' => $status,
            'datas' => $datas,
            'users' => $users_byID,
            'prority' => $prority,
            'type' => $type,
            'admin' => $admin,
            'statusData' => $statusData,
            'statusTable' => $statusTable,
            'parentName' => $parentName,
        ]);
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
            $datas = Project::getTaskByStatus($request, $parentName);
            return $this->sendSuccessResponse($datas);
        }
        
        $table = Table::where('name', '  ')->first();
        $columns = Column::where('table_id', $table->id)->orderBy('sort_order', 'asc')->get();
        $datas = TblService::getDatas($table, $columns);
        $dataSource = TblService::getDataSource($datas['data'], $columns);
        
        return $this->sendSuccessResponse($dataSource['dataSource']);
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

    public function getProjectInfo(Request $request, $projectId = 0)
    {
        if (empty($projectId)) {
            return $this->sendSuccessResponse([]);
        }


        $checklist = Checklist::where('task_id', $projectId)->where('is_recycle_bin', 0)->get()->toArray();
        $comments = TaskComment::getByTask($projectId);
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
}
