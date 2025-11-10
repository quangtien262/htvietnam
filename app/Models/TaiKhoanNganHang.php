<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaiKhoanNganHang extends Model
{
    protected $table = 'tai_khoan_ngan_hang';

    protected $fillable = [
        'ten_ngan_hang',
        'chi_nhanh',
        'so_tai_khoan',
        'chu_tai_khoan',
        'so_du_hien_tai',
        'loai_tien',
        'ghi_chu',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'so_du_hien_tai' => 'decimal:2',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Relationships
    public function giaoDichNganHang()
    {
        return $this->hasMany(GiaoDichNganHang::class, 'tai_khoan_ngan_hang_id');
    }

    public function doiSoatNganHang()
    {
        return $this->hasMany(DoiSoatNganHang::class, 'tai_khoan_ngan_hang_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('id', 'asc');
    }
}
