<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Services\Project\ProjectService;
use App\Models\Project\Project;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ProjectController extends Controller
{
    use AuthorizesRequests;

    protected $projectService;

    public function __construct(ProjectService $projectService)
    {
        $this->projectService = $projectService;
    }

    public function index(Request $request)
    {
        try {
            $projects = $this->projectService->getList($request->all());
            return response()->json([
                'success' => true,
                'data' => $projects,
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
                'ten_du_an' => 'required|string|max:255',
                'mo_ta' => 'nullable|string',
                'loai_du_an_id' => 'nullable|exists:pro___project_types,id',
                'trang_thai_id' => 'required|exists:pro___project_statuses,id',
                'uu_tien_id' => 'required|exists:pro___priorities,id',
                'ngay_bat_dau' => 'nullable|date',
                'ngay_ket_thuc_du_kien' => 'nullable|date|after_or_equal:ngay_bat_dau',
                'ngan_sach_du_kien' => 'nullable|numeric|min:0',
                'quan_ly_du_an_id' => 'nullable|exists:admin_users,id',
                'mau_sac' => 'nullable|string',
            ]);

            $project = $this->projectService->create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Tạo dự án thành công',
                'data' => $project,
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
            $project = $this->projectService->getById($id);

            // Check permission
            $this->authorize('view', $project);

            return response()->json([
                'success' => true,
                'data' => $project,
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
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $project = Project::findOrFail($id);

            // Check permission
            $this->authorize('update', $project);

            $validated = $request->validate([
                'ten_du_an' => 'sometimes|required|string|max:255',
                'mo_ta' => 'nullable|string',
                'loai_du_an_id' => 'nullable|exists:pro___project_types,id',
                'trang_thai_id' => 'sometimes|required|exists:pro___project_statuses,id',
                'uu_tien_id' => 'sometimes|required|exists:pro___priorities,id',
                'ngay_bat_dau' => 'nullable|date',
                'ngay_ket_thuc_du_kien' => 'nullable|date',
                'ngan_sach_du_kien' => 'nullable|numeric|min:0',
                'quan_ly_du_an_id' => 'nullable|exists:admin_users,id',
                'tien_do' => 'nullable|integer|min:0|max:100',
                'checklists' => 'nullable|array',
                'checklists.*.noi_dung' => 'required|string|max:255',
                'checklists.*.is_completed' => 'required|boolean',
                'checklists.*.assigned_to' => 'nullable|exists:admin_users,id',
                'checklists.*.mo_ta' => 'nullable|string',
                'checklists.*.sort_order' => 'required|integer',
            ]);

            $project = $this->projectService->update($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật dự án thành công',
                'data' => $project,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền sửa dự án này',
            ], 403);
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
            $project = Project::findOrFail($id);

            // Check permission
            $this->authorize('delete', $project);

            $this->projectService->delete($id);
            return response()->json([
                'success' => true,
                'message' => 'Xóa dự án thành công',
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xóa dự án này',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function dashboard()
    {
        try {
            $stats = $this->projectService->getDashboardStats();
            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function addMember(Request $request, $id)
    {
        try {
            $project = Project::findOrFail($id);

            // Check permission
            $this->authorize('manageMembers', $project);

            $validated = $request->validate([
                'admin_user_id' => 'required|exists:admin_users,id',
                'vai_tro' => 'required|in:quan_ly,thanh_vien,xem',
                'ngay_tham_gia' => 'nullable|date',
            ]);

            $member = $this->projectService->addMember($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Thêm thành viên thành công',
                'data' => $member,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền quản lý thành viên dự án này',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function removeMember($id, $memberId)
    {
        try {
            $project = Project::findOrFail($id);

            // Check permission
            $this->authorize('manageMembers', $project);

            $this->projectService->removeMember($id, $memberId);

            return response()->json([
                'success' => true,
                'message' => 'Xóa thành viên thành công',
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền quản lý thành viên dự án này',
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
            $project = Project::findOrFail($id);

            // Check permission to upload attachment
            $this->authorize('update', $project);

            $validated = $request->validate([
                'file' => 'required|file|max:10240',
                'mo_ta' => 'nullable|string',
            ]);

            $attachment = $this->projectService->uploadAttachment(
                $id,
                $validated['file'],
                $validated['mo_ta'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'Tải file thành công',
                'data' => $attachment,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền upload file cho dự án này',
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

            $attachment = $this->projectService->updateAttachment($id, $validated['mo_ta']);

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
            $attachment = \App\Models\Project\ProjectAttachment::findOrFail($id);
            return \Illuminate\Support\Facades\Storage::download($attachment->duong_dan, $attachment->ten_file);
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
            $attachment = \App\Models\Project\ProjectAttachment::findOrFail($id);
            $project = Project::findOrFail($attachment->project_id);

            // Check permission to delete attachment
            $this->authorize('update', $project);

            $this->projectService->deleteAttachment($id);

            return response()->json([
                'success' => true,
                'message' => 'Xóa file thành công',
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xóa file này',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getDashboardStats(Request $request, $id)
    {
        try {
            $stats = $this->projectService->getProjectDashboardStats($id, $request->all());

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
