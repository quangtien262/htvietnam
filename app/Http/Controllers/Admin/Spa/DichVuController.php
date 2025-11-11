<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DichVuController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('spa_dich_vu')
            ->leftJoin('spa_danh_muc_dich_vu', 'spa_dich_vu.danh_muc_id', '=', 'spa_danh_muc_dich_vu.id')
            ->select(
                'spa_dich_vu.*', 
                'spa_danh_muc_dich_vu.ten_danh_muc as danh_muc_ten'
            );

        // Filter by status
        if ($request->has('trang_thai')) {
            $query->where('spa_dich_vu.trang_thai', $request->trang_thai);
        }

        // Filter by category
        if ($request->has('danh_muc_id')) {
            $query->where('spa_dich_vu.danh_muc_id', $request->danh_muc_id);
        }

        // Search by name or code
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('spa_dich_vu.ten_dich_vu', 'like', "%{$search}%")
                  ->orWhere('spa_dich_vu.ma_dich_vu', 'like', "%{$search}%");
            });
        }

        $services = $query->paginate($request->get('per_page', 20));

        return $this->sendSuccessResponse($services);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_dich_vu' => 'required|string|max:255',
            'gia' => 'required|numeric|min:0',
        ]);

        $id = DB::table('spa_dich_vu')->insertGetId([
            'ma_dich_vu' => 'DV' . time(),
            'ten_dich_vu' => $request->ten_dich_vu,
            'danh_muc_id' => $request->danh_muc_id,
            'gia' => $request->gia,
            'thoi_luong' => $request->thoi_luong ?? 60,
            'mo_ta' => $request->mo_ta,
            'trang_thai' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id], 'Tạo dịch vụ thành công');
    }

    public function update(Request $request, $id)
    {
        DB::table('spa_dich_vu')->where('id', $id)->update([
            'ten_dich_vu' => $request->ten_dich_vu,
            'danh_muc_id' => $request->danh_muc_id,
            'gia' => $request->gia,
            'thoi_luong' => $request->thoi_luong,
            'mo_ta' => $request->mo_ta,
            'trang_thai' => $request->trang_thai,
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function destroy($id)
    {
        DB::table('spa_dich_vu')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }

    public function show($id)
    {
        $service = DB::table('spa_dich_vu')->where('id', $id)->first();
        return $this->sendSuccessResponse($service);
    }
}
