<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class CaLamViec extends Model
{
    protected $table = 'spa_ca_lam_viec';

    protected $fillable = [
        'ma_ca',
        'chi_nhanh_id',
        'nhan_vien_mo_ca_id',
        'nhan_vien_dong_ca_id',
        'thoi_gian_bat_dau',
        'thoi_gian_ket_thuc',
        'tien_mat_dau_ca',
        'tien_mat_cuoi_ca_ly_thuyet',
        'tien_mat_cuoi_ca_thuc_te',
        'chenh_lech',
        'doanh_thu_tien_mat',
        'doanh_thu_chuyen_khoan',
        'doanh_thu_the',
        'tong_doanh_thu',
        'so_hoa_don',
        'ghi_chu_mo_ca',
        'ghi_chu_dong_ca',
        'giai_trinh_chenh_lech',
        'trang_thai',
    ];

    protected $casts = [
        'thoi_gian_bat_dau' => 'datetime',
        'thoi_gian_ket_thuc' => 'datetime',
        'tien_mat_dau_ca' => 'decimal:2',
        'tien_mat_cuoi_ca_ly_thuyet' => 'decimal:2',
        'tien_mat_cuoi_ca_thuc_te' => 'decimal:2',
        'chenh_lech' => 'decimal:2',
        'doanh_thu_tien_mat' => 'decimal:2',
        'doanh_thu_chuyen_khoan' => 'decimal:2',
        'doanh_thu_the' => 'decimal:2',
        'tong_doanh_thu' => 'decimal:2',
    ];

    // Relationships
    public function chiNhanh()
    {
        return $this->belongsTo(ChiNhanh::class, 'chi_nhanh_id');
    }

    public function nhanVienMoCa()
    {
        return $this->belongsTo(\App\Models\User::class, 'nhan_vien_mo_ca_id');
    }

    public function nhanVienDongCa()
    {
        return $this->belongsTo(\App\Models\User::class, 'nhan_vien_dong_ca_id');
    }

    public function hoaDons()
    {
        return $this->hasMany(HoaDon::class, 'ca_lam_viec_id');
    }

    // Scopes
    public function scopeDangMo($query)
    {
        return $query->where('trang_thai', 'dang_mo');
    }

    public function scopeDaDong($query)
    {
        return $query->where('trang_thai', 'da_dong');
    }

    public function scopeByChiNhanh($query, $chiNhanhId)
    {
        return $query->where('chi_nhanh_id', $chiNhanhId);
    }

    // Helper methods
    public function isDangMo()
    {
        return $this->trang_thai === 'dang_mo';
    }

    public function isDaDong()
    {
        return $this->trang_thai === 'da_dong';
    }

    public function hasChenhlech()
    {
        return abs((float)$this->chenh_lech) > 0;
    }

    public function getThoiGianLamViec()
    {
        if (!$this->thoi_gian_ket_thuc) {
            $minutes = now()->diffInMinutes($this->thoi_gian_bat_dau);
        } else {
            $minutes = $this->thoi_gian_ket_thuc->diffInMinutes($this->thoi_gian_bat_dau);
        }

        $hours = floor($minutes / 60);
        $mins = $minutes % 60;

        return "{$hours}h{$mins}p";
    }
}
