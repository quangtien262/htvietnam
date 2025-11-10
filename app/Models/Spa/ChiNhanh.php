<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChiNhanh extends Model
{
    use SoftDeletes;

    protected $table = 'spa_chi_nhanh';

    protected $fillable = [
        'ma_chi_nhanh',
        'ten_chi_nhanh',
        'dia_chi',
        'so_dien_thoai',
        'email',
        'nguoi_quan_ly',
        'gio_mo_cua',
        'gio_dong_cua',
        'trang_thai',
    ];

    // Relationships
    public function phongs()
    {
        return $this->hasMany(Phong::class, 'chi_nhanh_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'chi_nhanh_id');
    }

    public function hoaDons()
    {
        return $this->hasMany(HoaDon::class, 'chi_nhanh_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'active');
    }

    // Accessors
    public function getWorkingHoursAttribute()
    {
        return $this->gio_mo_cua . ' - ' . $this->gio_dong_cua;
    }

    public function getIsOpenAttribute()
    {
        $now = now()->format('H:i:s');
        return $now >= $this->gio_mo_cua && $now <= $this->gio_dong_cua;
    }
}
