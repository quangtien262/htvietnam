<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Casts\Json;

class ChuongTrinhKhuyenMai extends Model
{
    use SoftDeletes;

    protected $table = 'spa_chuong_trinh_km';

    protected $fillable = [
        'ma_chuong_trinh',
        'ten_chuong_trinh',
        'loai',
        'gia_tri',
        'dieu_kien',
        'mo_ta',
        'ngay_bat_dau',
        'ngay_ket_thuc',
        'trang_thai',
    ];

    protected $casts = [
        'gia_tri' => 'decimal:0',
        'dieu_kien' => Json::class,
        'ngay_bat_dau' => 'datetime',
        'ngay_ket_thuc' => 'datetime',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'active')
            ->where('ngay_bat_dau', '<=', now())
            ->where('ngay_ket_thuc', '>=', now());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('ngay_bat_dau', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('ngay_ket_thuc', '<', now());
    }

    // Accessors
    public function getIsActiveAttribute()
    {
        return $this->trang_thai === 'active'
            && $this->ngay_bat_dau <= now()
            && $this->ngay_ket_thuc >= now();
    }
}
