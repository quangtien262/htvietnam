<?php

namespace App\Services\Spa;

use App\Models\Spa\KhachHang;
use App\Models\Spa\HoSoSucKhoe;
use App\Models\Spa\HoSoDa;
use Illuminate\Support\Facades\DB;

class KhachHangService
{
    public function getList($params = [])
    {
        $query = KhachHang::query()->with(['membershipCards.tier']);

        // Search
        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function($q) use ($search) {
                $q->where('ho_ten', 'like', "%{$search}%")
                    ->orWhere('so_dien_thoai', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('ma_khach_hang', 'like', "%{$search}%");
            });
        }

        // Filter by type
        if (!empty($params['loai_khach'])) {
            $query->where('loai_khach', $params['loai_khach']);
        }

        // Filter by source
        if (!empty($params['nguon_khach'])) {
            $query->where('nguon_khach', $params['nguon_khach']);
        }

        // Filter by status
        if (!empty($params['trang_thai'])) {
            $query->where('trang_thai', $params['trang_thai']);
        }

        // Sort
        $sortBy = $params['sort_by'] ?? 'created_at';
        $sortOrder = $params['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $params['per_page'] ?? 20;
        return $query->paginate($perPage);
    }

    public function create($data)
    {
        return DB::transaction(function() use ($data) {
            // Generate customer code
            $lastCustomer = KhachHang::orderBy('id', 'desc')->first();
            $nextNumber = $lastCustomer ? (int)substr($lastCustomer->ma_khach_hang, 2) + 1 : 1;
            $data['ma_khach_hang'] = 'KH' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

            $khachHang = KhachHang::create($data);

            // Create health record if provided
            if (!empty($data['health_record'])) {
                HoSoSucKhoe::create(array_merge($data['health_record'], [
                    'khach_hang_id' => $khachHang->id,
                ]));
            }

            // Create skin record if provided
            if (!empty($data['skin_record'])) {
                HoSoDa::create(array_merge($data['skin_record'], [
                    'khach_hang_id' => $khachHang->id,
                ]));
            }

            return $khachHang->load(['hoSoSucKhoe', 'hoSoDa']);
        });
    }

    public function update($id, $data)
    {
        return DB::transaction(function() use ($id, $data) {
            $khachHang = KhachHang::findOrFail($id);
            $khachHang->update($data);

            // Update health record
            if (!empty($data['health_record'])) {
                $healthRecord = $khachHang->hoSoSucKhoe()->latest()->first();
                if ($healthRecord) {
                    $healthRecord->update($data['health_record']);
                } else {
                    HoSoSucKhoe::create(array_merge($data['health_record'], [
                        'khach_hang_id' => $khachHang->id,
                    ]));
                }
            }

            // Update skin record
            if (!empty($data['skin_record'])) {
                $skinRecord = $khachHang->hoSoDa()->latest()->first();
                if ($skinRecord) {
                    $skinRecord->update($data['skin_record']);
                } else {
                    HoSoDa::create(array_merge($data['skin_record'], [
                        'khach_hang_id' => $khachHang->id,
                    ]));
                }
            }

            return $khachHang->load(['hoSoSucKhoe', 'hoSoDa']);
        });
    }

    public function delete($id)
    {
        $khachHang = KhachHang::findOrFail($id);
        return $khachHang->delete();
    }

    public function getDetail($id)
    {
        return KhachHang::with([
            'hoSoSucKhoe',
            'hoSoDa',
            'progressPhotos',
            'bookings',
            'hoaDons',
            'lieuTrinhs',
            'membershipCards.tier',
            'diemThuongLichSu',
            'danhGias',
        ])->findOrFail($id);
    }

    public function getStatistics($id)
    {
        $khachHang = KhachHang::findOrFail($id);

        return [
            'total_spending' => $khachHang->tong_chi_tieu,
            'total_visits' => $khachHang->so_lan_su_dung_dich_vu,
            'loyalty_points' => $khachHang->diem_tich_luy,
            'last_visit' => $khachHang->lan_mua_cuoi,
            'membership_tier' => $khachHang->membershipCards()->active()->first()?->tier,
            'rfm_score' => $khachHang->updateRFMScore(),
            'total_bookings' => $khachHang->bookings()->count(),
            'completed_treatments' => $khachHang->lieuTrinhs()->completed()->count(),
            'active_treatments' => $khachHang->lieuTrinhs()->active()->count(),
            'average_rating' => $khachHang->danhGias()->avg('trung_binh'),
        ];
    }

    public function getCustomersBySegment($segment)
    {
        $query = KhachHang::query();

        switch ($segment) {
            case 'vip':
                $query->vip();
                break;
            case 'high_value':
                $query->where('tong_chi_tieu', '>=', 20000000);
                break;
            case 'frequent':
                $query->where('so_lan_su_dung_dich_vu', '>=', 10);
                break;
            case 'recent':
                $query->where('lan_mua_cuoi', '>=', now()->subDays(30));
                break;
            case 'inactive':
                $query->where('lan_mua_cuoi', '<', now()->subDays(90));
                break;
        }

        return $query->get();
    }
}
