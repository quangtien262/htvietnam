<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Services\Project\TaskService;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    protected $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
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
}
