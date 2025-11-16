<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DanhMucSanPhamController extends Controller
{
    public function index(Request $request)
    {
        $categories = DB::table('spa_danh_muc_san_pham')
            ->select('*')
            ->orderBy('thu_tu')
            ->get();

        return $this->sendSuccessResponse($categories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_danh_muc' => 'required|string|max:255',
        ]);

        $id = DB::table('spa_danh_muc_san_pham')->insertGetId([
            'ten_danh_muc' => $request->ten_danh_muc,
            'thu_tu' => $request->thu_tu ?? 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $category = DB::table('spa_danh_muc_san_pham')->where('id', $id)->first();
        return $this->sendSuccessResponse($category, 'Tạo danh mục thành công');
    }

    public function update(Request $request, $id)
    {
        DB::table('spa_danh_muc_san_pham')->where('id', $id)->update([
            'ten_danh_muc' => $request->ten_danh_muc,
            'thu_tu' => $request->thu_tu,
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function destroy($id)
    {
        // Check if category has products
        $productCount = DB::table('spa_san_pham')->where('danh_muc_id', $id)->count();
        if ($productCount > 0) {
            return $this->sendErrorResponse('Không thể xóa danh mục đang có sản phẩm', 400);
        }

        DB::table('spa_danh_muc_san_pham')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }

    public function show($id)
    {
        $category = DB::table('spa_danh_muc_san_pham')->where('id', $id)->first();
        if (!$category) {
            return $this->sendErrorResponse('Không tìm thấy danh mục', 404);
        }

        // Count products in category
        $category->product_count = DB::table('spa_san_pham')
            ->where('danh_muc_id', $id)
            ->count();

        return $this->sendSuccessResponse($category);
    }
}
