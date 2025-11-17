<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class XuatHuyChiTiet extends Model
{
    protected $table = 'spa_xuat_huy_chi_tiet';

    protected $fillable = [
        'phieu_huy_id',
        'san_pham_id',
        'so_luong_huy',
        'gia_von',
        'ghi_chu',
        'ngay_san_xuat',
        'han_su_dung',
        'lo_san_xuat',
    ];

    protected $casts = [
        'so_luong_huy' => 'integer',
        'gia_von' => 'decimal:2',
        'ngay_san_xuat' => 'date',
        'han_su_dung' => 'date',
    ];

    protected $appends = [
        'thanh_tien',
        'gia_tri_mat',
    ];

    // Relationships
    public function phieuHuy()
    {
        return $this->belongsTo(XuatHuy::class, 'phieu_huy_id');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }

    // Accessors
    public function getThanhTienAttribute()
    {
        return $this->so_luong_huy * $this->gia_von;
    }

    public function getGiaTriMatAttribute()
    {
        return $this->thanh_tien; // Alias for frontend
    }

    public function getIsExpiredAttribute()
    {
        if ($this->han_su_dung) {
            return $this->han_su_dung < now();
        }
        return false;
    }
}
