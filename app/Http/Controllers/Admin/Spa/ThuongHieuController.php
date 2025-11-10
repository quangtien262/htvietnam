<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ThuongHieuController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('spa_thuong_hieu')->select('*');

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function($q) use ($search) {
                $q->where('ten_thuong_hieu', 'like', $search)
                  ->orWhere('ma_thuong_hieu', 'like', $search);
            });
        }

        $brands = $query->orderBy('ten_thuong_hieu')->get();

        return $this->sendSuccessResponse($brands);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_thuong_hieu' => 'required|string|max:255',
        ]);

        $id = DB::table('spa_thuong_hieu')->insertGetId([
            'ma_thuong_hieu' => $request->ma_thuong_hieu ?? 'TH' . now()->format('YmdHis'),
            'ten_thuong_hieu' => $request->ten_thuong_hieu,
            'mo_ta' => $request->mo_ta,
            'logo' => $request->logo,
            'website' => $request->website,
            'email' => $request->email,
            'sdt' => $request->sdt,
            'dia_chi' => $request->dia_chi,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id], 'Tạo thương hiệu thành công');
    }

    public function update(Request $request, $id)
    {
        $data = [];
        if ($request->filled('ma_thuong_hieu')) $data['ma_thuong_hieu'] = $request->ma_thuong_hieu;
        if ($request->filled('ten_thuong_hieu')) $data['ten_thuong_hieu'] = $request->ten_thuong_hieu;
        if ($request->has('mo_ta')) $data['mo_ta'] = $request->mo_ta;
        if ($request->has('logo')) $data['logo'] = $request->logo;
        if ($request->has('website')) $data['website'] = $request->website;
        if ($request->has('email')) $data['email'] = $request->email;
        if ($request->has('sdt')) $data['sdt'] = $request->sdt;
        if ($request->has('dia_chi')) $data['dia_chi'] = $request->dia_chi;
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
