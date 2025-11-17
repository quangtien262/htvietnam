<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\XuatHuy;
use App\Models\Spa\XuatHuyChiTiet;
use App\Models\Spa\TonKhoChiNhanh;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class XuatHuyController extends Controller
{
    public function index(Request $request)
    {
        $query = XuatHuy::with([
            'chiNhanh',
            'nguoiXuat',
            'nguoiDuyet',
            'chiTiets.sanPham'
        ]);

        if ($request->trang_thai) {
            $query->where('trang_thai', $request->trang_thai);
        }

        if ($request->chi_nhanh_id) {
            $query->where('chi_nhanh_id', $request->chi_nhanh_id);
        }

        if ($request->ly_do_huy) {
            $query->where('ly_do_huy', $request->ly_do_huy);
        }

        if ($request->tu_ngay) {
            $query->where('ngay_xuat', '>=', $request->tu_ngay);
        }
        if ($request->den_ngay) {
            $query->where('ngay_xuat', '<=', $request->den_ngay);
        }

        if ($request->search) {
            $query->where('ma_phieu', 'like', "%{$request->search}%");
        }

        $perPage = $request->per_page ?? 20;
        $disposals = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($disposals);
    }

    public function store(Request $request)
    {
        $request->validate([
            'chi_nhanh_id' => 'required|exists:spa_chi_nhanh,id',
            'ngay_xuat' => 'required|date',
            'ly_do_huy' => 'required|in:het_han,hong_hoc,mat_chat_luong,bi_o_nhiem,khac',
            'mo_ta_ly_do' => 'nullable|string',
            'ghi_chu' => 'nullable|string',
            'chi_tiets' => 'required|array|min:1',
            'chi_tiets.*.san_pham_id' => 'required|exists:spa_san_pham,id',
            'chi_tiets.*.so_luong_huy' => 'required|integer|min:1',
            'chi_tiets.*.ghi_chu' => 'nullable|string',
        ]);

        try {
            DB::transaction(function () use ($request, &$disposal) {
                // Check stock availability
                foreach ($request->chi_tiets as $item) {
                    $tonKho = TonKhoChiNhanh::where('chi_nhanh_id', $request->chi_nhanh_id)
                        ->where('san_pham_id', $item['san_pham_id'])
                        ->first();

                    if (!$tonKho || $tonKho->so_luong_ton < $item['so_luong_huy']) {
                        throw new \Exception("Sản phẩm ID {$item['san_pham_id']}: Không đủ tồn kho");
                    }
                }

                $disposal = XuatHuy::create([
                    'ma_phieu' => $request->ma_phieu ?? XuatHuy::generateMaPhieu(),
                    'chi_nhanh_id' => $request->chi_nhanh_id,
                    'nguoi_xuat_id' => auth()->id(),
                    'ngay_xuat' => $request->ngay_xuat,
                    'trang_thai' => 'cho_duyet',
                    'ly_do_huy' => $request->ly_do_huy,
                    'mo_ta_ly_do' => $request->mo_ta_ly_do,
                    'ghi_chu' => $request->ghi_chu,
                    'hinh_anh_ids' => $request->hinh_anh_ids,
                ]);

                foreach ($request->chi_tiets as $item) {
                    $tonKho = TonKhoChiNhanh::where('chi_nhanh_id', $request->chi_nhanh_id)
                        ->where('san_pham_id', $item['san_pham_id'])
                        ->first();

                    XuatHuyChiTiet::create([
                        'phieu_huy_id' => $disposal->id,
                        'san_pham_id' => $item['san_pham_id'],
                        'so_luong_huy' => $item['so_luong_huy'],
                        'gia_von' => $tonKho->gia_von_binh_quan,
                        'ghi_chu' => $item['ghi_chu'] ?? null,
                        'ngay_san_xuat' => $item['ngay_san_xuat'] ?? null,
                        'han_su_dung' => $item['han_su_dung'] ?? null,
                        'lo_san_xuat' => $item['lo_san_xuat'] ?? null,
                    ]);
                }

                $disposal->calculateTotals();
            });

            return response()->json([
                'message' => 'Tạo phiếu xuất hủy thành công',
                'data' => $disposal->load(['chiTiets.sanPham', 'chiNhanh']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi tạo phiếu: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        $disposal = XuatHuy::with([
            'chiNhanh',
            'nguoiXuat',
            'nguoiDuyet',
            'chiTiets.sanPham.danhMuc'
        ])->findOrFail($id);

        return response()->json($disposal);
    }

    public function approve($id)
    {
        $disposal = XuatHuy::findOrFail($id);

        try {
            $disposal->approve();

            return response()->json([
                'message' => 'Duyệt phiếu xuất hủy thành công',
                'data' => $disposal->fresh(['chiTiets.sanPham', 'chiNhanh']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi duyệt phiếu: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function cancel($id)
    {
        $disposal = XuatHuy::findOrFail($id);

        if ($disposal->trang_thai === 'da_duyet') {
            return response()->json([
                'message' => 'Không thể hủy phiếu đã duyệt',
            ], 400);
        }

        $disposal->update(['trang_thai' => 'huy']);

        return response()->json([
            'message' => 'Hủy phiếu xuất hủy thành công',
            'data' => $disposal->fresh(),
        ]);
    }

    public function statistics(Request $request)
    {
        $query = XuatHuy::query();

        if ($request->chi_nhanh_id) {
            $query->where('chi_nhanh_id', $request->chi_nhanh_id);
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
            'da_duyet' => (clone $query)->where('trang_thai', 'da_duyet')->count(),
            'da_huy' => (clone $query)->where('trang_thai', 'huy')->count(),
            'tong_gia_tri_huy' => (clone $query)->where('trang_thai', 'da_duyet')->sum('tong_gia_tri_huy'),
            'by_reason' => (clone $query)->where('trang_thai', 'da_duyet')
                ->select('ly_do_huy', DB::raw('COUNT(*) as count'), DB::raw('SUM(tong_gia_tri_huy) as total'))
                ->groupBy('ly_do_huy')
                ->get(),
        ];

        return response()->json($stats);
    }
}
