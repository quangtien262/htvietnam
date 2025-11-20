<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\DichVuNguyenLieu;
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
                'spa_dich_vu.gia_ban as gia',
                'spa_danh_muc_dich_vu.ten_danh_muc as danh_muc_ten',
                DB::raw('0 as so_luong_da_su_dung'),
                DB::raw('0 as doanh_thu')
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

        // Generate unique service code
        $maDichVu = 'DV' . time() . rand(100, 999);

        // Ensure uniqueness
        while (DB::table('spa_dich_vu')->where('ma_dich_vu', $maDichVu)->exists()) {
            $maDichVu = 'DV' . time() . rand(100, 999);
        }

        $id = DB::table('spa_dich_vu')->insertGetId([
            'ma_dich_vu' => $maDichVu,
            'ten_dich_vu' => $request->ten_dich_vu,
            'danh_muc_id' => $request->danh_muc_id,
            'gia_ban' => $request->gia ?? 0,
            'thoi_gian_thuc_hien' => $request->thoi_luong ?? 60,
            'mo_ta' => $request->mo_ta,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Save materials if provided
        if ($request->has('nguyen_lieu') && is_array($request->nguyen_lieu)) {
            foreach ($request->nguyen_lieu as $material) {
                if (!empty($material['san_pham_id']) && !empty($material['so_luong'])) {
                    DichVuNguyenLieu::create([
                        'dich_vu_id' => $id,
                        'san_pham_id' => $material['san_pham_id'],
                        'so_luong' => $material['so_luong'],
                        'don_vi_su_dung' => $material['don_vi_su_dung'] ?? 'Chai',
                        'gia_von' => $material['gia_von'] ?? 0,
                        'ty_le_quy_doi' => $material['ty_le_quy_doi'] ?? 1,
                        'thanh_tien' => $material['thanh_tien'] ?? 0,
                        'ghi_chu' => $material['ghi_chu'] ?? null,
                    ]);
                }
            }
        }

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
            $updateData['trang_thai'] = $request->is_active ? 'hoat_dong' : 'ngung_hoat_dong';
        }
        if ($request->has('trang_thai')) {
            $updateData['trang_thai'] = $request->trang_thai;
            $updateData['is_active'] = $request->trang_thai === 'hoat_dong';
        }

        $updateData['updated_at'] = now();

        DB::table('spa_dich_vu')->where('id', $id)->update($updateData);

        // Update materials if provided
        if ($request->has('nguyen_lieu')) {
            // Delete old materials
            DichVuNguyenLieu::where('dich_vu_id', $id)->delete();

            // Create new materials
            if (is_array($request->nguyen_lieu)) {
                foreach ($request->nguyen_lieu as $material) {
                    if (!empty($material['san_pham_id']) && !empty($material['so_luong'])) {
                        DichVuNguyenLieu::create([
                            'dich_vu_id' => $id,
                            'san_pham_id' => $material['san_pham_id'],
                            'so_luong' => $material['so_luong'],
                            'don_vi_su_dung' => $material['don_vi_su_dung'] ?? 'Chai',
                            'gia_von' => $material['gia_von'] ?? 0,
                            'ty_le_quy_doi' => $material['ty_le_quy_doi'] ?? 1,
                            'thanh_tien' => $material['thanh_tien'] ?? 0,
                            'ghi_chu' => $material['ghi_chu'] ?? null,
                        ]);
                    }
                }
            }
        }

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function destroy($id)
    {
        DB::table('spa_dich_vu')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }

    public function show($id)
    {
        $service = DB::table('spa_dich_vu')
            ->where('id', $id)
            ->select(
                'spa_dich_vu.*',
                'spa_dich_vu.gia_ban as gia'
            )
            ->first();

        // Load materials with product info
        if ($service) {
            $service->nguyen_lieu = DB::table('spa_dich_vu_nguyen_lieu as nl')
                ->leftJoin('spa_san_pham as sp', 'nl.san_pham_id', '=', 'sp.id')
                ->where('nl.dich_vu_id', $id)
                ->select(
                    'nl.*',
                    'sp.ma_san_pham',
                    'sp.ten_san_pham',
                    'sp.don_vi_tinh as don_vi_goc',
                    'sp.gia_nhap as gia_von_goc'
                )
                ->get()
                ->toArray();
        }

        return $this->sendSuccessResponse($service);
    }
}
