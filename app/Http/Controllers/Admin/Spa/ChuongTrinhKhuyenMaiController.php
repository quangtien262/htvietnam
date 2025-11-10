<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChuongTrinhKhuyenMaiController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('spa_chuong_trinh_khuyen_mai')->select('*');

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->trang_thai);
        }
        if ($request->filled('dang_hieu_luc')) {
            $now = now();
            $query->where('ngay_bat_dau', '<=', $now)
                  ->where('ngay_ket_thuc', '>=', $now)
                  ->where('trang_thai', 'active');
        }

        $promotions = $query->orderBy('ngay_bat_dau', 'desc')
            ->paginate($request->per_page ?? 20);

        return $this->sendSuccessResponse($promotions);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_chuong_trinh' => 'required|string|max:255',
            'ngay_bat_dau' => 'required|date',
            'ngay_ket_thuc' => 'required|date|after:ngay_bat_dau',
        ]);

        $id = DB::table('spa_chuong_trinh_khuyen_mai')->insertGetId([
            'ma_chuong_trinh' => 'KM' . now()->format('YmdHis'),
            'ten_chuong_trinh' => $request->ten_chuong_trinh,
            'mo_ta' => $request->mo_ta,
            'loai_khuyen_mai' => $request->loai_khuyen_mai ?? 'giam_gia',
            'gia_tri_khuyen_mai' => $request->gia_tri_khuyen_mai,
            'don_hang_toi_thieu' => $request->don_hang_toi_thieu ?? 0,
            'giam_toi_da' => $request->giam_toi_da,
            'ngay_bat_dau' => $request->ngay_bat_dau,
            'ngay_ket_thuc' => $request->ngay_ket_thuc,
            'trang_thai' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id], 'Tạo chương trình khuyến mãi thành công');
    }

    public function update(Request $request, $id)
    {
        $data = [];
        if ($request->filled('ten_chuong_trinh')) $data['ten_chuong_trinh'] = $request->ten_chuong_trinh;
        if ($request->has('mo_ta')) $data['mo_ta'] = $request->mo_ta;
        if ($request->filled('gia_tri_khuyen_mai')) $data['gia_tri_khuyen_mai'] = $request->gia_tri_khuyen_mai;
        if ($request->has('don_hang_toi_thieu')) $data['don_hang_toi_thieu'] = $request->don_hang_toi_thieu;
        if ($request->has('giam_toi_da')) $data['giam_toi_da'] = $request->giam_toi_da;
        if ($request->filled('ngay_bat_dau')) $data['ngay_bat_dau'] = $request->ngay_bat_dau;
        if ($request->filled('ngay_ket_thuc')) $data['ngay_ket_thuc'] = $request->ngay_ket_thuc;
        if ($request->filled('trang_thai')) $data['trang_thai'] = $request->trang_thai;
        $data['updated_at'] = now();

        DB::table('spa_chuong_trinh_khuyen_mai')->where('id', $id)->update($data);

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function destroy($id)
    {
        DB::table('spa_chuong_trinh_khuyen_mai')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }

    public function show($id)
    {
        $promotion = DB::table('spa_chuong_trinh_khuyen_mai')->where('id', $id)->first();
        if (!$promotion) {
            return $this->sendErrorResponse('Không tìm thấy chương trình', 404);
        }

        // Usage statistics
        $promotion->used_count = DB::table('spa_hoa_don')
            ->where('khuyen_mai_id', $id)
            ->count();

        $promotion->total_discount = DB::table('spa_hoa_don')
            ->where('khuyen_mai_id', $id)
            ->sum('giam_gia');

        return $this->sendSuccessResponse($promotion);
    }

    public function activate($id)
    {
        DB::table('spa_chuong_trinh_khuyen_mai')
            ->where('id', $id)
            ->update(['trang_thai' => 'active', 'updated_at' => now()]);

        return $this->sendSuccessResponse(null, 'Kích hoạt thành công');
    }

    public function deactivate($id)
    {
        DB::table('spa_chuong_trinh_khuyen_mai')
            ->where('id', $id)
            ->update(['trang_thai' => 'inactive', 'updated_at' => now()]);

        return $this->sendSuccessResponse(null, 'Vô hiệu hóa thành công');
    }
}