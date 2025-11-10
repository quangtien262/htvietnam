<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\ChamCong;
use App\Models\AdminUser;
use App\Services\Admin\ChamCongService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ChamCongController extends Controller
{
    /**
     * Display calendar view
     */
    public function index(Request $request)
    {
        $userId = $request->user_id ?? auth('admin_users')->id();
        $thang = $request->thang ?? now()->month;
        $nam = $request->nam ?? now()->year;

        $chamCongs = ChamCong::active()
            ->with('nhanVien')
            ->where('admin_user_id', $userId)
            ->byMonth($thang, $nam)
            ->orderBy('ngay_cham_cong')
            ->get();

        $tongHop = ChamCongService::getTongHopThang($userId, $thang, $nam);

        $nhanViens = AdminUser::where('admin_user_status_id', 1)
            ->select('id', 'name', 'code')
            ->get();

        return view('admin.hr.cham-cong', [
            'chamCongs' => $chamCongs,
            'tongHop' => $tongHop,
            'nhanViens' => $nhanViens,
            'thang' => $thang,
            'nam' => $nam,
            'userId' => $userId,
        ]);
    }

    /**
     * Store new attendance
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'admin_user_id' => 'required|exists:admin_users,id',
            'ngay_cham_cong' => 'required|date',
            'type' => 'required|integer|min:1|max:5',
            'checkin_h' => 'nullable|string',
            'checkin_m' => 'nullable|string',
            'checkout_h' => 'nullable|string',
            'checkout_m' => 'nullable|string',
            'gio_lam_them' => 'nullable|numeric',
            'note' => 'nullable|string',
        ]);

        try {
            $chamCong = ChamCongService::createChamCong($validated);

            return response()->json([
                'message' => 'success',
                'data' => $chamCong->load('nhanVien'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update attendance
     */
    public function update(Request $request, $id)
    {
        $chamCong = ChamCong::find($id);
        if (!$chamCong) {
            return response()->json(['message' => 'error', 'error' => 'Không tìm thấy'], 404);
        }

        $validated = $request->validate([
            'type' => 'required|integer|min:1|max:5',
            'checkin_h' => 'nullable|string',
            'checkin_m' => 'nullable|string',
            'checkout_h' => 'nullable|string',
            'checkout_m' => 'nullable|string',
            'gio_lam_them' => 'nullable|numeric',
            'note' => 'nullable|string',
        ]);

        $chamCong->update($validated);

        return response()->json([
            'message' => 'success',
            'data' => $chamCong->fresh()->load('nhanVien'),
        ]);
    }

    /**
     * Approve attendance
     */
    public function approve($id)
    {
        try {
            $chamCong = ChamCongService::approveChamCong($id, auth('admin_users')->id());

            return response()->json([
                'message' => 'success',
                'data' => $chamCong,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get attendance by date range
     */
    public function getByDateRange(Request $request)
    {
        $userId = $request->user_id;
        $from = $request->from;
        $to = $request->to;

        $chamCongs = ChamCong::active()
            ->with('nhanVien')
            ->where('admin_user_id', $userId)
            ->byDateRange($from, $to)
            ->orderBy('ngay_cham_cong')
            ->get();

        return response()->json([
            'message' => 'success',
            'data' => $chamCongs,
        ]);
    }

    /**
     * Delete attendance
     */
    public function destroy($id)
    {
        $chamCong = ChamCong::find($id);
        if (!$chamCong) {
            return response()->json(['message' => 'error'], 404);
        }

        $chamCong->is_recycle_bin = 1;
        $chamCong->save();

        return response()->json(['message' => 'success']);
    }
}
