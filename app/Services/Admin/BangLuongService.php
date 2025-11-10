<?php

namespace App\Services\Admin;

use App\Models\Admin\BangLuong;
use App\Models\Admin\ChamCong;
use App\Models\AdminUser;
use Carbon\Carbon;

class BangLuongService
{
    /**
     * Tính lương tự động cho nhân viên trong tháng
     */
    public static function tinhLuongThang($adminUserId, $thang, $nam)
    {
        $nhanVien = AdminUser::find($adminUserId);
        if (!$nhanVien) {
            throw new \Exception('Không tìm thấy nhân viên');
        }

        // Check if bang luong already exists
        $existing = BangLuong::where('admin_user_id', $adminUserId)
                             ->where('thang', $thang)
                             ->where('nam', $nam)
                             ->first();

        if ($existing) {
            // Update existing
            $bangLuong = $existing;
        } else {
            // Create new
            $bangLuong = new BangLuong();
            $bangLuong->admin_user_id = $adminUserId;
            $bangLuong->thang = $thang;
            $bangLuong->nam = $nam;
        }

        // Lương cơ bản
        $bangLuong->luong_co_ban = $nhanVien->salary ?? 0;
        $bangLuong->loai_luong = $nhanVien->loai_luong ?? 4;

        // Tính ngày công
        $soNgayCongChuan = self::getSoNgayCongChuan($thang, $nam);
        $bangLuong->so_ngay_cong_chuan = $soNgayCongChuan;

        // Lấy dữ liệu chấm công
        $chamCongs = ChamCong::active()
            ->where('admin_user_id', $adminUserId)
            ->byMonth($thang, $nam)
            ->get();

        // Tính số ngày công thực tế
        $soNgayCongThucTe = 0;
        $gioLamThemNgayThuong = 0;
        $gioLamThemThu7 = 0;
        $gioLamThemChuNhat = 0;
        $gioLamThemNgayLe = 0;
        $tongTienTruNghi = 0;

        foreach ($chamCongs as $cc) {
            if ($cc->type == 1) { // Đi làm
                $soNgayCongThucTe += 1;
                $soNgayCongThucTe += ($cc->luong_nghi_nua_ngay < 0) ? -0.5 : 0; // Trừ nửa ngày nếu có
            }

            // Tính làm thêm giờ
            $ngayChamCong = Carbon::parse($cc->ngay_cham_cong);
            $dayOfWeek = $ngayChamCong->dayOfWeek;

            if ($cc->gio_lam_them > 0) {
                if ($dayOfWeek == Carbon::SATURDAY) {
                    $gioLamThemThu7 += $cc->gio_lam_them;
                } elseif ($dayOfWeek == Carbon::SUNDAY) {
                    $gioLamThemChuNhat += $cc->gio_lam_them;
                } elseif ($cc->type == 4) { // Ngày lễ
                    $gioLamThemNgayLe += $cc->gio_lam_them;
                } else {
                    $gioLamThemNgayThuong += $cc->gio_lam_them;
                }
            }

            // Tổng tiền trừ nghỉ
            $tongTienTruNghi += $cc->luong_nghi_nua_ngay + $cc->luong_nghi_ca_ngay;
        }

        $bangLuong->so_ngay_cong_thuc_te = $soNgayCongThucTe;
        $bangLuong->gio_lam_them_ngay_thuong = $gioLamThemNgayThuong;
        $bangLuong->gio_lam_them_thu7 = $gioLamThemThu7;
        $bangLuong->gio_lam_them_chu_nhat = $gioLamThemChuNhat;
        $bangLuong->gio_lam_them_ngay_le = $gioLamThemNgayLe;

        // Tính lương theo ngày công
        if ($bangLuong->loai_luong == 4) { // Lương cố định
            $bangLuong->luong_theo_ngay_cong = $bangLuong->luong_co_ban;
        } else {
            $luong1NgayCong = $bangLuong->luong_co_ban / $soNgayCongChuan;
            $bangLuong->luong_theo_ngay_cong = $luong1NgayCong * $soNgayCongThucTe;
        }

        // Tính tiền làm thêm
        $bangLuong->tien_lam_them = self::tinhTienLamThem(
            $nhanVien,
            $gioLamThemNgayThuong,
            $gioLamThemThu7,
            $gioLamThemChuNhat,
            $gioLamThemNgayLe
        );

        // Thưởng, hoa hồng, phụ cấp (từ JSON settings)
        $bangLuong->tong_thuong = self::tinhThuong($nhanVien);
        $bangLuong->tong_hoa_hong = self::tinhHoaHong($nhanVien);
        $bangLuong->tong_phu_cap = self::tinhPhuCap($nhanVien);
        $bangLuong->chi_tiet_thuong = $nhanVien->thuong_setting;
        $bangLuong->chi_tiet_hoa_hong = $nhanVien->hoa_hong_setting;
        $bangLuong->chi_tiet_phu_cap = $nhanVien->phu_cap_setting;

        // Giảm trừ
        $bangLuong->tong_giam_tru = self::tinhGiamTru($nhanVien) + abs($tongTienTruNghi);
        $bangLuong->chi_tiet_giam_tru = $nhanVien->giam_tru_setting;

        // Bảo hiểm (tính trên lương cơ bản)
        $mucDongBH = $bangLuong->luong_co_ban;
        $bangLuong->tru_bhxh = $mucDongBH * 0.08; // 8%
        $bangLuong->tru_bhyt = $mucDongBH * 0.015; // 1.5%
        $bangLuong->tru_bhtn = $mucDongBH * 0.01; // 1%

        // Tổng thu nhập
        $bangLuong->tong_thu_nhap = $bangLuong->luong_theo_ngay_cong
            + $bangLuong->tien_lam_them
            + $bangLuong->tong_thuong
            + $bangLuong->tong_hoa_hong
            + $bangLuong->tong_phu_cap;

        // Tính thuế TNCN
        $bangLuong->tru_thue_tncn = self::tinhThueTNCN(
            $bangLuong->tong_thu_nhap,
            $bangLuong->tru_bhxh + $bangLuong->tru_bhyt + $bangLuong->tru_bhtn,
            $nhanVien->nguoi_phu_thuoc ?? 0
        );

        // Tổng khấu trừ
        $bangLuong->tong_khau_tru = $bangLuong->tong_giam_tru
            + $bangLuong->tru_bhxh
            + $bangLuong->tru_bhyt
            + $bangLuong->tru_bhtn
            + $bangLuong->tru_thue_tncn;

        // Thực nhận
        $bangLuong->thuc_nhan = $bangLuong->tong_thu_nhap - $bangLuong->tong_khau_tru;

        $bangLuong->trang_thai = 'draft';
        $bangLuong->save();

        return $bangLuong;
    }

    /**
     * Tính lương cho toàn bộ nhân viên trong tháng
     */
    public static function tinhLuongToanBo($thang, $nam, $chiNhanhId = null)
    {
        $query = AdminUser::where('admin_user_status_id', 1); // Active only

        if ($chiNhanhId) {
            $query->where('chi_nhanh_id', $chiNhanhId);
        }

        $nhanViens = $query->get();
        $results = [];

        foreach ($nhanViens as $nv) {
            try {
                $bangLuong = self::tinhLuongThang($nv->id, $thang, $nam);
                $results[] = [
                    'success' => true,
                    'nhan_vien_id' => $nv->id,
                    'ten_nhan_vien' => $nv->name,
                    'bang_luong_id' => $bangLuong->id,
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'success' => false,
                    'nhan_vien_id' => $nv->id,
                    'ten_nhan_vien' => $nv->name,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Tính số ngày công chuẩn trong tháng (trừ cuối tuần)
     */
    private static function getSoNgayCongChuan($thang, $nam)
    {
        $start = Carbon::create($nam, $thang, 1);
        $end = $start->copy()->endOfMonth();

        $workDays = 0;
        while ($start->lte($end)) {
            if ($start->dayOfWeek != Carbon::SATURDAY && $start->dayOfWeek != Carbon::SUNDAY) {
                $workDays++;
            }
            $start->addDay();
        }

        return $workDays;
    }

    /**
     * Tính tiền làm thêm giờ
     */
    private static function tinhTienLamThem($nhanVien, $gioNgayThuong, $gioThu7, $gioChuNhat, $gioNgayLe)
    {
        $luong1Gio = ($nhanVien->salary ?? 0) / 26 / 8; // Giả sử 26 ngày, 8h/ngày

        $tien = 0;

        // Ngày thường
        $heSo = $nhanVien->them_gio_ngay_thuong ?? 150;
        if ($nhanVien->is_them_gio_ngay_thuong_persen) {
            $tien += $gioNgayThuong * $luong1Gio * ($heSo / 100);
        } else {
            $tien += $gioNgayThuong * $heSo;
        }

        // Thứ 7
        $heSo = $nhanVien->them_gio_thu7 ?? 200;
        if ($nhanVien->is_them_gio_thu7_persen) {
            $tien += $gioThu7 * $luong1Gio * ($heSo / 100);
        } else {
            $tien += $gioThu7 * $heSo;
        }

        // Chủ nhật
        $heSo = $nhanVien->them_gio_chu_nhat ?? 200;
        if ($nhanVien->is_them_gio_chu_nhat_persen) {
            $tien += $gioChuNhat * $luong1Gio * ($heSo / 100);
        } else {
            $tien += $gioChuNhat * $heSo;
        }

        // Ngày lễ
        $heSo = $nhanVien->them_gio_nghi_le_tet ?? 200;
        if ($nhanVien->is_them_gio_nghi_le_persen) {
            $tien += $gioNgayLe * $luong1Gio * ($heSo / 100);
        } else {
            $tien += $gioNgayLe * $heSo;
        }

        return $tien;
    }

    /**
     * Tính tổng thưởng từ JSON setting
     */
    private static function tinhThuong($nhanVien)
    {
        if (!$nhanVien->is_setting_thuong || !$nhanVien->thuong_setting) {
            return 0;
        }

        $thuongSettings = is_array($nhanVien->thuong_setting)
            ? $nhanVien->thuong_setting
            : json_decode($nhanVien->thuong_setting, true);

        $total = 0;
        if (is_array($thuongSettings)) {
            foreach ($thuongSettings as $item) {
                $total += $item['so_tien'] ?? 0;
            }
        }

        return $total;
    }

    /**
     * Tính tổng hoa hồng
     */
    private static function tinhHoaHong($nhanVien)
    {
        if (!$nhanVien->is_setting_hoa_hong || !$nhanVien->hoa_hong_setting) {
            return 0;
        }

        $settings = is_array($nhanVien->hoa_hong_setting)
            ? $nhanVien->hoa_hong_setting
            : json_decode($nhanVien->hoa_hong_setting, true);

        $total = 0;
        if (is_array($settings)) {
            foreach ($settings as $item) {
                $total += $item['so_tien'] ?? 0;
            }
        }

        return $total;
    }

    /**
     * Tính tổng phụ cấp
     */
    private static function tinhPhuCap($nhanVien)
    {
        if (!$nhanVien->is_setting_phu_cap || !$nhanVien->phu_cap_setting) {
            return 0;
        }

        $settings = is_array($nhanVien->phu_cap_setting)
            ? $nhanVien->phu_cap_setting
            : json_decode($nhanVien->phu_cap_setting, true);

        $total = 0;
        if (is_array($settings)) {
            foreach ($settings as $item) {
                $total += $item['so_tien'] ?? 0;
            }
        }

        return $total;
    }

    /**
     * Tính tổng giảm trừ
     */
    private static function tinhGiamTru($nhanVien)
    {
        if (!$nhanVien->is_setting_giam_tru || !$nhanVien->giam_tru_setting) {
            return 0;
        }

        $settings = is_array($nhanVien->giam_tru_setting)
            ? $nhanVien->giam_tru_setting
            : json_decode($nhanVien->giam_tru_setting, true);

        $total = 0;
        if (is_array($settings)) {
            foreach ($settings as $item) {
                $total += $item['so_tien'] ?? 0;
            }
        }

        return $total;
    }

    /**
     * Tính thuế TNCN theo thang lũy tiến
     */
    private static function tinhThueTNCN($tongThuNhap, $baoHiem, $nguoiPhuThuoc)
    {
        // Giảm trừ gia cảnh
        $giamTruBanThan = 11000000; // 11 triệu/tháng
        $giamTruNguoiPhuThuoc = 4400000 * $nguoiPhuThuoc; // 4.4 triệu/người

        // Thu nhập tính thuế
        $thuNhapTinhThue = $tongThuNhap - $baoHiem - $giamTruBanThan - $giamTruNguoiPhuThuoc;

        if ($thuNhapTinhThue <= 0) {
            return 0;
        }

        // Thang lũy tiến
        $thue = 0;
        if ($thuNhapTinhThue <= 5000000) {
            $thue = $thuNhapTinhThue * 0.05;
        } elseif ($thuNhapTinhThue <= 10000000) {
            $thue = 5000000 * 0.05 + ($thuNhapTinhThue - 5000000) * 0.10;
        } elseif ($thuNhapTinhThue <= 18000000) {
            $thue = 5000000 * 0.05 + 5000000 * 0.10 + ($thuNhapTinhThue - 10000000) * 0.15;
        } elseif ($thuNhapTinhThue <= 32000000) {
            $thue = 5000000 * 0.05 + 5000000 * 0.10 + 8000000 * 0.15 + ($thuNhapTinhThue - 18000000) * 0.20;
        } elseif ($thuNhapTinhThue <= 52000000) {
            $thue = 5000000 * 0.05 + 5000000 * 0.10 + 8000000 * 0.15 + 14000000 * 0.20 + ($thuNhapTinhThue - 32000000) * 0.25;
        } elseif ($thuNhapTinhThue <= 80000000) {
            $thue = 5000000 * 0.05 + 5000000 * 0.10 + 8000000 * 0.15 + 14000000 * 0.20 + 20000000 * 0.25 + ($thuNhapTinhThue - 52000000) * 0.30;
        } else {
            $thue = 5000000 * 0.05 + 5000000 * 0.10 + 8000000 * 0.15 + 14000000 * 0.20 + 20000000 * 0.25 + 28000000 * 0.30 + ($thuNhapTinhThue - 80000000) * 0.35;
        }

        return $thue;
    }
}
