<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class GoiDichVu extends Model
{
    protected $table = 'spa_goi_dich_vu';

    protected $fillable = [
        'ma_goi',
        'ten_goi',
        'nhom_hang_id',
        'gia_ban',
        'so_luong',
        'han_su_dung',
        'lich_trinh_su_dung_id',
        'mo_ta',
        'hinh_anh',
        'is_active'
    ];

    protected $casts = [
        'gia_ban' => 'decimal:2',
        'so_luong' => 'integer',
        'han_su_dung' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function lichTrinhSuDung()
    {
        return $this->belongsTo(LichTrinhSuDung::class, 'lich_trinh_su_dung_id');
    }

    public function chiTiet()
    {
        return $this->hasMany(GoiDichVuChiTiet::class, 'goi_dich_vu_id');
    }

    public function dichVu()
    {
        return $this->belongsToMany(DichVu::class, 'spa_goi_dich_vu_chi_tiet', 'goi_dich_vu_id', 'dich_vu_id')
                    ->withPivot('gia_ban_le', 'so_luong', 'ghi_chu')
                    ->withTimestamps();
    }
}
