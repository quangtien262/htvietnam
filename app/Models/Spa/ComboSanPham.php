<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Casts\Json;

class ComboSanPham extends Model
{
    use SoftDeletes;

    protected $table = 'spa_combo_san_pham';

    protected $fillable = [
        'ma_combo',
        'ten_combo',
        'san_pham_chinh_id',
        'san_pham_kem_theo',
        'mo_ta',
        'hinh_anh',
        'gia_ban',
        'gia_thanh_vien',
        'tiet_kiem',
        'ngay_bat_dau',
        'ngay_ket_thuc',
        'trang_thai',
    ];

    protected $casts = [
        'san_pham_chinh_id' => 'integer',
        'san_pham_kem_theo' => Json::class,
        'gia_ban' => 'decimal:0',
        'gia_thanh_vien' => 'decimal:0',
        'tiet_kiem' => 'decimal:0',
        'ngay_bat_dau' => 'date',
        'ngay_ket_thuc' => 'date',
    ];

    // Relationships
    public function sanPhamChinh()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_chinh_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'active')
            ->where('ngay_bat_dau', '<=', now())
            ->where('ngay_ket_thuc', '>=', now());
    }

    // Accessors
    public function getGiaBanFormattedAttribute()
    {
        return number_format($this->gia_ban, 0, ',', '.');
    }

    public function getIsActiveAttribute()
    {
        return $this->trang_thai === 'active' 
            && $this->ngay_bat_dau <= now()
            && $this->ngay_ket_thuc >= now();
    }
}
