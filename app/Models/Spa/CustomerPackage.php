<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class CustomerPackage extends Model
{
    protected $table = 'spa_customer_packages';

    protected $fillable = [
        'khach_hang_id',
        'goi_dich_vu_id',
        'ten_goi',
        'gia_mua',
        'so_luong_tong',
        'so_luong_da_dung',
        'dich_vu_ids',
        'ngay_mua',
        'ngay_het_han',
        'trang_thai',
        'hoa_don_id',
        'ghi_chu',
    ];

    protected $casts = [
        'gia_mua' => 'decimal:2',
        'so_luong_tong' => 'integer',
        'so_luong_da_dung' => 'integer',
        'dich_vu_ids' => 'array',
        'ngay_mua' => 'datetime',
        'ngay_het_han' => 'datetime',
    ];

    // Relationships
    public function khachHang()
    {
        return $this->belongsTo(\App\Models\User::class, 'khach_hang_id');
    }

    public function goiDichVu()
    {
        return $this->belongsTo(GoiDichVu::class, 'goi_dich_vu_id');
    }

    public function hoaDon()
    {
        return $this->belongsTo(HoaDon::class, 'hoa_don_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'dang_dung');
    }

    public function scopeExpired($query)
    {
        return $query->where('trang_thai', 'het_han');
    }

    public function scopeUsedUp($query)
    {
        return $query->where('trang_thai', 'da_het');
    }

    // Accessors
    public function getSoLuongConLaiAttribute()
    {
        return $this->so_luong_tong - $this->so_luong_da_dung;
    }
}
