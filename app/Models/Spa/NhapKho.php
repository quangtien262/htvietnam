<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NhapKho extends Model
{
    use SoftDeletes;

    protected $table = 'spa_nhap_kho';

    protected $fillable = [
        'ma_phieu_nhap',
        'nha_cung_cap',
        'ngay_nhap',
        'nguoi_nhap',
        'tong_tien',
        'ghi_chu',
        'trang_thai',
    ];

    protected $casts = [
        'ngay_nhap' => 'datetime',
        'tong_tien' => 'decimal:0',
    ];

    // Relationships
    public function chiTiets()
    {
        return $this->hasMany(NhapKhoChiTiet::class, 'nhap_kho_id');
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('trang_thai', 'hoan_thanh');
    }

    public function scopePending($query)
    {
        return $query->where('trang_thai', 'cho_duyet');
    }

    // Accessors
    public function getTongTienFormattedAttribute()
    {
        return number_format($this->tong_tien, 0, ',', '.');
    }
}
