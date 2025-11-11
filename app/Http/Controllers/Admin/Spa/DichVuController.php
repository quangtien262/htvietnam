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
        if ($request->has('is_active')) {
            $query->where('spa_dich_vu.is_active', $request->is_active);
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
            'gia_ban' => $request->gia ?? 0,
            'thoi_gian_thuc_hien' => $request->thoi_luong ?? 60,
            'mo_ta' => $request->mo_ta,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id], 'Tạo dịch vụ thành công');
    }

    public function update(Request $request, $id)
    {
        $updateData = [];
        
        if ($request->has('ten_dich_vu')) {
            $updateData['ten_dich_vu'] = $request->ten_dich_vu;
        }
        if ($request->has('danh_muc_id')) {
            $updateData['danh_muc_id'] = $request->danh_muc_id;
        }
        if ($request->has('gia')) {
            $updateData['gia_ban'] = $request->gia;
        }
        if ($request->has('thoi_luong')) {
            $updateData['thoi_gian_thuc_hien'] = $request->thoi_luong;
        }
        if ($request->has('mo_ta')) {
            $updateData['mo_ta'] = $request->mo_ta;
        }
        if ($request->has('is_active')) {
            $updateData['is_active'] = $request->is_active;
        }
        
        $updateData['updated_at'] = now();

        DB::table('spa_dich_vu')->where('id', $id)->update($updateData);

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
