<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChiNhanhController extends Controller
{
    public function index(Request $request)
    {
        $branches = DB::table('spa_chi_nhanh')
            ->select('*')
            ->orderBy('ten_chi_nhanh')
            ->get();

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
            'sdt' => $request->sdt,
            'email' => $request->email,
            'gio_mo_cua' => $request->gio_mo_cua ?? '08:00',
            'gio_dong_cua' => $request->gio_dong_cua ?? '22:00',
            'trang_thai' => 'hoat_dong',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id], 'Tạo chi nhánh thành công');
    }

    public function update(Request $request, $id)
    {
        $data = [];
        if ($request->filled('ten_chi_nhanh')) $data['ten_chi_nhanh'] = $request->ten_chi_nhanh;
        if ($request->filled('dia_chi')) $data['dia_chi'] = $request->dia_chi;
        if ($request->filled('sdt')) $data['sdt'] = $request->sdt;
        if ($request->has('email')) $data['email'] = $request->email;
        if ($request->has('gio_mo_cua')) $data['gio_mo_cua'] = $request->gio_mo_cua;
        if ($request->has('gio_dong_cua')) $data['gio_dong_cua'] = $request->gio_dong_cua;
        if ($request->filled('trang_thai')) $data['trang_thai'] = $request->trang_thai;
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
