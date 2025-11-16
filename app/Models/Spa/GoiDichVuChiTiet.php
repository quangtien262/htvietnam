<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class GoiDichVuChiTiet extends Model
{
    protected $table = 'spa_goi_dich_vu_chi_tiet';

    protected $fillable = [
        'goi_dich_vu_id',
        'dich_vu_id',
        'gia_ban_le',
        'so_luong',
        'ghi_chu'
    ];

    protected $casts = [
        'gia_ban_le' => 'decimal:2',
        'so_luong' => 'integer',
    ];

    // Relationships
    public function goiDichVu()
    {
        return $this->belongsTo(GoiDichVu::class, 'goi_dich_vu_id');
    }

    public function dichVu()
    {
        return $this->belongsTo(DichVu::class, 'dich_vu_id');
    }
}
