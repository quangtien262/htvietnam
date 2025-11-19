<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project\TaskAttachment;
use App\Models\Project\Task;
use App\Models\Project\Project;
use App\Services\Project\TaskService;
use App\Services\Project\PermissionService;
use App\Services\Project\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TaskController extends Controller
{
    protected $taskService;
    protected $permissionService;
    protected $notificationService;

    public function __construct(
        TaskService $taskService,
        PermissionService $permissionService,
        NotificationService $notificationService
    )
    {
        $this->taskService = $taskService;
        $this->permissionService = $permissionService;
        $this->notificationService = $notificationService;
    }

    public function index(Request $request)
    {
        try {
            $tasks = $this->taskService->getList($request->all());
            return response()->json([
                'success' => true,
                'data' => $tasks,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $task = $this->taskService->getById($id);
            return response()->json([
                'success' => true,
                'data' => $task,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function kanban($projectId)
    {
        try {
            // Check project access permission
            $project = Project::findOrFail($projectId);
            $this->authorize('view', $project);

            $kanbanData = $this->taskService->getKanbanData($projectId);
            return response()->json([
                'success' => true,
                'data' => $kanbanData,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xem dự án này',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function gantt($projectId)
    {
        try {
            // Check project access permission
            $project = Project::findOrFail($projectId);
            $this->authorize('view', $project);

            $ganttData = $this->taskService->getGanttData($projectId);
            return response()->json([
                'success' => true,
                'data' => $ganttData,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xem dự án này',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'project_id' => 'required|exists:pro___projects,id',
                'tieu_de' => 'required|string|max:255',
                'mo_ta' => 'nullable|string',
                'parent_id' => 'nullable|exists:pro___tasks,id',
                'trang_thai_id' => 'required|exists:pro___task_statuses,id',
                'uu_tien_id' => 'required|exists:pro___priorities,id',
                'nguoi_thuc_hien_id' => 'nullable|exists:admin_users,id',
                'ngay_bat_dau' => 'nullable|date',
                'ngay_ket_thuc_du_kien' => 'nullable|date|after_or_equal:ngay_bat_dau',
                'thoi_gian_uoc_tinh' => 'nullable|integer|min:0',
            ]);

            // Check permission to create task using Policy
            $project = Project::with('members')->findOrFail($validated['project_id']);
            $this->authorize('create', [Task::class, $project]);

            $task = $this->taskService->create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Tạo nhiệm vụ thành công',
                'data' => $task,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền tạo task trong dự án này',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            \Log::info('TaskController::update START', [
                'task_id' => $id,
                'user_id' => auth('admin_users')->id(),
                'request_data' => $request->all(),
            ]);

            $task = Task::with('project.members')->findOrFail($id);

            \Log::info('TaskController::update - Task loaded', [
                'task_id' => $task->id,
                'has_project' => isset($task->project),
                'has_members' => isset($task->project->members),
                'members_count' => $task->project->members->count() ?? 0,
            ]);

            // Check permission using Policy
            $this->authorize('update', $task);

            \Log::info('TaskController::update - Authorization passed');

            $validated = $request->validate([
                'tieu_de' => 'sometimes|required|string|max:255',
                'mo_ta' => 'nullable|string',
                'trang_thai_id' => 'sometimes|required|exists:pro___task_statuses,id',
                'uu_tien_id' => 'sometimes|required|exists:pro___priorities,id',
                'nguoi_thuc_hien_id' => 'nullable|exists:admin_users,id',
                'ngay_bat_dau' => 'nullable|date',
                'ngay_ket_thuc_du_kien' => 'nullable|date',
                'thoi_gian_uoc_tinh' => 'nullable|integer|min:0',
                'tien_do' => 'nullable|integer|min:0|max:100',
                'checklists' => 'nullable|array',
                'checklists.*.noi_dung' => 'required|string|max:255',
                'checklists.*.is_completed' => 'required|boolean',
                'checklists.*.assigned_to' => 'nullable|exists:admin_users,id',
                'checklists.*.mo_ta' => 'nullable|string',
                'checklists.*.sort_order' => 'required|integer',
            ]);

            // Track changes for notifications
            $oldTask = $task->replicate();

            $task = $this->taskService->update($id, $validated);

            \Log::info('TaskController::update - Task updated successfully');

            // Reload task with supporters for notification recipients
            $task->load('supporters');            // Send notifications based on what changed
            if (isset($validated['checklists'])) {
                $this->notificationService->notifyTaskChange($task, 'task_checklist', 'đã cập nhật checklist');
            }
            if (isset($validated['trang_thai_id']) && $oldTask->trang_thai_id != $validated['trang_thai_id']) {
                $this->notificationService->notifyTaskChange($task, 'task_status', 'đã thay đổi trạng thái');
            }
            if (isset($validated['uu_tien_id']) && $oldTask->uu_tien_id != $validated['uu_tien_id']) {
                $this->notificationService->notifyTaskChange($task, 'task_priority', 'đã thay đổi độ ưu tiên');
            }
            if ((isset($validated['ngay_bat_dau']) || isset($validated['ngay_ket_thuc_du_kien']))
                && ($oldTask->ngay_bat_dau != ($validated['ngay_bat_dau'] ?? $oldTask->ngay_bat_dau)
                    || $oldTask->ngay_ket_thuc_du_kien != ($validated['ngay_ket_thuc_du_kien'] ?? $oldTask->ngay_ket_thuc_du_kien))) {
                $this->notificationService->notifyTaskChange($task, 'task_date', 'đã cập nhật ngày bắt đầu/kết thúc');
            }
            if (isset($validated['nguoi_thuc_hien_id']) && $oldTask->nguoi_thuc_hien_id != $validated['nguoi_thuc_hien_id']) {
                $this->notificationService->notifyTaskChange($task, 'task_member', 'đã thay đổi người thực hiện');
            }

            \Log::info('TaskController::update - SUCCESS');

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật nhiệm vụ thành công',
                'data' => $task,
                'debug' => [
                    'has_project' => isset($task->project),
                    'has_members' => isset($task->project->members),
                    'has_trang_thai' => isset($task->trangThai),
                    'has_uu_tien' => isset($task->uuTien),
                    'has_checklists' => isset($task->checklists),
                ]
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            \Log::error('TaskController::update - Authorization FAILED', [
                'task_id' => $id,
                'user_id' => auth('admin_users')->id(),
                'exception' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền sửa task này',
            ], 403);
        } catch (\Exception $e) {
            \Log::error('TaskController::update - Exception', [
                'task_id' => $id,
                'user_id' => auth('admin_users')->id(),
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'trang_thai_id' => 'required|exists:pro___task_statuses,id',
                'kanban_order' => 'nullable|integer',
            ]);

            $task = $this->taskService->updateStatus(
                $id,
                $validated['trang_thai_id'],
                $validated['kanban_order'] ?? null
            );

            // Send notification for status change
            $this->notificationService->notifyTaskChange($task, 'task_status', 'đã thay đổi trạng thái');

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái thành công',
                'data' => $task,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $task = Task::findOrFail($id);

            // Check permission to delete task
            $user = auth('admin_users')->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            if (!$this->permissionService->userHasPermissionInProject($user->id, $task->project_id, 'task.delete')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền xóa task này',
                ], 403);
            }

            $this->taskService->delete($id);
            return response()->json([
                'success' => true,
                'message' => 'Xóa nhiệm vụ thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function addComment(Request $request, $id)
    {
        try {
            $task = Task::with('project.members')->findOrFail($id);
            $user = auth('admin_users')->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            // Check permission using Policy
            $this->authorize('comment', $task);

            $validated = $request->validate([
                'noi_dung' => 'required|string',
                'parent_id' => 'nullable|exists:pro___task_comments,id',
            ]);

            $comment = $this->taskService->addComment(
                $id,
                $validated['noi_dung'],
                $validated['parent_id'] ?? null
            );

            // Send notification
            $this->notificationService->notifyTaskChange($task, 'task_comment', 'đã thêm bình luận');

            return response()->json([
                'success' => true,
                'message' => 'Thêm bình luận thành công',
                'data' => $comment,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền thêm bình luận',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function uploadAttachment(Request $request, $id)
    {
        try {
            $task = Task::with('project.members')->findOrFail($id);
            $user = auth('admin_users')->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            // Check permission using Policy
            $this->authorize('uploadAttachment', $task);

            $validated = $request->validate([
                'file' => 'required|file|max:10240', // Max 10MB
                'mo_ta' => 'nullable|string',
            ]);

            $attachment = $this->taskService->uploadAttachment(
                $id,
                $validated['file'],
                $validated['mo_ta'] ?? null
            );

            // Send notification
            $fileName = $validated['file']->getClientOriginalName();
            $this->notificationService->notifyTaskChange($task, 'task_file', "đã upload file: {$fileName}");

            return response()->json([
                'success' => true,
                'message' => 'Tải file thành công',
                'data' => $attachment,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền upload file',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateAttachment(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'mo_ta' => 'required|string',
            ]);

            $attachment = $this->taskService->updateAttachment($id, $validated['mo_ta']);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật mô tả thành công',
                'data' => $attachment,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function downloadAttachment($id)
    {
        try {
            $attachment = TaskAttachment::findOrFail($id);
            return Storage::download($attachment->duong_dan, $attachment->ten_file);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'File không tồn tại',
            ], 404);
        }
    }

    public function deleteAttachment($id)
    {
        try {
            $attachment = TaskAttachment::findOrFail($id);
            $task = Task::findOrFail($attachment->task_id);
            $user = auth('admin_users')->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            // Check permission to delete attachment
            if (!$this->permissionService->userHasPermissionInProject($user->id, $task->project_id, 'attachment.delete')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền xóa file',
                ], 403);
            }

            $this->taskService->deleteAttachment($id);

            return response()->json([
                'success' => true,
                'message' => 'Xóa file thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // ============================================
    // TIME TRACKING ENDPOINTS
    // ============================================

    public function startTimer($id)
    {
        try {
            $task = Task::with('project.members')->findOrFail($id);
            $user = auth('admin_users')->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            // Check permission using Policy
            $this->authorize('logTime', $task);

            $timeLog = $this->taskService->startTimer($id);

            return response()->json([
                'success' => true,
                'message' => 'Bắt đầu tính giờ',
                'data' => $timeLog,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền log thời gian',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function stopTimer($timeLogId)
    {
        try {
            $timeLog = $this->taskService->stopTimer($timeLogId);

            return response()->json([
                'success' => true,
                'message' => 'Dừng đếm thời gian',
                'data' => $timeLog,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function addManualTimeLog(Request $request, $id)
    {
        try {
            $task = Task::with('project.members')->findOrFail($id);
            $user = auth('admin_users')->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            // Check permission using Policy
            $this->authorize('logTime', $task);

            $validated = $request->validate([
                'started_at' => 'required|date',
                'ended_at' => 'required|date|after:started_at',
                'mo_ta' => 'nullable|string',
            ]);

            $timeLog = $this->taskService->addManualTimeLog($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Thêm log thời gian thành công',
                'data' => $timeLog,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền log thời gian',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getTimeLogs($id)
    {
        try {
            $timeLogs = $this->taskService->getTimeLogs($id);

            return response()->json([
                'success' => true,
                'data' => $timeLogs,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteTimeLog($timeLogId)
    {
        try {
            $this->taskService->deleteTimeLog($timeLogId);

            return response()->json([
                'success' => true,
                'message' => 'Xóa log thời gian thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getRunningTimer()
    {
        try {
            $timer = $this->taskService->getRunningTimer();

            return response()->json([
                'success' => true,
                'data' => $timer,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all tasks across all projects (with optional filters)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllTasks(Request $request)
    {
        try {
            $query = Task::with([
                'project:id,ten_du_an,ma_du_an',
                'trangThai:id,name,color,is_done',
                'uuTien:id,name,color',
                'nguoiThucHien:id,name',
                'nguoiGiaoViec:id,name'
            ]);

            // Filter by assigned user
            if ($request->has('assigned_user_id') && $request->assigned_user_id) {
                $query->where('nguoi_thuc_hien_id', $request->assigned_user_id);
            }

            // Filter by project
            if ($request->has('project_id') && $request->project_id) {
                $query->where('project_id', $request->project_id);
            }

            // Filter by status
            if ($request->has('status_id') && $request->status_id) {
                $query->where('trang_thai_id', $request->status_id);
            }

            // Filter by priority
            if ($request->has('priority_id') && $request->priority_id) {
                $query->where('uu_tien_id', $request->priority_id);
            }

            // Search by name
            if ($request->has('search') && $request->search) {
                $query->where('tieu_de', 'like', '%' . $request->search . '%');
            }

            // Filter by date range
            if ($request->has('start_date') && $request->start_date) {
                $query->whereDate('ngay_bat_dau', '>=', $request->start_date);
            }
            if ($request->has('end_date') && $request->end_date) {
                $query->whereDate('ngay_ket_thuc_du_kien', '<=', $request->end_date);
            }

            // Sort
            $sortBy = $request->get('sort_by', 'ngay_ket_thuc_du_kien');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            $tasks = $query->paginate($request->get('per_page', 20));

            // Transform data
            $tasks->getCollection()->transform(function ($task) {
                return [
                    'id' => $task->id,
                    'name' => $task->tieu_de,
                    'description' => $task->mo_ta,
                    'project' => [
                        'id' => $task->project->id ?? null,
                        'name' => $task->project->ten_du_an ?? null,
                        'code' => $task->project->ma_du_an ?? null,
                    ],
                    'status' => [
                        'id' => $task->trangThai->id ?? null,
                        'name' => $task->trangThai->name ?? null,
                        'color' => $task->trangThai->color ?? null,
                        'is_done' => $task->trangThai->is_done ?? false,
                    ],
                    'priority' => [
                        'id' => $task->uuTien->id ?? null,
                        'name' => $task->uuTien->name ?? null,
                        'color' => $task->uuTien->color ?? null,
                    ],
                    'start_date' => $task->ngay_bat_dau,
                    'end_date' => $task->ngay_ket_thuc_du_kien,
                    'progress' => $task->tien_do,
                    'assigned_users' => $task->nguoiThucHien ? [[
                        'id' => $task->nguoiThucHien->id,
                        'name' => $task->nguoiThucHien->name,
                    ]] : [],
                    'creator' => [
                        'id' => $task->nguoiGiaoViec->id ?? null,
                        'name' => $task->nguoiGiaoViec->name ?? null,
                    ],
                    'created_at' => $task->created_at,
                    'updated_at' => $task->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $tasks,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all tasks assigned to current user across all projects
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyTasks(Request $request)
    {
        try {
            $userId = auth()->guard('admin_users')->id();

            $query = Task::with([
                'project:id,ten_du_an,ma_du_an',
                'trangThai:id,name,color',
                'uuTien:id,name,color',
                'nguoiThucHien:id,name',
                'nguoiGiaoViec:id,name'
            ])
            ->where('nguoi_thuc_hien_id', $userId);

            // Filter by project
            if ($request->has('project_id') && $request->project_id) {
                $query->where('project_id', $request->project_id);
            }

            // Filter by status
            if ($request->has('status_id') && $request->status_id) {
                $query->where('trang_thai_id', $request->status_id);
            }

            // Filter by priority
            if ($request->has('priority_id') && $request->priority_id) {
                $query->where('uu_tien_id', $request->priority_id);
            }

            // Search by name
            if ($request->has('search') && $request->search) {
                $query->where('tieu_de', 'like', '%' . $request->search . '%');
            }

            // Filter by date range
            if ($request->has('start_date') && $request->start_date) {
                $query->whereDate('ngay_bat_dau', '>=', $request->start_date);
            }
            if ($request->has('end_date') && $request->end_date) {
                $query->whereDate('ngay_ket_thuc_du_kien', '<=', $request->end_date);
            }

            // Sort
            $sortBy = $request->get('sort_by', 'ngay_ket_thuc_du_kien');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            $tasks = $query->paginate($request->get('per_page', 20));

            // Transform data
            $tasks->getCollection()->transform(function ($task) {
                return [
                    'id' => $task->id,
                    'name' => $task->tieu_de,
                    'description' => $task->mo_ta,
                    'project' => [
                        'id' => $task->project->id ?? null,
                        'name' => $task->project->ten_du_an ?? null,
                        'code' => $task->project->ma_du_an ?? null,
                    ],
                    'status' => [
                        'id' => $task->trangThai->id ?? null,
                        'name' => $task->trangThai->name ?? null,
                        'color' => $task->trangThai->color ?? null,
                    ],
                    'priority' => [
                        'id' => $task->uuTien->id ?? null,
                        'name' => $task->uuTien->name ?? null,
                        'color' => $task->uuTien->color ?? null,
                    ],
                    'start_date' => $task->ngay_bat_dau,
                    'end_date' => $task->ngay_ket_thuc_du_kien,
                    'progress' => $task->tien_do,
                    'assigned_users' => $task->nguoiThucHien ? [[
                        'id' => $task->nguoiThucHien->id,
                        'name' => $task->nguoiThucHien->name,
                    ]] : [],
                    'creator' => [
                        'id' => $task->nguoiGiaoViec->id ?? null,
                        'name' => $task->nguoiGiaoViec->name ?? null,
                    ],
                    'created_at' => $task->created_at,
                    'updated_at' => $task->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $tasks,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Add supporters to task
     */
    public function addSupporters(Request $request, $taskId)
    {
        try {
            $validated = $request->validate([
                'supporter_ids' => 'required|array',
                'supporter_ids.*' => 'exists:admin_users,id',
            ]);

            $task = Task::findOrFail($taskId);

            // Sync supporters (replace existing)
            $task->supporters()->sync($validated['supporter_ids']);

            // Notify task change
            $notificationService = app(NotificationService::class);
            $supporterNames = \App\Models\AdminUser::whereIn('id', $validated['supporter_ids'])
                ->pluck('name')->toArray();

            $notificationService->notifyTaskChange(
                $task,
                'task_member',
                'Người hỗ trợ được cập nhật: ' . implode(', ', $supporterNames),
                ['supporter_ids' => $validated['supporter_ids']]
            );

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật người hỗ trợ thành công',
                'data' => $task->load('supporters'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update supporters (alias for addSupporters)
     */
    public function updateSupporters(Request $request, $taskId)
    {
        return $this->addSupporters($request, $taskId);
    }

    /**
     * Remove supporter from task
     */
    public function removeSupporter($taskId, $userId)
    {
        try {
            $task = Task::findOrFail($taskId);
            $task->supporters()->detach($userId);

            return response()->json([
                'success' => true,
                'message' => 'Xóa người hỗ trợ thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }
}
