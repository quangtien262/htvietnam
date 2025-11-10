<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\Business\{BaoGia, BaoGiaChiTiet};
use App\Services\Business\BusinessService;
use Illuminate\Http\Request;

class BaoGiaController extends Controller
{
    protected $businessService;

    public function __construct(BusinessService $businessService)
    {
        $this->businessService = $businessService;
    }

    public function index(Request $request)
    {
        $baoGias = BaoGia::with(['user', 'coHoi', 'nhanVienTao', 'chiTiets'])
            ->orderBy('created_at', 'desc')->get();

        return response()->json(['message' => 'success', 'data' => $baoGias]);
    }

    public function store(Request $request)
    {
        $baoGia = BaoGia::create($request->except('chi_tiets'));

        if ($request->chi_tiets) {
            foreach ($request->chi_tiets as $ct) {
                BaoGiaChiTiet::create(array_merge($ct, ['bao_gia_id' => $baoGia->id]));
            }
        }

        $this->businessService->tinhTongBaoGia($baoGia->id);

        return response()->json(['message' => 'success', 'data' => $baoGia]);
    }

    public function update(Request $request, $id)
    {
        $baoGia = BaoGia::findOrFail($id);
        $baoGia->update($request->except('chi_tiets'));

        if ($request->chi_tiets) {
            BaoGiaChiTiet::where('bao_gia_id', $id)->delete();
            foreach ($request->chi_tiets as $ct) {
                BaoGiaChiTiet::create(array_merge($ct, ['bao_gia_id' => $id]));
            }
        }

        $this->businessService->tinhTongBaoGia($id);

        return response()->json(['message' => 'success', 'data' => $baoGia]);
    }

    public function updateStatus(Request $request, $id)
    {
        $baoGia = BaoGia::findOrFail($id);
        $baoGia->update(['trang_thai' => $request->trang_thai]);

        return response()->json(['message' => 'success', 'data' => $baoGia]);
    }

    public function destroy($id)
    {
        BaoGia::findOrFail($id)->delete();
        return response()->json(['message' => 'success']);
    }
}
