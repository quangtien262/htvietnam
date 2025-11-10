<?php

namespace App\Models\Telesale;

use Illuminate\Database\Eloquent\Model;

class CaLamViecTelesale extends Model
{
    protected $table = 'ca_lam_viec_telesale';
    protected $fillable = ['nhan_vien_telesale_id', 'ca_lam_viec', 'ngay_lam_viec', 'thoi_gian_check_in', 'thoi_gian_check_out', 'tong_cuoc_goi', 'tong_don_hang', 'doanh_thu_ca', 'ghi_chu'];
    protected $casts = ['ngay_lam_viec' => 'date', 'thoi_gian_check_in' => 'datetime', 'thoi_gian_check_out' => 'datetime', 'doanh_thu_ca' => 'decimal:2'];

    public function nhanVienTelesale() { return $this->belongsTo(\App\Models\AdminUser::class, 'nhan_vien_telesale_id'); }

    public function scopeHomNay($query) { return $query->whereDate('ngay_lam_viec', today()); }
}
