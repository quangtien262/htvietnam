<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PhongController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('spa_phong as p')
            ->leftJoin('spa_chi_nhanh as cn', 'p.chi_nhanh_id', '=', 'cn.id')
            ->select('p.*', 'cn.ten_chi_nhanh');

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('p.ten_phong', 'like', "%{$search}%")
                  ->orWhere('p.ma_phong', 'like', "%{$search}%")
                  ->orWhere('cn.ten_chi_nhanh', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($request->filled('chi_nhanh_id')) {
            $query->where('p.chi_nhanh_id', $request->chi_nhanh_id);
        }
        if ($request->filled('loai_phong')) {
            $query->where('p.loai_phong', $request->loai_phong);
        }
        if ($request->filled('trang_thai')) {
            $query->where('p.trang_thai', $request->trang_thai);
        }

        $query->orderBy('p.ten_phong');

        // Pagination
        if ($request->has('limit')) {
            $limit = $request->limit;
            $page = $request->page ?? 1;
            $offset = ($page - 1) * $limit;

            $total = $query->count();
            $rooms = $query->offset($offset)->limit($limit)->get();

            return $this->sendSuccessResponse([
                'data' => $rooms,
                'total' => $total,
                'current_page' => (int)$page,
                'per_page' => (int)$limit,
            ]);
        }

        // Without pagination
        $rooms = $query->get();

        return $this->sendSuccessResponse($rooms);
    }

    public function store(Request $request)
    {
        $request->validate([
            'chi_nhanh_id' => 'required|integer',
            'ten_phong' => 'required|string|max:255',
        ]);

        $id = DB::table('spa_phong')->insertGetId([
            'chi_nhanh_id' => $request->chi_nhanh_id,
            'ma_phong' => $request->ma_phong ?? 'P' . now()->format('YmdHis'),
            'ten_phong' => $request->ten_phong,
            'loai_phong' => $request->loai_phong ?? 'single',
            'suc_chua' => $request->suc_chua ?? 1,
            'trang_thai' => 'san_sang',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id], 'Tạo phòng thành công');
    }

    public function update(Request $request, $id)
    {
        $data = [];
        if ($request->filled('ten_phong')) $data['ten_phong'] = $request->ten_phong;
        if ($request->filled('loai_phong')) $data['loai_phong'] = $request->loai_phong;
        if ($request->filled('suc_chua')) $data['suc_chua'] = $request->suc_chua;
        if ($request->filled('trang_thai')) $data['trang_thai'] = $request->trang_thai;
        $data['updated_at'] = now();

        DB::table('spa_phong')->where('id', $id)->update($data);

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function show($id)
    {
        $room = DB::table('spa_phong as p')
            ->leftJoin('spa_chi_nhanh as cn', 'p.chi_nhanh_id', '=', 'cn.id')
            ->select('p.*', 'cn.ten_chi_nhanh', 'cn.dia_chi as chi_nhanh_dia_chi')
            ->where('p.id', $id)
            ->first();

        if (!$room) {
            return $this->sendErrorResponse('Không tìm thấy phòng', 404);
        }

        return $this->sendSuccessResponse($room);
    }

    public function destroy($id)
    {
        DB::table('spa_phong')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }

    public function available(Request $request)
    {
        $date = $request->ngay ?? now()->toDateString();
        $time = $request->gio ?? now()->format('H:i');

        // Get rooms not in use at specified time
        $rooms = DB::table('spa_phong as p')
            ->leftJoin('spa_chi_nhanh as cn', 'p.chi_nhanh_id', '=', 'cn.id')
            ->select('p.*', 'cn.ten_chi_nhanh')
            ->where('p.trang_thai', 'san_sang')
            ->whereNotIn('p.id', function($query) use ($date, $time) {
                $query->select('phong_id')
                    ->from('spa_booking')
                    ->whereDate('ngay_hen', $date)
                    ->where('gio_bat_dau', '<=', $time)
                    ->where('gio_ket_thuc', '>=', $time)
                    ->whereIn('trang_thai', ['da_xac_nhan', 'dang_thuc_hien']);
            })
            ->get();

        return $this->sendSuccessResponse($rooms);
    }
}
