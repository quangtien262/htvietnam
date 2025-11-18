<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class NhapKho extends Model
{
    protected $table = 'spa_nhap_kho';

    protected $fillable = [
        'ma_phieu',
        'chi_nhanh_id',
        'nha_cung_cap_id',
        'ngay_nhap',
        'nguoi_nhap_id',
        'tong_tien',
        'ghi_chu',
    ];

    protected $casts = [
        'ngay_nhap' => 'datetime',
        'tong_tien' => 'decimal:0',
    ];

    // Relationships
    public function chiTiets()
    {
        return $this->hasMany(NhapKhoChiTiet::class, 'phieu_nhap_id');
    }

    public function chiNhanh()
    {
        return $this->belongsTo(ChiNhanh::class, 'chi_nhanh_id');
    }

    public function nhaCungCap()
    {
        return $this->belongsTo(NhaCungCap::class, 'nha_cung_cap_id');
    }

    public function nguoiNhap()
    {
        return $this->belongsTo(\App\Models\User::class, 'nguoi_nhap_id');
    }

    // Accessors
    public function getTongTienFormattedAttribute()
    {
        return number_format($this->tong_tien, 0, ',', '.');
    }
}
