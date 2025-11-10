<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GiaoDichNganHang;
use App\Models\TaiKhoanNganHang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class GiaoDichNganHangController extends Controller
{
    public function index(Request $request)
    {
        return view('admin.bank.transaction_list');
    }

    public function apiList(Request $request)
    {
        $searchData = $request->input('searchData', []);
        $keyword = $searchData['keyword'] ?? '';
        $tai_khoan_ngan_hang_id = $searchData['tai_khoan_ngan_hang_id'] ?? '';
        $loai_giao_dich = $searchData['loai_giao_dich'] ?? '';
        $tu_ngay = $searchData['tu_ngay'] ?? '';
        $den_ngay = $searchData['den_ngay'] ?? '';
        $page = $searchData['page'] ?? 1;
        $perPage = $searchData['per_page'] ?? 20;

        $query = GiaoDichNganHang::with(['taiKhoanNganHang', 'loaiThu', 'loaiChi', 'nguoiTao'])
            ->orderBy('ngay_giao_dich', 'desc')
            ->orderBy('id', 'desc');

        if ($keyword) {
            $query->where(function ($q) use ($keyword) {
                $q->where('noi_dung', 'like', "%{$keyword}%")
                    ->orWhere('ma_giao_dich', 'like', "%{$keyword}%");
            });
        }

        if ($tai_khoan_ngan_hang_id) {
            $query->where('tai_khoan_ngan_hang_id', $tai_khoan_ngan_hang_id);
        }

        if ($loai_giao_dich) {
            $query->where('loai_giao_dich', $loai_giao_dich);
        }

        if ($tu_ngay) {
            $query->where('ngay_giao_dich', '>=', $tu_ngay);
        }

        if ($den_ngay) {
            $query->where('ngay_giao_dich', '<=', $den_ngay);
        }

        $total = $query->count();
        $datas = $query->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        // Tính tổng thu, chi
        $tong_thu = GiaoDichNganHang::where('loai_giao_dich', 'thu')
            ->when($tai_khoan_ngan_hang_id, fn($q) => $q->where('tai_khoan_ngan_hang_id', $tai_khoan_ngan_hang_id))
            ->when($tu_ngay, fn($q) => $q->where('ngay_giao_dich', '>=', $tu_ngay))
            ->when($den_ngay, fn($q) => $q->where('ngay_giao_dich', '<=', $den_ngay))
            ->sum('so_tien');

        $tong_chi = GiaoDichNganHang::where('loai_giao_dich', 'chi')
            ->when($tai_khoan_ngan_hang_id, fn($q) => $q->where('tai_khoan_ngan_hang_id', $tai_khoan_ngan_hang_id))
            ->when($tu_ngay, fn($q) => $q->where('ngay_giao_dich', '>=', $tu_ngay))
            ->when($den_ngay, fn($q) => $q->where('ngay_giao_dich', '<=', $den_ngay))
            ->sum('so_tien');

        return response()->json([
            'status_code' => 200,
            'data' => [
                'datas' => $datas,
                'total' => $total,
                'tong_thu' => $tong_thu,
                'tong_chi' => $tong_chi,
                'chenh_lech' => $tong_thu - $tong_chi,
            ]
        ]);
    }

    public function apiAdd(Request $request)
    {
        $request->validate([
            'tai_khoan_ngan_hang_id' => 'required|exists:tai_khoan_ngan_hang,id',
            'ngay_giao_dich' => 'required|date',
            'loai_giao_dich' => 'required|in:thu,chi,chuyen_khoan',
            'so_tien' => 'required|numeric|min:0',
            'noi_dung' => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            $data = $request->only([
                'tai_khoan_ngan_hang_id',
                'ngay_giao_dich',
                'loai_giao_dich',
                'so_tien',
                'doi_tac_id',
                'doi_tac_type',
                'loai_thu_id',
                'loai_chi_id',
                'ma_giao_dich',
                'noi_dung',
                'ghi_chu',
                'trang_thai',
            ]);

            $data['created_by'] = Auth::guard('admin_users')->id();

            $giaoDich = GiaoDichNganHang::create($data);

            // Cập nhật số dư tài khoản
            $taiKhoan = TaiKhoanNganHang::findOrFail($request->tai_khoan_ngan_hang_id);
            if ($request->loai_giao_dich === 'thu') {
                $taiKhoan->so_du_hien_tai += $request->so_tien;
            } else {
                $taiKhoan->so_du_hien_tai -= $request->so_tien;
            }
            $taiKhoan->save();

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Thêm giao dịch thành công',
                'data' => $giaoDich->load(['taiKhoanNganHang', 'loaiThu', 'loaiChi'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    public function apiUpdate(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:giao_dich_ngan_hang,id',
            'tai_khoan_ngan_hang_id' => 'required|exists:tai_khoan_ngan_hang,id',
            'ngay_giao_dich' => 'required|date',
            'loai_giao_dich' => 'required|in:thu,chi,chuyen_khoan',
            'so_tien' => 'required|numeric|min:0',
            'noi_dung' => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            $giaoDich = GiaoDichNganHang::findOrFail($request->id);
            $soTienCu = $giaoDich->so_tien;
            $loaiCu = $giaoDich->loai_giao_dich;

            // Hoàn lại số dư cũ
            $taiKhoan = TaiKhoanNganHang::findOrFail($giaoDich->tai_khoan_ngan_hang_id);
            if ($loaiCu === 'thu') {
                $taiKhoan->so_du_hien_tai -= $soTienCu;
            } else {
                $taiKhoan->so_du_hien_tai += $soTienCu;
            }

            $data = $request->only([
                'tai_khoan_ngan_hang_id',
                'ngay_giao_dich',
                'loai_giao_dich',
                'so_tien',
                'doi_tac_id',
                'doi_tac_type',
                'loai_thu_id',
                'loai_chi_id',
                'ma_giao_dich',
                'noi_dung',
                'ghi_chu',
                'trang_thai',
            ]);

            $giaoDich->update($data);

            // Cập nhật số dư mới
            if ($request->loai_giao_dich === 'thu') {
                $taiKhoan->so_du_hien_tai += $request->so_tien;
            } else {
                $taiKhoan->so_du_hien_tai -= $request->so_tien;
            }
            $taiKhoan->save();

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Cập nhật giao dịch thành công',
                'data' => $giaoDich->load(['taiKhoanNganHang', 'loaiThu', 'loaiChi'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    public function apiDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        DB::beginTransaction();
        try {
            $giaoDichs = GiaoDichNganHang::whereIn('id', $ids)->get();

            foreach ($giaoDichs as $giaoDich) {
                // Hoàn lại số dư
                $taiKhoan = TaiKhoanNganHang::find($giaoDich->tai_khoan_ngan_hang_id);
                if ($taiKhoan) {
                    if ($giaoDich->loai_giao_dich === 'thu') {
                        $taiKhoan->so_du_hien_tai -= $giaoDich->so_tien;
                    } else {
                        $taiKhoan->so_du_hien_tai += $giaoDich->so_tien;
                    }
                    $taiKhoan->save();
                }

                $giaoDich->delete();
            }

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Xóa giao dịch thành công'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    public function apiTaiKhoanList(Request $request)
    {
        $taiKhoans = TaiKhoanNganHang::active()->ordered()->get();

        return response()->json([
            'status_code' => 200,
            'data' => $taiKhoans
        ]);
    }
}
