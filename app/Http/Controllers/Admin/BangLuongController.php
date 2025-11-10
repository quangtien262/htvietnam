<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\BangLuong;
use App\Models\AdminUser;
use App\Services\Admin\BangLuongService;
use Illuminate\Http\Request;

class BangLuongController extends Controller
{
    /**
     * Display salary list
     */
    public function index(Request $request)
    {
        $query = BangLuong::active()->with(['nhanVien', 'nguoiDuyet']);

        // Filters
        if ($request->thang) {
            $query->where('thang', $request->thang);
        }
        if ($request->nam) {
            $query->where('nam', $request->nam);
        }
        if ($request->trang_thai) {
            $query->where('trang_thai', $request->trang_thai);
        }
        if ($request->admin_user_id) {
            $query->where('admin_user_id', $request->admin_user_id);
        }

        $bangLuongs = $query->orderBy('created_at', 'desc')->paginate(30);

        $nhanViens = AdminUser::where('admin_user_status_id', 1)
            ->select('id', 'name', 'code')
            ->get();

        return view('admin.hr.bang-luong', [
            'bangLuongs' => $bangLuongs,
            'nhanViens' => $nhanViens,
            'filters' => $request->only(['thang', 'nam', 'trang_thai', 'admin_user_id']),
        ]);
    }

    /**
     * Calculate salary for single employee
     */
    public function tinhLuong(Request $request)
    {
        $validated = $request->validate([
            'admin_user_id' => 'required|exists:admin_users,id',
            'thang' => 'required|integer|min:1|max:12',
            'nam' => 'required|integer|min:2020',
        ]);

        try {
            $bangLuong = BangLuongService::tinhLuongThang(
                $validated['admin_user_id'],
                $validated['thang'],
                $validated['nam']
            );

            return response()->json([
                'message' => 'success',
                'data' => $bangLuong->load(['nhanVien', 'nguoiDuyet']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Calculate salary for all employees
     */
    public function tinhLuongToanBo(Request $request)
    {
        $validated = $request->validate([
            'thang' => 'required|integer|min:1|max:12',
            'nam' => 'required|integer|min:2020',
            'chi_nhanh_id' => 'nullable|exists:chi_nhanh,id',
        ]);

        try {
            $results = BangLuongService::tinhLuongToanBo(
                $validated['thang'],
                $validated['nam'],
                $validated['chi_nhanh_id'] ?? null
            );

            return response()->json([
                'message' => 'success',
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Approve salary
     */
    public function approve($id)
    {
        $bangLuong = BangLuong::find($id);
        if (!$bangLuong) {
            return response()->json(['message' => 'error', 'error' => 'Không tìm thấy'], 404);
        }

        $bangLuong->trang_thai = 'approved';
        $bangLuong->nguoi_duyet_id = auth('admin_users')->id();
        $bangLuong->ngay_duyet = now();
        $bangLuong->save();

        return response()->json([
            'message' => 'success',
            'data' => $bangLuong->fresh()->load(['nhanVien', 'nguoiDuyet']),
        ]);
    }

    /**
     * Mark as paid
     */
    public function markPaid($id, Request $request)
    {
        $bangLuong = BangLuong::find($id);
        if (!$bangLuong) {
            return response()->json(['message' => 'error'], 404);
        }

        $bangLuong->trang_thai = 'paid';
        $bangLuong->ngay_phat_luong = $request->ngay_phat_luong ?? now();
        $bangLuong->save();

        return response()->json([
            'message' => 'success',
            'data' => $bangLuong->fresh(),
        ]);
    }

    /**
     * Show detail
     */
    public function show($id)
    {
        $bangLuong = BangLuong::with(['nhanVien', 'nguoiDuyet'])
            ->find($id);

        if (!$bangLuong) {
            return response()->json(['message' => 'error'], 404);
        }

        return response()->json([
            'message' => 'success',
            'data' => $bangLuong,
        ]);
    }

    /**
     * Update manually
     */
    public function update(Request $request, $id)
    {
        $bangLuong = BangLuong::find($id);
        if (!$bangLuong) {
            return response()->json(['message' => 'error'], 404);
        }

        if ($bangLuong->trang_thai !== 'draft') {
            return response()->json([
                'message' => 'error',
                'error' => 'Chỉ có thể sửa bảng lương ở trạng thái nháp'
            ], 400);
        }

        $validated = $request->validate([
            'tong_thuong' => 'nullable|numeric',
            'tong_phu_cap' => 'nullable|numeric',
            'tong_giam_tru' => 'nullable|numeric',
            'ghi_chu' => 'nullable|string',
        ]);

        $bangLuong->update($validated);

        // Recalculate totals
        $bangLuong->tong_thu_nhap = $bangLuong->luong_theo_ngay_cong
            + $bangLuong->tien_lam_them
            + $bangLuong->tong_thuong
            + $bangLuong->tong_hoa_hong
            + $bangLuong->tong_phu_cap;

        $bangLuong->tong_khau_tru = $bangLuong->tong_giam_tru
            + $bangLuong->tru_bhxh
            + $bangLuong->tru_bhyt
            + $bangLuong->tru_bhtn
            + $bangLuong->tru_thue_tncn;

        $bangLuong->thuc_nhan = $bangLuong->tong_thu_nhap - $bangLuong->tong_khau_tru;
        $bangLuong->save();

        return response()->json([
            'message' => 'success',
            'data' => $bangLuong->fresh(),
        ]);
    }

    /**
     * Delete
     */
    public function destroy($id)
    {
        $bangLuong = BangLuong::find($id);
        if (!$bangLuong) {
            return response()->json(['message' => 'error'], 404);
        }

        if ($bangLuong->trang_thai !== 'draft') {
            return response()->json([
                'message' => 'error',
                'error' => 'Chỉ có thể xóa bảng lương ở trạng thái nháp'
            ], 400);
        }

        $bangLuong->is_recycle_bin = 1;
        $bangLuong->save();

        return response()->json(['message' => 'success']);
    }
}
