<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\CaLamViec;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class CaLamViecController extends Controller
{
    /**
     * Lấy ca đang mở của chi nhánh
     */
    public function getCurrentShift(Request $request)
    {
        $query = CaLamViec::with(['nhanVienMoCa', 'chiNhanh'])
            ->where('trang_thai', 'dang_mo');

        // Filter by branch if provided
        if ($request->filled('chi_nhanh_id')) {
            $query->where('chi_nhanh_id', $request->chi_nhanh_id);
        } else {
            // If no branch specified, get the first open shift
            // (In case user manages multiple branches)
            $query->orderBy('thoi_gian_bat_dau', 'desc');
        }

        $ca = $query->first();

        if (!$ca) {
            return $this->sendSuccessResponse(null, 'Chưa có ca nào đang mở');
        }

        // Tính doanh thu realtime
        $stats = $this->calculateShiftStats($ca->id);
        $ca->doanh_thu_realtime = $stats;

        return $this->sendSuccessResponse($ca);
    }

    /**
     * Mở ca mới
     */
    public function openShift(Request $request)
    {
        $request->validate([
            'chi_nhanh_id' => 'required|integer|exists:spa_chi_nhanh,id',
            'nguoi_thu_id' => 'required|integer|exists:users,id',
            'tien_mat_dau_ca' => 'required|numeric|min:0',
            'ghi_chu_mo_ca' => 'nullable|string',
        ]);

        $chiNhanhId = $request->chi_nhanh_id;

        // Kiểm tra xem đã có ca đang mở chưa
        $existingShift = CaLamViec::where('chi_nhanh_id', $chiNhanhId)
            ->where('trang_thai', 'dang_mo')
            ->first();

        if ($existingShift) {
            return $this->sendErrorResponse('Đã có ca đang mở. Vui lòng đóng ca trước khi mở ca mới', 400);
        }

        // Tạo mã ca tự động - Unique theo thời gian
        $today = now()->format('Ymd'); // 20251117
        $lastCaToday = CaLamViec::where('ma_ca', 'like', "CA_{$today}%")
            ->orderBy('id', 'desc')
            ->first();

        if ($lastCaToday) {
            // Extract số thứ tự từ mã ca: CA_20251117_001 -> 001
            $lastNumber = (int)substr($lastCaToday->ma_ca, -3);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        $maCa = 'CA_' . $today . '_' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        $ca = CaLamViec::create([
            'ma_ca' => $maCa,
            'chi_nhanh_id' => $chiNhanhId,
            'nhan_vien_mo_ca_id' => $request->nguoi_thu_id ?? Auth::id() ?? 1,
            'thoi_gian_bat_dau' => now(),
            'tien_mat_dau_ca' => $request->tien_mat_dau_ca,
            'ghi_chu_mo_ca' => $request->ghi_chu_mo_ca,
            'trang_thai' => 'dang_mo',
        ]);

        // Load relationships
        $ca->load(['nhanVienMoCa', 'chiNhanh']);

        return $this->sendSuccessResponse($ca, 'Mở ca thành công');
    }

    /**
     * Đóng ca
     */
    public function closeShift(Request $request, $id)
    {
        $request->validate([
            'tien_mat_cuoi_ca_thuc_te' => 'required|numeric|min:0',
            'ghi_chu_dong_ca' => 'nullable|string',
            'giai_trinh_chenh_lech' => 'required_if:has_difference,true|string',
        ]);

        $ca = CaLamViec::findOrFail($id);

        if ($ca->trang_thai !== 'dang_mo') {
            return $this->sendErrorResponse('Ca này đã được đóng', 400);
        }

        // Tính toán doanh thu
        $stats = $this->calculateShiftStats($id);

        $tienMatCuoiCaLyThuyet = $ca->tien_mat_dau_ca + $stats['doanh_thu_tien_mat'];
        $chenhLech = $request->tien_mat_cuoi_ca_thuc_te - $tienMatCuoiCaLyThuyet;

        // Cập nhật thông tin ca
        $ca->update([
            'nhan_vien_dong_ca_id' => Auth::id() ?? 1,
            'thoi_gian_ket_thuc' => now(),
            'tien_mat_cuoi_ca_ly_thuyet' => $tienMatCuoiCaLyThuyet,
            'tien_mat_cuoi_ca_thuc_te' => $request->tien_mat_cuoi_ca_thuc_te,
            'chenh_lech' => $chenhLech,
            'doanh_thu_tien_mat' => $stats['doanh_thu_tien_mat'],
            'doanh_thu_chuyen_khoan' => $stats['doanh_thu_chuyen_khoan'],
            'doanh_thu_the' => $stats['doanh_thu_the'],
            'tong_doanh_thu' => $stats['tong_doanh_thu'],
            'so_hoa_don' => $stats['so_hoa_don'],
            'ghi_chu_dong_ca' => $request->ghi_chu_dong_ca,
            'giai_trinh_chenh_lech' => $request->giai_trinh_chenh_lech,
            'trang_thai' => 'da_dong',
        ]);

        $ca->load(['nhanVienMoCa', 'nhanVienDongCa']);

        return $this->sendSuccessResponse($ca, 'Đóng ca thành công');
    }

    /**
     * Danh sách ca làm việc
     */
    public function index(Request $request)
    {
        $query = CaLamViec::with(['nhanVienMoCa', 'nhanVienDongCa', 'chiNhanh']);

        // Filter
        if ($request->filled('chi_nhanh_id')) {
            $query->where('chi_nhanh_id', $request->chi_nhanh_id);
        }

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->trang_thai);
        }

        if ($request->filled('from_date')) {
            $query->whereDate('thoi_gian_bat_dau', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('thoi_gian_bat_dau', '<=', $request->to_date);
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('ma_ca', 'like', '%' . $request->search . '%')
                  ->orWhereHas('nhanVienMoCa', function($nv) use ($request) {
                      $nv->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $shifts = $query->orderBy('thoi_gian_bat_dau', 'desc')
            ->paginate($request->per_page ?? 20);

        return $this->sendSuccessResponse($shifts);
    }

    /**
     * Chi tiết ca
     */
    public function show($id)
    {
        $ca = CaLamViec::with(['nhanVienMoCa', 'nhanVienDongCa', 'hoaDons'])
            ->findOrFail($id);

        return $this->sendSuccessResponse($ca);
    }

    /**
     * In biên bản bàn giao
     */
    public function printHandover($id)
    {
        $ca = CaLamViec::with(['nhanVienMoCa', 'nhanVienDongCa', 'chiNhanh'])
            ->findOrFail($id);

        if ($ca->trang_thai === 'dang_mo') {
            return $this->sendErrorResponse('Ca chưa đóng, không thể in biên bản', 400);
        }

        $pdf = Pdf::loadView('spa.shift-handover', ['ca' => $ca]);
        return $pdf->download("Bien_ban_ban_giao_{$ca->ma_ca}.pdf");
    }

    /**
     * Tính toán thống kê ca làm việc
     */
    private function calculateShiftStats($caId)
    {
        // Tính doanh thu từ các hóa đơn đã thanh toán (đủ hoặc có công nợ)
        // Bao gồm cả 'da_thanh_toan' và 'con_cong_no'
        $stats = DB::table('spa_hoa_don')
            ->where('ca_lam_viec_id', $caId)
            ->whereIn('trang_thai', ['da_thanh_toan', 'con_cong_no'])
            ->selectRaw('
                COUNT(*) as so_hoa_don,
                COALESCE(SUM(COALESCE(thanh_toan_tien_mat, 0)), 0) as doanh_thu_tien_mat,
                COALESCE(SUM(COALESCE(thanh_toan_chuyen_khoan, 0)), 0) as doanh_thu_chuyen_khoan,
                COALESCE(SUM(COALESCE(thanh_toan_the, 0) - COALESCE(phi_ca_the, 0)), 0) as doanh_thu_the,
                COALESCE(SUM(COALESCE(thanh_toan_vi, 0)), 0) as doanh_thu_vi,
                COALESCE(SUM(COALESCE(phi_ca_the, 0)), 0) as tong_phi_ca_the,
                COALESCE(SUM(
                    COALESCE(thanh_toan_tien_mat, 0) +
                    COALESCE(thanh_toan_chuyen_khoan, 0) +
                    COALESCE(thanh_toan_the, 0) - COALESCE(phi_ca_the, 0) +
                    COALESCE(thanh_toan_vi, 0)
                ), 0) as tong_doanh_thu
            ')
            ->first();

        // Log để debug
        Log::info('Shift Stats Calculation', [
            'ca_id' => $caId,
            'stats' => $stats,
        ]);

        return [
            'so_hoa_don' => $stats->so_hoa_don ?? 0,
            'doanh_thu_tien_mat' => $stats->doanh_thu_tien_mat ?? 0,
            'doanh_thu_chuyen_khoan' => $stats->doanh_thu_chuyen_khoan ?? 0,
            'doanh_thu_the' => $stats->doanh_thu_the ?? 0,
            'doanh_thu_vi' => $stats->doanh_thu_vi ?? 0,
            'tong_phi_ca_the' => $stats->tong_phi_ca_the ?? 0,
            'tong_doanh_thu' => $stats->tong_doanh_thu ?? 0,
        ];
    }
}
