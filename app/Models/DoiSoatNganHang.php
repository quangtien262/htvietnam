<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoiSoatNganHang extends Model
{
    protected $table = 'doi_soat_ngan_hang';

    protected $fillable = [
        'tai_khoan_ngan_hang_id',
        'ngay_doi_soat',
        'so_du_dau_ky',
        'so_du_cuoi_ky',
        'so_du_sao_ke',
        'chenh_lech',
        'ghi_chu',
        'trang_thai',
        'created_by',
    ];

    protected $casts = [
        'ngay_doi_soat' => 'date',
        'so_du_dau_ky' => 'decimal:2',
        'so_du_cuoi_ky' => 'decimal:2',
        'so_du_sao_ke' => 'decimal:2',
        'chenh_lech' => 'decimal:2',
    ];

    // Relationships
    public function taiKhoanNganHang()
    {
        return $this->belongsTo(TaiKhoanNganHang::class, 'tai_khoan_ngan_hang_id');
    }

    public function nguoiTao()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'created_by');
    }

    // Scopes
    public function scopeHoanThanh($query)
    {
        return $query->where('trang_thai', 'hoan_thanh');
    }

    public function scopeDangDoiSoat($query)
    {
        return $query->where('trang_thai', 'dang_doi_soat');
    }
}
