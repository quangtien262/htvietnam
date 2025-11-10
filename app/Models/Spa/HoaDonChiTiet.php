<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class HoaDonChiTiet extends Model
{
    protected $table = 'spa_hoa_don_chi_tiet';
    public $timestamps = false;

    protected $fillable = [
        'hoa_don_id',
        'dich_vu_id',
        'san_pham_id',
        'ktv_id',
        'so_luong',
        'don_gia',
        'thanh_tien',
        'ghi_chu',
    ];

    protected $casts = [
        'hoa_don_id' => 'integer',
        'dich_vu_id' => 'integer',
        'san_pham_id' => 'integer',
        'ktv_id' => 'integer',
        'so_luong' => 'integer',
        'don_gia' => 'decimal:0',
        'thanh_tien' => 'decimal:0',
    ];

    // Relationships
    public function hoaDon()
    {
        return $this->belongsTo(HoaDon::class, 'hoa_don_id');
    }

    public function dichVu()
    {
        return $this->belongsTo(DichVu::class, 'dich_vu_id');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }

    public function ktv()
    {
        return $this->belongsTo(KTV::class, 'ktv_id');
    }

    // Accessors
    public function getItemNameAttribute()
    {
        if ($this->dich_vu_id && $this->dichVu) {
            return $this->dichVu->ten_dich_vu;
        }
        if ($this->san_pham_id && $this->sanPham) {
            return $this->sanPham->ten_san_pham;
        }
        return '';
    }

    public function getItemTypeAttribute()
    {
        if ($this->dich_vu_id) return 'service';
        if ($this->san_pham_id) return 'product';
        return '';
    }
}
