<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LieuTrinhController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('spa_lieu_trinh as lt')
            ->leftJoin('users as kh', 'lt.khach_hang_id', '=', 'kh.id')
            ->leftJoin('spa_dich_vu as dv', 'lt.dich_vu_id', '=', 'dv.id')
            ->select(
                'lt.*',
                'kh.name as khach_hang_ten',
                'kh.phone as khach_hang_sdt',
                'dv.ten_dich_vu'
            );

        if ($request->filled('khach_hang_id')) {
            $query->where('lt.khach_hang_id', $request->khach_hang_id);
        }
        if ($request->filled('trang_thai')) {
            $query->where('lt.trang_thai', $request->trang_thai);
        }

        $treatments = $query->orderBy('lt.ngay_bat_dau', 'desc')
            ->paginate($request->per_page ?? 20);

        return $this->sendSuccessResponse($treatments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'khach_hang_id' => 'required|integer',
            'dich_vu_id' => 'required|integer',
            'so_buoi' => 'required|integer|min:1',
        ]);

        $id = DB::table('spa_lieu_trinh')->insertGetId([
            'ma_lieu_trinh' => 'LT' . now()->format('YmdHis'),
            'khach_hang_id' => $request->khach_hang_id,
            'dich_vu_id' => $request->dich_vu_id,
            'so_buoi' => $request->so_buoi,
            'so_buoi_da_thuc_hien' => 0,
            'ngay_bat_dau' => $request->ngay_bat_dau ?? now(),
            'ngay_ket_thuc' => $request->ngay_ket_thuc,
            'trang_thai' => 'dang_thuc_hien',
            'ghi_chu' => $request->ghi_chu,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id], 'Tạo liệu trình thành công');
    }

    public function update(Request $request, $id)
    {
        $data = [];
        if ($request->filled('so_buoi')) $data['so_buoi'] = $request->so_buoi;
        if ($request->filled('ngay_bat_dau')) $data['ngay_bat_dau'] = $request->ngay_bat_dau;
        if ($request->filled('ngay_ket_thuc')) $data['ngay_ket_thuc'] = $request->ngay_ket_thuc;
        if ($request->filled('trang_thai')) $data['trang_thai'] = $request->trang_thai;
        if ($request->has('ghi_chu')) $data['ghi_chu'] = $request->ghi_chu;
        $data['updated_at'] = now();

        DB::table('spa_lieu_trinh')->where('id', $id)->update($data);

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function show($id)
    {
        $treatment = DB::table('spa_lieu_trinh as lt')
            ->leftJoin('users as kh', 'lt.khach_hang_id', '=', 'kh.id')
            ->leftJoin('spa_dich_vu as dv', 'lt.dich_vu_id', '=', 'dv.id')
            ->select(
                'lt.*',
                'kh.name as khach_hang_ten',
                'kh.phone as khach_hang_sdt',
                'kh.email as khach_hang_email',
                'dv.ten_dich_vu',
                'dv.gia_dich_vu'
            )
            ->where('lt.id', $id)
            ->first();

        if (!$treatment) {
            return $this->sendErrorResponse('Không tìm thấy liệu trình', 404);
        }

        // Get treatment sessions
        $treatment->sessions = DB::table('spa_booking')
            ->where('lieu_trinh_id', $id)
            ->orderBy('ngay_hen')
            ->get();

        return $this->sendSuccessResponse($treatment);
    }

    public function destroy($id)
    {
        DB::table('spa_lieu_trinh')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }

    public function completeSession(Request $request, $id)
    {
        $treatment = DB::table('spa_lieu_trinh')->where('id', $id)->first();
        if (!$treatment) {
            return $this->sendErrorResponse('Không tìm thấy liệu trình', 404);
        }

        DB::table('spa_lieu_trinh')
            ->where('id', $id)
            ->increment('so_buoi_da_thuc_hien');

        $updated = DB::table('spa_lieu_trinh')->where('id', $id)->first();

        // Auto complete if all sessions done
        if ($updated->so_buoi_da_thuc_hien >= $updated->so_buoi) {
            DB::table('spa_lieu_trinh')
                ->where('id', $id)
                ->update(['trang_thai' => 'hoan_thanh']);
        }

        return $this->sendSuccessResponse(null, 'Cập nhật buổi điều trị thành công');
    }

    public function cancel($id)
    {
        DB::table('spa_lieu_trinh')
            ->where('id', $id)
            ->update([
                'trang_thai' => 'da_huy',
                'updated_at' => now(),
            ]);

        return $this->sendSuccessResponse(null, 'Hủy liệu trình thành công');
    }
}
