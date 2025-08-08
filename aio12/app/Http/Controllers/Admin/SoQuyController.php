<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\PhieuChi;
use App\Models\Admin\PhieuThu;
use App\Models\Admin\SoQuy;
use Illuminate\Support\Facades\DB;

use App\Services\Admin\TblService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class SoQuyController extends Controller
{

    public function index(Request $request)
    {
        $viewData = TblService::getDataIndexDefault('so_quy', $request, true, true);
        $mocThoiGian = 'today';
        if (!empty($request['mocThoiGian'])) {
            $mocThoiGian = $request['mocThoiGian'];
        }

        $khoangThoiGian = [null,null];
        if(!empty($request->khoangThoiGian)) {
            $khoangThoiGian = $request->khoangThoiGian;
            $mocThoiGian = '';
        }

        $soDuDauKy = 0;
        if($mocThoiGian != 'all') {
            $soDuDauKy = DB::table('so_quy');
            $soDuDauKy = $this->searchByDate_dauKy($soDuDauKy, $mocThoiGian, 'created_at', $khoangThoiGian);
            $soDuDauKy = $soDuDauKy->sum('so_tien');
        }
        

        // Tổng thu trong tháng (chỉ lấy so_tien > 0)
        $tongThu = DB::table('so_quy');
        $tongThu = $this->searchByDate($tongThu, $mocThoiGian, 'created_at', $khoangThoiGian);
        $tongThu = $tongThu->where('so_tien', '>', 0)->sum('so_tien');

        // Tổng chi trong tháng (chỉ lấy so_tien < 0)
        $tongChi = DB::table('so_quy');
        $tongChi = $this->searchByDate($tongChi, $mocThoiGian, 'created_at', $khoangThoiGian);
        $tongChi = $tongChi->where('so_tien', '<', 0)->sum('so_tien');

        // Tồn quỹ = Số dư đầu kỳ + Tổng thu + Tổng chi
        $tonQuy = $soDuDauKy + $tongThu + $tongChi;

        

        $viewData['soDuDauKy'] = $soDuDauKy;
        $viewData['tongThu'] = $tongThu;
        $viewData['tongChi'] = $tongChi;
        $viewData['tonQuy'] = $tonQuy;
        $viewData['khoangThoiGian'] = $khoangThoiGian;
        return Inertia::render('Admin/SoQuy/index', $viewData);
    }

    public function saveSoQuy(Request $rq)
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

    protected function searchByDate($data, $mocThoiGian, $column, $khoangThoiGian = [null,null])
    {
        if(!empty($khoangThoiGian[0])) {
            $data = $data->whereBetween($column, [$khoangThoiGian[0] . ' 00:00:00', $khoangThoiGian[1] . ' 23:59:59']);
            return $data;
        }

        switch ($mocThoiGian) {
            case 'today':
                $start = Carbon::today()->startOfDay()->format('Y-m-d H:i:s');
                $end = Carbon::today()->endOfDay()->format('Y-m-d H:i:s');
                $data = $data->whereBetween($column, [$start, $end]);
                break;
            case 'yesterday':
                $data = $data->whereDate($column, Carbon::yesterday());
                break;
            case '7day':
                $data = $data->where($column, '>=', Carbon::now()->subDays(7));
                break;
            case '30day':
                $data = $data->where($column, '>=', Carbon::now()->subDays(30));
                break;

            case 'month':
                $data = $data->whereMonth($column, Carbon::now()->month)->whereYear($column, Carbon::now()->year);
                break;
            case 'year':
                $data = $data->whereYear($column, Carbon::now()->year);
                break;
            case 'lastMonth':
                $lastMonth = Carbon::now()->subMonth();
                $data = $data->whereMonth($column, $lastMonth->month)->whereYear($column, $lastMonth->year);
                break;
            case 'lastYear':
                $lastYear = Carbon::now()->subYear()->year;
                $data = $data->whereYear($column, $lastYear);
                break;
            case 'thisWeek':
                $startOfWeek = Carbon::now()->startOfWeek(); // Mặc định: Thứ 2
                $endOfWeek = Carbon::now()->endOfWeek();   // Chủ nhật
                $data = $data->whereBetween($column, [$startOfWeek, $endOfWeek]);
                break;
            case 'lastWeek':
                $startOfLastWeek = Carbon::now()->subWeek()->startOfWeek(); // Thứ 2 tuần trước
                $endOfLastWeek = Carbon::now()->subWeek()->endOfWeek();     // Chủ nhật tuần trước
                $data = $data->whereBetween($column, [$startOfLastWeek, $endOfLastWeek]);
                break;
            case 'thisQuarter':
                $currentMonth = Carbon::now()->month; //lấy tháng hiện tại.
                $currentQuarter = ceil($currentMonth / 3); // chia tháng cho 3 và làm tròn lên → ra quý hiện tại.
                $currentYear = Carbon::now()->year;
                $data = $data->whereRaw('QUARTER(' . $column . ') = ?', [$currentQuarter])
                    ->whereYear($column, $currentYear);
                break;
            case 'lastQuarter':
                $currentQuarter = ceil(Carbon::now()->month / 3);
                $currentYear = Carbon::now()->year;

                // Tính quý trước
                if ($currentQuarter == 1) {
                    $previousQuarter = 4;
                    $previousYear = $currentYear - 1;
                } else {
                    $previousQuarter = $currentQuarter - 1;
                    $previousYear = $currentYear;
                }
                $data = $data->whereRaw('QUARTER(' . $column . ') = ?', [$previousQuarter])
                    ->whereYear($column, $previousYear);
                break;

            default:
                // mặc định là all
                break;
        }
        return $data;
    }

    protected function searchByDate_dauKy($data, $mocThoiGian, $column, $khoangThoiGian = [null,null])
    {
        if(!empty($khoangThoiGian[0])) {
            $data = $data->where($column, '<',$khoangThoiGian[0] . ' 00:00:00');
            return $data;
        }

        switch ($mocThoiGian) {
            case 'today':
                $start = Carbon::today()->startOfDay()->format('Y-m-d H:i:s');
                $data = $data->where($column, '<', $start);
                break;
            case 'yesterday':
                $data = $data->where($column, '<', Carbon::yesterday()->startOfDay()->format('Y-m-d H:i:s'));
                break;
            case '7day':
                $data = $data->where($column, '<', Carbon::now()->subDays(7));
                break;
            case '30day':
                $data = $data->where($column, '<', Carbon::now()->subDays(30));
                break;

            case 'month':
                $data = $data->whereYear($column, '<=',Carbon::now()->year)->whereMonth($column, '<',Carbon::now()->month);
                break;
            case 'year':
                $data = $data->whereYear($column, '<',Carbon::now()->year);
                break;
            case 'lastMonth':
                $lastMonth = Carbon::now()->subMonth();
                $data = $data->whereYear($column, '<=',$lastMonth->year)->whereMonth($column, '<',$lastMonth->month);
                break;
            case 'lastYear':
                $lastYear = Carbon::now()->subYear()->year;
                $data = $data->whereYear($column, '<',$lastYear);
                break;
            case 'thisWeek':
                $startOfWeek = Carbon::now()->startOfWeek(); // Mặc định: Thứ 2
                $data = $data->where($column, '<', $startOfWeek);
                break;
            case 'lastWeek':
                $startOfLastWeek = Carbon::now()->subWeek()->startOfWeek(); 
                $data = $data->where($column, '<', $startOfLastWeek);
                break;
            case 'thisQuarter':
                $currentMonth = Carbon::now()->month; //lấy tháng hiện tại.
                $currentQuarter = ceil($currentMonth / 3); // chia tháng cho 3 và làm tròn lên → ra quý hiện tại.
                $currentYear = Carbon::now()->year;
                // dd($currentQuarter);
                $data = $data->whereRaw('QUARTER(' . $column . ') < ?', [$currentQuarter])
                    ->whereYear($column, '<=',$currentYear);
                break;
            case 'lastQuarter':
                $currentQuarter = ceil(Carbon::now()->month / 3);
                $currentYear = Carbon::now()->year;

                // Tính quý trước
                if ($currentQuarter == 1) {
                    $previousQuarter = 4;
                    $previousYear = $currentYear - 1;
                } else {
                    $previousQuarter = $currentQuarter - 1;
                    $previousYear = $currentYear;
                }
                $data = $data->whereRaw('QUARTER(' . $column . ') < ?', [$previousQuarter])
                    ->whereYear($column, '<=', $previousYear);
                break;

            default:
                // mặc định là all
                break;
        }
        return $data;
    }
}
