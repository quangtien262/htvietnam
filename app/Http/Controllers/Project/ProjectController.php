<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Services\Project\ProjectService;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
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
            return response()->json([
                'success' => true,
                'data' => $project,
            ]);
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
            ]);

            $project = $this->projectService->update($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật dự án thành công',
                'data' => $project,
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
            $this->projectService->delete($id);
            return response()->json([
                'success' => true,
                'message' => 'Xóa dự án thành công',
            ]);
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
            $this->projectService->removeMember($id, $memberId);

            return response()->json([
                'success' => true,
                'message' => 'Xóa thành viên thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
