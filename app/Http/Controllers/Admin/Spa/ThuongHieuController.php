<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ThuongHieuController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('spa_thuong_hieu')
            ->select('id', 'ten_thuong_hieu', 'color', 'sort_order', 'logo', 'xuat_xu', 'mo_ta', 'note', 'is_active', 'created_by', 'created_at', 'updated_at');

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where('ten_thuong_hieu', 'like', $search);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Order by sort_order asc, then by name
        $brands = $query->orderBy('sort_order', 'asc')
                        ->orderBy('ten_thuong_hieu', 'asc')
                        ->get();

        return $this->sendSuccessResponse($brands);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_thuong_hieu' => 'required|string|max:255',
        ]);

        $id = DB::table('spa_thuong_hieu')->insertGetId([
            'ten_thuong_hieu' => $request->ten_thuong_hieu,
            'color' => $request->color,
            'sort_order' => $request->sort_order ?? 0,
            'mo_ta' => $request->mo_ta,
            'note' => $request->note,
            'logo' => $request->logo,
            'xuat_xu' => $request->xuat_xu,
            'is_active' => $request->is_active ?? true,
            'created_by' => auth()->id(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id], 'Tạo thương hiệu thành công');
    }

    public function update(Request $request, $id)
    {
        $brand = DB::table('spa_thuong_hieu')->where('id', $id)->first();
        if (!$brand) {
            return $this->sendErrorResponse('Không tìm thấy thương hiệu', 404);
        }

        $data = [];
        if ($request->filled('ten_thuong_hieu')) $data['ten_thuong_hieu'] = $request->ten_thuong_hieu;
        if ($request->has('color')) $data['color'] = $request->color;
        if ($request->has('sort_order')) $data['sort_order'] = $request->sort_order;
        if ($request->has('mo_ta')) $data['mo_ta'] = $request->mo_ta;
        if ($request->has('note')) $data['note'] = $request->note;
        if ($request->has('logo')) $data['logo'] = $request->logo;
        if ($request->has('xuat_xu')) $data['xuat_xu'] = $request->xuat_xu;
        if ($request->has('is_active')) $data['is_active'] = $request->is_active;
        $data['updated_at'] = now();

        DB::table('spa_thuong_hieu')->where('id', $id)->update($data);

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function destroy($id)
    {
        // Check if brand has products
        $productCount = DB::table('spa_san_pham')->where('thuong_hieu_id', $id)->count();
        if ($productCount > 0) {
            return $this->sendErrorResponse('Không thể xóa thương hiệu đang có sản phẩm', 400);
        }

        DB::table('spa_thuong_hieu')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }

    public function show($id)
    {
        $brand = DB::table('spa_thuong_hieu')->where('id', $id)->first();
        if (!$brand) {
            return $this->sendErrorResponse('Không tìm thấy thương hiệu', 404);
        }

        // Count products of this brand
        $brand->product_count = DB::table('spa_san_pham')
            ->where('thuong_hieu_id', $id)
            ->count();

        return $this->sendSuccessResponse($brand);
    }
}
