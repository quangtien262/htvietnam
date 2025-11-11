<?php

namespace App\Services\Spa;

use App\Models\Spa\Booking;
use App\Models\Spa\BookingDichVu;
use App\Models\Spa\KhachHang;
use App\Models\Spa\KTV;
use App\Models\Spa\Phong;
use Illuminate\Support\Facades\DB;

class BookingService
{
    public function getList($params = [])
    {
        $query = Booking::query()->with(['khachHang', 'chiNhanh', 'dichVus.dichVu', 'dichVus.ktv']);

        // Filter by status
        if (!empty($params['trang_thai'])) {
            $query->where('trang_thai', $params['trang_thai']);
        }

        // Filter by date
        if (!empty($params['ngay_hen'])) {
            $query->whereDate('ngay_hen', $params['ngay_hen']);
        }

        // Filter by date range
        if (!empty($params['tu_ngay']) && !empty($params['den_ngay'])) {
            $query->whereBetween('ngay_hen', [$params['tu_ngay'], $params['den_ngay']]);
        }

        // Filter by branch
        if (!empty($params['chi_nhanh_id'])) {
            $query->where('chi_nhanh_id', $params['chi_nhanh_id']);
        }

        // Filter by source
        if (!empty($params['nguon_booking'])) {
            $query->where('nguon_booking', $params['nguon_booking']);
        }

        // Sort
        $sortBy = $params['sort_by'] ?? 'ngay_hen';
        $sortOrder = $params['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $params['per_page'] ?? 20;
        return $query->paginate($perPage);
    }

    public function create($data)
    {
        return DB::transaction(function() use ($data) {
            // Generate booking code
            $lastBooking = Booking::orderBy('id', 'desc')->first();
            $nextNumber = $lastBooking ? (int)substr($lastBooking->ma_booking, 2) + 1 : 1;
            $data['ma_booking'] = 'BK' . str_pad($nextNumber, 8, '0', STR_PAD_LEFT);

            // Calculate estimated duration
            $totalDuration = 0;
            foreach ($data['dich_vus'] as $dichVu) {
                $service = \App\Models\Spa\DichVu::find($dichVu['dich_vu_id']);
                if ($service) {
                    $totalDuration += $service->thoi_gian_thuc_hien;
                }
            }
            $data['thoi_gian_du_kien'] = $totalDuration;

            $booking = Booking::create($data);

            // Add services
            foreach ($data['dich_vus'] as $dichVuData) {
                BookingDichVu::create([
                    'booking_id' => $booking->id,
                    'dich_vu_id' => $dichVuData['dich_vu_id'],
                    'ktv_id' => $dichVuData['ktv_id'] ?? null,
                    'phong_id' => $dichVuData['phong_id'] ?? null,
                    'gio_bat_dau' => $dichVuData['gio_bat_dau'] ?? $data['gio_hen'],
                    'gio_ket_thuc' => $dichVuData['gio_ket_thuc'] ?? null,
                    'ghi_chu' => $dichVuData['ghi_chu'] ?? null,
                ]);
            }

            return $booking->load('dichVus.dichVu');
        });
    }

    public function update($id, $data)
    {
        return DB::transaction(function() use ($id, $data) {
            $booking = Booking::findOrFail($id);
            $booking->update($data);

            // Update services if provided
            if (!empty($data['dich_vus'])) {
                // Delete existing services
                $booking->dichVus()->delete();

                // Add new services
                foreach ($data['dich_vus'] as $dichVuData) {
                    BookingDichVu::create([
                        'booking_id' => $booking->id,
                        'dich_vu_id' => $dichVuData['dich_vu_id'],
                        'ktv_id' => $dichVuData['ktv_id'] ?? null,
                        'phong_id' => $dichVuData['phong_id'] ?? null,
                        'gio_bat_dau' => $dichVuData['gio_bat_dau'] ?? null,
                        'gio_ket_thuc' => $dichVuData['gio_ket_thuc'] ?? null,
                        'ghi_chu' => $dichVuData['ghi_chu'] ?? null,
                    ]);
                }
            }

            return $booking->load('dichVus.dichVu');
        });
    }

    public function confirm($id)
    {
        $booking = Booking::findOrFail($id);
        return $booking->confirm();
    }

    public function start($id)
    {
        $booking = Booking::findOrFail($id);
        return $booking->start();
    }

    public function complete($id)
    {
        $booking = Booking::findOrFail($id);
        return $booking->complete();
    }

    public function cancel($id, $reason)
    {
        $booking = Booking::findOrFail($id);
        return $booking->cancel($reason);
    }

    public function getAvailableKTVs($date, $time, $duration)
    {
        $duration = (int) $duration; // Cast to integer
        $endTime = \Carbon\Carbon::parse($time)->addMinutes($duration)->format('H:i:s');

        return KTV::active()
            ->get()
            ->filter(function($ktv) use ($date, $time, $endTime) {
                return $ktv->isAvailable($date, $time, $endTime);
            });
    }

    public function getAvailableRooms($date, $time, $duration, $roomType = null)
    {
        $duration = (int) $duration; // Cast to integer
        $endTime = \Carbon\Carbon::parse($time)->addMinutes($duration)->format('H:i:s');

        $query = Phong::available();
        
        if ($roomType) {
            $query->byType($roomType);
        }

        return $query->get()->filter(function($phong) use ($date, $time, $endTime) {
            return $phong->checkAvailability($date, $time, $endTime);
        });
    }

    public function getCalendar($params = [])
    {
        $date = $params['date'] ?? now()->format('Y-m-d');
        $chiNhanhId = $params['chi_nhanh_id'] ?? null;

        $query = Booking::with(['khachHang', 'dichVus.dichVu', 'dichVus.ktv', 'dichVus.phong'])
            ->byDate($date);

        if ($chiNhanhId) {
            $query->where('chi_nhanh_id', $chiNhanhId);
        }

        $bookings = $query->get();

        return $bookings->map(function($booking) {
            return [
                'id' => $booking->id,
                'title' => $booking->khachHang->ho_ten,
                'start' => $booking->ngay_hen->format('Y-m-d') . ' ' . $booking->gio_hen,
                'duration' => $booking->thoi_gian_du_kien,
                'status' => $booking->trang_thai,
                'services' => $booking->dichVus->map(function($dv) {
                    return [
                        'service' => $dv->dichVu->ten_dich_vu,
                        'ktv' => $dv->ktv?->ho_ten,
                        'room' => $dv->phong?->ten_phong,
                        'start' => $dv->gio_bat_dau,
                        'end' => $dv->gio_ket_thuc,
                    ];
                }),
            ];
        });
    }

    public function sendReminders()
    {
        $reminderHours = \App\Models\Spa\CauHinh::getSMSReminderHours();
        $targetTime = now()->addHours($reminderHours);

        $bookings = Booking::confirmed()
            ->whereDate('ngay_hen', $targetTime->format('Y-m-d'))
            ->whereTime('gio_hen', '>=', $targetTime->format('H:i:s'))
            ->whereTime('gio_hen', '<=', $targetTime->addHour()->format('H:i:s'))
            ->where('sms_nhac_nho', false)
            ->get();

        foreach ($bookings as $booking) {
            $booking->sendReminder();
            // TODO: Implement actual SMS sending
        }

        return $bookings->count();
    }
}
