<?php

namespace App\Models\Telesale;

use Illuminate\Database\Eloquent\Model;

class CuocGoiTelesale extends Model
{
    protected $table = 'cuoc_goi_telesale';
    protected $fillable = ['ma_cuoc_goi', 'data_khach_hang_id', 'nhan_vien_telesale_id', 'thoi_gian_bat_dau', 'thoi_gian_ket_thuc', 'thoi_luong', 'ket_qua', 'ghi_chu', 'noi_dung_cuoc_goi', 'file_ghi_am', 'ngay_hen_goi_lai', 'da_tao_don_hang'];
    protected $casts = ['thoi_gian_bat_dau' => 'datetime', 'thoi_gian_ket_thuc' => 'datetime', 'ngay_hen_goi_lai' => 'datetime', 'da_tao_don_hang' => 'boolean'];

    protected static function boot() {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->ma_cuoc_goi)) {
                $latest = self::orderBy('id', 'desc')->first();
                $number = $latest ? ((int) substr($latest->ma_cuoc_goi, 2)) + 1 : 1;
                $model->ma_cuoc_goi = 'CG' . str_pad($number, 5, '0', STR_PAD_LEFT);
            }
        });
    }

    public function dataKhachHang() { return $this->belongsTo(DataKhachHangTelesale::class, 'data_khach_hang_id'); }
    public function nhanVienTelesale() { return $this->belongsTo(\App\Models\AdminUser::class, 'nhan_vien_telesale_id'); }

    public function scopeThanhCong($query) { return $query->where('ket_qua', 'thanh_cong'); }
    public function scopeHomNay($query) { return $query->whereDate('thoi_gian_bat_dau', today()); }
}
