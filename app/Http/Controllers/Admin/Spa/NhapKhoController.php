<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NhapKhoController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('spa_nhap_kho as nk')
            ->leftJoin('spa_san_pham as sp', 'nk.san_pham_id', '=', 'sp.id')
            ->leftJoin('users', 'nk.nguoi_nhap_id', '=', 'users.id')
            ->select(
                'nk.*',
                'sp.ten_san_pham',
                'sp.ma_san_pham',
                'users.name as nguoi_nhap_ten'
            );

        if ($request->filled('tu_ngay')) {
            $query->whereDate('nk.ngay_nhap', '>=', $request->tu_ngay);
        }
        if ($request->filled('den_ngay')) {
            $query->whereDate('nk.ngay_nhap', '<=', $request->den_ngay);
        }
        if ($request->filled('san_pham_id')) {
            $query->where('nk.san_pham_id', $request->san_pham_id);
        }

        $receipts = $query->orderBy('nk.ngay_nhap', 'desc')
            ->paginate($request->per_page ?? 20);

        return $this->sendSuccessResponse($receipts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'san_pham_id' => 'required|integer',
            'so_luong' => 'required|integer|min:1',
            'don_gia' => 'required|numeric|min:0',
        ]);

        $thanh_tien = $request->so_luong * $request->don_gia;

        $id = DB::table('spa_nhap_kho')->insertGetId([
            'san_pham_id' => $request->san_pham_id,
            'so_luong' => $request->so_luong,
            'don_gia' => $request->don_gia,
            'thanh_tien' => $thanh_tien,
            'ngay_nhap' => $request->ngay_nhap ?? now(),
            'nguoi_nhap_id' => $request->user()->id,
            'nha_cung_cap' => $request->nha_cung_cap,
            'so_lo' => $request->so_lo,
            'han_su_dung' => $request->han_su_dung,
            'ghi_chu' => $request->ghi_chu,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Update product stock
        DB::table('spa_san_pham')
            ->where('id', $request->san_pham_id)
            ->increment('ton_kho', $request->so_luong);

        return $this->sendSuccessResponse(['id' => $id], 'Nhập kho thành công');
    }

    public function show($id)
    {
        $receipt = DB::table('spa_nhap_kho as nk')
            ->leftJoin('spa_san_pham as sp', 'nk.san_pham_id', '=', 'sp.id')
            ->leftJoin('users', 'nk.nguoi_nhap_id', '=', 'users.id')
            ->select(
                'nk.*',
                'sp.ten_san_pham',
                'sp.ma_san_pham',
                'sp.don_vi_tinh',
                'users.name as nguoi_nhap_ten'
            )
            ->where('nk.id', $id)
            ->first();

        if (!$receipt) {
            return $this->sendErrorResponse('Không tìm thấy phiếu nhập', 404);
        }

        return $this->sendSuccessResponse($receipt);
    }

    public function destroy($id)
    {
        $receipt = DB::table('spa_nhap_kho')->where('id', $id)->first();
        if (!$receipt) {
            return $this->sendErrorResponse('Không tìm thấy phiếu nhập', 404);
        }

        // Rollback stock
        DB::table('spa_san_pham')
            ->where('id', $receipt->san_pham_id)
            ->decrement('ton_kho', $receipt->so_luong);

        DB::table('spa_nhap_kho')->where('id', $id)->delete();

        return $this->sendSuccessResponse(null, 'Xóa phiếu nhập thành công');
    }

    // Statistics
    public function statistics(Request $request)
    {
        $tu_ngay = $request->tu_ngay ?? now()->startOfMonth();
        $den_ngay = $request->den_ngay ?? now();

        $stats = DB::table('spa_nhap_kho')
            ->whereDate('ngay_nhap', '>=', $tu_ngay)
            ->whereDate('ngay_nhap', '<=', $den_ngay)
            ->selectRaw('
                COUNT(*) as tong_phieu,
                SUM(so_luong) as tong_so_luong,
                SUM(thanh_tien) as tong_gia_tri
            ')
            ->first();

        return $this->sendSuccessResponse($stats);
    }
}
