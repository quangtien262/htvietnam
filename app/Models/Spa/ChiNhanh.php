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
        'thanh_pho',
        'sdt',
        'email',
        'so_phong',
        'so_ktv',
        'gio_mo_cua',
        'gio_dong_cua',
        'toa_do_lat',
        'toa_do_lng',
        'is_active',
        'trang_thai',
        'nguoi_quan_ly',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'so_phong' => 'integer',
        'so_ktv' => 'integer',
        'toa_do_lat' => 'decimal:8',
        'toa_do_lng' => 'decimal:8',
    ];

    protected $appends = ['name', 'code', 'phone'];

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
    public function getNameAttribute()
    {
        return $this->ten_chi_nhanh;
    }

    public function getCodeAttribute()
    {
        return $this->ma_chi_nhanh;
    }

    public function getPhoneAttribute()
    {
        return $this->sdt;
    }

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
