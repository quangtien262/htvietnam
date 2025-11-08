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
use App\Models\Admin\SoQuyType;
use App\Models\Admin\SoQuyStatus;
use App\Models\Admin\LoaiThu;
use App\Models\Admin\LoaiChi;
use App\Models\Admin\ChiNhanh;

class SoQuyController extends Controller
{
    /**
     * API: Lấy danh sách sổ quỹ cho React
     */
    public function apiList(Request $request)
    {
        try {
            $searchData = $request->input('searchData', []);
            $page = $searchData['page'] ?? 1;
            $perPage = $searchData['per_page'] ?? 30;

            $query = SoQuy::with([
                'soQuyType',
                'soQuyStatus',
                'loaiThu',
                'loaiChi',
                'apartment',
                'room',
                'khachHang',
                'nguoiNhan'
            ]);

            // Filters
            if (!empty($searchData['keyword'])) {
                $keyword = $searchData['keyword'];
                $query->where(function ($q) use ($keyword) {
                    $q->where('code', 'like', "%{$keyword}%")
                      ->orWhere('note', 'like', "%{$keyword}%")
                      ->orWhere('nguoi_nhan_name', 'like', "%{$keyword}%");
                });
            }

            if (!empty($searchData['so_quy_type_id'])) {
                $query->where('so_quy_type_id', $searchData['so_quy_type_id']);
            }

            if (!empty($searchData['loai_thu_id'])) {
                $query->where('loai_thu_id', $searchData['loai_thu_id']);
            }

            if (!empty($searchData['loai_chi_id'])) {
                $query->where('loai_chi_id', $searchData['loai_chi_id']);
            }

            if (!empty($searchData['apartment_id'])) {
                $query->where('apartment_id', $searchData['apartment_id']);
            }

            if (!empty($searchData['room_id'])) {
                $query->where('room_id', $searchData['room_id']);
            }

            if (!empty($searchData['so_quy_status_id'])) {
                $query->where('so_quy_status_id', $searchData['so_quy_status_id']);
            }

            if (!empty($searchData['from_date'])) {
                $query->where('thoi_gian', '>=', $searchData['from_date']);
            }

            if (!empty($searchData['to_date'])) {
                $query->where('thoi_gian', '<=', $searchData['to_date']);
            }

            // Order by
            $query->orderBy('thoi_gian', 'desc')->orderBy('id', 'desc');

            // Pagination
            $total = $query->count();
            $datas = $query->skip(($page - 1) * $perPage)
                          ->take($perPage)
                          ->get();

            // Format data
            $formattedData = $datas->map(function ($item) {
                return [
                    'id' => $item->id,
                    'code' => $item->code,
                    'name' => $item->name,
                    'so_tien' => $item->so_tien,
                    'so_quy_type_id' => $item->so_quy_type_id,
                    'so_quy_type_name' => $item->soQuyType->name ?? '',
                    'loai_thu_id' => $item->loai_thu_id,
                    'loai_thu_name' => $item->loaiThu->name ?? '',
                    'loai_chi_id' => $item->loai_chi_id,
                    'loai_chi_name' => $item->loaiChi->name ?? '',
                    'apartment_id' => $item->apartment_id,
                    'apartment_name' => $item->apartment->name ?? '',
                    'room_id' => $item->room_id,
                    'room_name' => $item->room->name ?? '',
                    'khach_hang_id' => $item->khach_hang_id,
                    'khach_hang_name' => $item->khachHang->name ?? '',
                    'nguoi_nhan_id' => $item->nguoi_nhan_id,
                    'nguoi_nhan_name' => $item->nguoiNhan->name ?? $item->nguoi_nhan_name,
                    'nguoi_nhan_phone' => $item->nguoi_nhan_phone,
                    'thoi_gian' => $item->thoi_gian,
                    'note' => $item->note,
                    'so_quy_status_id' => $item->so_quy_status_id,
                    'so_quy_status_name' => $item->soQuyStatus->name ?? '',
                    'ma_chung_tu' => $item->ma_chung_tu,
                    'loai_chung_tu' => $item->loai_chung_tu,
                    'created_at' => $item->created_at,
                ];
            });

            // Calculate statistics
            $statistics = $this->apiCalculateStatistics($searchData);

            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => [
                    'datas' => $formattedData,
                    'total' => $total,
                    'statistics' => $statistics,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Tính toán thống kê
     */
    private function apiCalculateStatistics($searchData = [])
    {
        $query = SoQuy::query();

        if (!empty($searchData['apartment_id'])) {
            $query->where('apartment_id', $searchData['apartment_id']);
        }

        if (!empty($searchData['room_id'])) {
            $query->where('room_id', $searchData['room_id']);
        }

        if (!empty($searchData['from_date'])) {
            $query->where('thoi_gian', '>=', $searchData['from_date']);
        }

        if (!empty($searchData['to_date'])) {
            $query->where('thoi_gian', '<=', $searchData['to_date']);
        }

        // Assuming so_quy_type_id: 1 = Thu, 2 = Chi
        $totalThu = (clone $query)->where('so_quy_type_id', 1)->sum('so_tien');
        $totalChi = (clone $query)->where('so_quy_type_id', 2)->sum('so_tien');

        return [
            'total_thu' => $totalThu,
            'total_chi' => $totalChi,
            'balance' => $totalThu - $totalChi,
        ];
    }

    /**
     * API: Thêm mới sổ quỹ
     */
    public function apiAdd(Request $request)
    {
        try {
            DB::beginTransaction();

            // Generate code
            $code = $this->apiGenerateCode();

            $soQuy = new SoQuy();
            $soQuy->code = $code;
            $soQuy->name = $request->name;
            $soQuy->so_tien = $request->so_tien;
            $soQuy->so_quy_type_id = $request->so_quy_type_id;
            $soQuy->loai_thu_id = $request->loai_thu_id;
            $soQuy->loai_chi_id = $request->loai_chi_id;
            $soQuy->apartment_id = $request->apartment_id;
            $soQuy->room_id = $request->room_id;
            $soQuy->khach_hang_id = $request->khach_hang_id;
            $soQuy->nguoi_nhan_id = $request->nguoi_nhan_id;
            $soQuy->nguoi_nhan_name = $request->nguoi_nhan_name;
            $soQuy->nguoi_nhan_phone = $request->nguoi_nhan_phone;
            $soQuy->nguoi_nhan_code = $request->nguoi_nhan_code;
            $soQuy->thoi_gian = $request->thoi_gian ?? now();
            $soQuy->note = $request->note;
            $soQuy->so_quy_status_id = $request->so_quy_status_id ?? 1;
            $soQuy->ma_chung_tu = $request->ma_chung_tu;
            $soQuy->loai_chung_tu = $request->loai_chung_tu;
            $soQuy->chung_tu_id = $request->chung_tu_id;
            $soQuy->images = $request->images;
            $soQuy->save();

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Thêm mới thành công',
                'data' => $soQuy
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Cập nhật sổ quỹ
     */
    public function apiUpdate(Request $request)
    {
        try {
            DB::beginTransaction();

            $soQuy = SoQuy::find($request->id);

            if (!$soQuy) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Không tìm thấy phiếu',
                ], 404);
            }

            $soQuy->name = $request->name;
            $soQuy->so_tien = $request->so_tien;
            $soQuy->so_quy_type_id = $request->so_quy_type_id;
            $soQuy->loai_thu_id = $request->loai_thu_id;
            $soQuy->loai_chi_id = $request->loai_chi_id;
            $soQuy->apartment_id = $request->apartment_id;
            $soQuy->room_id = $request->room_id;
            $soQuy->khach_hang_id = $request->khach_hang_id;
            $soQuy->nguoi_nhan_id = $request->nguoi_nhan_id;
            $soQuy->nguoi_nhan_name = $request->nguoi_nhan_name;
            $soQuy->nguoi_nhan_phone = $request->nguoi_nhan_phone;
            $soQuy->nguoi_nhan_code = $request->nguoi_nhan_code;
            $soQuy->thoi_gian = $request->thoi_gian ?? $soQuy->thoi_gian;
            $soQuy->note = $request->note;
            $soQuy->so_quy_status_id = $request->so_quy_status_id ?? $soQuy->so_quy_status_id;
            $soQuy->ma_chung_tu = $request->ma_chung_tu;
            $soQuy->loai_chung_tu = $request->loai_chung_tu;
            $soQuy->chung_tu_id = $request->chung_tu_id;

            if ($request->has('images')) {
                $soQuy->images = $request->images;
            }

            $soQuy->save();

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Cập nhật thành công',
                'data' => $soQuy
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Xóa sổ quỹ
     */
    public function apiDelete(Request $request)
    {
        try {
            $ids = $request->ids ?? [];

            if (empty($ids)) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Vui lòng chọn phiếu cần xóa',
                ], 400);
            }

            SoQuy::whereIn('id', $ids)->delete();

            return response()->json([
                'status_code' => 200,
                'message' => 'Xóa thành công',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Generate code tự động
     */
    private function apiGenerateCode()
    {
        $prefix = 'SQ';
        $date = date('ymd');

        $lastCode = SoQuy::where('code', 'like', $prefix . $date . '%')
                        ->orderBy('code', 'desc')
                        ->first();

        if ($lastCode) {
            $lastNumber = intval(substr($lastCode->code, -4));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . $date . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * API: Get So Quy Types
     */
    public function getSoQuyTypes(Request $request)
    {
        try {
            $datas = SoQuyType::orderBy('id', 'asc')->get();
            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => ['datas' => $datas]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Get So Quy Statuses
     */
    public function getSoQuyStatuses(Request $request)
    {
        try {
            $datas = SoQuyStatus::orderBy('id', 'asc')->get();
            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => ['datas' => $datas]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Get Loai Thu
     */
    public function getLoaiThu(Request $request)
    {
        try {
            $datas = LoaiThu::orderBy('id', 'asc')->get();
            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => ['datas' => $datas]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Get Loai Chi
     */
    public function getLoaiChi(Request $request)
    {
        try {
            $datas = LoaiChi::orderBy('id', 'asc')->get();
            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => ['datas' => $datas]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Get Chi Nhanh
     */
    public function getChiNhanh(Request $request)
    {
        try {
            $datas = ChiNhanh::orderBy('id', 'asc')->get();
            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => ['datas' => $datas]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Get Admin Users
     */
    public function getAdminUsers(Request $request)
    {
        try {
            $datas = \App\Models\AdminUser::select('id', 'name', 'email', 'phone')
                ->orderBy('name', 'asc')
                ->get();
            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => ['datas' => $datas]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $props = TblService::getDataIndexDefault('so_quy', $request, true, true);
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



        $props['soDuDauKy'] = $soDuDauKy;
        $props['tongThu'] = $tongThu;
        $props['tongChi'] = $tongChi;
        $props['tonQuy'] = $tonQuy;
        $props['khoangThoiGian'] = $khoangThoiGian;
        return Inertia::render('Admin/SoQuy/index', $props);
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
