<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class HopDongLaoDong extends Model
{
    protected $table = 'hop_dong_lao_dong';

    protected $fillable = [
        'ma_hop_dong',
        'admin_user_id',
        'loai_hop_dong',
        'ngay_bat_dau',
        'ngay_ket_thuc',
        'luong_hop_dong',
        'muc_dong_bao_hiem',
        'file_hop_dong',
        'trang_thai',
        'ngay_ky',
        'nguoi_dai_dien_cong_ty',
        'ghi_chu',
    ];

    protected $casts = [
        'ngay_bat_dau' => 'date',
        'ngay_ket_thuc' => 'date',
        'ngay_ky' => 'date',
        'luong_hop_dong' => 'decimal:2',
        'muc_dong_bao_hiem' => 'decimal:2',
    ];

    // Relationships
    public function nhanVien()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'admin_user_id');
    }

    public function nguoiDaiDien()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'nguoi_dai_dien_cong_ty');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_recycle_bin', '!=', 1)->where('trang_thai', 'active');
    }

    public function scopeExpired($query)
    {
        return $query->where('trang_thai', 'expired');
    }

    public function scopeExpiringSoon($query, $days = 30)
    {
        $date = now()->addDays($days);
        return $query->where('trang_thai', 'active')
                     ->whereNotNull('ngay_ket_thuc')
                     ->where('ngay_ket_thuc', '<=', $date);
    }

    // Auto generate ma_hop_dong
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->ma_hop_dong)) {
                $model->ma_hop_dong = self::generateMaHopDong();
            }
        });
    }

    public static function generateMaHopDong()
    {
        $prefix = 'HD-' . date('Y') . '-';
        $lastRecord = self::where('ma_hop_dong', 'like', $prefix . '%')
                           ->orderBy('ma_hop_dong', 'desc')
                           ->first();

        if ($lastRecord) {
            $lastNumber = intval(substr($lastRecord->ma_hop_dong, -3));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }

    public static function getLoaiHopDongOptions()
    {
        return [
            'thu_viec' => 'Thử việc',
            'co_thoi_han' => 'Có thời hạn',
            'khong_thoi_han' => 'Không thời hạn',
            'mua_vu' => 'Mùa vụ',
        ];
    }
}
