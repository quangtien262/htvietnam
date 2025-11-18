<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\TraHangNhap;
use App\Models\Spa\TraHangNhapChiTiet;
use App\Models\Spa\NhapKho;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TraHangNhapController extends Controller
{
    public function index(Request $request)
    {
        $query = TraHangNhap::with([
            'chiNhanh',
            'phieuNhap',
            'nhaCungCap',
            'nguoiTra',
            'nguoiDuyet',
            'chiTiets.sanPham'
        ]);

        if ($request->trang_thai) {
            $query->where('trang_thai', $request->trang_thai);
        }

        if ($request->chi_nhanh_id) {
            $query->where('chi_nhanh_id', $request->chi_nhanh_id);
        }

        if ($request->nha_cung_cap_id) {
            $query->where('nha_cung_cap_id', $request->nha_cung_cap_id);
        }

        if ($request->tu_ngay) {
            $query->where('ngay_tra', '>=', $request->tu_ngay);
        }
        if ($request->den_ngay) {
            $query->where('ngay_tra', '<=', $request->den_ngay);
        }

        if ($request->search) {
            $query->where('ma_phieu', 'like', "%{$request->search}%");
        }

        $perPage = $request->per_page ?? 20;
        $returns = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($returns);
    }

    public function store(Request $request)
    {
        $request->validate([
            'chi_nhanh_id' => 'required|exists:spa_chi_nhanh,id',
            'phieu_nhap_id' => 'required|exists:spa_nhap_kho,id',
            'nha_cung_cap_id' => 'required|exists:spa_nha_cung_cap,id',
            'ngay_tra' => 'required|date',
            'ly_do_tra' => 'required|in:hang_loi,het_han,sai_quy_cach,khong_dung_don_hang,khac',
            'mo_ta_ly_do' => 'nullable|string',
            'ghi_chu' => 'nullable|string',
            'chi_tiets' => 'required|array|min:1',
            'chi_tiets.*.san_pham_id' => 'required|exists:spa_san_pham,id',
            'chi_tiets.*.so_luong_tra' => 'required|integer|min:1',
            'chi_tiets.*.don_gia' => 'required|numeric|min:0',
            'chi_tiets.*.mo_ta_loi' => 'nullable|string',
        ]);

        try {
            DB::transaction(function () use ($request, &$return) {
                $return = TraHangNhap::create([
                    'ma_phieu' => $request->ma_phieu ?? TraHangNhap::generateMaPhieu(),
                    'chi_nhanh_id' => $request->chi_nhanh_id,
                    'phieu_nhap_id' => $request->phieu_nhap_id,
                    'nha_cung_cap_id' => $request->nha_cung_cap_id,
                    'nguoi_tra_id' => auth()->id(),
                    'ngay_tra' => $request->ngay_tra,
                    'trang_thai' => 'cho_duyet',
                    'ly_do_tra' => $request->ly_do_tra,
                    'mo_ta_ly_do' => $request->mo_ta_ly_do,
                    'ghi_chu' => $request->ghi_chu,
                    'hinh_anh_ids' => $request->hinh_anh_ids,
                ]);

                foreach ($request->chi_tiets as $item) {
                    TraHangNhapChiTiet::create([
                        'phieu_tra_id' => $return->id,
                        'san_pham_id' => $item['san_pham_id'],
                        'nhap_kho_chi_tiet_id' => $item['nhap_kho_chi_tiet_id'] ?? null,
                        'so_luong_tra' => $item['so_luong_tra'],
                        'don_gia' => $item['don_gia'],
                        'mo_ta_loi' => $item['mo_ta_loi'] ?? null,
                        'ngay_san_xuat' => $item['ngay_san_xuat'] ?? null,
                        'han_su_dung' => $item['han_su_dung'] ?? null,
                        'lo_san_xuat' => $item['lo_san_xuat'] ?? null,
                    ]);
                }

                $return->calculateTotals();
            });

            return response()->json([
                'message' => 'Tạo phiếu trả hàng thành công',
                'data' => $return->load(['chiTiets.sanPham', 'chiNhanh', 'nhaCungCap']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi tạo phiếu: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        $return = TraHangNhap::with([
            'chiNhanh',
            'phieuNhap',
            'nhaCungCap',
            'nguoiTra',
            'nguoiDuyet',
            'chiTiets.sanPham.danhMuc',
            'chiTiets.nhapKhoChiTiet'
        ])->findOrFail($id);

        return response()->json($return);
    }

    public function approve($id)
    {
        $return = TraHangNhap::findOrFail($id);

        try {
            $return->approve();

            return response()->json([
                'message' => 'Duyệt phiếu trả hàng thành công',
                'data' => $return->fresh(['chiTiets.sanPham', 'chiNhanh']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi duyệt phiếu: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function cancel($id)
    {
        $return = TraHangNhap::findOrFail($id);

        if ($return->trang_thai === 'da_duyet') {
            return response()->json([
                'message' => 'Không thể hủy phiếu đã duyệt',
            ], 400);
        }

        $return->update(['trang_thai' => 'huy']);

        return response()->json([
            'message' => 'Hủy phiếu trả hàng thành công',
            'data' => $return->fresh(),
        ]);
    }

    public function statistics(Request $request)
    {
        $query = TraHangNhap::query();

        if ($request->chi_nhanh_id) {
            $query->where('chi_nhanh_id', $request->chi_nhanh_id);
        }

        if ($request->tu_ngay) {
            $query->where('ngay_tra', '>=', $request->tu_ngay);
        }
        if ($request->den_ngay) {
            $query->where('ngay_tra', '<=', $request->den_ngay);
        }

        $stats = [
            'tong_phieu' => $query->count(),
            'cho_duyet' => (clone $query)->where('trang_thai', 'cho_duyet')->count(),
            'da_duyet' => (clone $query)->where('trang_thai', 'da_duyet')->count(),
            'da_huy' => (clone $query)->where('trang_thai', 'huy')->count(),
            'tong_tien_tra' => (clone $query)->where('trang_thai', 'da_duyet')->sum('tong_tien_tra'),
        ];

        return response()->json($stats);
    }

    /**
     * Get suppliers list for dropdown
     */
    public function getSuppliers()
    {
        $suppliers = \App\Models\Spa\NhaCungCap::where('is_active', 1)
            ->orderBy('ten_ncc')
            ->get(['id', 'ma_ncc', 'ten_ncc', 'sdt', 'email']);

        return response()->json($suppliers);
    }

    /**
     * Get receipts by supplier
     */
    public function getReceiptsBySupplier($supplierId)
    {
        $receipts = NhapKho::where('nha_cung_cap_id', $supplierId)
            ->orderBy('ngay_nhap', 'desc')
            ->get(['id', 'ma_phieu', 'ngay_nhap', 'chi_nhanh_id', 'tong_tien', 'ghi_chu']);

        return response()->json($receipts);
    }

    /**
     * Get products from a receipt
     */
    public function getProductsByReceipt($receiptId)
    {
        $chiTiets = \App\Models\Spa\NhapKhoChiTiet::with('sanPham.danhMuc')
            ->where('phieu_nhap_id', $receiptId)
            ->get();

        return response()->json($chiTiets);
    }
}
