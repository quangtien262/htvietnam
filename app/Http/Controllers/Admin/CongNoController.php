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
    /**
     * API: Lấy danh sách công nợ
     */
    public function apiList(Request $request)
    {
        try {
            $searchData = $request->input('searchData', []);
            $page = $searchData['page'] ?? 1;
            $pageSize = $searchData['pageSize'] ?? 20;
            $search = $searchData['search'] ?? '';

            $query = DB::table('cong_no')
                ->where('is_recycle_bin', 0)
                ->orderBy('id', 'desc');

            // Search by keyword
            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('ma_chung_tu', 'like', "%{$search}%");
                });
            }

            // Filter by nha_cung_cap_id
            if (isset($searchData['nha_cung_cap_id']) && $searchData['nha_cung_cap_id'] !== null && $searchData['nha_cung_cap_id'] !== '') {
                $query->where('nha_cung_cap_id', $searchData['nha_cung_cap_id']);
            }

            // Filter by users_id (khách hàng)
            if (isset($searchData['users_id']) && $searchData['users_id'] !== null && $searchData['users_id'] !== '') {
                $query->where('users_id', $searchData['users_id']);
            }

            // Filter by loai_chung_tu
            if (isset($searchData['loai_chung_tu']) && $searchData['loai_chung_tu'] !== null && $searchData['loai_chung_tu'] !== '') {
                $query->where('loai_chung_tu', $searchData['loai_chung_tu']);
            }

            // Filter by cong_no_status_id
            if (isset($searchData['cong_no_status_id']) && $searchData['cong_no_status_id'] !== null && $searchData['cong_no_status_id'] !== '') {
                $query->where('cong_no_status_id', $searchData['cong_no_status_id']);
            }

            $total = $query->count();
            $list = $query->skip(($page - 1) * $pageSize)
                ->take($pageSize)
                ->get();

            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => [
                    'list' => $list,
                    'total' => $total
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
     * API: Lấy chi tiết công nợ
     */
    public function apiDetail(Request $request)
    {
        try {
            $id = $request->input('id');

            if (!$id) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'ID không hợp lệ'
                ]);
            }

            $congNo = DB::table('cong_no')->where('id', $id)->first();

            if (!$congNo) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Không tìm thấy công nợ'
                ]);
            }

            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => ['cong_no' => $congNo]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Thêm mới công nợ
     */
    public function apiAdd(Request $request)
    {
        try {
            DB::beginTransaction();

            $user = Auth::guard('admin_users')->user();
            $createBy = $user ? $user->id : 0;

            $congNoId = DB::table('cong_no')->insertGetId([
                'name' => $request->name ?? '',
                'code' => '', // Sẽ được tạo tự động
                'users_id' => $request->users_id ?? 0,
                'nha_cung_cap_id' => $request->nha_cung_cap_id ?? 0,
                'loai_chung_tu' => $request->loai_chung_tu ?? '',
                'chung_tu_id' => $request->chung_tu_id ?? 0,
                'ma_chung_tu' => $request->ma_chung_tu ?? '',
                'product_id' => $request->product_id ?? 0,
                'product_code' => $request->product_code ?? '',
                'tong_tien_hoa_don' => $request->tong_tien_hoa_don ?? 0,
                'so_tien_da_thanh_toan' => $request->so_tien_da_thanh_toan ?? 0,
                'so_tien_no' => $request->so_tien_no ?? 0,
                'cong_no_status_id' => $request->cong_no_status_id ?? 0,
                'ngay_hen_tat_toan' => $request->ngay_hen_tat_toan ?? null,
                'ngay_tat_toan' => $request->ngay_tat_toan ?? null,
                'info' => $request->info ?? null,
                'create_by' => $createBy,
                'is_recycle_bin' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Auto generate code với prefix CN
            $code = 'CN' . str_pad($congNoId, 5, '0', STR_PAD_LEFT);
            DB::table('cong_no')->where('id', $congNoId)->update(['code' => $code]);

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Thêm công nợ thành công',
                'data' => ['id' => $congNoId]
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
     * API: Cập nhật công nợ
     */
    public function apiUpdate(Request $request)
    {
        try {
            DB::beginTransaction();

            $id = $request->input('id');

            if (!$id) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'ID không hợp lệ'
                ]);
            }

            DB::table('cong_no')->where('id', $id)->update([
                'name' => $request->name ?? '',
                'users_id' => $request->users_id ?? 0,
                'nha_cung_cap_id' => $request->nha_cung_cap_id ?? 0,
                'loai_chung_tu' => $request->loai_chung_tu ?? '',
                'chung_tu_id' => $request->chung_tu_id ?? 0,
                'ma_chung_tu' => $request->ma_chung_tu ?? '',
                'product_id' => $request->product_id ?? 0,
                'product_code' => $request->product_code ?? '',
                'tong_tien_hoa_don' => $request->tong_tien_hoa_don ?? 0,
                'so_tien_da_thanh_toan' => $request->so_tien_da_thanh_toan ?? 0,
                'so_tien_no' => $request->so_tien_no ?? 0,
                'cong_no_status_id' => $request->cong_no_status_id ?? 0,
                'ngay_hen_tat_toan' => $request->ngay_hen_tat_toan ?? null,
                'ngay_tat_toan' => $request->ngay_tat_toan ?? null,
                'info' => $request->info ?? null,
                'updated_at' => now()
            ]);

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Cập nhật công nợ thành công'
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
     * API: Xóa công nợ
     */
    public function apiDelete(Request $request)
    {
        try {
            $ids = $request->ids ?? [];

            if (empty($ids)) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Vui lòng chọn công nợ cần xóa'
                ], 400);
            }

            DB::beginTransaction();

            // Soft delete
            DB::table('cong_no')
                ->whereIn('id', $ids)
                ->update([
                    'is_recycle_bin' => 1,
                    'updated_at' => now()
                ]);

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Xóa công nợ thành công'
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
     * API: Lấy danh sách nhà cung cấp
     */
    public function apiNhaCungCapList(Request $request)
    {
        try {
            $list = DB::table('nha_cung_cap')
                ->where('is_recycle_bin', 0)
                ->select('id', 'name', 'code')
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => ['datas' => $list]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Lấy danh sách khách hàng
     */
    public function apiUsersList(Request $request)
    {
        try {
            $list = DB::table('users')
                ->where('is_recycle_bin', 0)
                ->select('id', 'name', 'phone')
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => ['datas' => $list]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Lấy danh sách trạng thái công nợ
     */
    public function apiStatusList(Request $request)
    {
        try {
            $list = DB::table('cong_no_status')
                ->where('is_recycle_bin', 0)
                ->select('id', 'name')
                ->orderBy('sort_order', 'asc')
                ->get();

            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => ['datas' => $list]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Thanh toán công nợ (toàn bộ hoặc một phần)
     */
    public function apiPayment(Request $request)
    {
        try {
            DB::beginTransaction();

            $id = $request->input('id');
            $soTienThanhToan = $request->input('so_tien_thanh_toan', 0);
            $ghiChu = $request->input('ghi_chu', '');

            if (!$id || $soTienThanhToan <= 0) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Thông tin thanh toán không hợp lệ'
                ]);
            }

            $congNo = DB::table('cong_no')->where('id', $id)->first();

            if (!$congNo) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Không tìm thấy công nợ'
                ]);
            }

            // Cập nhật số tiền đã thanh toán
            $soTienDaThanhToanMoi = $congNo->so_tien_da_thanh_toan + $soTienThanhToan;
            $soTienNoMoi = $congNo->tong_tien_hoa_don - $soTienDaThanhToanMoi;

            $updateData = [
                'so_tien_da_thanh_toan' => $soTienDaThanhToanMoi,
                'so_tien_no' => $soTienNoMoi,
                'updated_at' => now()
            ];

            // Nếu đã thanh toán hết, cập nhật ngày tất toán
            if ($soTienNoMoi <= 0) {
                $updateData['ngay_tat_toan'] = now();
                // Tìm trạng thái "Đã thanh toán" (có thể là id = 2 hoặc tên cụ thể)
                $statusDaThanhToan = DB::table('cong_no_status')
                    ->where('name', 'like', '%thanh toán%')
                    ->orWhere('name', 'like', '%hoàn thành%')
                    ->first();
                if ($statusDaThanhToan) {
                    $updateData['cong_no_status_id'] = $statusDaThanhToan->id;
                }
            }

            DB::table('cong_no')->where('id', $id)->update($updateData);

            // Ghi log lịch sử thanh toán
            DB::table('cong_no_payment_history')->insert([
                'cong_no_id' => $id,
                'so_tien' => $soTienThanhToan,
                'ghi_chu' => $ghiChu,
                'nguoi_thanh_toan' => Auth::guard('admin_users')->user()->id ?? 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Thanh toán thành công'
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
     * API: Lấy lịch sử thanh toán
     */
    public function apiPaymentHistory(Request $request)
    {
        try {
            $congNoId = $request->input('cong_no_id');

            if (!$congNoId) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'ID công nợ không hợp lệ'
                ]);
            }

            $history = DB::table('cong_no_payment_history as h')
                ->leftJoin('admin_users as u', 'h.nguoi_thanh_toan', '=', 'u.id')
                ->where('h.cong_no_id', $congNoId)
                ->select(
                    'h.*',
                    'u.name as ten_nguoi_thanh_toan'
                )
                ->orderBy('h.created_at', 'desc')
                ->get();

            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => ['list' => $history]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Thống kê công nợ
     */
    public function apiStatistics(Request $request)
    {
        try {
            $searchData = $request->input('searchData', []);

            $query = DB::table('cong_no')->where('is_recycle_bin', 0);

            // Apply filters
            if (isset($searchData['nha_cung_cap_id']) && $searchData['nha_cung_cap_id']) {
                $query->where('nha_cung_cap_id', $searchData['nha_cung_cap_id']);
            }
            if (isset($searchData['users_id']) && $searchData['users_id']) {
                $query->where('users_id', $searchData['users_id']);
            }
            if (isset($searchData['from_date']) && $searchData['from_date']) {
                $query->where('created_at', '>=', $searchData['from_date']);
            }
            if (isset($searchData['to_date']) && $searchData['to_date']) {
                $query->where('created_at', '<=', $searchData['to_date']);
            }

            $statistics = [
                'tong_so_cong_no' => $query->count(),
                'tong_tien_cong_no' => $query->sum('so_tien_no'),
                'no_phai_tra' => $query->where('so_tien_no', '<', 0)->sum('so_tien_no'),
                'no_can_thu' => $query->where('so_tien_no', '>', 0)->sum('so_tien_no'),
                'da_thanh_toan' => DB::table('cong_no')
                    ->where('is_recycle_bin', 0)
                    ->where('so_tien_no', '<=', 0)
                    ->count(),
                'chua_thanh_toan' => DB::table('cong_no')
                    ->where('is_recycle_bin', 0)
                    ->where('so_tien_no', '>', 0)
                    ->count(),
                'tong_da_thanh_toan' => $query->sum('so_tien_da_thanh_toan'),
                'tong_hoa_don' => $query->sum('tong_tien_hoa_don')
            ];

            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => $statistics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Cập nhật hàng loạt trạng thái
     */
    public function apiBulkUpdateStatus(Request $request)
    {
        try {
            $ids = $request->input('ids', []);
            $statusId = $request->input('status_id');

            if (empty($ids) || !$statusId) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Thông tin không hợp lệ'
                ]);
            }

            DB::table('cong_no')
                ->whereIn('id', $ids)
                ->update([
                    'cong_no_status_id' => $statusId,
                    'updated_at' => now()
                ]);

            return response()->json([
                'status_code' => 200,
                'message' => 'Cập nhật trạng thái thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Export Excel
     */
    public function apiExport(Request $request)
    {
        try {
            $searchData = $request->input('searchData', []);

            $query = DB::table('cong_no as cn')
                ->leftJoin('nha_cung_cap as ncc', 'cn.nha_cung_cap_id', '=', 'ncc.id')
                ->leftJoin('users as u', 'cn.users_id', '=', 'u.id')
                ->leftJoin('cong_no_status as s', 'cn.cong_no_status_id', '=', 's.id')
                ->where('cn.is_recycle_bin', 0)
                ->select(
                    'cn.*',
                    'ncc.name as ten_nha_cung_cap',
                    'u.name as ten_khach_hang',
                    's.name as ten_trang_thai'
                )
                ->orderBy('cn.id', 'desc');

            // Apply filters
            if (!empty($searchData['search'])) {
                $search = $searchData['search'];
                $query->where(function($q) use ($search) {
                    $q->where('cn.name', 'like', "%{$search}%")
                      ->orWhere('cn.code', 'like', "%{$search}%")
                      ->orWhere('cn.ma_chung_tu', 'like', "%{$search}%");
                });
            }

            if (isset($searchData['nha_cung_cap_id']) && $searchData['nha_cung_cap_id']) {
                $query->where('cn.nha_cung_cap_id', $searchData['nha_cung_cap_id']);
            }

            if (isset($searchData['users_id']) && $searchData['users_id']) {
                $query->where('cn.users_id', $searchData['users_id']);
            }

            $data = $query->get();

            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => ['list' => $data]
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
