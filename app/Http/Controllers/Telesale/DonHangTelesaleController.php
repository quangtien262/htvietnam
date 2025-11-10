<?php

namespace App\Http\Controllers\Telesale;

use App\Http\Controllers\Controller;
use App\Models\Telesale\{DonHangTelesale, DonHangTelesaleChiTiet};
use App\Services\Telesale\TelesaleService;
use Illuminate\Http\Request;

class DonHangTelesaleController extends Controller
{
    protected $telesaleService;

    public function __construct(TelesaleService $telesaleService)
    {
        $this->telesaleService = $telesaleService;
    }

    public function index(Request $request)
    {
        $query = DonHangTelesale::with(['dataKhachHang', 'nhanVienTelesale', 'chiTiets']);

        if ($request->trang_thai) {
            $query->where('trang_thai', $request->trang_thai);
        }

        $donHangs = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['message' => 'success', 'data' => $donHangs]);
    }

    public function store(Request $request)
    {
        $donHang = DonHangTelesale::create($request->except('chi_tiets'));

        if ($request->chi_tiets) {
            foreach ($request->chi_tiets as $ct) {
                DonHangTelesaleChiTiet::create(array_merge($ct, ['don_hang_telesale_id' => $donHang->id]));
            }
        }

        $this->telesaleService->tinhTongDonHang($donHang->id);

        // Đánh dấu cuộc gọi đã tạo đơn
        if ($request->cuoc_goi_id) {
            \App\Models\Telesale\CuocGoiTelesale::find($request->cuoc_goi_id)
                ->update(['da_tao_don_hang' => true]);
        }

        return response()->json(['message' => 'success', 'data' => $donHang]);
    }

    public function updateStatus(Request $request, $id)
    {
        $donHang = DonHangTelesale::findOrFail($id);
        $donHang->update(['trang_thai' => $request->trang_thai]);

        return response()->json(['message' => 'success', 'data' => $donHang]);
    }

    public function baoCao(Request $request)
    {
        $thang = $request->thang ?? now()->month;
        $nam = $request->nam ?? now()->year;

        $tongDonHang = DonHangTelesale::theoThang($thang, $nam)->count();
        $doanhThu = DonHangTelesale::theoThang($thang, $nam)->thanhCong()->sum('tong_thanh_toan');

        return response()->json([
            'message' => 'success',
            'data' => [
                'tong_don_hang' => $tongDonHang,
                'doanh_thu' => $doanhThu,
            ]
        ]);
    }
}
