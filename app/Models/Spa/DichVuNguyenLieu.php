<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class DichVuNguyenLieu extends Model
{
    protected $table = 'spa_dich_vu_nguyen_lieu';

    protected $fillable = [
        'dich_vu_id',
        'san_pham_id',
        'so_luong',
        'don_vi_su_dung',
        'gia_von',
        'ty_le_quy_doi',
        'thanh_tien',
        'ghi_chu',
    ];

    protected $casts = [
        'dich_vu_id' => 'integer',
        'san_pham_id' => 'integer',
        'so_luong' => 'decimal:4',
        'gia_von' => 'decimal:2',
        'ty_le_quy_doi' => 'decimal:4',
        'thanh_tien' => 'decimal:2',
    ];

    // Relationships
    public function dichVu()
    {
        return $this->belongsTo(DichVu::class, 'dich_vu_id');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }
}
