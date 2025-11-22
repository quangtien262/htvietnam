<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\SanPhamDonViQuiDoi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SanPhamController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('spa_san_pham')
            ->leftJoin('spa_danh_muc_san_pham', 'spa_san_pham.danh_muc_id', '=', 'spa_danh_muc_san_pham.id')
            ->leftJoin('spa_thuong_hieu', 'spa_san_pham.thuong_hieu_id', '=', 'spa_thuong_hieu.id')
            ->select(
                'spa_san_pham.*',
                'spa_danh_muc_san_pham.ten_danh_muc as danh_muc_ten',
                'spa_thuong_hieu.ten_thuong_hieu'
            );

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('spa_san_pham.is_active', $request->is_active);
        }

        // Filter by category
        if ($request->has('danh_muc_id') && $request->danh_muc_id) {
            $query->where('spa_san_pham.danh_muc_id', $request->danh_muc_id);
        }

        // Search by name or code
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('spa_san_pham.ten_san_pham', 'like', "%{$search}%")
                  ->orWhere('spa_san_pham.ma_san_pham', 'like', "%{$search}%");
            });
        }

        $products = $query->orderBy('spa_san_pham.created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        // Load conversion units for each product
        $products->getCollection()->transform(function($product) {
            $product->don_vi_quy_doi = SanPhamDonViQuiDoi::where('san_pham_id', $product->id)
                ->where('is_active', 1)
                ->get()
                ->toArray();
            return $product;
        });

        return response()->json([
            'status_code' => 200,
            'message' => 'Lấy danh sách sản phẩm thành công',
            'data' => $products
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_san_pham' => 'required|string|max:255',
            'gia_ban' => 'required|numeric|min:0',
            'gia_nhap' => 'nullable|numeric|min:0',
            'don_vi_tinh' => 'required|string',
        ]);

        // Create product first to get ID
        $id = DB::table('spa_san_pham')->insertGetId([
            'ma_san_pham' => 'TEMP_' . time(), // Temporary code
            'ten_san_pham' => $request->ten_san_pham,
            'danh_muc_id' => $request->danh_muc_id,
            'thuong_hieu_id' => $request->thuong_hieu_id,
            'xuat_xu' => $request->xuat_xu,
            'gia_nhap' => $request->gia_nhap ?? 0,
            'gia_ban' => $request->gia_ban,
            'price_member' => $request->price_member,
            'don_vi_tinh' => $request->don_vi_tinh,
            'ton_kho' => $request->ton_kho ?? 0,
            'ton_kho_canh_bao' => $request->ton_kho_toi_thieu ?? 10,
            'mo_ta_ngan' => $request->mo_ta,
            'hinh_anh_ids' => $request->hinh_anh,
            'ngay_het_han' => $request->han_su_dung,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Generate ma_san_pham based on ID if not provided
        $maSanPham = $request->ma_san_pham;
        if (empty($maSanPham)) {
            $maSanPham = 'SP' . str_pad($id, 5, '0', STR_PAD_LEFT);
        }

        // Update with proper ma_san_pham
        DB::table('spa_san_pham')->where('id', $id)->update([
            'ma_san_pham' => $maSanPham,
            'updated_at' => now(),
        ]);

        // Save conversion units if provided
        if ($request->has('don_vi_quy_doi') && is_array($request->don_vi_quy_doi)) {
            foreach ($request->don_vi_quy_doi as $conversion) {
                if (!empty($conversion['don_vi']) && !empty($conversion['ty_le'])) {
                    SanPhamDonViQuiDoi::create([
                        'san_pham_id' => $id,
                        'don_vi' => $conversion['don_vi'],
                        'ty_le' => $conversion['ty_le'],
                        'ghi_chu' => $conversion['ghi_chu'] ?? null,
                        'is_active' => 1,
                    ]);
                }
            }
        }

        return $this->sendSuccessResponse(['id' => $id, 'ma_san_pham' => $maSanPham], 'Tạo sản phẩm thành công');
    }

    public function update(Request $request, $id)
    {
        $product = DB::table('spa_san_pham')->where('id', $id)->first();
        if (!$product) {
            return $this->sendErrorResponse('Không tìm thấy sản phẩm', 404);
        }

        DB::table('spa_san_pham')->where('id', $id)->update([
            'ten_san_pham' => $request->ten_san_pham ?? $product->ten_san_pham,
            'danh_muc_id' => $request->danh_muc_id ?? $product->danh_muc_id,
            'thuong_hieu_id' => $request->thuong_hieu_id ?? $product->thuong_hieu_id,
            'xuat_xu' => $request->xuat_xu ?? $product->xuat_xu,
            'gia_nhap' => $request->gia_nhap ?? $product->gia_nhap,
            'gia_ban' => $request->gia_ban ?? $product->gia_ban,
            'price_member' => $request->has('price_member') ? $request->price_member : $product->price_member,
            'don_vi_tinh' => $request->don_vi_tinh ?? $product->don_vi_tinh,
            'ton_kho_canh_bao' => $request->ton_kho_toi_thieu ?? $product->ton_kho_canh_bao,
            'mo_ta_ngan' => $request->mo_ta ?? $product->mo_ta_ngan,
            'hinh_anh_ids' => $request->hinh_anh ?? $product->hinh_anh_ids,
            'ngay_het_han' => $request->han_su_dung ?? $product->ngay_het_han,
            'is_active' => $request->is_active ?? $product->is_active,
            'updated_at' => now(),
        ]);

        // Update conversion units if provided
        if ($request->has('don_vi_quy_doi')) {
            // Delete old conversion units
            SanPhamDonViQuiDoi::where('san_pham_id', $id)->delete();

            // Create new conversion units
            if (is_array($request->don_vi_quy_doi)) {
                foreach ($request->don_vi_quy_doi as $conversion) {
                    if (!empty($conversion['don_vi']) && !empty($conversion['ty_le'])) {
                        SanPhamDonViQuiDoi::create([
                            'san_pham_id' => $id,
                            'don_vi' => $conversion['don_vi'],
                            'ty_le' => $conversion['ty_le'],
                            'ghi_chu' => $conversion['ghi_chu'] ?? null,
                            'is_active' => 1,
                        ]);
                    }
                }
            }
        }

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function destroy($id)
    {
        DB::table('spa_san_pham')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }

    public function show($id)
    {
        $product = DB::table('spa_san_pham')
            ->leftJoin('spa_danh_muc_san_pham', 'spa_san_pham.danh_muc_id', '=', 'spa_danh_muc_san_pham.id')
            ->leftJoin('spa_thuong_hieu', 'spa_san_pham.thuong_hieu_id', '=', 'spa_thuong_hieu.id')
            ->where('spa_san_pham.id', $id)
            ->select(
                'spa_san_pham.*',
                'spa_danh_muc_san_pham.ten_danh_muc',
                'spa_thuong_hieu.ten_thuong_hieu'
            )
            ->first();

        // Load conversion units
        if ($product) {
            $product->don_vi_quy_doi = SanPhamDonViQuiDoi::where('san_pham_id', $id)
                ->where('is_active', 1)
                ->get()
                ->toArray();
        }

        return $this->sendSuccessResponse($product);
    }
}
