<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\PhieuThu;
use App\Models\Sales\PhieuThuChiTiet;
use App\Models\Sales\DonHang;
use App\Services\Sales\DonHangService;
use Illuminate\Http\Request;

class PhieuThuController extends Controller
{
    protected $donHangService;

    public function __construct(DonHangService $donHangService)
    {
        $this->donHangService = $donHangService;
    }

    public function index(Request $request)
    {
        $phieuThus = PhieuThu::with(['user', 'nguoiThu', 'chiTiets.donHang'])
            ->orderBy('created_at', 'desc')->get();

        return response()->json(['message' => 'success', 'data' => $phieuThus]);
    }

    public function store(Request $request)
    {
        $phieuThu = PhieuThu::create($request->except('chi_tiets'));

        if ($request->chi_tiets) {
            foreach ($request->chi_tiets as $ct) {
                PhieuThuChiTiet::create(array_merge($ct, ['phieu_thu_id' => $phieuThu->id]));

                // Cập nhật đã thanh toán cho đơn hàng
                $donHang = DonHang::find($ct['don_hang_id']);
                if ($donHang) {
                    $donHang->da_thanh_toan += $ct['so_tien'];
                    $donHang->con_no = $donHang->tong_cong - $donHang->da_thanh_toan;
                    $donHang->save();
                }
            }
        }

        // Cập nhật công nợ khách hàng
        $this->donHangService->capNhatCongNoKhachHang($phieuThu->user_id);

        return response()->json(['message' => 'success', 'data' => $phieuThu]);
    }

    public function approve($id)
    {
        $phieuThu = PhieuThu::findOrFail($id);
        $phieuThu->update(['trang_thai' => 'confirmed']);

        return response()->json(['message' => 'success']);
    }
}
