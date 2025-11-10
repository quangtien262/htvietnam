<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GiaoDichNganHang extends Model
{
    protected $table = 'giao_dich_ngan_hang';

    protected $fillable = [
        'tai_khoan_ngan_hang_id',
        'ngay_giao_dich',
        'loai_giao_dich',
        'so_tien',
        'doi_tac_id',
        'doi_tac_type',
        'loai_thu_id',
        'loai_chi_id',
        'ma_giao_dich',
        'noi_dung',
        'ghi_chu',
        'trang_thai',
        'is_doi_soat',
        'created_by',
    ];

    protected $casts = [
        'ngay_giao_dich' => 'date',
        'so_tien' => 'decimal:2',
        'is_doi_soat' => 'boolean',
    ];

    // Relationships
    public function taiKhoanNganHang()
    {
        return $this->belongsTo(TaiKhoanNganHang::class, 'tai_khoan_ngan_hang_id');
    }

    public function doiTac()
    {
        return $this->morphTo();
    }

    public function loaiThu()
    {
        return $this->belongsTo(\App\Models\Web\LoaiThu::class, 'loai_thu_id');
    }

    public function loaiChi()
    {
        return $this->belongsTo(\App\Models\Web\LoaiChi::class, 'loai_chi_id');
    }

    public function nguoiTao()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'created_by');
    }

    // Scopes
    public function scopeThu($query)
    {
        return $query->where('loai_giao_dich', 'thu');
    }

    public function scopeChi($query)
    {
        return $query->where('loai_giao_dich', 'chi');
    }

    public function scopeChuaDoiSoat($query)
    {
        return $query->where('is_doi_soat', false);
    }
}
