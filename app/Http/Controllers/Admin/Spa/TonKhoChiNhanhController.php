<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\TonKhoChiNhanh;
use App\Models\Spa\ChiNhanh;
use App\Models\Spa\SanPham;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TonKhoChiNhanhController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = TonKhoChiNhanh::with(['chiNhanh', 'sanPham.danhMuc']);

        // Filter by branch
        if ($request->chi_nhanh_id) {
            $query->where('chi_nhanh_id', $request->chi_nhanh_id);
        }

        // Filter by product
        if ($request->san_pham_id) {
            $query->where('san_pham_id', $request->san_pham_id);
        }

        // Filter by category
        if ($request->danh_muc_id) {
            $query->whereHas('sanPham', function ($q) use ($request) {
                $q->where('danh_muc_id', $request->danh_muc_id);
            });
        }

        // Filter low stock only
        if ($request->low_stock_only) {
            $query->lowStock();
        }

        // Filter out of stock only
        if ($request->out_of_stock_only) {
            $query->outOfStock();
        }

        // Search by product name
        if ($request->search) {
            $query->whereHas('sanPham', function ($q) use ($request) {
                $q->where('ten_san_pham', 'like', "%{$request->search}%")
                  ->orWhere('ma_san_pham', 'like', "%{$request->search}%");
            });
        }

        $perPage = $request->per_page ?? 50;
        $tonKho = $query->orderBy('chi_nhanh_id')
            ->orderBy('san_pham_id')
            ->paginate($perPage);

        return response()->json($tonKho);
    }

    /**
     * Get stock by branch
     */
    public function getByBranch($chiNhanhId, Request $request)
    {
        $query = TonKhoChiNhanh::with(['sanPham.danhMuc', 'sanPham.thuongHieu'])
            ->where('chi_nhanh_id', $chiNhanhId);

        if ($request->search) {
            $query->whereHas('sanPham', function ($q) use ($request) {
                $q->where('ten_san_pham', 'like', "%{$request->search}%")
                  ->orWhere('ma_san_pham', 'like', "%{$request->search}%");
            });
        }

        if ($request->danh_muc_id) {
            $query->whereHas('sanPham', function ($q) use ($request) {
                $q->where('danh_muc_id', $request->danh_muc_id);
            });
        }

        $tonKho = $query->get();

        // Statistics
        $stats = [
            'tong_san_pham' => $tonKho->count(),
            'tong_gia_tri' => $tonKho->sum('gia_tri_ton_kho'),
            'san_pham_canh_bao' => $tonKho->filter(fn($item) => $item->is_low_stock)->count(),
            'san_pham_het_hang' => $tonKho->where('so_luong_ton', '<=', 0)->count(),
        ];

        return response()->json([
            'data' => $tonKho,
            'statistics' => $stats,
        ]);
    }

    /**
     * Get stock by product (all branches)
     */
    public function getByProduct($sanPhamId)
    {
        $tonKho = TonKhoChiNhanh::with('chiNhanh')
            ->where('san_pham_id', $sanPhamId)
            ->get();

        $sanPham = SanPham::find($sanPhamId);

        return response()->json([
            'san_pham' => $sanPham,
            'ton_kho_chi_nhanh' => $tonKho,
            'tong_ton' => $tonKho->sum('so_luong_ton'),
            'tong_dat_truoc' => $tonKho->sum('so_luong_dat_truoc'),
            'tong_kha_dung' => $tonKho->sum('so_luong_kha_dung'),
        ]);
    }

    /**
     * Get low stock items by branch
     */
    public function getLowStock($chiNhanhId)
    {
        $lowStock = TonKhoChiNhanh::with(['sanPham.danhMuc'])
            ->where('chi_nhanh_id', $chiNhanhId)
            ->lowStock()
            ->get();

        return response()->json($lowStock);
    }

    /**
     * Get out of stock items by branch
     */
    public function getOutOfStock($chiNhanhId)
    {
        $outOfStock = TonKhoChiNhanh::with(['sanPham.danhMuc'])
            ->where('chi_nhanh_id', $chiNhanhId)
            ->outOfStock()
            ->get();

        return response()->json($outOfStock);
    }

    /**
     * Manual sync stock with product table
     */
    public function sync(Request $request)
    {
        try {
            DB::transaction(function () use ($request) {
                if ($request->san_pham_id) {
                    // Sync single product
                    TonKhoChiNhanh::syncWithProductTable($request->san_pham_id);
                } else {
                    // Sync all products
                    $sanPhamIds = TonKhoChiNhanh::distinct('san_pham_id')->pluck('san_pham_id');

                    foreach ($sanPhamIds as $sanPhamId) {
                        TonKhoChiNhanh::syncWithProductTable($sanPhamId);
                    }
                }
            });

            return response()->json([
                'message' => 'Đồng bộ tồn kho thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi đồng bộ tồn kho: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update reserved stock
     */
    public function updateReserved(Request $request)
    {
        $request->validate([
            'chi_nhanh_id' => 'required|exists:spa_chi_nhanh,id',
            'san_pham_id' => 'required|exists:spa_san_pham,id',
            'so_luong' => 'required|integer|min:1',
            'type' => 'required|in:increase,decrease',
        ]);

        try {
            $result = TonKhoChiNhanh::updateReservedStock(
                $request->chi_nhanh_id,
                $request->san_pham_id,
                $request->so_luong,
                $request->type
            );

            if (!$result) {
                return response()->json([
                    'message' => 'Không tìm thấy tồn kho',
                ], 404);
            }

            return response()->json([
                'message' => 'Cập nhật đặt trước thành công',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi cập nhật: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get stock statistics
     */
    public function statistics(Request $request)
    {
        $query = TonKhoChiNhanh::with(['chiNhanh', 'sanPham']);

        if ($request->chi_nhanh_id) {
            $query->where('chi_nhanh_id', $request->chi_nhanh_id);
        }

        $tonKho = $query->get();

        $stats = [
            'tong_chi_nhanh' => $tonKho->pluck('chi_nhanh_id')->unique()->count(),
            'tong_san_pham' => $tonKho->count(),
            'tong_ton_kho' => $tonKho->sum('so_luong_ton'),
            'tong_gia_tri' => $tonKho->sum('gia_tri_ton_kho'),
            'san_pham_canh_bao' => $tonKho->filter(fn($item) => $item->is_low_stock)->count(),
            'san_pham_het_hang' => $tonKho->where('so_luong_ton', '<=', 0)->count(),
            'tong_dat_truoc' => $tonKho->sum('so_luong_dat_truoc'),

            'by_branch' => $tonKho->groupBy('chi_nhanh_id')->map(function ($items, $chiNhanhId) {
                $chiNhanh = $items->first()->chiNhanh;
                return [
                    'chi_nhanh' => $chiNhanh ? $chiNhanh->ten_chi_nhanh : 'Không rõ',
                    'ma_chi_nhanh' => $chiNhanh ? $chiNhanh->ma_chi_nhanh : '',
                    'tong_san_pham' => $items->count(),
                    'tong_gia_tri' => $items->sum('gia_tri_ton_kho'),
                    'canh_bao' => $items->filter(fn($item) => $item->is_low_stock)->count(),
                ];
            })->values(),
        ];

        return response()->json($stats);
    }

    /**
     * Get branches list for dropdown
     */
    public function getBranches()
    {
        $branches = ChiNhanh::where('trang_thai', 'active')
            ->get(['id', 'ma_chi_nhanh', 'ten_chi_nhanh', 'dia_chi', 'sdt', 'email']);

        return response()->json($branches);
    }
}
