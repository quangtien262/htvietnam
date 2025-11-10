<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Casts\Json;

class DichVu extends Model
{
    use SoftDeletes;

    protected $table = 'spa_dich_vu';

    protected $fillable = [
        'ma_dich_vu',
        'ten_dich_vu',
        'danh_muc_id',
        'mo_ta',
        'hinh_anh',
        'thoi_gian_thuc_hien',
        'gia_ban',
        'gia_thanh_vien',
        'gia_von',
        'yeu_cau_ktv',
        'yeu_cau_phong',
        'loi_ich',
        'quy_trinh',
        'luu_y',
        'tags',
        'trang_thai',
    ];

    protected $casts = [
        'danh_muc_id' => 'integer',
        'thoi_gian_thuc_hien' => 'integer',
        'gia_ban' => 'decimal:0',
        'gia_thanh_vien' => 'decimal:0',
        'gia_von' => 'decimal:0',
        'loi_ich' => Json::class,
        'quy_trinh' => Json::class,
        'tags' => Json::class,
    ];

    // Relationships
    public function danhMuc()
    {
        return $this->belongsTo(DanhMucDichVu::class, 'danh_muc_id');
    }

    public function lieuTrinhs()
    {
        return $this->hasMany(LieuTrinh::class, 'dich_vu_id');
    }

    public function bookingDichVus()
    {
        return $this->hasMany(BookingDichVu::class, 'dich_vu_id');
    }

    public function hoaDonChiTiets()
    {
        return $this->hasMany(HoaDonChiTiet::class, 'dich_vu_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'active');
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('danh_muc_id', $categoryId);
    }

    public function scopePriceRange($query, $min, $max)
    {
        return $query->whereBetween('gia_ban', [$min, $max]);
    }

    public function scopeDurationRange($query, $min, $max)
    {
        return $query->whereBetween('thoi_gian_thuc_hien', [$min, $max]);
    }

    // Accessors
    public function getGiaBanFormattedAttribute()
    {
        return number_format($this->gia_ban, 0, ',', '.');
    }

    public function getDiscountPercentAttribute()
    {
        if ($this->gia_ban > 0) {
            return round((($this->gia_ban - $this->gia_thanh_vien) / $this->gia_ban) * 100, 0);
        }
        return 0;
    }

    public function getGrossProfitAttribute()
    {
        return $this->gia_ban - $this->gia_von;
    }

    public function getProfitMarginAttribute()
    {
        if ($this->gia_ban > 0) {
            return round((($this->gia_ban - $this->gia_von) / $this->gia_ban) * 100, 2);
        }
        return 0;
    }
}
