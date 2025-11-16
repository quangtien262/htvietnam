<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Casts\Json;

class SanPham extends Model
{
    use SoftDeletes;

    protected $table = 'spa_san_pham';

    protected $fillable = [
        'ma_san_pham',
        'ten_san_pham',
        'danh_muc_id',
        'thuong_hieu_id',
        'mo_ta',
        'hinh_anh',
        'don_vi_tinh',
        'gia_ban',
        'gia_thanh_vien',
        'gia_von',
        'ton_kho',
        'ton_kho_canh_bao',
        'han_su_dung',
        'huong_dan_su_dung',
        'thanh_phan',
        'cong_dung',
        'tags',
        'trang_thai',
    ];

    protected $casts = [
        'danh_muc_id' => 'integer',
        'thuong_hieu_id' => 'integer',
        'gia_ban' => 'decimal:0',
        'gia_thanh_vien' => 'decimal:0',
        'gia_von' => 'decimal:0',
        'ton_kho' => 'integer',
        'ton_kho_canh_bao' => 'integer',
        'han_su_dung' => 'date',
        'thanh_phan' => Json::class,
        'cong_dung' => Json::class,
        'tags' => Json::class,
    ];

    // Relationships
    public function danhMuc()
    {
        return $this->belongsTo(DanhMucSanPham::class, 'danh_muc_id');
    }

    public function thuongHieu()
    {
        return $this->belongsTo(ThuongHieu::class, 'thuong_hieu_id');
    }

    public function nhapKhoChiTiets()
    {
        return $this->hasMany(NhapKhoChiTiet::class, 'san_pham_id');
    }

    public function comboSanPhams()
    {
        return $this->hasMany(ComboSanPham::class, 'san_pham_chinh_id');
    }

    public function hoaDonChiTiets()
    {
        return $this->hasMany(HoaDonChiTiet::class, 'san_pham_id');
    }

    public function donViQuiDoi()
    {
        return $this->hasMany(SanPhamDonViQuiDoi::class, 'san_pham_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'active');
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('ton_kho', '<=', 'ton_kho_canh_bao');
    }

    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->whereBetween('han_su_dung', [now(), now()->addDays($days)]);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('danh_muc_id', $categoryId);
    }

    public function scopeByBrand($query, $brandId)
    {
        return $query->where('thuong_hieu_id', $brandId);
    }

    // Accessors
    public function getGiaBanFormattedAttribute()
    {
        return number_format($this->gia_ban, 0, ',', '.');
    }

    public function getIsLowStockAttribute()
    {
        return $this->ton_kho <= $this->ton_kho_canh_bao;
    }

    public function getIsExpiringSoonAttribute()
    {
        if ($this->han_su_dung) {
            return $this->han_su_dung->lte(now()->addDays(30));
        }
        return false;
    }

    public function getIsExpiredAttribute()
    {
        if ($this->han_su_dung) {
            return $this->han_su_dung->lt(now());
        }
        return false;
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

    // Business Logic
    public function updateStock($quantity, $type = 'increase')
    {
        if ($type === 'increase') {
            $this->ton_kho += $quantity;
        } else {
            $this->ton_kho -= $quantity;
        }

        $this->save();
        return $this->ton_kho;
    }
}
