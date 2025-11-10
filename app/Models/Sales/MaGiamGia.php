<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaGiamGia extends Model
{
    use SoftDeletes;
    protected $table = 'ma_giam_gia';
    protected $fillable = ['ma_code', 'ten_voucher', 'loai_giam', 'gia_tri_giam', 'giam_toi_da', 'gia_tri_don_toi_thieu', 'ngay_bat_dau', 'ngay_het_han', 'so_luong', 'da_su_dung', 'gioi_han_moi_khach', 'trang_thai'];
    protected $casts = ['ngay_bat_dau' => 'date', 'ngay_het_han' => 'date', 'gia_tri_giam' => 'decimal:2', 'giam_toi_da' => 'decimal:2', 'gia_tri_don_toi_thieu' => 'decimal:2'];

    public function scopeActive($query) { return $query->where('trang_thai', 'active')->where('ngay_bat_dau', '<=', now())->where('ngay_het_han', '>=', now()); }
    public function scopeConSuDung($query) { return $query->where(function($q) { $q->whereNull('so_luong')->orWhereRaw('da_su_dung < so_luong'); }); }
}
