<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\ChuyenKho;
use App\Models\Spa\ChuyenKhoChiTiet;
use App\Models\Spa\TonKhoChiNhanh;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChuyenKhoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ChuyenKho::with([
            'chiNhanhXuat',
            'chiNhanhNhap',
            'nguoiXuat',
            'nguoiDuyet',
            'nguoiNhap',
            'chiTiets.sanPham'
        ]);

        // Filter by status
        if ($request->trang_thai) {
            $query->where('trang_thai', $request->trang_thai);
        }

        // Filter by branch (xuat or nhap)
        if ($request->chi_nhanh_id) {
            if ($request->type === 'xuat') {
                $query->where('chi_nhanh_xuat_id', $request->chi_nhanh_id);
            } elseif ($request->type === 'nhap') {
                $query->where('chi_nhanh_nhap_id', $request->chi_nhanh_id);
            } else {
                $query->byBranch($request->chi_nhanh_id);
            }
        }

        // Filter by date range
        if ($request->tu_ngay) {
            $query->where('ngay_xuat', '>=', $request->tu_ngay);
        }
        if ($request->den_ngay) {
            $query->where('ngay_xuat', '<=', $request->den_ngay);
        }

        // Search by ma_phieu
        if ($request->search) {
            $query->where('ma_phieu', 'like', "%{$request->search}%");
        }

        $perPage = $request->per_page ?? 20;
        $transfers = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($transfers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'chi_nhanh_xuat_id' => 'required|exists:spa_chi_nhanh,id',
            'chi_nhanh_nhap_id' => 'required|exists:spa_chi_nhanh,id|different:chi_nhanh_xuat_id',
            'ngay_xuat' => 'required|date',
            'ngay_du_kien_nhan' => 'nullable|date|after_or_equal:ngay_xuat',
            'ly_do' => 'nullable|string|max:255',
            'ghi_chu' => 'nullable|string',
            'chi_tiets' => 'required|array|min:1',
            'chi_tiets.*.san_pham_id' => 'required|exists:spa_san_pham,id',
            'chi_tiets.*.so_luong_xuat' => 'required|integer|min:1',
        ]);

        try {
            DB::transaction(function () use ($request, &$transfer) {
                // Check stock availability
                foreach ($request->chi_tiets as $item) {
                    $tonKho = TonKhoChiNhanh::where('chi_nhanh_id', $request->chi_nhanh_xuat_id)
                        ->where('san_pham_id', $item['san_pham_id'])
                        ->first();

                    if (!$tonKho || $tonKho->so_luong_kha_dung < $item['so_luong_xuat']) {
                        throw new \Exception("Sản phẩm ID {$item['san_pham_id']}: Không đủ tồn kho khả dụng");
                    }
                }

                // Create transfer
                $transfer = ChuyenKho::create([
                    'ma_phieu' => $request->ma_phieu ?? ChuyenKho::generateMaPhieu(),
                    'chi_nhanh_xuat_id' => $request->chi_nhanh_xuat_id,
                    'chi_nhanh_nhap_id' => $request->chi_nhanh_nhap_id,
                    'nguoi_xuat_id' => auth()->id(),
                    'ngay_xuat' => $request->ngay_xuat,
                    'ngay_du_kien_nhan' => $request->ngay_du_kien_nhan,
                    'trang_thai' => 'cho_duyet',
                    'ly_do' => $request->ly_do,
                    'ghi_chu' => $request->ghi_chu,
                    'hinh_anh_xuat_ids' => $request->hinh_anh_xuat_ids,
                ]);

                // Create details
                $tongSoLuong = 0;
                $tongGiaTri = 0;

                foreach ($request->chi_tiets as $item) {
                    $tonKho = TonKhoChiNhanh::where('chi_nhanh_id', $request->chi_nhanh_xuat_id)
                        ->where('san_pham_id', $item['san_pham_id'])
                        ->first();

                    ChuyenKhoChiTiet::create([
                        'phieu_chuyen_id' => $transfer->id,
                        'san_pham_id' => $item['san_pham_id'],
                        'so_luong_xuat' => $item['so_luong_xuat'],
                        'gia_von' => $tonKho->gia_von_binh_quan,
                        'ghi_chu' => $item['ghi_chu'] ?? null,
                    ]);

                    $tongSoLuong += $item['so_luong_xuat'];
                    $tongGiaTri += $item['so_luong_xuat'] * $tonKho->gia_von_binh_quan;
                }

                // Update totals
                $transfer->update([
                    'tong_so_luong_xuat' => $tongSoLuong,
                    'tong_gia_tri' => $tongGiaTri,
                ]);
            });

            return response()->json([
                'message' => 'Tạo phiếu chuyển kho thành công',
                'data' => $transfer->load(['chiTiets.sanPham', 'chiNhanhXuat', 'chiNhanhNhap']),
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
        $transfer = ChuyenKho::with([
            'chiNhanhXuat',
            'chiNhanhNhap',
            'nguoiXuat',
            'nguoiDuyet',
            'nguoiNhap',
            'chiTiets.sanPham.danhMuc'
        ])->findOrFail($id);

        return response()->json($transfer);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $transfer = ChuyenKho::findOrFail($id);

        if ($transfer->trang_thai !== 'cho_duyet') {
            return response()->json([
                'message' => 'Chỉ có thể sửa phiếu ở trạng thái chờ duyệt',
            ], 400);
        }

        $request->validate([
            'ngay_du_kien_nhan' => 'nullable|date|after_or_equal:ngay_xuat',
            'ly_do' => 'nullable|string|max:255',
            'ghi_chu' => 'nullable|string',
            'chi_tiets' => 'required|array|min:1',
            'chi_tiets.*.san_pham_id' => 'required|exists:spa_san_pham,id',
            'chi_tiets.*.so_luong_xuat' => 'required|integer|min:1',
        ]);

        try {
            DB::transaction(function () use ($request, $transfer) {
                // Delete old details
                $transfer->chiTiets()->delete();

                // Create new details
                $tongSoLuong = 0;
                $tongGiaTri = 0;

                foreach ($request->chi_tiets as $item) {
                    $tonKho = TonKhoChiNhanh::where('chi_nhanh_id', $transfer->chi_nhanh_xuat_id)
                        ->where('san_pham_id', $item['san_pham_id'])
                        ->first();

                    if (!$tonKho || $tonKho->so_luong_kha_dung < $item['so_luong_xuat']) {
                        throw new \Exception("Sản phẩm ID {$item['san_pham_id']}: Không đủ tồn kho");
                    }

                    ChuyenKhoChiTiet::create([
                        'phieu_chuyen_id' => $transfer->id,
                        'san_pham_id' => $item['san_pham_id'],
                        'so_luong_xuat' => $item['so_luong_xuat'],
                        'gia_von' => $tonKho->gia_von_binh_quan,
                        'ghi_chu' => $item['ghi_chu'] ?? null,
                    ]);

                    $tongSoLuong += $item['so_luong_xuat'];
                    $tongGiaTri += $item['so_luong_xuat'] * $tonKho->gia_von_binh_quan;
                }

                // Update transfer
                $transfer->update([
                    'ngay_du_kien_nhan' => $request->ngay_du_kien_nhan,
                    'ly_do' => $request->ly_do,
                    'ghi_chu' => $request->ghi_chu,
                    'tong_so_luong_xuat' => $tongSoLuong,
                    'tong_gia_tri' => $tongGiaTri,
                ]);
            });

            return response()->json([
                'message' => 'Cập nhật phiếu chuyển thành công',
                'data' => $transfer->load('chiTiets.sanPham'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi cập nhật: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve transfer
     */
    public function approve($id)
    {
        $transfer = ChuyenKho::findOrFail($id);

        try {
            $transfer->approve();

            return response()->json([
                'message' => 'Duyệt phiếu chuyển thành công',
                'data' => $transfer->fresh(['chiTiets.sanPham', 'chiNhanhXuat', 'chiNhanhNhap']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi duyệt phiếu: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Receive transfer
     */
    public function receive(Request $request, $id)
    {
        $transfer = ChuyenKho::findOrFail($id);

        $request->validate([
            'chi_tiets' => 'required|array|min:1',
            'chi_tiets.*.id' => 'required|exists:spa_chuyen_kho_chi_tiet,id',
            'chi_tiets.*.so_luong_nhan' => 'required|integer|min:0',
            'chi_tiets.*.so_luong_hong' => 'nullable|integer|min:0',
            'chi_tiets.*.ly_do_hong' => 'nullable|string',
            'ghi_chu_nhan_hang' => 'nullable|string',
            'hinh_anh_nhan_ids' => 'nullable|array',
        ]);

        try {
            $transfer->receive($request->chi_tiets);

            $transfer->update([
                'ghi_chu_nhan_hang' => $request->ghi_chu_nhan_hang,
                'hinh_anh_nhan_ids' => $request->hinh_anh_nhan_ids,
            ]);

            return response()->json([
                'message' => 'Nhận hàng thành công',
                'data' => $transfer->fresh(['chiTiets.sanPham', 'chiNhanhXuat', 'chiNhanhNhap']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi nhận hàng: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Cancel transfer
     */
    public function cancel($id)
    {
        $transfer = ChuyenKho::findOrFail($id);

        try {
            $transfer->cancel();

            return response()->json([
                'message' => 'Hủy phiếu chuyển thành công',
                'data' => $transfer->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi hủy phiếu: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get transfer history by branch
     */
    public function history($chiNhanhId, Request $request)
    {
        $query = ChuyenKho::with(['chiNhanhXuat', 'chiNhanhNhap', 'nguoiXuat'])
            ->byBranch($chiNhanhId, $request->type ?? 'all');

        if ($request->tu_ngay) {
            $query->where('ngay_xuat', '>=', $request->tu_ngay);
        }
        if ($request->den_ngay) {
            $query->where('ngay_xuat', '<=', $request->den_ngay);
        }

        $transfers = $query->orderBy('ngay_xuat', 'desc')->get();

        return response()->json($transfers);
    }

    /**
     * Get statistics
     */
    public function statistics(Request $request)
    {
        $query = ChuyenKho::query();

        if ($request->chi_nhanh_id) {
            $query->byBranch($request->chi_nhanh_id);
        }

        if ($request->tu_ngay) {
            $query->where('ngay_xuat', '>=', $request->tu_ngay);
        }
        if ($request->den_ngay) {
            $query->where('ngay_xuat', '<=', $request->den_ngay);
        }

        $stats = [
            'tong_phieu' => $query->count(),
            'cho_duyet' => (clone $query)->where('trang_thai', 'cho_duyet')->count(),
            'dang_chuyen' => (clone $query)->where('trang_thai', 'dang_chuyen')->count(),
            'da_nhan' => (clone $query)->where('trang_thai', 'da_nhan')->count(),
            'da_huy' => (clone $query)->where('trang_thai', 'huy')->count(),
            'tong_gia_tri' => (clone $query)->where('trang_thai', 'da_nhan')->sum('tong_gia_tri'),
        ];

        return response()->json($stats);
    }
}
