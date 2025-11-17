<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\KiemKho;
use App\Models\Spa\KiemKhoChiTiet;
use App\Models\Spa\TonKhoChiNhanh;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KiemKhoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = KiemKho::with([
            'chiNhanh',
            'nguoiKiem',
            'nguoiDuyet',
            'chiTiets.sanPham'
        ]);

        // Filter by status
        if ($request->trang_thai) {
            $query->where('trang_thai', $request->trang_thai);
        }

        // Filter by branch
        if ($request->chi_nhanh_id) {
            $query->where('chi_nhanh_id', $request->chi_nhanh_id);
        }

        // Filter by date range
        if ($request->tu_ngay) {
            $query->where('ngay_kiem', '>=', $request->tu_ngay);
        }
        if ($request->den_ngay) {
            $query->where('ngay_kiem', '<=', $request->den_ngay);
        }

        // Search by ma_phieu
        if ($request->search) {
            $query->where('ma_phieu', 'like', "%{$request->search}%");
        }

        $perPage = $request->per_page ?? 20;
        $kiemKho = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($kiemKho);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'chi_nhanh_id' => 'required|exists:spa_chi_nhanh,id',
            'ngay_kiem' => 'required|date',
            'loai_kiem_kho' => 'required|in:dinh_ky,dot_xuat,theo_danh_muc,toan_bo',
            'ly_do' => 'nullable|string|max:255',
            'ghi_chu' => 'nullable|string',
            'chi_tiets' => 'required|array|min:1',
            'chi_tiets.*.san_pham_id' => 'required|exists:spa_san_pham,id',
            'chi_tiets.*.so_luong_thuc_te' => 'required|integer|min:0',
            'chi_tiets.*.ghi_chu' => 'nullable|string',
        ]);

        try {
            DB::transaction(function () use ($request, &$kiemKho) {
                // Create inventory count
                $kiemKho = KiemKho::create([
                    'ma_phieu' => $request->ma_phieu ?? KiemKho::generateMaPhieu(),
                    'chi_nhanh_id' => $request->chi_nhanh_id,
                    'nguoi_kiem_id' => auth()->id(),
                    'ngay_kiem' => $request->ngay_kiem,
                    'trang_thai' => 'dang_kiem',
                    'loai_kiem_kho' => $request->loai_kiem_kho,
                    'ly_do' => $request->ly_do,
                    'ghi_chu' => $request->ghi_chu,
                    'hinh_anh_ids' => $request->hinh_anh_ids,
                ]);

                // Create details
                foreach ($request->chi_tiets as $item) {
                    $tonKho = TonKhoChiNhanh::where('chi_nhanh_id', $request->chi_nhanh_id)
                        ->where('san_pham_id', $item['san_pham_id'])
                        ->first();

                    $soLuongHeThong = $tonKho ? $tonKho->so_luong_ton : 0;

                    KiemKhoChiTiet::create([
                        'phieu_kiem_id' => $kiemKho->id,
                        'san_pham_id' => $item['san_pham_id'],
                        'so_luong_he_thong' => $soLuongHeThong,
                        'so_luong_thuc_te' => $item['so_luong_thuc_te'],
                        'gia_von' => $tonKho ? $tonKho->gia_von_binh_quan : 0,
                        'ghi_chu' => $item['ghi_chu'] ?? null,
                        'nguyen_nhan_chenh_lech' => $item['nguyen_nhan_chenh_lech'] ?? null,
                    ]);
                }

                // Calculate totals
                $kiemKho->calculateTotals();
            });

            return response()->json([
                'message' => 'Tạo phiếu kiểm kho thành công',
                'data' => $kiemKho->load(['chiTiets.sanPham', 'chiNhanh']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi tạo phiếu: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $kiemKho = KiemKho::with([
            'chiNhanh',
            'nguoiKiem',
            'nguoiDuyet',
            'chiTiets.sanPham.danhMuc'
        ])->findOrFail($id);

        return response()->json($kiemKho);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $kiemKho = KiemKho::findOrFail($id);

        if (!in_array($kiemKho->trang_thai, ['dang_kiem', 'cho_duyet'])) {
            return response()->json([
                'message' => 'Không thể sửa phiếu đã duyệt hoặc đã hủy',
            ], 400);
        }

        $request->validate([
            'ngay_kiem' => 'required|date',
            'loai_kiem_kho' => 'required|in:dinh_ky,dot_xuat,theo_danh_muc,toan_bo',
            'ly_do' => 'nullable|string|max:255',
            'ghi_chu' => 'nullable|string',
            'chi_tiets' => 'required|array|min:1',
            'chi_tiets.*.san_pham_id' => 'required|exists:spa_san_pham,id',
            'chi_tiets.*.so_luong_thuc_te' => 'required|integer|min:0',
        ]);

        try {
            DB::transaction(function () use ($request, $kiemKho) {
                // Delete old details
                $kiemKho->chiTiets()->delete();

                // Create new details
                foreach ($request->chi_tiets as $item) {
                    $tonKho = TonKhoChiNhanh::where('chi_nhanh_id', $kiemKho->chi_nhanh_id)
                        ->where('san_pham_id', $item['san_pham_id'])
                        ->first();

                    $soLuongHeThong = $tonKho ? $tonKho->so_luong_ton : 0;

                    KiemKhoChiTiet::create([
                        'phieu_kiem_id' => $kiemKho->id,
                        'san_pham_id' => $item['san_pham_id'],
                        'so_luong_he_thong' => $soLuongHeThong,
                        'so_luong_thuc_te' => $item['so_luong_thuc_te'],
                        'gia_von' => $tonKho ? $tonKho->gia_von_binh_quan : 0,
                        'ghi_chu' => $item['ghi_chu'] ?? null,
                        'nguyen_nhan_chenh_lech' => $item['nguyen_nhan_chenh_lech'] ?? null,
                    ]);
                }

                // Update inventory count
                $kiemKho->update([
                    'ngay_kiem' => $request->ngay_kiem,
                    'loai_kiem_kho' => $request->loai_kiem_kho,
                    'ly_do' => $request->ly_do,
                    'ghi_chu' => $request->ghi_chu,
                ]);

                // Calculate totals
                $kiemKho->calculateTotals();
            });

            return response()->json([
                'message' => 'Cập nhật phiếu kiểm kho thành công',
                'data' => $kiemKho->load('chiTiets.sanPham'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi cập nhật: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Submit for approval
     */
    public function submit($id)
    {
        $kiemKho = KiemKho::findOrFail($id);

        if ($kiemKho->trang_thai !== 'dang_kiem') {
            return response()->json([
                'message' => 'Chỉ có thể trình duyệt phiếu đang kiểm',
            ], 400);
        }

        $kiemKho->update(['trang_thai' => 'cho_duyet']);

        return response()->json([
            'message' => 'Trình duyệt phiếu kiểm kho thành công',
            'data' => $kiemKho->fresh(),
        ]);
    }

    /**
     * Approve inventory count
     */
    public function approve($id)
    {
        $kiemKho = KiemKho::findOrFail($id);

        try {
            $kiemKho->approve();

            return response()->json([
                'message' => 'Duyệt phiếu kiểm kho thành công',
                'data' => $kiemKho->fresh(['chiTiets.sanPham', 'chiNhanh']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi duyệt phiếu: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Cancel inventory count
     */
    public function cancel($id)
    {
        $kiemKho = KiemKho::findOrFail($id);

        if ($kiemKho->trang_thai === 'da_duyet') {
            return response()->json([
                'message' => 'Không thể hủy phiếu đã duyệt',
            ], 400);
        }

        $kiemKho->update(['trang_thai' => 'huy']);

        return response()->json([
            'message' => 'Hủy phiếu kiểm kho thành công',
            'data' => $kiemKho->fresh(),
        ]);
    }

    /**
     * Get products for inventory count
     */
    public function getProducts($chiNhanhId, Request $request)
    {
        $query = TonKhoChiNhanh::with(['sanPham.danhMuc'])
            ->where('chi_nhanh_id', $chiNhanhId);

        // Filter by category
        if ($request->danh_muc_id) {
            $query->whereHas('sanPham', function ($q) use ($request) {
                $q->where('danh_muc_id', $request->danh_muc_id);
            });
        }

        // Filter by search
        if ($request->search) {
            $query->whereHas('sanPham', function ($q) use ($request) {
                $q->where('ten_san_pham', 'like', "%{$request->search}%")
                  ->orWhere('ma_san_pham', 'like', "%{$request->search}%");
            });
        }

        $tonKho = $query->get();

        // Transform to include product info at root level
        $products = $tonKho->map(function ($item) {
            return [
                'id' => $item->sanPham->id,
                'ma_san_pham' => $item->sanPham->ma_san_pham,
                'ten_san_pham' => $item->sanPham->ten_san_pham,
                'ton_kho' => $item->so_luong_ton,
                'don_vi_tinh' => $item->sanPham->don_vi_tinh,
                'gia_von' => $item->gia_von_binh_quan,
                'danh_muc' => $item->sanPham->danhMuc,
            ];
        });

        return response()->json($products);
    }

    /**
     * Get statistics
     */
    public function statistics(Request $request)
    {
        $query = KiemKho::query();

        if ($request->chi_nhanh_id) {
            $query->where('chi_nhanh_id', $request->chi_nhanh_id);
        }

        if ($request->tu_ngay) {
            $query->where('ngay_kiem', '>=', $request->tu_ngay);
        }
        if ($request->den_ngay) {
            $query->where('ngay_kiem', '<=', $request->den_ngay);
        }

        $stats = [
            'tong_phieu' => $query->count(),
            'dang_kiem' => (clone $query)->where('trang_thai', 'dang_kiem')->count(),
            'cho_duyet' => (clone $query)->where('trang_thai', 'cho_duyet')->count(),
            'da_duyet' => (clone $query)->where('trang_thai', 'da_duyet')->count(),
            'da_huy' => (clone $query)->where('trang_thai', 'huy')->count(),
            'tong_chenh_lech' => (clone $query)->where('trang_thai', 'da_duyet')->sum('tong_chenh_lech'),
            'tong_gia_tri_chenh_lech' => (clone $query)->where('trang_thai', 'da_duyet')->sum('tong_gia_tri_chenh_lech'),
        ];

        return response()->json($stats);
    }
}
