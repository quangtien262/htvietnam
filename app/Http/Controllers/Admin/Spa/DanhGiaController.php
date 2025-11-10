<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DanhGiaController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('spa_danh_gia as dg')
            ->leftJoin('users as kh', 'dg.khach_hang_id', '=', 'kh.id')
            ->leftJoin('spa_dich_vu as dv', 'dg.dich_vu_id', '=', 'dv.id')
            ->leftJoin('spa_ktv as ktv', 'dg.ktv_id', '=', 'ktv.id')
            ->select(
                'dg.*',
                'kh.name as khach_hang_ten',
                'dv.ten_dich_vu',
                'ktv.ten_ktv'
            );

        if ($request->filled('khach_hang_id')) {
            $query->where('dg.khach_hang_id', $request->khach_hang_id);
        }
        if ($request->filled('dich_vu_id')) {
            $query->where('dg.dich_vu_id', $request->dich_vu_id);
        }
        if ($request->filled('ktv_id')) {
            $query->where('dg.ktv_id', $request->ktv_id);
        }
        if ($request->filled('diem_danh_gia')) {
            $query->where('dg.diem_danh_gia', $request->diem_danh_gia);
        }

        $reviews = $query->orderBy('dg.created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return $this->sendSuccessResponse($reviews);
    }

    public function store(Request $request)
    {
        $request->validate([
            'khach_hang_id' => 'required|integer',
            'booking_id' => 'required|integer',
            'diem_danh_gia' => 'required|integer|min:1|max:5',
        ]);

        $id = DB::table('spa_danh_gia')->insertGetId([
            'khach_hang_id' => $request->khach_hang_id,
            'booking_id' => $request->booking_id,
            'dich_vu_id' => $request->dich_vu_id,
            'ktv_id' => $request->ktv_id,
            'diem_danh_gia' => $request->diem_danh_gia,
            'noi_dung' => $request->noi_dung,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Update service rating
        if ($request->dich_vu_id) {
            $this->updateServiceRating($request->dich_vu_id);
        }

        // Update KTV rating
        if ($request->ktv_id) {
            $this->updateKTVRating($request->ktv_id);
        }

        return $this->sendSuccessResponse(['id' => $id], 'Gửi đánh giá thành công');
    }

    public function update(Request $request, $id)
    {
        $data = [];
        if ($request->filled('diem_danh_gia')) $data['diem_danh_gia'] = $request->diem_danh_gia;
        if ($request->has('noi_dung')) $data['noi_dung'] = $request->noi_dung;
        $data['updated_at'] = now();

        DB::table('spa_danh_gia')->where('id', $id)->update($data);

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function show($id)
    {
        $review = DB::table('spa_danh_gia as dg')
            ->leftJoin('users as kh', 'dg.khach_hang_id', '=', 'kh.id')
            ->leftJoin('spa_dich_vu as dv', 'dg.dich_vu_id', '=', 'dv.id')
            ->leftJoin('spa_ktv as ktv', 'dg.ktv_id', '=', 'ktv.id')
            ->select(
                'dg.*',
                'kh.name as khach_hang_ten',
                'kh.phone as khach_hang_sdt',
                'dv.ten_dich_vu',
                'ktv.ten_ktv'
            )
            ->where('dg.id', $id)
            ->first();

        if (!$review) {
            return $this->sendErrorResponse('Không tìm thấy đánh giá', 404);
        }

        return $this->sendSuccessResponse($review);
    }

    public function destroy($id)
    {
        $review = DB::table('spa_danh_gia')->where('id', $id)->first();
        if (!$review) {
            return $this->sendErrorResponse('Không tìm thấy đánh giá', 404);
        }

        DB::table('spa_danh_gia')->where('id', $id)->delete();

        // Recalculate ratings
        if ($review->dich_vu_id) {
            $this->updateServiceRating($review->dich_vu_id);
        }
        if ($review->ktv_id) {
            $this->updateKTVRating($review->ktv_id);
        }

        return $this->sendSuccessResponse(null, 'Xóa đánh giá thành công');
    }

    private function updateServiceRating($dich_vu_id)
    {
        $avg = DB::table('spa_danh_gia')
            ->where('dich_vu_id', $dich_vu_id)
            ->avg('diem_danh_gia');

        DB::table('spa_dich_vu')
            ->where('id', $dich_vu_id)
            ->update(['diem_danh_gia' => round($avg, 2)]);
    }

    private function updateKTVRating($ktv_id)
    {
        $avg = DB::table('spa_danh_gia')
            ->where('ktv_id', $ktv_id)
            ->avg('diem_danh_gia');

        DB::table('spa_ktv')
            ->where('id', $ktv_id)
            ->update(['diem_danh_gia' => round($avg, 2)]);
    }
}
