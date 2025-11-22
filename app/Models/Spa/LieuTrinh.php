<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Casts\Json;

class LieuTrinh extends Model
{
    use SoftDeletes;

    protected $table = 'spa_lieu_trinh';

    protected $fillable = [
        'ma_lieu_trinh',
        'ten_lieu_trinh',
        'dich_vu_id',
        'so_buoi',
        'tan_suat',
        'mo_ta',
        'gia_ban',
        'dich_vu_bao_gom',
        'san_pham_kem_theo',
        'hieu_qua_mong_doi',
        'trang_thai',
    ];

    protected $casts = [
        'dich_vu_id' => 'integer',
        'so_buoi' => 'integer',
        'gia_ban' => 'decimal:0',
        'dich_vu_bao_gom' => Json::class,
        'san_pham_kem_theo' => Json::class,
        'hieu_qua_mong_doi' => Json::class,
    ];

    // Relationships
    public function dichVu()
    {
        return $this->belongsTo(DichVu::class, 'dich_vu_id');
    }

    public function khachHangLieuTrinhs()
    {
        return $this->hasMany(KhachHangLieuTrinh::class, 'lieu_trinh_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'active');
    }

    // Accessors
    public function getGiaBanFormattedAttribute()
    {
        return number_format($this->gia_ban, 0, ',', '.');
    }

    public function getPricePerSessionAttribute()
    {
        if ($this->so_buoi > 0) {
            return round($this->gia_ban / $this->so_buoi, 0);
        }
        return 0;
    }

    public function getDiscountPercentAttribute()
    {
        if ($this->gia_ban > 0) {
            return round((($this->gia_ban - $this->price_member) / $this->gia_ban) * 100, 0);
        }
        return 0;
    }
}
