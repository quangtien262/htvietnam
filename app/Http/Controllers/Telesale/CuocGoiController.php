<?php

namespace App\Http\Controllers\Telesale;

use App\Http\Controllers\Controller;
use App\Models\Telesale\{CuocGoiTelesale, LichHenGoiLai};
use Illuminate\Http\Request;

class CuocGoiController extends Controller
{
    public function index(Request $request)
    {
        $cuocGois = CuocGoiTelesale::with(['dataKhachHang', 'nhanVienTelesale'])
            ->orderBy('thoi_gian_bat_dau', 'desc')
            ->limit(100)->get();

        return response()->json(['message' => 'success', 'data' => $cuocGois]);
    }

    public function store(Request $request)
    {
        $cuocGoi = CuocGoiTelesale::create($request->all());

        // Nếu hẹn gọi lại, tạo lịch hẹn
        if ($request->ket_qua === 'hen_goi_lai' && $request->ngay_hen_goi_lai) {
            LichHenGoiLai::create([
                'data_khach_hang_id' => $request->data_khach_hang_id,
                'cuoc_goi_id' => $cuocGoi->id,
                'nhan_vien_telesale_id' => $request->nhan_vien_telesale_id,
                'thoi_gian_hen' => $request->ngay_hen_goi_lai,
                'noi_dung_can_hoi' => $request->ghi_chu,
            ]);
        }

        return response()->json(['message' => 'success', 'data' => $cuocGoi]);
    }

    public function baoCao(Request $request)
    {
        $tongCuocGoi = CuocGoiTelesale::homNay()->count();
        $cuocGoiThanhCong = CuocGoiTelesale::homNay()->thanhCong()->count();
        $cuocGoiKhongNgheMay = CuocGoiTelesale::homNay()->where('ket_qua', 'khong_nghe_may')->count();

        return response()->json([
            'message' => 'success',
            'data' => [
                'tong_cuoc_goi' => $tongCuocGoi,
                'thanh_cong' => $cuocGoiThanhCong,
                'khong_nghe_may' => $cuocGoiKhongNgheMay,
            ]
        ]);
    }
}
