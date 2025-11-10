<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class KpiDanhGia extends Model
{
    protected $table = 'kpi_danh_gia';

    protected $fillable = [
        'admin_user_id',
        'thang',
        'nam',
        'chi_tieu_kpi',
        'tong_diem',
        'xep_loai',
        'nguoi_danh_gia',
        'ngay_danh_gia',
        'nhan_xet',
    ];

    protected $casts = [
        'chi_tieu_kpi' => 'array',
        'tong_diem' => 'decimal:2',
        'ngay_danh_gia' => 'datetime',
    ];

    // Relationships
    public function nhanVien()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'admin_user_id');
    }

    public function nguoiDanhGia()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'nguoi_danh_gia');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_recycle_bin', '!=', 1);
    }

    public function scopeByMonth($query, $month, $year)
    {
        return $query->where('thang', $month)->where('nam', $year);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('admin_user_id', $userId);
    }

    public function scopeByRating($query, $rating)
    {
        return $query->where('xep_loai', $rating);
    }

    // Auto calculate xep_loai based on tong_diem
    public function calculateXepLoai()
    {
        if ($this->tong_diem >= 90) {
            $this->xep_loai = 'A';
        } elseif ($this->tong_diem >= 75) {
            $this->xep_loai = 'B';
        } elseif ($this->tong_diem >= 60) {
            $this->xep_loai = 'C';
        } else {
            $this->xep_loai = 'D';
        }
    }

    public static function getXepLoaiLabel($xepLoai)
    {
        $labels = [
            'A' => 'Xuất sắc',
            'B' => 'Tốt',
            'C' => 'Trung bình',
            'D' => 'Yếu',
        ];
        return $labels[$xepLoai] ?? 'Không xác định';
    }
}
