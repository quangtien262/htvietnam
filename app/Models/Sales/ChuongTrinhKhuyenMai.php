<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChuongTrinhKhuyenMai extends Model
{
    use SoftDeletes;
    protected $table = 'chuong_trinh_khuyen_mai';
    protected $fillable = ['ma_chuong_trinh', 'ten_chuong_trinh', 'mo_ta', 'loai_khuyen_mai', 'gia_tri_giam', 'gia_tri_don_hang_toi_thieu', 'ngay_bat_dau', 'ngay_ket_thuc', 'san_pham_ap_dung', 'nhom_khach_hang_ap_dung', 'gioi_han_su_dung', 'da_su_dung', 'trang_thai'];
    protected $casts = ['ngay_bat_dau' => 'date', 'ngay_ket_thuc' => 'date', 'gia_tri_giam' => 'decimal:2', 'gia_tri_don_hang_toi_thieu' => 'decimal:2', 'san_pham_ap_dung' => 'array', 'nhom_khach_hang_ap_dung' => 'array'];

    protected static function boot() {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->ma_chuong_trinh)) {
                $latest = self::withTrashed()->orderBy('id', 'desc')->first();
                $number = $latest ? ((int) substr($latest->ma_chuong_trinh, 2)) + 1 : 1;
                $model->ma_chuong_trinh = 'KM' . str_pad($number, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function scopeActive($query) { return $query->where('trang_thai', 'active')->where('ngay_bat_dau', '<=', now())->where('ngay_ket_thuc', '>=', now()); }
}
