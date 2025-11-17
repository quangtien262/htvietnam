<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class TraHangNhapChiTiet extends Model
{
    protected $table = 'spa_tra_hang_nhap_chi_tiet';

    protected $fillable = [
        'phieu_tra_id',
        'san_pham_id',
        'nhap_kho_chi_tiet_id',
        'so_luong_tra',
        'don_gia',
        'mo_ta_loi',
        'ngay_san_xuat',
        'han_su_dung',
        'lo_san_xuat',
    ];

    protected $casts = [
        'so_luong_tra' => 'integer',
        'don_gia' => 'decimal:2',
        'ngay_san_xuat' => 'date',
        'han_su_dung' => 'date',
    ];

    protected $appends = [
        'thanh_tien',
    ];

    // Relationships
    public function phieuTra()
    {
        return $this->belongsTo(TraHangNhap::class, 'phieu_tra_id');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }

    public function nhapKhoChiTiet()
    {
        return $this->belongsTo(NhapKhoChiTiet::class, 'nhap_kho_chi_tiet_id');
    }

    // Accessors
    public function getThanhTienAttribute()
    {
        return $this->so_luong_tra * $this->don_gia;
    }
}
