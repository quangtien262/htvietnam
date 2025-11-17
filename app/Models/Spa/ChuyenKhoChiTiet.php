<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class ChuyenKhoChiTiet extends Model
{
    protected $table = 'spa_chuyen_kho_chi_tiet';

    protected $fillable = [
        'phieu_chuyen_id',
        'san_pham_id',
        'so_luong_xuat',
        'so_luong_nhan',
        'so_luong_hong',
        'gia_von',
        'ghi_chu',
        'ly_do_hong',
    ];

    protected $casts = [
        'so_luong_xuat' => 'integer',
        'so_luong_nhan' => 'integer',
        'so_luong_hong' => 'integer',
        'gia_von' => 'decimal:2',
    ];

    protected $appends = [
        'so_luong_chenh_lech',
        'thanh_tien',
    ];

    // Relationships
    public function phieuChuyen()
    {
        return $this->belongsTo(ChuyenKho::class, 'phieu_chuyen_id');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }

    // Accessors
    public function getSoLuongChenhLechAttribute()
    {
        return $this->so_luong_xuat - $this->so_luong_nhan - $this->so_luong_hong;
    }

    public function getThanhTienAttribute()
    {
        return $this->so_luong_xuat * $this->gia_von;
    }
}
