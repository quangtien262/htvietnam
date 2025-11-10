<?php

namespace App\Models\Telesale;

use Illuminate\Database\Eloquent\Model;

class KpiTelesale extends Model
{
    protected $table = 'kpi_telesale';
    protected $fillable = ['nhan_vien_telesale_id', 'thang', 'nam', 'muc_tieu_cuoc_goi', 'thuc_te_cuoc_goi', 'muc_tieu_don_hang', 'thuc_te_don_hang', 'muc_tieu_doanh_thu', 'thuc_te_doanh_thu', 'ty_le_nghe_may', 'ty_le_chot_don', 'thoi_gian_goi_trung_binh'];
    protected $casts = ['muc_tieu_doanh_thu' => 'decimal:2', 'thuc_te_doanh_thu' => 'decimal:2', 'ty_le_nghe_may' => 'decimal:2', 'ty_le_chot_don' => 'decimal:2'];

    public function nhanVienTelesale() { return $this->belongsTo(\App\Models\AdminUser::class, 'nhan_vien_telesale_id'); }

    public function scopeTheoThang($query, $thang, $nam) {
        return $query->where('thang', $thang)->where('nam', $nam);
    }
}
