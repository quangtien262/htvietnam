<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
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

        return $this->sendSuccessResponse($products);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_san_pham' => 'required|string|max:255',
            'gia_ban' => 'required|numeric|min:0',
            'gia_nhap' => 'nullable|numeric|min:0',
            'don_vi_tinh' => 'required|string',
        ]);

        $id = DB::table('spa_san_pham')->insertGetId([
            'ma_san_pham' => 'SP' . time() . rand(100, 999),
            'ten_san_pham' => $request->ten_san_pham,
            'danh_muc_id' => $request->danh_muc_id,
            'thuong_hieu_id' => $request->thuong_hieu_id,
            'gia_nhap' => $request->gia_nhap ?? 0,
            'gia_ban' => $request->gia_ban,
            'don_vi_tinh' => $request->don_vi_tinh,
            'ton_kho' => $request->ton_kho ?? 0,
            'ton_kho_canh_bao' => $request->ton_kho_toi_thieu ?? 10,
            'mo_ta_ngan' => $request->mo_ta,
            'hinh_anh_ids' => $request->hinh_anh,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id], 'Tạo sản phẩm thành công');
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
            'gia_nhap' => $request->gia_nhap ?? $product->gia_nhap,
            'gia_ban' => $request->gia_ban ?? $product->gia_ban,
            'don_vi_tinh' => $request->don_vi_tinh ?? $product->don_vi_tinh,
            'ton_kho_canh_bao' => $request->ton_kho_toi_thieu ?? $product->ton_kho_canh_bao,
            'mo_ta_ngan' => $request->mo_ta ?? $product->mo_ta_ngan,
            'hinh_anh_ids' => $request->hinh_anh ?? $product->hinh_anh_ids,
            'is_active' => $request->is_active ?? $product->is_active,
            'updated_at' => now(),
        ]);

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

        return $this->sendSuccessResponse($product);
    }
}
