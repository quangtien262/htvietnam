<?php

namespace App\Services\Admin;

use App\Models\Admin\ChamCong;
use App\Models\AdminUser;
use Carbon\Carbon;

class ChamCongService
{
    /**
     * Validate và tạo chấm công
     */
    public static function createChamCong($data)
    {
        // Check duplicate
        $existing = ChamCong::where('admin_user_id', $data['admin_user_id'])
            ->where('ngay_cham_cong', $data['ngay_cham_cong'])
            ->first();

        if ($existing) {
            throw new \Exception('Đã có chấm công cho ngày này');
        }

        // Auto calculate KPI and deductions for type = 1 (Đi làm)
        if ($data['type'] == 1) {
            $nhanVien = AdminUser::find($data['admin_user_id']);
            $luong1Ngay = ($nhanVien->salary ?? 0) / 26;

            $checkinTime = intval($data['checkin_h'] . str_pad($data['checkin_m'], 2, '0', STR_PAD_LEFT));
            $checkoutTime = intval($data['checkout_h'] . str_pad($data['checkout_m'], 2, '0', STR_PAD_LEFT));

            $data['kpi'] = 0;
            $data['note'] = '';
            $data['luong_nghi_nua_ngay'] = 0;
            $data['luong_nghi_ca_ngay'] = 0;

            // Đi muộn
            if ($checkinTime >= 850) {
                $data['kpi'] = -1;
                $data['note'] = 'Đi muộn';
            }

            // Nghỉ nửa buổi sáng
            if ($checkinTime >= 1030) {
                $data['kpi'] = 0;
                $data['luong_nghi_nua_ngay'] = -$luong1Ngay / 2;
                $data['note'] = 'Nghỉ nửa ngày';
            }

            // Về sớm
            if ($checkoutTime <= 1710) {
                $data['kpi'] = -1;
                $data['note'] = $data['note'] ? $data['note'] . ', Về sớm' : 'Về sớm';
            }

            // Nghỉ nửa buổi chiều
            if ($checkoutTime <= 1530) {
                $data['kpi'] = 0;
                $data['luong_nghi_nua_ngay'] += -$luong1Ngay / 2;
                $data['note'] = 'Nghỉ nửa ngày';
            }
        } elseif ($data['type'] == 2 || $data['type'] == 3) {
            // Nghỉ có phép hoặc không phép
            $nhanVien = AdminUser::find($data['admin_user_id']);
            $luong1Ngay = ($nhanVien->salary ?? 0) / 26;
            $data['luong_nghi_ca_ngay'] = -$luong1Ngay;
        }

        $chamCong = ChamCong::create($data);
        return $chamCong;
    }

    /**
     * Duyệt chấm công
     */
    public static function approveChamCong($id, $approvedBy)
    {
        $chamCong = ChamCong::find($id);
        if (!$chamCong) {
            throw new \Exception('Không tìm thấy chấm công');
        }

        $chamCong->is_approved = 1;
        $chamCong->approved_by = $approvedBy;
        $chamCong->approved_at = now();
        $chamCong->save();

        return $chamCong;
    }

    /**
     * Tạo chấm công từ vân tay (auto)
     */
    public static function syncFromVanTay($userId, $date, $vanTayData)
    {
        // Logic sync từ máy vân tay
        // This would be called from API endpoint that receives fingerprint data

        $existing = ChamCong::where('admin_user_id', $userId)
            ->where('ngay_cham_cong', $date)
            ->first();

        if ($existing) {
            // Update
            $existing->van_tay_checkin_time = $vanTayData['checkin_time'] ?? null;
            $existing->van_tay_checkout_time = $vanTayData['checkout_time'] ?? null;
            $existing->save();
            return $existing;
        }

        // Create from fingerprint data
        $data = [
            'admin_user_id' => $userId,
            'ngay_cham_cong' => $date,
            'type' => 1,
            'van_tay_checkin_time' => $vanTayData['checkin_time'] ?? null,
            'van_tay_checkout_time' => $vanTayData['checkout_time'] ?? null,
        ];

        // Parse time from fingerprint
        if (!empty($vanTayData['checkin_time'])) {
            $time = Carbon::parse($vanTayData['checkin_time']);
            $data['checkin_h'] = $time->format('H');
            $data['checkin_m'] = $time->format('i');
        }

        if (!empty($vanTayData['checkout_time'])) {
            $time = Carbon::parse($vanTayData['checkout_time']);
            $data['checkout_h'] = $time->format('H');
            $data['checkout_m'] = $time->format('i');
        }

        return self::createChamCong($data);
    }

    /**
     * Lấy tổng hợp chấm công tháng
     */
    public static function getTongHopThang($userId, $thang, $nam)
    {
        $chamCongs = ChamCong::active()
            ->where('admin_user_id', $userId)
            ->byMonth($thang, $nam)
            ->orderBy('ngay_cham_cong')
            ->get();

        $tongHop = [
            'tong_ngay' => $chamCongs->count(),
            'di_lam' => $chamCongs->where('type', 1)->count(),
            'nghi_phep' => $chamCongs->where('type', 2)->count(),
            'nghi_ko_phep' => $chamCongs->where('type', 3)->count(),
            'nghi_le' => $chamCongs->where('type', 4)->count(),
            'di_muon' => $chamCongs->where('kpi', -1)->count(),
            'tong_gio_lam_them' => $chamCongs->sum('gio_lam_them'),
            'cham_congs' => $chamCongs,
        ];

        return $tongHop;
    }
}
