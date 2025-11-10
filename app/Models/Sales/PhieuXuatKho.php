<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PhieuXuatKho extends Model
{
    use SoftDeletes;
    protected $table = 'phieu_xuat_kho';
    protected $fillable = ['ma_phieu_xuat', 'don_hang_id', 'ngay_xuat', 'nguoi_xuat_id', 'ly_do_xuat', 'tong_gia_tri', 'trang_thai', 'ghi_chu'];
    protected $casts = ['ngay_xuat' => 'date', 'tong_gia_tri' => 'decimal:2'];

    protected static function boot() {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->ma_phieu_xuat)) {
                $latest = self::withTrashed()->orderBy('id', 'desc')->first();
                $number = $latest ? ((int) substr($latest->ma_phieu_xuat, 2)) + 1 : 1;
                $model->ma_phieu_xuat = 'PX' . str_pad($number, 5, '0', STR_PAD_LEFT);
            }
        });
    }

    public function donHang() { return $this->belongsTo(DonHang::class, 'don_hang_id'); }
    public function nguoiXuat() { return $this->belongsTo(\App\Models\AdminUser::class, 'nguoi_xuat_id'); }
    public function chiTiets() { return $this->hasMany(PhieuXuatKhoChiTiet::class, 'phieu_xuat_kho_id'); }
}
