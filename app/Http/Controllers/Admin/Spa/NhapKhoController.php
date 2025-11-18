<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\NhapKho;
use App\Models\Spa\NhapKhoChiTiet;
use App\Models\Spa\TonKhoChiNhanh;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

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

                // Determine transaction type (nhap/xuat/dieu_chinh_tang/dieu_chinh_giam)
                $loaiGiaoDich = $request->loai_giao_dich ?? 'nhap';

                // Create receipt
                $nhapKho = NhapKho::create([
                    'ma_phieu' => $maPhieu,
                    'chi_nhanh_id' => $request->chi_nhanh_id,
                    'nha_cung_cap_id' => $request->nha_cung_cap_id,
                    'ngay_nhap' => $request->ngay_nhap,
                    'nguoi_nhap_id' => Auth::check() ? Auth::id() : 1,
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

                    // Determine stock action based on transaction type
                    if ($loaiGiaoDich === 'xuat' || $loaiGiaoDich === 'dieu_chinh_giam') {
                        $stockAction = 'decrease';
                    } else {
                        $stockAction = 'increase'; // nhap, dieu_chinh_tang
                    }

                    // Update branch stock with AVCO
                    TonKhoChiNhanh::updateStock(
                        $request->chi_nhanh_id,
                        $item['san_pham_id'],
                        $item['so_luong'],
                        $stockAction,
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

    public function bulkImport(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.san_pham_id' => 'required|exists:spa_san_pham,id',
            'items.*.so_luong' => 'required|integer|min:1',
            'items.*.gia_nhap' => 'required|numeric|min:0',
            'items.*.nha_cung_cap_id' => 'nullable|exists:spa_nha_cung_cap,id',
            'chi_nhanh_id' => 'nullable|exists:spa_chi_nhanh,id',
            'nha_cung_cap' => 'nullable|string',
            'ngay_nhap' => 'required|date',
            'ghi_chu' => 'nullable|string',
        ]);

        try {
            $chiNhanhId = $request->chi_nhanh_id ?? 1;
            $nhapKho = null;

            DB::transaction(function () use ($request, $chiNhanhId, &$nhapKho) {
                // Generate ma_phieu
                $maPhieu = $this->generateMaPhieu();

                // Create NhapKho record
                $nhapKho = NhapKho::create([
                    'ma_phieu' => $maPhieu,
                    'chi_nhanh_id' => $chiNhanhId,
                    'nha_cung_cap_id' => $request->items[0]['nha_cung_cap_id'] ?? null,
                    'ngay_nhap' => $request->ngay_nhap,
                    'nguoi_nhap_id' => Auth::check() ? Auth::id() : 1,
                    'ghi_chu' => $request->ghi_chu,
                    'tong_tien' => 0,
                ]);

                $tongTien = 0;

                // Create details and update stock for each item
                foreach ($request->items as $item) {
                    $thanhTien = $item['so_luong'] * $item['gia_nhap'];

                    // Create NhapKhoChiTiet
                    NhapKhoChiTiet::create([
                        'phieu_nhap_id' => $nhapKho->id,
                        'san_pham_id' => $item['san_pham_id'],
                        'so_luong' => $item['so_luong'],
                        'don_gia' => $item['gia_nhap'],
                        'thanh_tien' => $thanhTien,
                    ]);

                    // Update branch stock with AVCO
                    TonKhoChiNhanh::updateStock(
                        $chiNhanhId,
                        $item['san_pham_id'],
                        $item['so_luong'],
                        'increase',
                        $item['gia_nhap']
                    );

                    // Sync product total stock
                    TonKhoChiNhanh::syncWithProductTable($item['san_pham_id']);

                    $tongTien += $thanhTien;
                }

                // Update total
                $nhapKho->update(['tong_tien' => $tongTien]);
            });

            $nhapKhoWithRelations = $nhapKho ? $nhapKho->load(['chiTiets.sanPham', 'chiNhanh']) : null;

            return response()->json([
                'success' => true,
                'message' => "Nhập kho thành công " . count($request->items) . " sản phẩm",
                'data' => [
                    'count' => count($request->items),
                    'phieu_nhap' => $nhapKhoWithRelations
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi nhập kho: ' . $e->getMessage()
            ], 500);
        }
    }

    public function importCsv(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls',
            'chi_nhanh_id' => 'nullable|exists:spa_chi_nhanh,id',
            'nha_cung_cap' => 'nullable|string',
            'ngay_nhap' => 'required|date',
            'ghi_chu' => 'nullable|string',
        ]);

        try {
            $file = $request->file('file');
            $path = $file->getRealPath();

            // Read CSV
            $csv = array_map('str_getcsv', file($path));
            $header = array_shift($csv); // Remove header row

            $items = [];
            $errors = [];

            foreach ($csv as $index => $row) {
                if (count($row) < 4) {
                    $errors[] = "Dòng " . ($index + 2) . ": Thiếu dữ liệu";
                    continue;
                }

                $maSanPham = trim($row[0]);
                $soLuong = (int)$row[2];
                $giaNhap = (float)$row[3];

                // Find product by code
                $product = DB::table('spa_san_pham')
                    ->where('ma_san_pham', $maSanPham)
                    ->first();

                if (!$product) {
                    $errors[] = "Dòng " . ($index + 2) . ": Không tìm thấy sản phẩm {$maSanPham}";
                    continue;
                }

                $items[] = [
                    'san_pham_id' => $product->id,
                    'so_luong' => $soLuong,
                    'gia_nhap' => $giaNhap,
                ];
            }

            if (empty($items)) {
                return $this->sendErrorResponse('Không có dữ liệu hợp lệ để import. Lỗi: ' . implode(', ', $errors), 400);
            }

            $successCount = 0;
            $chiNhanhId = $request->chi_nhanh_id ?? 1; // Default to branch 1 if not specified

            DB::transaction(function () use ($items, $chiNhanhId, &$successCount) {
                foreach ($items as $item) {
                    // Update branch stock using the same method as regular import
                    TonKhoChiNhanh::updateStock(
                        $chiNhanhId,
                        $item['san_pham_id'],
                        $item['so_luong'],
                        'increase',
                        $item['gia_nhap']
                    );

                    // Sync product total stock
                    TonKhoChiNhanh::syncWithProductTable($item['san_pham_id']);

                    $successCount++;
                }
            });

            $message = "Import thành công {$successCount} sản phẩm";
            if (!empty($errors)) {
                $message .= ". Lỗi: " . count($errors) . " dòng";
            }

            return $this->sendSuccessResponse([
                'count' => $successCount,
                'errors' => $errors,
            ], $message, 200);

        } catch (\Exception $e) {
            return $this->sendErrorResponse('Lỗi khi import CSV: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get inventory stock list with product details
     */
    public function stockList(Request $request)
    {
        try {
            // If chi_nhanh_id is provided, filter by that branch
            // Otherwise, aggregate stock across all branches
            $chiNhanhId = $request->chi_nhanh_id;

            if ($chiNhanhId) {
                // Query for specific branch
                $query = TonKhoChiNhanh::with(['sanPham.danhMuc'])
                    ->where('chi_nhanh_id', $chiNhanhId);
            } else {
                // Aggregate across all branches - group by san_pham_id
                $aggregatedStocks = TonKhoChiNhanh::selectRaw('
                    san_pham_id,
                    SUM(so_luong_ton) as total_ton_kho,
                    AVG(gia_von_binh_quan) as avg_gia_von
                ')
                ->groupBy('san_pham_id')
                ->get()
                ->keyBy('san_pham_id');

                // Get all products with aggregated stock
                $query = \App\Models\Spa\SanPham::with(['danhMuc'])
                    ->whereIn('id', $aggregatedStocks->pluck('san_pham_id'));
            }

            // Filter by status
            if ($request->filled('trang_thai')) {
                $isActive = $request->trang_thai === 'active' ? 1 : 0;
                if ($chiNhanhId) {
                    $query->whereHas('sanPham', function ($q) use ($isActive) {
                        $q->where('is_active', $isActive);
                    });
                } else {
                    $query->where('is_active', $isActive);
                }
            }

            // Search
            if ($request->filled('search')) {
                $search = $request->search;
                if ($chiNhanhId) {
                    $query->whereHas('sanPham', function ($q) use ($search) {
                        $q->where('ten_san_pham', 'like', "%{$search}%")
                          ->orWhere('ma_san_pham', 'like', "%{$search}%");
                    });
                } else {
                    $query->where('ten_san_pham', 'like', "%{$search}%")
                          ->orWhere('ma_san_pham', 'like', "%{$search}%");
                }
            }

            if ($chiNhanhId) {
                $stocks = $query->orderBy('san_pham_id')
                    ->paginate($request->per_page ?? 1000);

                // Transform data to include product info
                $data = $stocks->getCollection()->map(function ($stock) {
                    return [
                        'id' => $stock->sanPham->id,
                        'ma_san_pham' => $stock->sanPham->ma_san_pham,
                        'ten_san_pham' => $stock->sanPham->ten_san_pham,
                        'danh_muc_id' => $stock->sanPham->danh_muc_id,
                        'danh_muc_ten' => $stock->sanPham->danhMuc->ten_danh_muc ?? null,
                        'don_vi_tinh' => $stock->sanPham->don_vi_tinh,
                        'ton_kho' => $stock->so_luong_ton,
                        'ton_kho_toi_thieu' => $stock->sanPham->ton_kho_canh_bao ?? 0,
                        'gia_nhap' => $stock->gia_von_binh_quan,
                        'gia_ban' => $stock->sanPham->gia_ban,
                        'trang_thai' => $stock->sanPham->is_active == 1 ? 'active' : 'inactive',
                    ];
                });

                return response()->json([
                    'data' => [
                        'data' => $data,
                        'current_page' => $stocks->currentPage(),
                        'total' => $stocks->total(),
                        'per_page' => $stocks->perPage(),
                    ]
                ]);
            } else {
                // Aggregate view
                $products = $query->orderBy('id')
                    ->paginate($request->per_page ?? 1000);

                $data = $products->getCollection()->map(function ($product) use ($aggregatedStocks) {
                    $stockData = $aggregatedStocks->get($product->id);
                    return [
                        'id' => $product->id,
                        'ma_san_pham' => $product->ma_san_pham,
                        'ten_san_pham' => $product->ten_san_pham,
                        'danh_muc_id' => $product->danh_muc_id,
                        'danh_muc_ten' => $product->danhMuc->ten_danh_muc ?? null,
                        'don_vi_tinh' => $product->don_vi_tinh,
                        'ton_kho' => $stockData ? $stockData->total_ton_kho : 0,
                        'ton_kho_toi_thieu' => $product->ton_kho_canh_bao ?? 0,
                        'gia_nhap' => $stockData ? $stockData->avg_gia_von : 0,
                        'gia_ban' => $product->gia_ban,
                        'trang_thai' => $product->is_active == 1 ? 'active' : 'inactive',
                    ];
                });

                return response()->json([
                    'data' => [
                        'data' => $data,
                        'current_page' => $products->currentPage(),
                        'total' => $products->total(),
                        'per_page' => $products->perPage(),
                    ]
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy danh sách tồn kho: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get transaction history for a product
     */
    public function transactions(Request $request, $productId)
    {
        try {
            // Get all inventory receipts containing this product
            $nhapKhoChiTiets = NhapKhoChiTiet::with(['nhapKho.chiNhanh', 'nhapKho.nguoiNhap', 'nhapKho.nhaCungCap'])
                ->where('san_pham_id', $productId)
                ->orderBy('created_at', 'desc')
                ->get();

            $transactions = $nhapKhoChiTiets->map(function ($chiTiet) {
                return [
                    'id' => $chiTiet->id,
                    'ma_phieu' => $chiTiet->nhapKho->ma_phieu ?? 'N/A',
                    'loai_giao_dich' => $chiTiet->nhapKho->loai_giao_dich ?? 'nhap',
                    'chi_nhanh' => $chiTiet->nhapKho->chiNhanh->ten_chi_nhanh ?? 'N/A',
                    'nguoi_nhap' => $chiTiet->nhapKho->nguoiNhap->name ?? 'N/A',
                    'nha_cung_cap' => $chiTiet->nhapKho->nhaCungCap->ten_ncc ?? 'N/A',
                    'ngay_nhap' => $chiTiet->nhapKho->ngay_nhap ?? null,
                    'so_luong' => $chiTiet->so_luong,
                    'don_gia' => $chiTiet->don_gia,
                    'thanh_tien' => $chiTiet->thanh_tien,
                    'ghi_chu' => $chiTiet->nhapKho->ghi_chu ?? '',
                    'created_at' => $chiTiet->created_at,
                ];
            });

            return response()->json([
                'data' => $transactions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy lịch sử giao dịch: ' . $e->getMessage()
            ], 500);
        }
    }
}
