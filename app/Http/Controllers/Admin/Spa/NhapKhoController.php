<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\NhapKho;
use App\Models\Spa\NhapKhoChiTiet;
use App\Models\Spa\TonKhoChiNhanh;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NhapKhoController extends Controller
{
    public function index(Request $request)
    {
        $query = NhapKho::with(['chiTiets.sanPham', 'chiNhanh']);

        // Filter by branch
        if ($request->filled('chi_nhanh_id')) {
            $query->where('chi_nhanh_id', $request->chi_nhanh_id);
        }

        if ($request->filled('tu_ngay')) {
            $query->whereDate('ngay_nhap', '>=', $request->tu_ngay);
        }
        if ($request->filled('den_ngay')) {
            $query->whereDate('ngay_nhap', '<=', $request->den_ngay);
        }

        if ($request->filled('nha_cung_cap_id')) {
            $query->where('nha_cung_cap_id', $request->nha_cung_cap_id);
        }

        if ($request->filled('search')) {
            $query->where('ma_phieu', 'like', "%{$request->search}%");
        }

        $receipts = $query->orderBy('ngay_nhap', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($receipts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'chi_nhanh_id' => 'required|exists:spa_chi_nhanh,id',
            'nha_cung_cap_id' => 'nullable|exists:spa_nha_cung_cap,id',
            'ngay_nhap' => 'required|date',
            'chi_tiets' => 'required|array|min:1',
            'chi_tiets.*.san_pham_id' => 'required|exists:spa_san_pham,id',
            'chi_tiets.*.so_luong' => 'required|integer|min:1',
            'chi_tiets.*.don_gia' => 'required|numeric|min:0',
        ]);

        try {
            DB::transaction(function () use ($request, &$nhapKho) {
                // Generate ma_phieu if not provided
                $maPhieu = $request->ma_phieu ?? $this->generateMaPhieu();

                // Create receipt
                $nhapKho = NhapKho::create([
                    'ma_phieu' => $maPhieu,
                    'chi_nhanh_id' => $request->chi_nhanh_id,
                    'nha_cung_cap_id' => $request->nha_cung_cap_id,
                    'ngay_nhap' => $request->ngay_nhap,
                    'nguoi_nhap_id' => auth()->id(),
                    'ghi_chu' => $request->ghi_chu,
                ]);

                $tongTien = 0;

                // Create details and update stock
                foreach ($request->chi_tiets as $item) {
                    $thanhTien = $item['so_luong'] * $item['don_gia'];

                    NhapKhoChiTiet::create([
                        'phieu_nhap_id' => $nhapKho->id,
                        'san_pham_id' => $item['san_pham_id'],
                        'so_luong' => $item['so_luong'],
                        'don_gia' => $item['don_gia'],
                        'thanh_tien' => $thanhTien,
                        'ngay_san_xuat' => $item['ngay_san_xuat'] ?? null,
                        'han_su_dung' => $item['han_su_dung'] ?? null,
                    ]);

                    // Update branch stock with AVCO
                    TonKhoChiNhanh::updateStock(
                        $request->chi_nhanh_id,
                        $item['san_pham_id'],
                        $item['so_luong'],
                        'increase',
                        $item['don_gia']
                    );

                    // Sync product total stock
                    TonKhoChiNhanh::syncWithProductTable($item['san_pham_id']);

                    $tongTien += $thanhTien;
                }

                // Update total
                $nhapKho->update(['tong_tien' => $tongTien]);
            });

            return response()->json([
                'message' => 'Nhập kho thành công',
                'data' => $nhapKho->load(['chiTiets.sanPham', 'chiNhanh']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi nhập kho: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        $nhapKho = NhapKho::with([
            'chiNhanh',
            'chiTiets.sanPham.danhMuc'
        ])->findOrFail($id);

        return response()->json($nhapKho);
    }

    public function destroy($id)
    {
        $nhapKho = NhapKho::findOrFail($id);

        try {
            DB::transaction(function () use ($nhapKho) {
                // Rollback stock for each product
                foreach ($nhapKho->chiTiets as $chiTiet) {
                    TonKhoChiNhanh::updateStock(
                        $nhapKho->chi_nhanh_id,
                        $chiTiet->san_pham_id,
                        $chiTiet->so_luong,
                        'decrease'
                    );

                    // Sync product total stock
                    TonKhoChiNhanh::syncWithProductTable($chiTiet->san_pham_id);
                }

                // Delete receipt
                $nhapKho->delete();
            });

            return response()->json([
                'message' => 'Xóa phiếu nhập thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi xóa phiếu: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Statistics
    public function statistics(Request $request)
    {
        $query = NhapKho::query();

        if ($request->chi_nhanh_id) {
            $query->where('chi_nhanh_id', $request->chi_nhanh_id);
        }

        $tu_ngay = $request->tu_ngay ?? now()->startOfMonth();
        $den_ngay = $request->den_ngay ?? now();

        $query->whereDate('ngay_nhap', '>=', $tu_ngay)
            ->whereDate('ngay_nhap', '<=', $den_ngay);

        $stats = [
            'tong_phieu' => $query->count(),
            'tong_gia_tri' => $query->sum('tong_tien'),
        ];

        return response()->json($stats);
    }

    private function generateMaPhieu()
    {
        $latest = NhapKho::latest('id')->first();
        $number = $latest ? (int)substr($latest->ma_phieu, 2) + 1 : 1;
        return 'PN' . str_pad($number, 5, '0', STR_PAD_LEFT);
    }
}
