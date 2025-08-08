<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin\NhapHangDetail;
use App\Models\Admin\Product;
use App\Models\Admin\TraHangNCC;
use App\Models\Admin\XuatHuy;
use App\Models\Admin\XuatHuyDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\ChiNhanh;
use App\Models\Admin\Column;
use App\Models\Admin\CongNo;
use App\Models\Admin\HoaDon;
use App\Models\Admin\KhachTraHang;
use App\Models\Admin\KhachTraHangDetail;
use App\Models\Admin\KiemKho;
use App\Models\Admin\KiemKhoDetail;
use App\Models\Admin\NhaCungCap;
use App\Models\Admin\NhapHang;
use App\Models\Admin\PhieuChi;
use App\Models\Admin\PhieuThu;
use App\Models\Admin\SoQuy;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use App\Models\Admin\TraHangNCCDetail;
use App\Models\AdminUser;
use App\Models\User;
use App\Services\Admin\UserService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class SalesController extends Controller
{
    public function dashboard(Request $request)
    {
        $soLuongSPTheoLoai = [];
        
        $viewData = [
            'soLuongSPTheoLoai' => $soLuongSPTheoLoai
        ];
        return Inertia::render('Admin/Dashboard/sales', $viewData);
    }

    public function index(Request $request)
    {
        $viewData = TblService::getDataIndexDefault('cong_no', $request, true, true);
        $mocThoiGian = 'today';
        if (!empty($request['mocThoiGian'])) {
            $mocThoiGian = $request['mocThoiGian'];
        }

        $khoangThoiGian = [null, null];
        if (!empty($request->khoangThoiGian)) {
            $khoangThoiGian = $request->khoangThoiGian;
            $mocThoiGian = '';
        }

        $query = TblService::getQuery('cong_no', $request);

        $soLuongCongNo = $query;
        $soLuongCongNo = $soLuongCongNo->count();

        $noPhaiTra = $query;
        $noPhaiTra = $noPhaiTra->where('so_tien_no', '<', 0)->sum('so_tien_no');

        $noCanThu = $query;
        $noCanThu = $noCanThu->where('so_tien_no', '>', 0)->sum('so_tien_no');

        $tongCongNo = $noPhaiTra + $noCanThu;

        $viewData['tongCongNo'] = $tongCongNo;
        $viewData['noCanThu'] = $noCanThu;
        $viewData['noPhaiTra'] = $noPhaiTra;
        $viewData['soLuongCongNo'] = $soLuongCongNo;
        $viewData['khoangThoiGian'] = $khoangThoiGian;
        return Inertia::render('Admin/CongNo/index', $viewData);
    }
}
