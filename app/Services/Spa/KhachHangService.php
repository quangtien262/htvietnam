<?php

namespace App\Services\Spa;

use App\Models\User;
use App\Models\Spa\HoSoSucKhoe;
use App\Models\Spa\HoSoDa;
use Illuminate\Support\Facades\DB;

class KhachHangService
{
    public function getList($params = [])
    {
        $query = User::query();

        // Search
        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('ho_ten', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('sdt', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
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
            // Map field names from frontend to users table
            $userData = [
                'name' => $data['ho_ten'] ?? null,
                'ho_ten' => $data['ho_ten'] ?? null,
                'phone' => $data['so_dien_thoai'] ?? null,
                'sdt' => $data['so_dien_thoai'] ?? null,
                'email' => $data['email'] ?? null,
                'ngay_sinh' => $data['ngay_sinh'] ?? null,
                'gioi_tinh' => $data['gioi_tinh'] ?? null,
                'dia_chi' => $data['dia_chi'] ?? null,
                'nguon_khach' => $data['nguon_khach'] ?? null,
                'ghi_chu' => $data['ghi_chu'] ?? null,
                'password' => bcrypt('123456'), // Default password
            ];

            $user = User::create($userData);

            // Create health record if provided
            if (!empty($data['health_record'])) {
                HoSoSucKhoe::create(array_merge($data['health_record'], [
                    'khach_hang_id' => $user->id,
                ]));
            }

            // Create skin record if provided
            if (!empty($data['skin_record'])) {
                HoSoDa::create(array_merge($data['skin_record'], [
                    'khach_hang_id' => $user->id,
                ]));
            }

            return $user;
        });
    }

    public function update($id, $data)
    {
        return DB::transaction(function() use ($id, $data) {
            $user = User::findOrFail($id);

            // Map field names from frontend to users table
            $userData = [];
            if (isset($data['ho_ten'])) {
                $userData['name'] = $data['ho_ten'];
                $userData['ho_ten'] = $data['ho_ten'];
            }
            if (isset($data['so_dien_thoai'])) {
                $userData['phone'] = $data['so_dien_thoai'];
                $userData['sdt'] = $data['so_dien_thoai'];
            }
            if (isset($data['email'])) $userData['email'] = $data['email'];
            if (isset($data['ngay_sinh'])) $userData['ngay_sinh'] = $data['ngay_sinh'];
            if (isset($data['gioi_tinh'])) $userData['gioi_tinh'] = $data['gioi_tinh'];
            if (isset($data['dia_chi'])) $userData['dia_chi'] = $data['dia_chi'];
            if (isset($data['ghi_chu'])) $userData['ghi_chu'] = $data['ghi_chu'];

            $user->update($userData);

            // Update health record
            if (!empty($data['health_record'])) {
                $healthRecord = HoSoSucKhoe::where('khach_hang_id', $user->id)->latest()->first();
                if ($healthRecord) {
                    $healthRecord->update($data['health_record']);
                } else {
                    HoSoSucKhoe::create(array_merge($data['health_record'], [
                        'khach_hang_id' => $user->id,
                    ]));
                }
            }

            // Update skin record
            if (!empty($data['skin_record'])) {
                $skinRecord = HoSoDa::where('khach_hang_id', $user->id)->latest()->first();
                if ($skinRecord) {
                    $skinRecord->update($data['skin_record']);
                } else {
                    HoSoDa::create(array_merge($data['skin_record'], [
                        'khach_hang_id' => $user->id,
                    ]));
                }
            }

            return $user;
        });
    }

    public function delete($id)
    {
        $user = User::findOrFail($id);
        return $user->delete();
    }

    public function getDetail($id)
    {
        return User::findOrFail($id);
    }

    public function getStatistics($id)
    {
        $user = User::findOrFail($id);

        // Count related SPA records
        $totalBookings = \App\Models\Spa\Booking::where('khach_hang_id', $id)->count();
        $totalInvoices = \App\Models\Spa\HoaDon::where('khach_hang_id', $id)->count();
        $totalSpending = \App\Models\Spa\HoaDon::where('khach_hang_id', $id)->sum('tong_thanh_toan');
        $lastVisit = \App\Models\Spa\HoaDon::where('khach_hang_id', $id)->max('created_at');

        return [
            'total_spending' => $totalSpending ?? 0,
            'total_visits' => $totalInvoices,
            'loyalty_points' => $user->diem_tich_luy ?? $user->points ?? 0,
            'last_visit' => $lastVisit,
            'total_bookings' => $totalBookings,
        ];
    }

    public function getCustomersBySegment($segment)
    {
        $query = User::query();

        switch ($segment) {
            case 'vip':
                $query->where('loai_khach', 'VIP');
                break;
            case 'high_value':
                $query->where('tong_chi_tieu', '>=', 20000000);
                break;
            case 'frequent':
                $query->where('so_lan_su_dung_dich_vu', '>=', 10);
                break;
            case 'recent':
                $query->where('updated_at', '>=', now()->subDays(30));
                break;
            case 'inactive':
                $query->where('updated_at', '<', now()->subDays(90));
                break;
        }

        return $query->get();
    }
}
