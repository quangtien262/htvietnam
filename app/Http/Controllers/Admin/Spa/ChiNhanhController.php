<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChiNhanhController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('spa_chi_nhanh')->select('*');

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('ten_chi_nhanh', 'like', "%{$search}%")
                  ->orWhere('ma_chi_nhanh', 'like', "%{$search}%")
                  ->orWhere('dia_chi', 'like', "%{$search}%")
                  ->orWhere('sdt', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('trang_thai')) {
            $query->where('trang_thai', $request->trang_thai);
        }

        $query->orderBy('ten_chi_nhanh');

        // Pagination
        if ($request->has('limit')) {
            $limit = $request->limit;
            $page = $request->page ?? 1;
            $offset = ($page - 1) * $limit;

            $total = $query->count();
            $branches = $query->offset($offset)->limit($limit)->get();

            // Add room count for each branch
            foreach ($branches as $branch) {
                $branch->room_count = DB::table('spa_phong')
                    ->where('chi_nhanh_id', $branch->id)
                    ->count();
            }

            return $this->sendSuccessResponse([
                'data' => $branches,
                'total' => $total,
                'current_page' => (int)$page,
                'per_page' => (int)$limit,
            ]);
        }

        // Without pagination
        $branches = $query->get();

        // Add room count for each branch
        foreach ($branches as $branch) {
            $branch->room_count = DB::table('spa_phong')
                ->where('chi_nhanh_id', $branch->id)
                ->count();
        }

        return $this->sendSuccessResponse($branches);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_chi_nhanh' => 'required|string|max:255',
            'dia_chi' => 'required|string',
            'sdt' => 'required|string',
        ]);

        $id = DB::table('spa_chi_nhanh')->insertGetId([
            'ma_chi_nhanh' => $request->ma_chi_nhanh ?? 'CN' . now()->format('YmdHis'),
            'ten_chi_nhanh' => $request->ten_chi_nhanh,
            'dia_chi' => $request->dia_chi,
            'thanh_pho' => $request->thanh_pho,
            'sdt' => $request->so_dien_thoai,
            'email' => $request->email,
            'gio_mo_cua' => $request->gio_mo_cua ?? '08:00',
            'gio_dong_cua' => $request->gio_dong_cua ?? '22:00',
            'trang_thai' => $request->trang_thai ?? 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id], 'Tạo chi nhánh thành công');
    }

    public function update(Request $request, $id)
    {
        $data = [];

        // Update all fields sent from frontend
        if ($request->filled('ten_chi_nhanh')) $data['ten_chi_nhanh'] = $request->ten_chi_nhanh;
        if ($request->filled('dia_chi')) $data['dia_chi'] = $request->dia_chi;
        if ($request->filled('thanh_pho')) $data['thanh_pho'] = $request->thanh_pho;
        if ($request->filled('so_dien_thoai')) $data['sdt'] = $request->so_dien_thoai;
        if ($request->has('email')) $data['email'] = $request->email;
        if ($request->has('gio_mo_cua')) $data['gio_mo_cua'] = $request->gio_mo_cua;
        if ($request->has('gio_dong_cua')) $data['gio_dong_cua'] = $request->gio_dong_cua;
        if ($request->has('trang_thai')) $data['trang_thai'] = $request->trang_thai;

        $data['updated_at'] = now();

        DB::table('spa_chi_nhanh')->where('id', $id)->update($data);

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function show($id)
    {
        $branch = DB::table('spa_chi_nhanh')->where('id', $id)->first();
        if (!$branch) {
            return $this->sendErrorResponse('Không tìm thấy chi nhánh', 404);
        }

        // Get rooms
        $branch->rooms = DB::table('spa_phong')
            ->where('chi_nhanh_id', $id)
            ->get();

        return $this->sendSuccessResponse($branch);
    }

    public function destroy($id)
    {
        // Check if branch has rooms
        $roomCount = DB::table('spa_phong')->where('chi_nhanh_id', $id)->count();
        if ($roomCount > 0) {
            return $this->sendErrorResponse('Không thể xóa chi nhánh đang có phòng', 400);
        }

        DB::table('spa_chi_nhanh')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }
}
