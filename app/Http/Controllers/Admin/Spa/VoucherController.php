<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VoucherController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('spa_voucher')->select('*');

        if ($request->filled('trang_thai')) {
            // Map frontend status to database status
            if ($request->trang_thai === 'hoat_dong') {
                $query->where('trang_thai', 'chua_su_dung');
            } elseif ($request->trang_thai === 'tam_dung') {
                $query->where('trang_thai', 'het_han');
            }
        }

        if ($request->filled('search')) {
            $query->where('ma_voucher', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('loai_giam_gia')) {
            $laPhanTram = $request->loai_giam_gia === 'phan_tram' ? 1 : 0;
            $query->where('la_phan_tram', $laPhanTram);
        }

        $perPage = $request->per_page ?? $request->limit ?? 20;
        $vouchers = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // Transform data to match frontend format
        $transformedData = collect($vouchers->items())->map(function ($voucher) {
            $dieuKien = json_decode($voucher->dieu_kien_su_dung, true) ?? [];

            return [
                'id' => $voucher->id,
                'ma_voucher' => $voucher->ma_voucher,
                'ten_voucher' => $dieuKien['ten_voucher'] ?? '',
                'loai_giam_gia' => $voucher->la_phan_tram ? 'phan_tram' : 'so_tien',
                'gia_tri_giam' => (float)$voucher->gia_tri_giam,
                'giam_toi_da' => (float)$voucher->giam_toi_da,
                'don_toi_thieu' => $dieuKien['don_toi_thieu'] ?? 0,
                'so_luong' => $dieuKien['so_luong'] ?? 1,
                'so_luong_da_dung' => $dieuKien['so_luong_da_dung'] ?? 0,
                'ngay_bat_dau' => $dieuKien['ngay_bat_dau'] ?? $voucher->created_at,
                'ngay_ket_thuc' => $voucher->ngay_het_han,
                'ap_dung_cho' => $dieuKien['ap_dung_cho'] ?? 'tat_ca',
                'danh_sach_ap_dung' => $dieuKien['danh_sach_ap_dung'] ?? [],
                'mo_ta' => $dieuKien['mo_ta'] ?? '',
                'trang_thai' => $voucher->trang_thai === 'chua_su_dung' ? 'hoat_dong' : 'tam_dung',
                'created_at' => $voucher->created_at,
            ];
        });

        // Calculate stats
        $stats = [
            'totalVouchers' => DB::table('spa_voucher')->count(),
            'activeVouchers' => DB::table('spa_voucher')->where('trang_thai', 'chua_su_dung')->count(),
            'totalUsed' => DB::table('spa_voucher')->where('trang_thai', 'da_su_dung')->count(),
            'totalDiscount' => 0, // Can be calculated if needed
        ];

        return $this->sendSuccessResponse([
            'data' => $transformedData,
            'total' => $vouchers->total(),
            'current_page' => $vouchers->currentPage(),
            'per_page' => $vouchers->perPage(),
            'last_page' => $vouchers->lastPage(),
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'gia_tri' => 'required|numeric|min:0',
            'so_luong' => 'required|integer|min:1',
            'ngay_het_han' => 'required|date',
        ]);

        $vouchers = [];
        for ($i = 0; $i < $request->so_luong; $i++) {
            $vouchers[] = [
                'ma_voucher' => strtoupper(Str::random(8)),
                'gia_tri_giam' => $request->gia_tri,
                'la_phan_tram' => 0,
                'giam_toi_da' => 0,
                'ngay_het_han' => $request->ngay_het_han,
                'trang_thai' => 'chua_su_dung',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('spa_voucher')->insert($vouchers);

        return $this->sendSuccessResponse(['created' => count($vouchers)], 'Tạo voucher thành công');
    }

    public function verify(Request $request)
    {
        $request->validate([
            'ma_voucher' => 'required|string',
            'gia_tri_don_hang' => 'nullable|numeric',
        ]);

        $voucher = DB::table('spa_voucher')
            ->where('ma_voucher', strtoupper($request->ma_voucher))
            ->first();

        if (!$voucher) {
            return $this->sendErrorResponse('Mã voucher không tồn tại', 404);
        }

        // Check expiry first
        if (now() > $voucher->ngay_het_han) {
            return $this->sendErrorResponse('Voucher đã hết hạn', 400);
        }

        // Check usage status - but allow if not fully used
        $dieuKienCheck = json_decode($voucher->dieu_kien_su_dung, true) ?? [];
        $soLuongCheck = $dieuKienCheck['so_luong'] ?? 1;
        $soLuongDaDungCheck = $dieuKienCheck['so_luong_da_dung'] ?? 0;

        if ($soLuongDaDungCheck >= $soLuongCheck) {
            return $this->sendErrorResponse('Voucher đã hết lượt sử dụng', 400);
        }

        $dieuKien = json_decode($voucher->dieu_kien_su_dung, true) ?? [];
        $donToiThieu = $dieuKien['don_toi_thieu'] ?? 0;
        $soLuong = $dieuKien['so_luong'] ?? 1;
        $soLuongDaDung = $dieuKien['so_luong_da_dung'] ?? 0;

        // Check số lượng còn lại
        if ($soLuongDaDung >= $soLuong) {
            return $this->sendErrorResponse('Voucher đã hết lượt sử dụng', 400);
        }

        // Check giá trị đơn hàng tối thiểu
        if ($request->filled('gia_tri_don_hang') && $request->gia_tri_don_hang < $donToiThieu) {
            return $this->sendErrorResponse('Giá trị đơn hàng tối thiểu: ' . number_format($donToiThieu) . 'đ', 400);
        }

        // Calculate discount amount
        $giaTriGiam = 0;
        if ($voucher->la_phan_tram) {
            $giaTriGiam = ($request->gia_tri_don_hang ?? 0) * ($voucher->gia_tri_giam / 100);
            if ($voucher->giam_toi_da > 0 && $giaTriGiam > $voucher->giam_toi_da) {
                $giaTriGiam = $voucher->giam_toi_da;
            }
        } else {
            $giaTriGiam = $voucher->gia_tri_giam;
        }

        // Transform to frontend format
        $transformed = [
            'id' => $voucher->id,
            'ma_voucher' => $voucher->ma_voucher,
            'ten_voucher' => $dieuKien['ten_voucher'] ?? '',
            'loai_giam_gia' => $voucher->la_phan_tram ? 'phan_tram' : 'so_tien',
            'gia_tri_giam' => (float)$voucher->gia_tri_giam,
            'giam_toi_da' => (float)$voucher->giam_toi_da,
            'don_toi_thieu' => $donToiThieu,
            'so_tien_giam' => $giaTriGiam,
            'so_luong_con_lai' => $soLuong - $soLuongDaDung,
        ];

        return $this->sendSuccessResponse($transformed, 'Voucher hợp lệ');
    }    public function apply(Request $request)
    {
        $request->validate([
            'ma_voucher' => 'required|string',
            'khach_hang_id' => 'required|integer',
            'hoa_don_id' => 'required|integer',
            'so_tien_giam' => 'required|numeric',
        ]);

        $voucher = DB::table('spa_voucher')
            ->where('ma_voucher', strtoupper($request->ma_voucher))
            ->first();

        if (!$voucher) {
            return $this->sendErrorResponse('Voucher không hợp lệ', 400);
        }

        // Get current usage
        $dieuKien = json_decode($voucher->dieu_kien_su_dung, true) ?? [];
        $soLuong = $dieuKien['so_luong'] ?? 1;
        $soLuongDaDung = $dieuKien['so_luong_da_dung'] ?? 0;

        // Increment usage count
        $soLuongDaDungMoi = $soLuongDaDung + 1;
        $dieuKien['so_luong_da_dung'] = $soLuongDaDungMoi;

        // Determine new status
        $trangThaiMoi = ($soLuongDaDungMoi >= $soLuong) ? 'da_su_dung' : 'chua_su_dung';

        // Update voucher
        DB::table('spa_voucher')->where('id', $voucher->id)->update([
            'khach_hang_id' => $request->khach_hang_id,
            'ngay_su_dung' => now(),
            'trang_thai' => $trangThaiMoi,
            'dieu_kien_su_dung' => json_encode($dieuKien),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse([
            'voucher_id' => $voucher->id,
            'so_tien_giam' => $request->so_tien_giam,
            'so_luong_con_lai' => $soLuong - $soLuongDaDungMoi,
        ], 'Áp dụng voucher thành công');
    }

    public function createOrUpdate(Request $request)
    {
        $request->validate([
            'loai_giam_gia' => 'required|in:phan_tram,so_tien',
            'gia_tri_giam' => 'required|numeric|min:0',
            'ngay_ket_thuc' => 'required|date',
        ]);

        // Map frontend fields to database columns
        $laPhanTram = $request->loai_giam_gia === 'phan_tram' ? 1 : 0;

        // Build dieu_kien_su_dung JSON
        $dieuKienSuDung = [
            'don_toi_thieu' => $request->don_toi_thieu ?? 0,
            'ap_dung_cho' => $request->ap_dung_cho ?? 'tat_ca',
            'danh_sach_ap_dung' => $request->danh_sach_ap_dung ?? [],
            'mo_ta' => $request->mo_ta ?? '',
            'ten_voucher' => $request->ten_voucher ?? '',
            'ngay_bat_dau' => $request->ngay_bat_dau ?? null,
            'so_luong' => $request->so_luong ?? 1,
            'so_luong_da_dung' => 0,
        ];

        $data = [
            'la_phan_tram' => $laPhanTram,
            'gia_tri_giam' => $request->gia_tri_giam,
            'giam_toi_da' => $request->giam_toi_da ?? 0,
            'dieu_kien_su_dung' => json_encode($dieuKienSuDung),
            'ngay_het_han' => $request->ngay_ket_thuc,
            'trang_thai' => $request->trang_thai === 'hoat_dong' ? 'chua_su_dung' : 'het_han',
            'updated_at' => now(),
        ];

        if ($request->filled('id')) {
            // Update existing voucher
            DB::table('spa_voucher')->where('id', $request->id)->update($data);
            return $this->sendSuccessResponse(null, 'Cập nhật voucher thành công');
        } else {
            // Create new voucher
            $data['created_at'] = now();

            // Generate ma_voucher if not provided
            if ($request->filled('ma_voucher')) {
                $data['ma_voucher'] = strtoupper($request->ma_voucher);
            } else {
                // Insert with temporary ma_voucher first to get ID
                $tempMaVoucher = 'TEMP_' . uniqid();
                $data['ma_voucher'] = $tempMaVoucher;

                $id = DB::table('spa_voucher')->insertGetId($data);

                // Update with generated ma_voucher
                $maVoucher = 'VOUCHER' . str_pad($id, 4, '0', STR_PAD_LEFT);
                DB::table('spa_voucher')->where('id', $id)->update(['ma_voucher' => $maVoucher]);

                return $this->sendSuccessResponse(['id' => $id, 'ma_voucher' => $maVoucher], 'Tạo voucher mới thành công');
            }

            $id = DB::table('spa_voucher')->insertGetId($data);
            return $this->sendSuccessResponse(['id' => $id, 'ma_voucher' => $data['ma_voucher']], 'Tạo voucher mới thành công');
        }
    }

    public function delete(Request $request)
    {
        $request->validate(['id' => 'required|integer']);

        $voucher = DB::table('spa_voucher')->where('id', $request->id)->first();
        if ($voucher && $voucher->trang_thai === 'da_su_dung') {
            return $this->sendErrorResponse('Không thể xóa voucher đã sử dụng', 400);
        }

        DB::table('spa_voucher')->where('id', $request->id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa voucher thành công');
    }

    public function destroy($id)
    {
        $voucher = DB::table('spa_voucher')->where('id', $id)->first();
        if ($voucher && $voucher->trang_thai === 'da_su_dung') {
            return $this->sendErrorResponse('Không thể xóa voucher đã sử dụng', 400);
        }

        DB::table('spa_voucher')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }

    public function show($id)
    {
        $voucher = DB::table('spa_voucher as v')
            ->leftJoin('users as u', 'v.khach_hang_id', '=', 'u.id')
            ->select('v.*', 'u.name as khach_hang_ten', 'u.phone as khach_hang_sdt')
            ->where('v.id', $id)
            ->first();

        if (!$voucher) {
            return $this->sendErrorResponse('Không tìm thấy voucher', 404);
        }

        // Transform to match frontend format
        $dieuKien = json_decode($voucher->dieu_kien_su_dung, true) ?? [];
        $transformed = [
            'id' => $voucher->id,
            'ma_voucher' => $voucher->ma_voucher,
            'ten_voucher' => $dieuKien['ten_voucher'] ?? '',
            'loai_giam_gia' => $voucher->la_phan_tram ? 'phan_tram' : 'so_tien',
            'gia_tri_giam' => (float)$voucher->gia_tri_giam,
            'giam_toi_da' => (float)$voucher->giam_toi_da,
            'don_toi_thieu' => $dieuKien['don_toi_thieu'] ?? 0,
            'so_luong' => $dieuKien['so_luong'] ?? 1,
            'so_luong_da_dung' => $dieuKien['so_luong_da_dung'] ?? 0,
            'ngay_bat_dau' => $dieuKien['ngay_bat_dau'] ?? $voucher->created_at,
            'ngay_ket_thuc' => $voucher->ngay_het_han,
            'ap_dung_cho' => $dieuKien['ap_dung_cho'] ?? 'tat_ca',
            'danh_sach_ap_dung' => $dieuKien['danh_sach_ap_dung'] ?? [],
            'mo_ta' => $dieuKien['mo_ta'] ?? '',
            'trang_thai' => $voucher->trang_thai === 'chua_su_dung' ? 'hoat_dong' : 'tam_dung',
            'khach_hang_ten' => $voucher->khach_hang_ten,
            'khach_hang_sdt' => $voucher->khach_hang_sdt,
            'created_at' => $voucher->created_at,
        ];

        return $this->sendSuccessResponse($transformed);
    }
}
