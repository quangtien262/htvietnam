<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project\TaskAttachment;
use App\Models\Project\Task;
use App\Models\Project\Project;
use App\Services\Project\TaskService;
use App\Services\Project\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TaskController extends Controller
{
    protected $taskService;
    protected $permissionService;

    public function __construct(TaskService $taskService, PermissionService $permissionService)
    {
        $this->taskService = $taskService;
        $this->permissionService = $permissionService;
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
            $kanbanData = $this->taskService->getKanbanData($projectId);
            return response()->json([
                'success' => true,
                'data' => $kanbanData,
            ]);
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
            $ganttData = $this->taskService->getGanttData($projectId);
            return response()->json([
                'success' => true,
                'data' => $ganttData,
            ]);
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

            // Check permission to create task
            $user = auth('admin_users')->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            if (!$this->permissionService->userHasPermissionInProject($user->id, $validated['project_id'], 'task.create')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền tạo task trong dự án này',
                ], 403);
            }

            $task = $this->taskService->create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Tạo nhiệm vụ thành công',
                'data' => $task,
            ]);
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
            $task = Task::findOrFail($id);
            
            // Check permission to update task
            $user = auth('admin_users')->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            // Check if user has task.update OR (task.update_own AND is assignee)
            $hasUpdatePermission = $this->permissionService->userHasPermissionInProject($user->id, $task->project_id, 'task.update');
            $hasUpdateOwnPermission = $this->permissionService->userHasPermissionInProject($user->id, $task->project_id, 'task.update_own') 
                && $task->nguoi_thuc_hien_id === $user->id;

            if (!$hasUpdatePermission && !$hasUpdateOwnPermission) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền sửa task này',
                ], 403);
            }
            
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
                'checklists.*.sort_order' => 'required|integer',
            ]);

            $task = $this->taskService->update($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật nhiệm vụ thành công',
                'data' => $task,
            ]);
        } catch (\Exception $e) {
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
            $task = Task::findOrFail($id);
            $user = auth('admin_users')->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }
            
            // Check permission to add comment
            if (!$this->permissionService->userHasPermissionInProject($user->id, $task->project_id, 'comment.create')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền thêm bình luận',
                ], 403);
            }
            
            $validated = $request->validate([
                'noi_dung' => 'required|string',
                'parent_id' => 'nullable|exists:pro___task_comments,id',
            ]);

            $comment = $this->taskService->addComment(
                $id,
                $validated['noi_dung'],
                $validated['parent_id'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'Thêm bình luận thành công',
                'data' => $comment,
            ]);
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
            $task = Task::findOrFail($id);
            $user = auth('admin_users')->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }
            
            // Check permission to upload attachment
            if (!$this->permissionService->userHasPermissionInProject($user->id, $task->project_id, 'attachment.upload')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền upload file',
                ], 403);
            }
            
            $validated = $request->validate([
                'file' => 'required|file|max:10240', // Max 10MB
                'mo_ta' => 'nullable|string',
            ]);

            $attachment = $this->taskService->uploadAttachment(
                $id, 
                $validated['file'],
                $validated['mo_ta'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'Tải file thành công',
                'data' => $attachment,
            ]);
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
            $task = Task::findOrFail($id);
            $user = auth('admin_users')->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }
            
            // Check permission to log time
            if (!$this->permissionService->userHasPermissionInProject($user->id, $task->project_id, 'time.log')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền log thời gian',
                ], 403);
            }
            
            $timeLog = $this->taskService->startTimer($id);

            return response()->json([
                'success' => true,
                'message' => 'Bắt đầu tính giờ',
                'data' => $timeLog,
            ]);
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
            $task = Task::findOrFail($id);
            $user = auth('admin_users')->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }
            
            // Check permission to log time
            if (!$this->permissionService->userHasPermissionInProject($user->id, $task->project_id, 'time.log')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền log thời gian',
                ], 403);
            }
            
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
}
