<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class NhapKhoChiTiet extends Model
{
    protected $table = 'spa_nhap_kho_chi_tiet';
    public $timestamps = false;

    protected $fillable = [
        'phieu_nhap_id',
        'san_pham_id',
        'so_luong',
        'don_gia',
        'thanh_tien',
        'ngay_san_xuat',
        'han_su_dung',
    ];

    protected $casts = [
        'phieu_nhap_id' => 'integer',
        'san_pham_id' => 'integer',
        'so_luong' => 'integer',
        'don_gia' => 'decimal:0',
        'thanh_tien' => 'decimal:0',
        'ngay_san_xuat' => 'date',
        'han_su_dung' => 'date',
    ];

    // Relationships
    public function nhapKho()
    {
        return $this->belongsTo(NhapKho::class, 'phieu_nhap_id');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }
}
