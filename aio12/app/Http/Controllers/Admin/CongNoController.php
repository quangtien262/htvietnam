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

class CongNoController extends Controller
{

    public function index(Request $request)
    {
        $viewData = TblService::getDataIndexDefault('cong_no', $request, true, true);
        $mocThoiGian = 'today';
        if (!empty($request['mocThoiGian'])) {
            $mocThoiGian = $request['mocThoiGian'];
        }

        $khoangThoiGian = [null,null];
        if(!empty($request->khoangThoiGian)) {
            $khoangThoiGian = $request->khoangThoiGian;
            $mocThoiGian = '';
        }

        $soLuongCongNo = TblService::getQuery('cong_no', $request)->count();

        $noPhaiTra = TblService::getQuery('cong_no', $request)->where('so_tien_no', '<', 0)->sum('so_tien_no');

        $noCanThu = TblService::getQuery('cong_no', $request)->where('so_tien_no', '>', 0)->sum('so_tien_no');

        $tongCongNo = $noPhaiTra + $noCanThu;

        $viewData['tongCongNo'] = $tongCongNo;
        $viewData['noCanThu'] = $noCanThu;
        $viewData['noPhaiTra'] = $noPhaiTra;
        $viewData['soLuongCongNo'] = $soLuongCongNo;
        $viewData['khoangThoiGian'] = $khoangThoiGian;
        return Inertia::render('Admin/CongNo/index', $viewData);
    }

    public function saveCongNo(Request $rq)
    {

        // save sổ quỹ
        if (empty($rq->id)) {
            $data = new SoQuy();
        } else {
            $data = SoQuy::find($rq->id);
        }

        $now = date('Y-m-d');
        if (empty($rq->name)) {
            $data->name = $now;
        } else {
            $data->name = $rq->name;
        }
        if (!empty($rq->code)) {
            $data->code = $rq->code;
        }

        $data->note = $rq->note;
        $data->loai_chung_tu = $rq->loai_phieu;
        $data->chi_nhanh_id = !empty($rq->chi_nhanh_id) ? $rq->chi_nhanh_id : 0;

        $data->loai_thu_id = !empty($rq->loai_thu_id) ? $rq->loai_thu_id : 0;
        $data->loai_chi_id = !empty($rq->loai_chi_id) ? $rq->loai_chi_id : 0;

        $data->thoi_gian = !empty($rq->thoi_gian) ? $rq->thoi_gian : $now;
        $data->so_tien = $rq->so_tien;
        $nhanVienId = Auth::guard('admin_users')->user()->id;
        $data->nhan_vien_id = $nhanVienId;

        $data->create_by = $nhanVienId;

        $data->save();

        $data->code = 'KTH' . TblService::formatNumberByLength($data->id, 5);
        $data->save();

        // save phieu thu
        if ($rq->loai_phieu == 'phieu_thu') {
            $phieuThu = new PhieuThu();
            $phieuThu->note = $rq->note;
            $phieuThu->loai_chung_tu = $rq->loai_phieu;
            $phieuThu->chi_nhanh_id = !empty($rq->chi_nhanh_id) ? $rq->chi_nhanh_id : 0;
            $phieuThu->thoi_gian = !empty($rq->thoi_gian) ? $rq->thoi_gian : $now;
            $phieuThu->so_tien = $rq->so_tien;
            $phieuThu->nhan_vien_id = $nhanVienId;
            $phieuThu->create_by = $nhanVienId;
            $phieuThu->loai_thu_id = !empty($rq->loai_thu_id) ? $rq->loai_thu_id : 0;
            $phieuThu->save();
        }

        // save phieu chi
        if ($rq->loai_phieu == 'phieu_chi') {
            $phieuChi = new PhieuChi();
            $phieuChi->note = $rq->note;
            $phieuChi->loai_chung_tu = $rq->loai_phieu;
            $phieuChi->chi_nhanh_id = !empty($rq->chi_nhanh_id) ? $rq->chi_nhanh_id : 0;
            $phieuChi->thoi_gian = !empty($rq->thoi_gian) ? $rq->thoi_gian : $now;
            $phieuChi->so_tien = -$rq->so_tien;
            $phieuChi->nhan_vien_id = $nhanVienId;
            $phieuChi->create_by = $nhanVienId;
            $phieuChi->loai_chi_id = !empty($rq->loai_chi_id) ? $rq->loai_chi_id : 0;
            $phieuChi->save();
        }

        return $this->sendSuccessResponse($data, 'success');
    }

    public function info(Request $request) {
        $congNo = CongNo::find($request->id);
        $data = [
            'congNo' => $congNo,
        ];

        if(!empty($congNo->nha_cung_cap_id)) {
           $data['nhaCungCap'] = NhaCungCap::getNhaCungCapInfo($congNo->nha_cung_cap_id);
        }

        if(!empty($congNo->users_id)) {
            $data['khachHang']= UserService::khachHangInfo($congNo->users_id);
        }

        $loaiChungTu = $congNo->loai_chung_tu;

        switch ($loaiChungTu) {
            // hđơn bán lẻ
            case 'hoa_don':
                $data['hoaDon']= HoaDon::info($congNo->chung_tu_id);
                break;
            // nhập hàng
            case 'product_nhap_hang':
                $data['nhapHang']= NhapHang::find($congNo->chung_tu_id);
                break;
            // trả hàng ncc
            case 'product_tra_hang_ncc':
                $data['traHangNCC']= TraHangNCC::find($congNo->chung_tu_id);
                break;
            // khách trả hàng
            case 'product_khach_tra_hang':
                $data['khachTraHang']= KhachTraHang::find($congNo->chung_tu_id);
                // dd($data['khachTraHang']);
                break;
            default:
                # code...
                break;
        }
        return $this->sendSuccessResponse($data);
    }

}
