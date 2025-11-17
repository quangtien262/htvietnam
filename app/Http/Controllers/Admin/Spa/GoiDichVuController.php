<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\GoiDichVu;
use App\Models\Spa\GoiDichVuChiTiet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GoiDichVuController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('spa_goi_dich_vu')
            ->leftJoin('spa_lich_trinh_su_dung', 'spa_goi_dich_vu.lich_trinh_su_dung_id', '=', 'spa_lich_trinh_su_dung.id')
            ->select(
                'spa_goi_dich_vu.*',
                'spa_lich_trinh_su_dung.name as lich_trinh_ten',
                'spa_lich_trinh_su_dung.color as lich_trinh_color'
            );

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('spa_goi_dich_vu.is_active', $request->is_active);
        }

        // Search by name or code
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('spa_goi_dich_vu.ma_goi', 'like', "%{$search}%");
            });
        }

        $packages = $query->orderBy('spa_goi_dich_vu.created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        // Load service details for each package
        foreach ($packages as $package) {
            $package->dich_vu = DB::table('spa_goi_dich_vu_chi_tiet')
                ->join('spa_dich_vu', 'spa_goi_dich_vu_chi_tiet.dich_vu_id', '=', 'spa_dich_vu.id')
                ->where('spa_goi_dich_vu_chi_tiet.goi_dich_vu_id', $package->id)
                ->select(
                    'spa_goi_dich_vu_chi_tiet.*',
                    'spa_dich_vu.ma_dich_vu',
                    'spa_dich_vu.ten_dich_vu',
                    'spa_dich_vu.gia_ban as gia_goc'
                )
                ->get();
        }

        return $this->sendSuccessResponse($packages);
    }

    public function store(Request $request)
    {
        $request->validate([
            'gia_ban' => 'required|numeric|min:0',
            'so_luong' => 'required|numeric|min:0',
        ]);

        // Create package first to get ID
        $id = DB::table('spa_goi_dich_vu')->insertGetId([
            'ma_goi' => 'TEMP_' . time(), // Temporary code
            'nhom_hang_id' => $request->nhom_hang_id,
            'gia_ban' => $request->gia_ban,
            'so_luong' => $request->so_luong,
            'lich_trinh_su_dung_id' => $request->lich_trinh_su_dung_id,
            'mo_ta' => $request->mo_ta,
            'hinh_anh' => $request->hinh_anh,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Generate ma_goi based on ID if not provided
        $maGoi = $request->ma_goi;
        if (empty($maGoi)) {
            $maGoi = 'GOI' . str_pad($id, 5, '0', STR_PAD_LEFT);
        }

        // Update with proper ma_goi
        DB::table('spa_goi_dich_vu')->where('id', $id)->update([
            'ma_goi' => $maGoi,
            'updated_at' => now(),
        ]);

        // Save services if provided
        if ($request->has('dich_vu_trong_goi') && is_array($request->dich_vu_trong_goi)) {
            foreach ($request->dich_vu_trong_goi as $service) {
                if (!empty($service['dich_vu_id'])) {
                    GoiDichVuChiTiet::create([
                        'goi_dich_vu_id' => $id,
                        'dich_vu_id' => $service['dich_vu_id'],
                        'gia_ban_le' => $service['gia_ban_le'] ?? 0,
                        'so_luong' => $service['so_luong'] ?? 1,
                        'ghi_chu' => $service['ghi_chu'] ?? null,
                    ]);
                }
            }
        }

        $package = DB::table('spa_goi_dich_vu')->where('id', $id)->first();

        return $this->sendSuccessResponse($package, 'Tạo gói dịch vụ thành công', 200);
    }

    public function show($id)
    {
        $package = DB::table('spa_goi_dich_vu')
            ->leftJoin('spa_lich_trinh_su_dung', 'spa_goi_dich_vu.lich_trinh_su_dung_id', '=', 'spa_lich_trinh_su_dung.id')
            ->where('spa_goi_dich_vu.id', $id)
            ->select(
                'spa_goi_dich_vu.*',
                'spa_lich_trinh_su_dung.name as lich_trinh_ten'
            )
            ->first();

        if (!$package) {
            return $this->sendErrorResponse('Không tìm thấy gói dịch vụ', 404);
        }

        // Load services in package
        $package->dich_vu_trong_goi = DB::table('spa_goi_dich_vu_chi_tiet')
            ->join('spa_dich_vu', 'spa_goi_dich_vu_chi_tiet.dich_vu_id', '=', 'spa_dich_vu.id')
            ->where('spa_goi_dich_vu_chi_tiet.goi_dich_vu_id', $id)
            ->select(
                'spa_goi_dich_vu_chi_tiet.*',
                'spa_dich_vu.ma_dich_vu',
                'spa_dich_vu.ten_dich_vu',
                'spa_dich_vu.gia_ban as gia_goc'
            )
            ->get();

        return $package;
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'gia_ban' => 'required|numeric|min:0',
            'so_luong' => 'required|numeric|min:0',
        ]);

        DB::table('spa_goi_dich_vu')->where('id', $id)->update([
            'ma_goi' => $request->ma_goi ?? 'GOI' . str_pad($id, 5, '0', STR_PAD_LEFT),
            'nhom_hang_id' => $request->nhom_hang_id,
            'gia_ban' => $request->gia_ban,
            'so_luong' => $request->so_luong,
            'lich_trinh_su_dung_id' => $request->lich_trinh_su_dung_id,
            'mo_ta' => $request->mo_ta,
            'hinh_anh' => $request->hinh_anh,
            'updated_at' => now(),
        ]);

        // Delete old services
        GoiDichVuChiTiet::where('goi_dich_vu_id', $id)->delete();

        // Save new services
        if ($request->has('dich_vu_trong_goi') && is_array($request->dich_vu_trong_goi)) {
            foreach ($request->dich_vu_trong_goi as $service) {
                if (!empty($service['dich_vu_id'])) {
                    GoiDichVuChiTiet::create([
                        'goi_dich_vu_id' => $id,
                        'dich_vu_id' => $service['dich_vu_id'],
                        'gia_ban_le' => $service['gia_ban_le'] ?? 0,
                        'so_luong' => $service['so_luong'] ?? 1,
                        'ghi_chu' => $service['ghi_chu'] ?? null,
                    ]);
                }
            }
        }

        $package = DB::table('spa_goi_dich_vu')->where('id', $id)->first();

        return $this->sendSuccessResponse($package, 'Cập nhật gói dịch vụ thành công', 200);
    }

    public function destroy($id)
    {
        DB::table('spa_goi_dich_vu')->where('id', $id)->delete();

        return $this->sendSuccessResponse(null, 'Xóa gói dịch vụ thành công', 200);
    }

    public function getSchedules()
    {
        $schedules = DB::table('spa_lich_trinh_su_dung')
            ->orderBy('sort_order')
            ->get();

        return $this->sendSuccessResponse($schedules);
    }

    public function createSchedule(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:50',
        ]);

        $id = DB::table('spa_lich_trinh_su_dung')->insertGetId([
            'name' => $request->name,
            'color' => $request->color ?? 'blue',
            'sort_order' => $request->sort_order ?? 0,
            'note' => $request->note,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $schedule = DB::table('spa_lich_trinh_su_dung')->where('id', $id)->first();

        return $this->sendSuccessResponse($schedule, 'Tạo lịch trình thành công', 200);
    }
}
