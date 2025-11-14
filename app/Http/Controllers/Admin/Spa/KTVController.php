<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KTVController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('admin_users')
            ->select(
                'admin_users.id',
                'admin_users.name as ho_ten',
                'admin_users.phone as so_dien_thoai',
                'admin_users.email',
                'admin_users.avatar as hinh_anh',
                'admin_users.status as trang_thai',
                'admin_users.created_at',
                DB::raw("'' as ma_nhan_vien"),
                DB::raw("'' as gioi_tinh"),
                DB::raw("null as ngay_sinh"),
                DB::raw("'' as dia_chi"),
                DB::raw("null as chi_nhanh_id"),
                DB::raw("'Nhân viên' as chuc_vu"),
                DB::raw("'' as chuyen_mon"),
                DB::raw("0 as kinh_nghiem_nam"),
                DB::raw("0 as luong_co_ban"),
                DB::raw("0 as ty_le_hoa_hong"),
                DB::raw("0 as rating"),
                DB::raw("0 as so_gio_lam_viec"),
                DB::raw("0 as so_khach_hang_phuc_vu"),
                DB::raw("0 as doanh_thu"),
                DB::raw("0 as tong_hoa_hong")
            );

        // Filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('admin_users.name', 'like', "%{$search}%")
                  ->orWhere('admin_users.phone', 'like', "%{$search}%")
                  ->orWhere('admin_users.email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('trang_thai')) {
            $query->where('admin_users.status', $request->trang_thai);
        }

        $perPage = $request->get('limit', $request->get('per_page', 10));
        $data = $query->orderBy('admin_users.id', 'desc')->paginate($perPage);

        // Calculate stats
        $stats = [
            'total' => DB::table('admin_users')->count(),
            'active' => DB::table('admin_users')->where('status', 'active')->count(),
            'topPerformer' => 0,
            'totalCommission' => 0,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'data' => $data->items(),
                'total' => $data->total(),
                'current_page' => $data->currentPage(),
                'per_page' => $data->perPage(),
                'stats' => $stats,
            ]
        ]);
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
