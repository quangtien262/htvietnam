<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\NghiPhep;
use App\Models\AdminUser;
use Illuminate\Http\Request;

class NghiPhepController extends Controller
{
    public function index(Request $request)
    {
        $query = NghiPhep::active()->with(['nhanVien', 'nguoiDuyet']);

        if ($request->trang_thai) {
            $query->where('trang_thai', $request->trang_thai);
        }
        if ($request->admin_user_id) {
            $query->where('admin_user_id', $request->admin_user_id);
        }
        if ($request->loai_nghi) {
            $query->where('loai_nghi', $request->loai_nghi);
        }

        $nghiPheps = $query->orderBy('created_at', 'desc')->paginate(30);

        $nhanViens = AdminUser::where('admin_user_status_id', 1)
            ->select('id', 'name', 'code')->get();

        return view('admin.hr.nghi-phep', [
            'nghiPheps' => $nghiPheps,
            'nhanViens' => $nhanViens,
            'filters' => $request->only(['trang_thai', 'admin_user_id', 'loai_nghi']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'admin_user_id' => 'required|exists:admin_users,id',
            'loai_nghi' => 'required|string',
            'tu_ngay' => 'required|date',
            'den_ngay' => 'required|date|after_or_equal:tu_ngay',
            'ly_do' => 'nullable|string',
            'file_dinh_kem' => 'nullable|string',
        ]);

        $nghiPhep = NghiPhep::create($validated);

        return response()->json([
            'message' => 'success',
            'data' => $nghiPhep->load(['nhanVien']),
        ]);
    }

    public function approve($id, Request $request)
    {
        $nghiPhep = NghiPhep::find($id);
        if (!$nghiPhep) {
            return response()->json(['message' => 'error'], 404);
        }

        $nghiPhep->trang_thai = 'approved';
        $nghiPhep->nguoi_duyet_id = auth('admin_users')->id();
        $nghiPhep->ngay_duyet = now();
        $nghiPhep->ghi_chu_duyet = $request->ghi_chu_duyet;
        $nghiPhep->save();

        return response()->json([
            'message' => 'success',
            'data' => $nghiPhep->fresh()->load(['nhanVien', 'nguoiDuyet']),
        ]);
    }

    public function reject($id, Request $request)
    {
        $nghiPhep = NghiPhep::find($id);
        if (!$nghiPhep) {
            return response()->json(['message' => 'error'], 404);
        }

        $nghiPhep->trang_thai = 'rejected';
        $nghiPhep->nguoi_duyet_id = auth('admin_users')->id();
        $nghiPhep->ngay_duyet = now();
        $nghiPhep->ghi_chu_duyet = $request->ghi_chu_duyet;
        $nghiPhep->save();

        return response()->json([
            'message' => 'success',
            'data' => $nghiPhep->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $nghiPhep = NghiPhep::find($id);
        if (!$nghiPhep || $nghiPhep->trang_thai !== 'pending') {
            return response()->json(['message' => 'error'], 400);
        }

        $nghiPhep->is_recycle_bin = 1;
        $nghiPhep->save();

        return response()->json(['message' => 'success']);
    }
}
