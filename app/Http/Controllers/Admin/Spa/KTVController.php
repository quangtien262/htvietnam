<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KTVController extends Controller
{
    public function index(Request $request)
    {
        $ktvs = DB::table('spa_ktv')
            ->leftJoin('admin_users', 'spa_ktv.admin_user_id', '=', 'admin_users.id')
            ->select('spa_ktv.*', 'admin_users.name', 'admin_users.phone', 'admin_users.email')
            ->paginate($request->get('per_page', 20));

        return $this->sendSuccessResponse($ktvs);
    }

    public function store(Request $request)
    {
        $request->validate([
            'admin_user_id' => 'required|exists:admin_users,id',
            'chuyen_mon' => 'required|array',
        ]);

        $id = DB::table('spa_ktv')->insertGetId([
            'admin_user_id' => $request->admin_user_id,
            'chuyen_mon' => json_encode($request->chuyen_mon),
            'ty_le_hoa_hong' => $request->ty_le_hoa_hong ?? 0,
            'trang_thai' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id], 'Tạo KTV thành công');
    }

    public function update(Request $request, $id)
    {
        DB::table('spa_ktv')->where('id', $id)->update([
            'chuyen_mon' => json_encode($request->chuyen_mon),
            'ty_le_hoa_hong' => $request->ty_le_hoa_hong,
            'trang_thai' => $request->trang_thai,
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function destroy($id)
    {
        DB::table('spa_ktv')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }

    public function schedule(Request $request, $id)
    {
        // Placeholder for schedule management
        return $this->sendSuccessResponse([]);
    }

    public function updateSchedule(Request $request, $id)
    {
        // Placeholder for updating schedule
        return $this->sendSuccessResponse(null, 'Cập nhật lịch thành công');
    }

    public function commissions(Request $request, $id)
    {
        // Placeholder for commissions
        return $this->sendSuccessResponse([]);
    }

    public function leaveRequests(Request $request, $id)
    {
        // Placeholder for leave requests
        return $this->sendSuccessResponse([]);
    }
}
