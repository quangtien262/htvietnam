<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\Business\CoHoiKinhDoanh;
use Illuminate\Http\Request;

class CoHoiKinhDoanhController extends Controller
{
    public function index(Request $request)
    {
        $query = CoHoiKinhDoanh::with(['user', 'nhanVienPhuTrach']);

        if ($request->giai_doan) {
            $query->where('giai_doan', $request->giai_doan);
        }

        if ($request->nhan_vien_id) {
            $query->where('nhan_vien_phu_trach_id', $request->nhan_vien_id);
        }

        $coHois = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['message' => 'success', 'data' => $coHois]);
    }

    public function store(Request $request)
    {
        $coHoi = CoHoiKinhDoanh::create($request->all());
        return response()->json(['message' => 'success', 'data' => $coHoi]);
    }

    public function update(Request $request, $id)
    {
        $coHoi = CoHoiKinhDoanh::findOrFail($id);
        $coHoi->update($request->all());
        return response()->json(['message' => 'success', 'data' => $coHoi]);
    }

    public function updateGiaiDoan(Request $request, $id)
    {
        $coHoi = CoHoiKinhDoanh::findOrFail($id);
        $coHoi->update(['giai_doan' => $request->giai_doan]);
        
        if ($request->giai_doan === 'won') {
            $coHoi->update(['ngay_chot_thuc_te' => now()]);
        }
        
        return response()->json(['message' => 'success', 'data' => $coHoi]);
    }

    public function destroy($id)
    {
        CoHoiKinhDoanh::findOrFail($id)->delete();
        return response()->json(['message' => 'success']);
    }

    public function baoCao(Request $request)
    {
        $thang = $request->thang ?? now()->month;
        $nam = $request->nam ?? now()->year;

        $tongCoHoi = CoHoiKinhDoanh::theoThang($thang, $nam)->count();
        $coHoiWon = CoHoiKinhDoanh::theoThang($thang, $nam)->won()->count();
        $coHoiLost = CoHoiKinhDoanh::theoThang($thang, $nam)->lost()->count();
        $giaTriDuKien = CoHoiKinhDoanh::theoThang($thang, $nam)->active()->sum('gia_tri_du_kien');

        return response()->json([
            'message' => 'success',
            'data' => [
                'tong_co_hoi' => $tongCoHoi,
                'co_hoi_thanh_cong' => $coHoiWon,
                'co_hoi_that_bai' => $coHoiLost,
                'gia_tri_du_kien' => $giaTriDuKien,
            ]
        ]);
    }
}
