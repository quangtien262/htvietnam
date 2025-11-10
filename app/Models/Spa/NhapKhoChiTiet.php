<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class NhapKhoChiTiet extends Model
{
    protected $table = 'spa_nhap_kho_chi_tiet';
    public $timestamps = false;

    protected $fillable = [
        'nhap_kho_id',
        'san_pham_id',
        'so_luong',
        'don_gia',
        'thanh_tien',
        'han_su_dung',
    ];

    protected $casts = [
        'nhap_kho_id' => 'integer',
        'san_pham_id' => 'integer',
        'so_luong' => 'integer',
        'don_gia' => 'decimal:0',
        'thanh_tien' => 'decimal:0',
        'han_su_dung' => 'date',
    ];

    // Relationships
    public function nhapKho()
    {
        return $this->belongsTo(NhapKho::class, 'nhap_kho_id');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }
}
