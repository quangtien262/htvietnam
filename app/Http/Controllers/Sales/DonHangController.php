<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\DonHang;
use App\Models\Sales\DonHangChiTiet;
use App\Services\Sales\DonHangService;
use Illuminate\Http\Request;

class DonHangController extends Controller
{
    protected $donHangService;

    public function __construct(DonHangService $donHangService)
    {
        $this->donHangService = $donHangService;
    }

    public function index(Request $request)
    {
        $query = DonHang::with(['user', 'nhanVienBanHang', 'chiTiets']);

        if ($request->trang_thai) {
            $query->where('trang_thai', $request->trang_thai);
        }

        if ($request->thang && $request->nam) {
            $query->theoThang($request->thang, $request->nam);
        }

        $donHangs = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['message' => 'success', 'data' => $donHangs]);
    }

    public function store(Request $request)
    {
        $donHang = DonHang::create($request->except('chi_tiets'));

        if ($request->chi_tiets) {
            foreach ($request->chi_tiets as $ct) {
                DonHangChiTiet::create(array_merge($ct, ['don_hang_id' => $donHang->id]));
            }
        }

        $this->donHangService->tinhTongDonHang($donHang->id);

        return response()->json(['message' => 'success', 'data' => $donHang]);
    }

    public function update(Request $request, $id)
    {
        $donHang = DonHang::findOrFail($id);
        $donHang->update($request->except('chi_tiets'));

        if ($request->chi_tiets) {
            DonHangChiTiet::where('don_hang_id', $id)->delete();
            foreach ($request->chi_tiets as $ct) {
                DonHangChiTiet::create(array_merge($ct, ['don_hang_id' => $id]));
            }
        }

        $this->donHangService->tinhTongDonHang($id);

        return response()->json(['message' => 'success']);
    }

    public function updateStatus(Request $request, $id)
    {
        $donHang = DonHang::findOrFail($id);
        $donHang->update(['trang_thai' => $request->trang_thai]);

        return response()->json(['message' => 'success']);
    }

    public function cancel(Request $request, $id)
    {
        $donHang = DonHang::findOrFail($id);
        $donHang->update([
            'trang_thai' => 'cancelled',
            'ly_do_huy' => $request->ly_do_huy,
            'ngay_huy' => now(),
        ]);

        return response()->json(['message' => 'success']);
    }

    public function baoCao(Request $request)
    {
        $thang = $request->thang ?? date('m');
        $nam = $request->nam ?? date('Y');

        $tongDonHang = DonHang::theoThang($thang, $nam)->count();
        $tongDoanhThu = DonHang::theoThang($thang, $nam)->sum('tong_cong');
        $daThanhToan = DonHang::theoThang($thang, $nam)->sum('da_thanh_toan');
        $congNo = DonHang::theoThang($thang, $nam)->sum('con_no');

        return response()->json([
            'message' => 'success',
            'data' => [
                'tong_don_hang' => $tongDonHang,
                'tong_doanh_thu' => $tongDoanhThu,
                'da_thanh_toan' => $daThanhToan,
                'cong_no' => $congNo,
            ]
        ]);
    }
}
